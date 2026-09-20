import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

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
            return res.json(JSON.parse(featuredProducts))
        }
        featuredProducts = await Product.find({ isFeatured: true }).lean();

        if(!featuredProducts) {
            return res.status(404).json({ message: "No featured products found" });
        }

        await redis.set("featured_products", JSON.stringify(featuredProducts));

        res.json(featuredProducts);
        } catch (error) {
        console.log("Error in getFeaturedProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });

        }
    };

    export const createProduct = async (req, res) => {
        try {
            const { name, description, price, image, images = [], category, brand, details = "", ingredients = [], isNew = false } = req.body;

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

            const { name, description, price, image, images, category, brand, details = "", ingredients = [], isNew = false } = req.body;

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

            const updatedProduct = await product.save();

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

    export const getProductById = async (req, res) => {
        try {
            const product = await Product.findById(req.params.id).lean();
            if (!product) return res.status(404).json({ message: "Product not found" });
            if (!product.images?.length && product.image) product.images = [product.image];
            return res.json({ product });
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

            const existingReview = product.reviews.find((review) => review.user.toString() === req.user._id.toString());
            if (existingReview) {
                existingReview.rating = rating;
                existingReview.comment = comment;
                existingReview.username = req.user.name || req.user.email?.split("@")[0] || "Customer";
            } else {
                product.reviews.push({
                    user: req.user._id,
                    username: req.user.name || req.user.email?.split("@")[0] || "Customer",
                    rating,
                    comment,
                });
            }

            product.ratingCount = product.reviews.length;
            product.ratingAverage = product.ratingCount
                ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.ratingCount
                : 0;

            await product.save();
            return res.status(existingReview ? 200 : 201).json({ product });
        } catch (error) {
            console.log("Error in addProductReview controller", error.message);
            return res.status(500).json({ message: "Server error", error: error.message });
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
                        price: 1,
                    }
                }
            ]);

            res.json({ products });
        } catch (error) {
            console.log("Error in getRecommendedProducts controller", error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        };
    };

    export const getProductsByCategory = async (req, res) => {
        const { category } = req.params;
        try {
            
            const products = await Product.find({ category });
            res.json({ products });
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
            res.json({ products });
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
            const featuredProducts = await Product.find({ isFeatured: true }).lean();
            await redis.set("featured_products", JSON.stringify(featuredProducts));
        } catch (error) {
            console.log("Error updating featured products cache", error.message);
        }
    };
