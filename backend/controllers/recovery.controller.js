import User from "../models/user.model.js";
import { RecoveryEvent, RecoverySettings } from "../models/cartRecovery.model.js";

export const getRecoveryPreference = async (req, res) => res.json({ enabled: req.user.abandonedCartEmails !== false });

export const updateRecoveryPreference = async (req, res) => {
    try {
        const enabled = Boolean(req.body?.enabled);
        const user = await User.findByIdAndUpdate(req.user._id, { abandonedCartEmails: enabled }, { new: true });
        return res.json({ enabled: user.abandonedCartEmails, message: enabled ? "Cart reminder emails enabled" : "Cart reminder emails disabled" });
    } catch (error) {
        return res.status(500).json({ message: "Unable to update email preferences" });
    }
};

export const getRecoveryAdmin = async (_req, res) => {
    try {
        const settings = await RecoverySettings.findOneAndUpdate({ key: "cart-recovery" }, { $setOnInsert: { enabled: true, delayHours: 24 } }, { upsert: true, new: true });
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const stats = await RecoveryEvent.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: "$type", count: { $sum: 1 }, value: { $sum: "$cartTotal" } } }]);
        const sent = stats.find((item) => item._id === "sent") || { count: 0, value: 0 };
        const recovered = stats.find((item) => item._id === "recovered") || { count: 0, value: 0 };
        return res.json({ settings, analytics: { sent: sent.count, recovered: recovered.count, recoveredValue: recovered.value, recoveryRate: sent.count ? (recovered.count / sent.count) * 100 : 0 } });
    } catch (error) {
        return res.status(500).json({ message: "Unable to load cart recovery settings" });
    }
};

export const updateRecoverySettings = async (req, res) => {
    try {
        const delayHours = Number(req.body?.delayHours);
        if (!Number.isInteger(delayHours) || delayHours < 1 || delayHours > 168) return res.status(400).json({ message: "Delay must be between 1 and 168 hours" });
        const settings = await RecoverySettings.findOneAndUpdate({ key: "cart-recovery" }, { enabled: Boolean(req.body?.enabled), delayHours }, { upsert: true, new: true, runValidators: true });
        return res.json({ settings, message: "Cart recovery settings saved" });
    } catch (error) {
        return res.status(500).json({ message: "Unable to save cart recovery settings" });
    }
};
