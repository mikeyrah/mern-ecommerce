import CustomOrder from "../models/customOrder.model.js";
import { sendCustomOrderConfirmation, sendCustomOrderNotification, sendCustomOrderStatusUpdate } from "../lib/email.js";

const statuses = new Set(["new", "reviewing", "quoted", "approved", "declined", "completed"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createCustomOrder = async (req, res) => {
    try {
        const { customerName, email, phone, occasion, dessertType, eventDate, servings, flavor, colors, designDetails, allergies, budget, deliveryMethod } = req.body;
        const requestedDate = new Date(eventDate);
        if (!customerName?.trim() || !emailPattern.test(email || "") || !phone?.trim() || !occasion?.trim() || !dessertType || !flavor?.trim() || !designDetails?.trim()) {
            return res.status(400).json({ message: "Please complete all required custom-order details." });
        }
        if (Number.isNaN(requestedDate.getTime()) || requestedDate < new Date(new Date().setHours(0, 0, 0, 0))) {
            return res.status(400).json({ message: "Please choose a future event date." });
        }
        const order = await CustomOrder.create({ customerName, email, phone, occasion, dessertType, eventDate: requestedDate, servings: Number(servings), flavor, colors, designDetails, allergies, budget: Number(budget) || 0, deliveryMethod });
        await Promise.allSettled([
            sendCustomOrderConfirmation(order),
            sendCustomOrderNotification(order, process.env.ORDER_NOTIFICATION_EMAIL || "stewarttateandco@gmail.com"),
        ]);
        return res.status(201).json({ message: "Your custom order request has been received.", requestNumber: order.requestNumber });
    } catch (error) {
        if (error.name === "ValidationError") return res.status(400).json({ message: Object.values(error.errors)[0]?.message || "Invalid custom order request." });
        console.error("Unable to create custom order:", error);
        return res.status(500).json({ message: "Unable to submit your request right now." });
    }
};

export const getCustomOrders = async (_req, res) => {
    try {
        const orders = await CustomOrder.find({}).sort({ createdAt: -1 }).lean();
        return res.json({ orders });
    } catch (error) {
        return res.status(500).json({ message: "Unable to load custom orders." });
    }
};

export const updateCustomOrder = async (req, res) => {
    try {
        const order = await CustomOrder.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Custom order request not found." });
        const previousStatus = order.status;
        if (req.body.status && !statuses.has(req.body.status)) return res.status(400).json({ message: "Invalid custom-order status." });
        if (req.body.status) order.status = req.body.status;
        if (req.body.quotedPrice !== undefined) order.quotedPrice = Math.max(0, Number(req.body.quotedPrice) || 0);
        if (req.body.adminNote !== undefined) order.adminNote = String(req.body.adminNote).slice(0, 2000);
        await order.save();
        if (order.status !== previousStatus || order.status === "quoted") await sendCustomOrderStatusUpdate(order).catch((error) => console.error("Custom order email failed:", error.message));
        return res.json({ order });
    } catch (error) {
        return res.status(500).json({ message: "Unable to update custom order." });
    }
};
