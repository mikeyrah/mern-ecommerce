import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import SearchLog from '../models/searchLog.model.js';

export const getAnalyticsData = async () => {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    

    const salesData = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" }
            }
        }
    ])

    const { totalOrders, totalRevenue} = salesData[0] || { totalOrders: 0, totalRevenue: 0 };

    return {
        users: totalUsers,
        products: totalProducts,
        totalSales: totalOrders,
        totalRevenue,
    }
};

export const getDailySalesData = async (startDate, endDate) => {
    try {
        const dailySalesData = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                sales: { $sum: 1 },
                revenue: { $sum: "$totalAmount" },
            },
        },
        { $sort: { _id: 1 } },
    ]);
    return dailySalesData;

    const dateArray = getDatesInRange(startDate, endDate);

    return dateArray.map(date => {
        const foundData = dailySalesData.find(item => item._id === date);
       
        return {
            date,
            sales: foundData?.sales || 0,
            revenue: foundData?.revenue || 0,
        }
    })
    } catch (error) {
        throw error;
    }
};

export const getSearchAnalytics = async () => {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [topSearches, noResultSearches, totalSearches] = await Promise.all([
        SearchLog.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: "$query", searches: { $sum: 1 }, averageResults: { $avg: "$resultCount" } } }, { $sort: { searches: -1 } }, { $limit: 10 }]),
        SearchLog.aggregate([{ $match: { createdAt: { $gte: since }, resultCount: 0 } }, { $group: { _id: "$query", searches: { $sum: 1 } } }, { $sort: { searches: -1 } }, { $limit: 8 }]),
        SearchLog.countDocuments({ createdAt: { $gte: since } }),
    ]);
    return { totalSearches, topSearches, noResultSearches };
};

export const getWishlistAnalytics = async () => {
    const [summary] = await User.aggregate([
        { $unwind: "$wishlist" },
        { $group: { _id: "$wishlist.product", saves: { $sum: 1 }, alerts: { $sum: { $cond: ["$wishlist.notifyBackInStock", 1, 0] } } } },
        { $sort: { saves: -1 } },
        { $limit: 10 },
        { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        { $group: { _id: null, popularProducts: { $push: { productId: "$_id", name: { $ifNull: ["$product.name", "Deleted product"] }, saves: "$saves", alerts: "$alerts" } }, totalSaved: { $sum: "$saves" } } },
    ]);
    return summary || { totalSaved: 0, popularProducts: [] };
};

function getDatesInRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}
