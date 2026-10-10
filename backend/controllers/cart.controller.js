import Product from "../models/product.model.js";

const sameLine = (item, productId, variantId = "") => item.product.toString() === productId && String(item.variant || "") === String(variantId || "");
const selectedVariant = (product, variantId) => variantId ? product.variants.id(variantId) : null;
const availableStock = (product, variant) => variant?.trackInventory ? variant.stock : product.trackInventory ? product.stock : null;

const markCartChanged = (user) => {
    if (user.cartItems.length) {
        user.cartUpdatedAt = new Date();
        user.cartReminderCartUpdatedAt = undefined;
    } else {
        user.cartUpdatedAt = undefined;
        user.cartReminderSentAt = undefined;
        user.cartReminderCartUpdatedAt = undefined;
    }
};

export const getCartProducts = async (req, res) => {
    try {
        const cartItems = req.user.cartItems || [];
        const productIds = cartItems.map((item) => item.product);
        const products = await Product.find({ _id: { $in: productIds } });

        const productMap = new Map(products.map((product) => [product._id.toString(), product]));
        const productsWithQuantity = cartItems.map((item) => {
            const product = productMap.get(item.product.toString());
            if (!product) return null;
            const variant = selectedVariant(product, item.variant);
            return {
                ...product.toJSON(),
                quantity: item.quantity,
                cartLineId: item._id,
                selectedVariant: variant ? { _id: variant._id, label: variant.label, sku: variant.sku, price: variant.price, stock: variant.stock, trackInventory: variant.trackInventory, image: variant.image } : null,
                price: item.unitPrice ?? variant?.price ?? product.price,
                image: variant?.image || product.image,
            };
        }).filter(Boolean);
        res.json(productsWithQuantity);
    } catch (error) {
        console.log("Error in getCartProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const addToCart = async (req, res) => {
    try {
        const { productId, variantId = "" } = req.body;
        const user = req.user;

        const product = productId ? await Product.findById(productId) : null;
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const variant = variantId ? product.variants.id(variantId) : null;
        if (product.variants.length && !variant) return res.status(400).json({ message: "Please choose a product option" });
        const existingItem = user.cartItems.find((item) => sameLine(item, productId, variantId));
        const nextQuantity = existingItem ? existingItem.quantity + 1 : 1;
        const stock = availableStock(product, variant);
        if (stock !== null && nextQuantity > stock) {
            return res.status(409).json({ message: stock ? `Only ${stock} available` : "This option is out of stock" });
        }
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItems.push({ product: productId, variant: variant?._id || null, variantLabel: variant?.label || "", unitPrice: variant?.price ?? product.price, quantity: 1 });
        }

        markCartChanged(user);
        await user.save();
        res.json(user.cartItems);

    } catch (error) {
        console.log("Error in addToCart controller", error.message);
        res.status(500).json({ message: error.message });
    }
    };


    export const removeAllFromCart = async (req, res) => {
        try {
            const { productId, variantId = "" } = req.body;
            const user = req.user;
            if (!productId) {
                user.cartItems = [];
            } else {
                user.cartItems = user.cartItems.filter(
                    (item) => !sameLine(item, productId, variantId)
                );
            }
            markCartChanged(user);
            await user.save();
            res.json(user.cartItems);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
        };

        export const updateQuantity = async (req, res) => {
            try {
                const { id:productId } = req.params;
                const { quantity, variantId = "" } = req.body;
                const user = req.user;
                if (!Number.isInteger(quantity) || quantity < 0) {
                    return res.status(400).json({ message: "Quantity must be a non-negative integer" });
                }
                const existingItem = user.cartItems.find((item) => sameLine(item, productId, variantId));
                const product = await Product.findById(productId);
                if (!product) return res.status(404).json({ message: "Product not found" });
                const variant = variantId ? product.variants.id(variantId) : null;
                const stock = availableStock(product, variant);
                if (stock !== null && quantity > stock) {
                    return res.status(409).json({ message: stock ? `Only ${stock} available` : "This option is out of stock" });
                }
            
                if (existingItem) {
                    if (quantity === 0) {
                        user.cartItems = user.cartItems.filter(
                            (item) => !sameLine(item, productId, variantId)
                        );
                        markCartChanged(user);
                        await user.save();
                        return res.json(user.cartItems);
                    }
                    existingItem.quantity = quantity;
                    markCartChanged(user);
                    await user.save();
                    res.json(user.cartItems);
                } else {
                    res.status(404).json({ message: "Product not found in cart" });
                }
            } catch (error) {
                console.log("Error in updateQuantity controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
            }
        };
