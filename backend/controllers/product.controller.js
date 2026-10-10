import { redis } from "../lib/redis.js";
import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import SearchLog from "../models/searchLog.model.js";
import User from "../models/user.model.js";
import { sendBackInStock } from "../lib/email.js";

const isApprovedReview = (review) => !review.status || review.status === "approved";

const updateRatingSummary = (product) => {
    const approved = product.reviews.filter(isApprovedReview);
    product.ratingCount = approved.length;
    product.ratingAverage = approved.length
        ? approved.reduce((sum, review) => sum + review.rating, 0) / approved.length
        : 0;
};

const publicProduct = (product) => {
    const value = product.toObject ? product.toObject() : { ...product };
    value.reviews = (value.reviews || []).filter(isApprovedReview).map((review) => ({
        _id: review._id,
        username: review.username,
        rating: review.rating,
        comment: review.comment,
        verifiedPurchase: Boolean(review.verifiedPurchase),
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
    }));
    value.ratingCount = value.reviews.length;
    value.ratingAverage = value.reviews.length
        ? value.reviews.reduce((sum, review) => sum + review.rating, 0) / value.reviews.length
        : 0;
    return value;
};

const hasPurchasedProduct = (userId, productId) => Order.exists({
    user: userId,
    "products.product": productId,
    paymentStatus: { $in: ["paid", "partially-refunded"] },
    fulfillmentStatus: { $ne: "cancelled" },
});

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const allowedBrands = new Set(["botani-eve", "the-krafted-charm", "the-velvet-bakery"]);
const normalizeVariants = (variants = []) => {
    if (!Array.isArray(variants)) return [];
    return variants.map((variant) => ({
        ...((variant?._id && mongoose.isValidObjectId(variant._id)) ? { _id: variant._id } : {}),
        label: String(variant?.label || "").trim(),
        sku: String(variant?.sku || "").trim(),
        price: variant?.price === "" || variant?.price === undefined || variant?.price === null ? undefined : Number(variant.price),
        trackInventory: Boolean(variant?.trackInventory),
        stock: Math.max(0, Number(variant?.stock) || 0),
        image: String(variant?.image || "").trim(),
    })).filter((variant) => variant.label);
};

const notifyWishlistRestock = async (product) => {
    const users = await User.find({ wishlist: { $elemMatch: { product: product._id, notifyBackInStock: true } } });
    await Promise.allSettled(users.map((user) => sendBackInStock(user, product)));
    if (users.length) {
        await User.updateMany(
            { _id: { $in: users.map((user) => user._id) } },
            { $set: { "wishlist.$[item].notifyBackInStock": false, "wishlist.$[item].wasInStock": true } },
            { arrayFilters: [{ "item.product": product._id }] }
        );
    }
};

export const searchProducts = async (req, res) => {
    try {
        const query = String(req.query.q || "").trim().slice(0, 100);
        const brand = String(req.query.brand || "").trim();
        const category = String(req.query.category || "").trim().slice(0, 100);
        const inStock = req.query.inStock === "true";
        const minPrice = req.query.minPrice === undefined || req.query.minPrice === "" ? null : Number(req.query.minPrice);
        const maxPrice = req.query.maxPrice === undefined || req.query.maxPrice === "" ? null : Number(req.query.maxPrice);
        const sort = String(req.query.sort || "relevance");
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(48, Math.max(1, Number.parseInt(req.query.limit, 10) || 24));
        if (brand && !allowedBrands.has(brand)) return res.status(400).json({ message: "Invalid brand filter" });
        if ((minPrice !== null && (!Number.isFinite(minPrice) || minPrice < 0)) || (maxPrice !== null && (!Number.isFinite(maxPrice) || maxPrice < 0))) return res.status(400).json({ message: "Invalid price range" });
        if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) return res.status(400).json({ message: "Minimum price cannot exceed maximum price" });

        const filter = {};
        if (query) {
            const pattern = new RegExp(escapeRegex(query), "i");
            filter.$or = [{ name: pattern }, { description: pattern }, { category: pattern }, { brand: pattern }, { details: pattern }, { ingredients: pattern }];
        }
        if (brand) filter.brand = brand;
        if (category) filter.category = category;
        if (minPrice !== null || maxPrice !== null) filter.price = { ...(minPrice !== null ? { $gte: minPrice } : {}), ...(maxPrice !== null ? { $lte: maxPrice } : {}) };
        if (inStock) filter.$and = [{ $or: [{ trackInventory: false }, { trackInventory: { $exists: false } }, { stock: { $gt: 0 } }] }];

        const sorts = {
            newest: { createdAt: -1 },
            "price-low": { price: 1 },
            "price-high": { price: -1 },
            rating: { ratingAverage: -1, ratingCount: -1 },
            popular: { soldCount: -1, ratingCount: -1 },
            relevance: query ? { isFeatured: -1, soldCount: -1, createdAt: -1 } : { createdAt: -1 },
        };
        const sortOrder = sorts[sort] || sorts.relevance;
        const [products, total, categories] = await Promise.all([
            Product.find(filter).sort(sortOrder).skip((page - 1) * limit).limit(limit),
            Product.countDocuments(filter),
            Product.distinct("category"),
        ]);
        if (query) SearchLog.create({ query: query.toLowerCase(), resultCount: total }).catch(() => {});
        return res.json({ products: products.map(publicProduct), total, page, pages: Math.max(1, Math.ceil(total / limit)), filters: { brands: [...allowedBrands], categories: categories.sort() } });
    } catch (error) {
        console.log("Error searching products", error.message);
        return res.status(500).json({ message: "Unable to search products" });
    }
};

export const getSearchSuggestions = async (req, res) => {
    try {
        const query = String(req.query.q || "").trim().slice(0, 100);
        if (query.length < 2) return res.json({ suggestions: [] });
        const pattern = new RegExp(escapeRegex(query), "i");
        const products = await Product.find({ $or: [{ name: pattern }, { category: pattern }, { brand: pattern }] }).select("name image images brand category price").limit(6).lean();
        return res.json({ suggestions: products });
    } catch (error) {
        return res.status(500).json({ message: "Unable to load suggestions" });
    }
};

const uploadProductImages = async (images = []) => {
    const uploads = images
        .filter((image) => typeof image === "string" && image.startsWith("data:"))
        .map((image) => cloudinary.uploader.upload(image, { folder: "products" }));
    const results = await Promise.all(uploads);
    return results.map((result) => result.secure_url);
};

const getProductImageUrls = (product) => [...new Set([product.image, ...(product.images || [])].filter(Boolean))];

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ products });
    } catch (error) {
        console.log("Error in getAllProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featured_products")
        if(featuredProducts) {
            return res.json(JSON.parse(featuredProducts).map(publicProduct))
        }
        featuredProducts = await Product.find({ isFeatured: true }).lean();

        if(!featuredProducts) {
            return res.status(404).json({ message: "No featured products found" });
        }

        const publicProducts = featuredProducts.map(publicProduct);
        await redis.set("featured_products", JSON.stringify(publicProducts));

        res.json(publicProducts);
        } catch (error) {
        console.log("Error in getFeaturedProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });

        }
    };

    export const createProduct = async (req, res) => {
        try {
            const { name, description, price, image, images = [], category, brand, details = "", ingredients = [], isNew = false, sku = "", trackInventory = false, stock = 0, lowStockThreshold = 5, variantName = "", variants = [] } = req.body;

            const imagePayloads = images.length ? images : image ? [image] : [];
            const uploadedImages = await uploadProductImages(imagePayloads);

            if (!uploadedImages.length) {
                return res.status(400).json({ message: "At least one product image is required" });
            }

            const product = await Product.create({
                name,
                description,
                price,
                image: uploadedImages[0],
                images: uploadedImages,
                category,
                brand,
                details,
                ingredients: Array.isArray(ingredients) ? ingredients : String(ingredients).split(",").map((item) => item.trim()).filter(Boolean),
                isNew,
                sku,
                trackInventory: Boolean(trackInventory),
                stock: Math.max(0, Number(stock) || 0),
                lowStockThreshold: Math.max(0, Number(lowStockThreshold) || 0),
                variantName: String(variantName).trim(),
                variants: normalizeVariants(variants),
            })
            res.status(201).json({ product });
        } catch (error) {
            console.log("Error in createProduct controller", error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    };

    export const deleteProduct = async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);

            if(!product) {
                return res.status(404).json({ message: "Product not found" });
            }

            for (const imageUrl of getProductImageUrls(product)) {
                const publicId = imageUrl.split("/").pop().split(".")[0];
                try {
                    await cloudinary.uploader.destroy(`products/${publicId}`);
                    console.log("Image deleted from Cloudinary");
                } catch (error) {
                    console.log("Error deleting image from Cloudinary", error.message);
                }
            }

            await Product.findByIdAndDelete(req.params.id);

            res.json({ message: "Product deleted successfully" });
        } catch (error) {
            console.log("Error in deleteProduct controller", error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    };

    export const updateProduct = async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);

            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }

            const { name, description, price, image, images, category, brand, details = "", ingredients = [], isNew = false, sku, trackInventory, stock, lowStockThreshold, variantName = "", variants = [] } = req.body;
            const wasOutOfStock = product.trackInventory && product.stock <= 0;

            if (!name || !description || price === "" || price === undefined || !category || !brand) {
                return res.status(400).json({ message: "Name, description, price, category, and brand are required" });
            }

            const numericPrice = Number(price);
            if (!Number.isFinite(numericPrice) || numericPrice < 0) {
                return res.status(400).json({ message: "Price must be a valid positive number" });
            }

            const previousImages = getProductImageUrls(product);
            const submittedImages = Array.isArray(images) ? images : image ? [image] : previousImages;
            const retainedImages = submittedImages.filter((item) => typeof item === "string" && !item.startsWith("data:"));
            const uploadedImages = await uploadProductImages(submittedImages);
            const nextImages = [...retainedImages, ...uploadedImages];

            if (!nextImages.length) return res.status(400).json({ message: "At least one product image is required" });

            product.name = name.trim();
            product.description = description.trim();
            product.price = numericPrice;
            product.category = category;
            product.brand = brand;
            product.image = nextImages[0];
            product.images = nextImages;
            product.details = details.trim();
            product.ingredients = Array.isArray(ingredients) ? ingredients : String(ingredients).split(",").map((item) => item.trim()).filter(Boolean);
            product.isNew = Boolean(isNew);
            if (sku !== undefined) product.sku = String(sku).trim();
            if (trackInventory !== undefined) product.trackInventory = Boolean(trackInventory);
            if (stock !== undefined) product.stock = Math.max(0, Number(stock) || 0);
            if (lowStockThreshold !== undefined) product.lowStockThreshold = Math.max(0, Number(lowStockThreshold) || 0);
            product.variantName = String(variantName).trim();
            product.variants = normalizeVariants(variants);

            const updatedProduct = await product.save();
            if (wasOutOfStock && (!updatedProduct.trackInventory || updatedProduct.stock > 0)) notifyWishlistRestock(updatedProduct).catch((error) => console.log("Wishlist restock notification failed", error.message));

            const removedImages = previousImages.filter((url) => !nextImages.includes(url));
            removedImages.forEach((url) => {
                const publicId = url.split("/").pop().split(".")[0];
                cloudinary.uploader.destroy(`products/${publicId}`).catch((error) => {
                    console.log("Error deleting replaced image from Cloudinary", error.message);
                });
            });

            await updateFeaturedProductsCache();
            return res.json({ product: updatedProduct });
        } catch (error) {
            console.log("Error in updateProduct controller", error.message);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    };

    export const updateInventory = async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) return res.status(404).json({ message: "Product not found" });
            const wasOutOfStock = product.trackInventory && product.stock <= 0;
            const { stock, lowStockThreshold, trackInventory, sku } = req.body ?? {};
            if (stock !== undefined && (!Number.isInteger(Number(stock)) || Number(stock) < 0)) return res.status(400).json({ message: "Stock must be a non-negative whole number" });
            if (lowStockThreshold !== undefined && (!Number.isInteger(Number(lowStockThreshold)) || Number(lowStockThreshold) < 0)) return res.status(400).json({ message: "Low-stock threshold must be a non-negative whole number" });
            if (stock !== undefined) product.stock = Number(stock);
            if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);
            if (trackInventory !== undefined) product.trackInventory = Boolean(trackInventory);
            if (sku !== undefined) product.sku = String(sku).trim();
            await product.save();
            if (wasOutOfStock && (!product.trackInventory || product.stock > 0)) notifyWishlistRestock(product).catch((error) => console.log("Wishlist restock notification failed", error.message));
            return res.json({ product: publicProduct(product) });
        } catch (error) {
            return res.status(500).json({ message: "Unable to update inventory" });
        }
    };

    export const getProductById = async (req, res) => {
        try {
            const product = await Product.findById(req.params.id).lean();
            if (!product) return res.status(404).json({ message: "Product not found" });
            if (!product.images?.length && product.image) product.images = [product.image];
            return res.json({ product: publicProduct(product) });
        } catch (error) {
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    };

    export const addProductReview = async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) return res.status(404).json({ message: "Product not found" });

            const rating = Number(req.body.rating);
            const comment = String(req.body.comment || "").trim();
            if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) {
                return res.status(400).json({ message: "A rating from 1 to 5 and review text are required" });
            }
            if (comment.length > 1000) return res.status(400).json({ message: "Review must be 1000 characters or fewer" });

            const verifiedPurchase = await hasPurchasedProduct(req.user._id, product._id);
            if (!verifiedPurchase) return res.status(403).json({ message: "Only customers who purchased this product can review it" });

            const existingReview = product.reviews.find((review) => review.user.toString() === req.user._id.toString());
            if (existingReview) {
                existingReview.rating = rating;
                existingReview.comment = comment;
                existingReview.username = req.user.name || req.user.email?.split("@")[0] || "Customer";
                existingReview.verifiedPurchase = true;
                existingReview.status = "pending";
                existingReview.adminNote = "";
            } else {
                product.reviews.push({
                    user: req.user._id,
                    username: req.user.name || req.user.email?.split("@")[0] || "Customer",
                    rating,
                    comment,
                    verifiedPurchase: true,
                    status: "pending",
                });
            }

            updateRatingSummary(product);

            await product.save();
            return res.status(existingReview ? 200 : 201).json({
                message: "Thank you. Your verified review is awaiting approval.",
                product: publicProduct(product),
            });
        } catch (error) {
            console.log("Error in addProductReview controller", error.message);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    };

    export const getReviewEligibility = async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) return res.status(404).json({ message: "Product not found" });
            const eligible = Boolean(await hasPurchasedProduct(req.user._id, product._id));
            const review = product.reviews.find((item) => item.user.toString() === req.user._id.toString());
            return res.json({
                eligible,
                review: review ? { rating: review.rating, comment: review.comment, status: review.status || "approved" } : null,
            });
        } catch (error) {
            return res.status(500).json({ message: "Unable to check review eligibility" });
        }
    };

    export const getAdminReviews = async (_req, res) => {
        try {
            const products = await Product.find({ "reviews.0": { $exists: true } }).select("name image reviews").lean();
            const reviews = products.flatMap((product) => product.reviews.map((review) => ({
                ...review,
                productId: product._id,
                productName: product.name,
                productImage: product.image,
                status: review.status || "approved",
            }))).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return res.json({ reviews });
        } catch (error) {
            return res.status(500).json({ message: "Unable to load reviews" });
        }
    };

    export const moderateReview = async (req, res) => {
        try {
            const status = String(req.body?.status || "");
            const adminNote = String(req.body?.adminNote || "").trim();
            if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Choose approved or rejected" });
            if (adminNote.length > 500) return res.status(400).json({ message: "Admin note must be 500 characters or fewer" });
            const product = await Product.findById(req.params.productId);
            const review = product?.reviews.id(req.params.reviewId);
            if (!product || !review) return res.status(404).json({ message: "Review not found" });
            review.status = status;
            review.adminNote = adminNote;
            updateRatingSummary(product);
            await product.save();
            await updateFeaturedProductsCache();
            return res.json({ message: `Review ${status}`, review });
        } catch (error) {
            return res.status(500).json({ message: "Unable to moderate review" });
        }
    };

    export const deleteReview = async (req, res) => {
        try {
            const product = await Product.findById(req.params.productId);
            const review = product?.reviews.id(req.params.reviewId);
            if (!product || !review) return res.status(404).json({ message: "Review not found" });
            review.deleteOne();
            updateRatingSummary(product);
            await product.save();
            await updateFeaturedProductsCache();
            return res.json({ message: "Review deleted" });
        } catch (error) {
            return res.status(500).json({ message: "Unable to delete review" });
        }
    };

    export const getRecommendedProducts = async (req, res) => {
        try {
            const products = await Product.aggregate([
                { $sample: { size: 4 } },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        description: 1,
                        image: 1,
                        images: 1,
                        price: 1,
                        brand: 1,
                        category: 1,
                        isNew: 1,
                        trackInventory: 1,
                        stock: 1,
                        variantName: 1,
                        variants: 1,
                        reviews: 1,
                        createdAt: 1,
                    }
                }
            ]);

            res.json({ products: products.map(publicProduct) });
        } catch (error) {
            console.log("Error in getRecommendedProducts controller", error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        };
    };

    export const getProductsByCategory = async (req, res) => {
        const { category } = req.params;
        try {
            
            const products = await Product.find({ category });
            res.json({ products: products.map(publicProduct) });
        } catch (error) {
            console.log("Error in getProductsByCategory controller", error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    };

    export const getProductsByBrand = async (req, res) => {
        const { brand } = req.params;
        try {
            // Products created before brand support belong to the original
            // apparel collection, The Krafted Charm.
            const filter = brand === "the-krafted-charm"
                ? { $or: [{ brand }, { brand: { $exists: false } }] }
                : { brand };
            const products = await Product.find(filter);
            res.json({ products: products.map(publicProduct) });
        } catch (error) {
            console.log("Error in getProductsByBrand controller", error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    };


    export const toggleFeaturedProduct = async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);

            if(product) {
                product.isFeatured = !product.isFeatured;
                const updatedProduct = await product.save();
                await updateFeaturedProductsCache();
                res.json({ product: updatedProduct });
            } else {
                res.status(404).json({ message: "Product not found" });
            }
        } catch (error) {
            console.log("Error in toggleFeaturedProduct controller", error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    };

    export async function updateFeaturedProductsCache() {
        try {
            const featuredProducts = await Product.find({ isFeatured: true });
            await redis.set("featured_products", JSON.stringify(featuredProducts.map(publicProduct)));
        } catch (error) {
            console.log("Error updating featured products cache", error.message);
        }
    };
