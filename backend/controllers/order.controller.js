import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import { stripe } from "../lib/stripe.js";
import { sendOrderStatusUpdate, sendReturnStatusUpdate } from "../lib/email.js";

const statuses = new Set(["placed", "processing", "shipped", "delivered", "cancelled"]);

const populatedOrder = (query) => query
    .populate("user", "name email profilePicture")
    .populate("products.product", "name image images brand category");

export const getMyOrders = async (req, res) => {
    try {
        const orders = await populatedOrder(Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ message: "Unable to load orders" });
    }
};

export const getOrderById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid order" });
        const order = await populatedOrder(Order.findById(req.params.id));
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (req.user.role !== "admin" && order.user._id.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Access denied" });
        res.json({ order });
    } catch (error) {
        res.status(500).json({ message: "Unable to load order" });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status && statuses.has(req.query.status)) filter.fulfillmentStatus = req.query.status;
        const orders = await populatedOrder(Order.find(filter).sort({ createdAt: -1 }));
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ message: "Unable to load orders" });
    }
};

export const updateOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        const { fulfillmentStatus, trackingNumber, carrier, adminNote } = req.body ?? {};
        if (fulfillmentStatus && !statuses.has(fulfillmentStatus)) return res.status(400).json({ message: "Invalid order status" });

        const statusChanged = fulfillmentStatus && fulfillmentStatus !== order.fulfillmentStatus;
        if (statusChanged) {
            if (fulfillmentStatus === "cancelled" && !order.inventoryRestocked) {
                await Promise.all(order.products.map((item) => Product.updateOne(
                    { _id: item.product, trackInventory: true },
                    [{ $set: { stock: { $add: ["$stock", item.quantity] }, soldCount: { $max: [0, { $subtract: [{ $ifNull: ["$soldCount", 0] }, item.quantity] }] } } }]
                )));
                order.inventoryRestocked = true;
            } else if (order.fulfillmentStatus === "cancelled" && order.inventoryRestocked) {
                await Promise.all(order.products.map((item) => Product.updateOne(
                    { _id: item.product, trackInventory: true },
                    [{ $set: { stock: { $max: [0, { $subtract: ["$stock", item.quantity] }] }, soldCount: { $add: [{ $ifNull: ["$soldCount", 0] }, item.quantity] } } }]
                )));
                order.inventoryRestocked = false;
            }
            order.fulfillmentStatus = fulfillmentStatus;
            order.statusHistory.push({ status: fulfillmentStatus, note: adminNote || "" });
        }
        if (trackingNumber !== undefined) order.trackingNumber = String(trackingNumber).trim();
        if (carrier !== undefined) order.carrier = String(carrier).trim();
        if (adminNote !== undefined) order.adminNote = String(adminNote).trim();
        await order.save();
        const updated = await populatedOrder(Order.findById(order._id));
        if (statusChanged) {
            const customer = await User.findById(order.user).select("name email").lean();
            sendOrderStatusUpdate(order, { name: customer?.name, email: order.customerEmail || customer?.email })
                .catch((emailError) => console.error("Order status email failed:", emailError.message));
        }
        res.json({ order: updated });
    } catch (error) {
        res.status(500).json({ message: "Unable to update order" });
    }
};

export const requestReturn = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.paymentStatus !== "paid") return res.status(409).json({ message: "This order is not eligible for a return" });
        if (!["processing", "shipped", "delivered"].includes(order.fulfillmentStatus)) return res.status(409).json({ message: "This order is not currently eligible for a return" });
        if (order.returnRequest?.status && order.returnRequest.status !== "none" && order.returnRequest.status !== "rejected") return res.status(409).json({ message: "A return request already exists for this order" });

        const reason = String(req.body?.reason || "").trim();
        const customerNote = String(req.body?.customerNote || "").trim();
        if (!reason) return res.status(400).json({ message: "Please select a return reason" });
        order.returnRequest = { status: "requested", reason, customerNote, requestedAt: new Date() };
        await order.save();
        const updated = await populatedOrder(Order.findById(order._id));
        res.status(201).json({ order: updated, message: "Return request submitted" });
    } catch (error) {
        res.status(500).json({ message: "Unable to submit return request" });
    }
};

export const reviewReturn = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.returnRequest?.status !== "requested") return res.status(409).json({ message: "This return request has already been reviewed" });
        const action = String(req.body?.action || "");
        if (!["approve", "reject"].includes(action)) return res.status(400).json({ message: "Choose approve or reject" });

        order.returnRequest.adminNote = String(req.body?.adminNote || "").trim();
        order.returnRequest.reviewedAt = new Date();
        if (action === "reject") {
            order.returnRequest.status = "rejected";
        } else {
            let paymentIntentId = order.stripePaymentIntentId;
            if (!paymentIntentId) {
                const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
                paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
            }
            if (!paymentIntentId) return res.status(409).json({ message: "Stripe payment could not be located" });
            const refund = await stripe.refunds.create({ payment_intent: paymentIntentId }, { idempotencyKey: `order-refund-${order._id}` });
            order.stripePaymentIntentId = paymentIntentId;
            order.paymentStatus = "refunded";
            order.returnRequest.status = "refunded";
            order.returnRequest.refundId = refund.id;
            order.returnRequest.refundAmount = refund.amount / 100;
            order.returnRequest.refundedAt = new Date();
            if (!order.inventoryRestocked) {
                await Promise.all(order.products.map((item) => Product.updateOne(
                    { _id: item.product, trackInventory: true },
                    [{ $set: { stock: { $add: ["$stock", item.quantity] }, soldCount: { $max: [0, { $subtract: [{ $ifNull: ["$soldCount", 0] }, item.quantity] }] } } }]
                )));
                order.inventoryRestocked = true;
            }
        }
        await order.save();
        const customer = await User.findById(order.user).select("name email").lean();
        sendReturnStatusUpdate(order, { name: customer?.name, email: order.customerEmail || customer?.email })
            .catch((emailError) => console.error("Return email failed:", emailError.message));
        const updated = await populatedOrder(Order.findById(order._id));
        res.json({ order: updated, message: action === "approve" ? "Refund issued" : "Return request declined" });
    } catch (error) {
        console.error("Return review failed:", error);
        res.status(500).json({ message: error?.type?.startsWith("Stripe") ? error.message : "Unable to review return request" });
    }
};
