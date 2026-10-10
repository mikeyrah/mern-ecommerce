import User from "../models/user.model.js";
import { RecoveryEvent, RecoverySettings } from "../models/cartRecovery.model.js";
import { sendAbandonedCartReminder } from "./email.js";

let recoveryRunning = false;

export const processAbandonedCarts = async () => {
    if (recoveryRunning) return;
    recoveryRunning = true;
    try {
        const settings = await RecoverySettings.findOneAndUpdate({ key: "cart-recovery" }, { $setOnInsert: { enabled: true, delayHours: 24 } }, { upsert: true, new: true });
        if (!settings.enabled) return;
        const cutoff = new Date(Date.now() - settings.delayHours * 60 * 60 * 1000);
        const users = await User.find({
            "cartItems.0": { $exists: true },
            abandonedCartEmails: { $ne: false },
            cartUpdatedAt: { $lte: cutoff },
            $expr: { $ne: ["$cartReminderCartUpdatedAt", "$cartUpdatedAt"] },
        }).populate("cartItems.product", "name price image images stock trackInventory variants variantName").limit(50);

        for (const user of users) {
            const items = user.cartItems.filter((item) => {
                if (!item.product) return false;
                const variant = item.variant ? item.product.variants.id(item.variant) : null;
                return variant?.trackInventory ? variant.stock > 0 : !item.product.trackInventory || item.product.stock > 0;
            });
            if (!items.length) continue;
            const cartTotal = items.reduce((sum, item) => sum + (item.unitPrice ?? item.product.price) * item.quantity, 0);
            const result = await sendAbandonedCartReminder(user, items, cartTotal);
            if (result?.skipped) continue;
            user.cartReminderSentAt = new Date();
            user.cartReminderCartUpdatedAt = user.cartUpdatedAt;
            await user.save();
            await RecoveryEvent.create({ user: user._id, type: "sent", cartTotal, itemCount: items.reduce((sum, item) => sum + item.quantity, 0) });
        }
    } catch (error) {
        console.error("Abandoned cart recovery failed:", error.message);
    } finally {
        recoveryRunning = false;
    }
};

export const startCartRecoveryScheduler = () => {
    const interval = setInterval(processAbandonedCarts, 15 * 60 * 1000);
    interval.unref();
    setTimeout(processAbandonedCarts, 30 * 1000).unref();
};
