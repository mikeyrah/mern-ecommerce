import express from "express";
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js';
import { getAnalyticsData, getDailySalesData, getSearchAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, async (req,res) => {
    try {
        const analyticsData = await getAnalyticsData();

        const endDate = new Date();
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 7); // 7 days ago

        const dailySalesData = await getDailySalesData(startDate, endDate);
        const searchAnalytics = await getSearchAnalytics();

        res.json({
            analyticsData,
            dailySalesData,
            searchAnalytics
        });
    } catch (error) {
        console.log("Error in analytics route", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;
