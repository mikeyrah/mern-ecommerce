import Product from "../models/product.model.js";
import User from "../models/user.model.js";

const populateWishlist = (query) => query.populate("wishlist.product", "name price image images brand category stock trackInventory createdAt");

const formatWishlist = (user) => user.wishlist
    .filter((item) => item.product)
    .map((item) => {
        const product = item.product.toObject ? item.product.toObject() : item.product;
        const inStock = !product.trackInventory || Number(product.stock) > 0;
        return {
            _id: item._id,
            product,
            addedAt: item.addedAt,
            notifyBackInStock: Boolean(item.notifyBackInStock),
            priceChanged: Number(item.priceWhenAdded) !== Number(product.price),
            previousPrice: item.priceWhenAdded,
            backInStock: !item.wasInStock && inStock,
            inStock,
        };
    });

export const getWishlist = async (req, res) => {
    try {
        const user = await populateWishlist(User.findById(req.user._id));
        return res.json({ wishlist: formatWishlist(user) });
    } catch (error) {
        return res.status(500).json({ message: "Unable to load your wishlist" });
    }
};

export const addToWishlist = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(404).json({ message: "Product not found" });
        const user = await User.findById(req.user._id);
        const exists = user.wishlist.some((item) => item.product.toString() === product._id.toString());
        if (!exists) user.wishlist.push({ product: product._id, priceWhenAdded: product.price, wasInStock: !product.trackInventory || product.stock > 0 });
        await user.save();
        await populateWishlist(user);
        return res.status(exists ? 200 : 201).json({ wishlist: formatWishlist(user), message: exists ? "Already saved" : "Saved to your wishlist" });
    } catch (error) {
        return res.status(500).json({ message: "Unable to save this product" });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.wishlist = user.wishlist.filter((item) => item.product.toString() !== req.params.productId);
        await user.save();
        await populateWishlist(user);
        return res.json({ wishlist: formatWishlist(user), message: "Removed from your wishlist" });
    } catch (error) {
        return res.status(500).json({ message: "Unable to remove this product" });
    }
};

export const updateStockNotification = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const item = user.wishlist.find((entry) => entry.product.toString() === req.params.productId);
        if (!item) return res.status(404).json({ message: "Product is not in your wishlist" });
        item.notifyBackInStock = Boolean(req.body?.enabled);
        await user.save();
        await populateWishlist(user);
        return res.json({ wishlist: formatWishlist(user), message: item.notifyBackInStock ? "Back-in-stock alerts enabled" : "Back-in-stock alerts disabled" });
    } catch (error) {
        return res.status(500).json({ message: "Unable to update notifications" });
    }
};
