import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
    try {
        const cartItems = req.user.cartItems || [];
        const productIds = cartItems.map((item) => item.product);
        const products = await Product.find({ _id: { $in: productIds } });

        const productsWithQuantity = products.map(product => {
            const item = cartItems.find(
                (cartItem) => cartItem.product.toString() === product._id.toString()
            );
            return {...product.toJSON(), quantity: item.quantity};
        })
        res.json(productsWithQuantity);
    } catch (error) {
        console.log("Error in getCartProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const addToCart = async (req, res) => {
    try {
        const {productId} = req.body;
        const user = req.user;

        const product = productId ? await Product.findById(productId) : null;
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const existingItem = user.cartItems.find(
            (item) => item.product.toString() === productId
        );
        const nextQuantity = existingItem ? existingItem.quantity + 1 : 1;
        if (product.trackInventory && nextQuantity > product.stock) {
            return res.status(409).json({ message: product.stock ? `Only ${product.stock} available` : "This product is out of stock" });
        }
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItems.push({ product: productId, quantity: 1 });
        }

        await user.save();
        res.json(user.cartItems);

    } catch (error) {
        console.log("Error in addToCart controller", error.message);
        res.status(500).json({ message: error.message });
    }
    };


    export const removeAllFromCart = async (req, res) => {
        try {
            const { productId } = req.body;
            const user = req.user;
            if (!productId) {
                user.cartItems = [];
            } else {
                user.cartItems = user.cartItems.filter(
                    (item) => item.product.toString() !== productId
                );
            }
            await user.save();
            res.json(user.cartItems);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
        };

        export const updateQuantity = async (req, res) => {
            try {
                const { id:productId } = req.params;
                const { quantity } = req.body;
                const user = req.user;
                if (!Number.isInteger(quantity) || quantity < 0) {
                    return res.status(400).json({ message: "Quantity must be a non-negative integer" });
                }
                const existingItem = user.cartItems.find(
                    (item) => item.product.toString() === productId
                );
                const product = await Product.findById(productId);
                if (!product) return res.status(404).json({ message: "Product not found" });
                if (product.trackInventory && quantity > product.stock) {
                    return res.status(409).json({ message: product.stock ? `Only ${product.stock} available` : "This product is out of stock" });
                }
            
                if (existingItem) {
                    if (quantity === 0) {
                        user.cartItems = user.cartItems.filter(
                            (item) => item.product.toString() !== productId
                        );
                        await user.save();
                        return res.json(user.cartItems);
                    }
                    existingItem.quantity = quantity;
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
