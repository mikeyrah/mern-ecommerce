import Coupon from '../models/coupon.model.js';
import Order from '../models/order.model.js'
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import { stripe } from '../lib/stripe.js';
import { sendNewOrderNotification, sendOrderConfirmation } from '../lib/email.js';
import { RecoveryEvent } from '../models/cartRecovery.model.js';

const clearPurchasedCart = async (userId, order) => {
    const user = await User.findById(userId).select("cartItems cartReminderSentAt cartReminderCartUpdatedAt cartUpdatedAt");
    if (!user) return;
    const wasReminded = Boolean(user.cartReminderSentAt && user.cartReminderCartUpdatedAt);
    user.cartItems = [];
    user.cartUpdatedAt = undefined;
    user.cartReminderSentAt = undefined;
    user.cartReminderCartUpdatedAt = undefined;
    await user.save();
    if (wasReminded) {
        try { await RecoveryEvent.create({ user: user._id, type: "recovered", cartTotal: order.totalAmount, itemCount: order.products.reduce((sum, item) => sum + item.quantity, 0), order: order._id }); }
        catch (error) { if (error?.code !== 11000) throw error; }
    }
};


export const createCheckoutSession = async (req,res) => {
    try {
        const {products, couponCode, deliveryMethod = "shipping"} = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Invalid or empty products array" });
        }
        if (products.length > 15) return res.status(400).json({ message: "Checkout supports up to 15 different products per order" });
        if (!["shipping", "pickup"].includes(deliveryMethod)) return res.status(400).json({ message: "Invalid delivery method" });

        const requestedProducts = products.map((product) => ({
            id: product._id,
            quantity: Number(product.quantity),
        }));
        if (requestedProducts.some((product) => !product.id || !Number.isInteger(product.quantity) || product.quantity < 1 || product.quantity > 99)) {
            return res.status(400).json({ message: "Invalid product quantity" });
        }

        const catalogProducts = await Product.find({ _id: { $in: requestedProducts.map((product) => product.id) } }).lean();
        if (catalogProducts.length !== requestedProducts.length) return res.status(400).json({ message: "One or more products are unavailable" });
        const catalog = new Map(catalogProducts.map((product) => [product._id.toString(), product]));
        const verifiedProducts = requestedProducts.map((item) => ({ ...catalog.get(item.id), quantity: item.quantity }));
        const unavailable = verifiedProducts.find((product) => product.trackInventory && product.quantity > product.stock);
        if (unavailable) {
            return res.status(409).json({ message: unavailable.stock ? `Only ${unavailable.stock} of ${unavailable.name} available` : `${unavailable.name} is out of stock` });
        }

        let totalAmount = 0;
        const lineItems = verifiedProducts.map(product => {
            const amount = Math.round(product.price * 100);
            totalAmount += amount * product.quantity;

            return {
                price_data:{
                    currency:"usd",
                    product_data: {
                        name:product.name,
                        images: product.image ? [product.image] : [],
                    },
                    unit_amount:amount
                },
                quantity:product.quantity || 1,
            }
        });

        let coupon = null;
        if(couponCode) {
            coupon = await Coupon.findOne({code:couponCode,userId:req.user._id,isActive:true});
            if(coupon){
                totalAmount -= Math.round(totalAmount * coupon.discountPercentage / 100);
            }
        }

        const shippingAmount = deliveryMethod === "shipping" && totalAmount < 7500
            ? Math.max(0, Number(process.env.FLAT_SHIPPING_CENTS) || 700)
            : 0;
        const fulfillmentOptions = deliveryMethod === "shipping" ? {
            shipping_address_collection: { allowed_countries: ["US"] },
            shipping_options: [{
                shipping_rate_data: {
                    type: "fixed_amount",
                    fixed_amount: { amount: shippingAmount, currency: "usd" },
                    display_name: shippingAmount ? "Standard shipping" : "Free standard shipping",
                    delivery_estimate: {
                        minimum: { unit: "business_day", value: 3 },
                        maximum: { unit: "business_day", value: 5 },
                    },
                },
            }],
        } : {};

        const session = await stripe.checkout.sessions.create({
            payment_method_types:["card"],
            line_items: lineItems,
            mode:"payment",
            ...fulfillmentOptions,
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: coupon
            ? [
                {
                    coupon: await createStripeCoupon(coupon.discountPercentage),
                },
            ]
            : [],
            metadata: {
                userId:req.user._id.toString(),
                couponCode:couponCode || "",
                deliveryMethod,
                shippingAmount: String(shippingAmount),
                products: verifiedProducts.map((p) => `${p._id}:${p.quantity}`).join(","),
            },
        });
        if(totalAmount >= 20000) {
            await createNewCoupon(req.user._id);
        }
        res.status(200).json({
            sessionId: session.id,
            url: session.url,
            totalAmount: (totalAmount + shippingAmount) / 100,
        });
    } catch (error) {
        console.error("Error processing checkout:", error);
        res.status(500).json({ message: "Error processing checkout", error: error.message });
    }
};

const recordPaidOrder = async (session) => {
      if (session.payment_status !== "paid") throw new Error("Payment has not completed");
      const existingOrder = await Order.findOne({ stripeSessionId: session.id });
      if (existingOrder) {
        await clearPurchasedCart(existingOrder.user, existingOrder);
        return existingOrder;
      }
      
        if(session.metadata.couponCode) {
            await Coupon.findOneAndUpdate({
                code: session.metadata.couponCode, userId:session.metadata.userId
            }, {
                isActive:false
            })
        }

        let products;
        if (session.metadata.products.trim().startsWith("[")) {
            products = JSON.parse(session.metadata.products);
        } else {
            const references = session.metadata.products.split(",").map((entry) => {
                const [id, quantity] = entry.split(":");
                return { id, quantity: Number(quantity) };
            });
            const catalogProducts = await Product.find({ _id: { $in: references.map((item) => item.id) } }).lean();
            const catalog = new Map(catalogProducts.map((product) => [product._id.toString(), product]));
            products = references.map((item) => {
                const product = catalog.get(item.id);
                if (!product) throw new Error("A purchased product could not be located");
                return { id: item.id, quantity: item.quantity, price: product.price, name: product.name, image: product.images?.[0] || product.image || "" };
            });
        }
        const newOrder = new Order({
            user:session.metadata.userId,
            products: products.map(product => ({
                product: product.id,
                quantity: product.quantity,
                price: product.price,
                name: product.name,
                image: product.image,
            })),
            totalAmount: session.amount_total / 100,
            stripeSessionId: session.id,
            stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || "",
            deliveryMethod: session.metadata.deliveryMethod || "shipping",
            shippingAmount: Number(session.metadata.shippingAmount || 0) / 100,
            pickupLocation: session.metadata.deliveryMethod === "pickup"
                ? (process.env.PICKUP_LOCATION || "Stewart-Tate & Co., 970 N Oak St, Jackson, GA 30233. Pickup hours: 10 AM–6 PM. We'll notify you when your order is ready.")
                : "",
            customerEmail: session.customer_details?.email || "",
            shippingAddress: session.shipping_details?.address ? {
                name: session.shipping_details.name || "",
                line1: session.shipping_details.address.line1 || "",
                line2: session.shipping_details.address.line2 || "",
                city: session.shipping_details.address.city || "",
                state: session.shipping_details.address.state || "",
                postalCode: session.shipping_details.address.postal_code || "",
                country: session.shipping_details.address.country || "",
            } : undefined,
        })

        try {
            await newOrder.save();
        } catch (error) {
            // Stripe's webhook and the browser success callback can arrive at
            // the same time. The unique session ID lets one create the order;
            // the other should return that order instead of showing an error.
            if (error?.code === 11000) {
                const concurrentOrder = await Order.findOne({ stripeSessionId: session.id });
                if (concurrentOrder) return concurrentOrder;
            }
            throw error;
        }
        await Promise.all(products.map((product) => Product.updateOne(
            { _id: product.id, trackInventory: true },
            [
                { $set: { stock: { $max: [0, { $subtract: ["$stock", product.quantity] }] }, soldCount: { $add: [{ $ifNull: ["$soldCount", 0] }, product.quantity] } } },
            ],
            { updatePipeline: true }
        )));
        await clearPurchasedCart(session.metadata.userId, newOrder);

        const customer = await User.findById(session.metadata.userId).select("name email").lean();
        const notificationEmail = process.env.ORDER_NOTIFICATION_EMAIL || "stewarttateandco@gmail.com";
        const notifications = await Promise.allSettled([
            sendOrderConfirmation(newOrder, {
                name: customer?.name || session.customer_details?.name || "Customer",
                email: newOrder.customerEmail || customer?.email,
            }),
            sendNewOrderNotification(
                newOrder,
                notificationEmail,
                { name: customer?.name || session.customer_details?.name || "Customer" }
            ),
        ]);
        notifications.filter((result) => result.status === "rejected").forEach((result) => {
            console.error("Order email failed:", result.reason?.message || result.reason);
        });

        return newOrder;
};

export const checkoutSuccess = async(req,res) => {
    try {
        const { sessionId } = req.body ?? {};
        if (!sessionId) return res.status(400).json({ message: "Checkout session is required" });
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.metadata?.userId !== req.user._id.toString()) return res.status(403).json({ message: "This checkout does not belong to your account" });
        const order = await recordPaidOrder(session);
        res.status(200).json({
            success: true,
            message: "Payment successful and order recorded.",
            orderId: order._id,
            deliveryMethod: order.deliveryMethod,
            pickupLocation: order.pickupLocation,
        });
    } catch (error) {
        console.error("Error processing successful checkout:", error);
        res.status(500).json({ message:"Error processing successful checkout", error: error.message });
    }
};

export const stripeWebhook = async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).send("Stripe webhook is not configured");
    try {
        const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
        if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
            await recordPaidOrder(event.data.object);
        }
        res.json({ received: true });
    } catch (error) {
        console.error("Stripe webhook failed:", error.message);
        res.status(400).send(`Webhook error: ${error.message}`);
    }
};

async function createStripeCoupon(discountPercentage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    })

    return coupon.id;
}

async function createNewCoupon(userId){
    const newCoupon = new Coupon({
        code:"GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage:10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId:userId
    })

    await newCoupon.save();

    return newCoupon
}
