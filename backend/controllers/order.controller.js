import mongoose from "mongoose";
import Order from "../models/order.model.js";

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

        if (fulfillmentStatus && fulfillmentStatus !== order.fulfillmentStatus) {
            order.fulfillmentStatus = fulfillmentStatus;
            order.statusHistory.push({ status: fulfillmentStatus, note: adminNote || "" });
        }
        if (trackingNumber !== undefined) order.trackingNumber = String(trackingNumber).trim();
        if (carrier !== undefined) order.carrier = String(carrier).trim();
        if (adminNote !== undefined) order.adminNote = String(adminNote).trim();
        await order.save();
        const updated = await populatedOrder(Order.findById(order._id));
        res.json({ order: updated });
    } catch (error) {
        res.status(500).json({ message: "Unable to update order" });
    }
};
