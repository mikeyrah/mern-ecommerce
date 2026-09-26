import Coupon from '../models/coupon.model.js';
import Order from '../models/order.model.js'
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import { stripe } from '../lib/stripe.js';


export const createCheckoutSession = async (req,res) => {
    try {
        const {products, couponCode} = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Invalid or empty products array" });
        }

        const requestedProducts = products.map((product) => ({
            id: product._id,
            quantity: Number(product.quantity),
        }));
        if (requestedProducts.some((product) => !product.id || !Number.isInteger(product.quantity) || product.quantity < 1 || product.quantity > 99)) {
            return res.status(400).json({ message: "Invalid product quantity" });
        }

        const catalogProducts = await Product.find({ _id: { $in: requestedProducts.map((product) => product.id) } }).lean();
        if (catalogProducts.length !== requestedProducts.length) return res.status(400).json({ message: "One or more products are unavailable" });
        const catalog = new Map(catalogProducts.map((product) => [product._id.toString(), product]));
        const verifiedProducts = requestedProducts.map((item) => ({ ...catalog.get(item.id), quantity: item.quantity }));

        let totalAmount = 0;
        const lineItems = verifiedProducts.map(product => {
            const amount = Math.round(product.price * 100);
            totalAmount += amount * product.quantity;

            return {
                price_data:{
                    currency:"usd",
                    product_data: {
                        name:product.name,
                        images: product.image ? [product.image] : [],
                    },
                    unit_amount:amount
                },
                quantity:product.quantity || 1,
            }
        });

        let coupon = null;
        if(couponCode) {
            coupon = await Coupon.findOne({code:couponCode,userId:req.user._id,isActive:true});
            if(coupon){
                totalAmount -= Math.round(totalAmount * coupon.discountPercentage / 100);
            }
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types:["card"],
            line_items: lineItems,
            mode:"payment",
            shipping_address_collection: { allowed_countries: ["US"] },
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: coupon
            ? [
                {
                    coupon: await createStripeCoupon(coupon.discountPercentage),
                },
            ]
            : [],
            metadata: {
                userId:req.user._id.toString(),
                couponCode:couponCode || "",
                products: JSON.stringify(
                    verifiedProducts.map((p) => ({
                        id: p._id.toString(),
                        quantity: p.quantity,
                        price: p.price,
                        name: p.name,
                        image: p.image || "",
                    }))
                ),
            },
        });
        if(totalAmount >= 20000) {
            await createNewCoupon(req.user._id);
        }
        res.status(200).json({
            sessionId: session.id,
            url: session.url,
            totalAmount: totalAmount / 100,
        });
    } catch (error) {
        console.error("Error processing checkout:", error);
        res.status(500).json({ message: "Error processing checkout", error: error.message });
    }
};

export const checkoutSuccess = async(req,res) => {
    try {
      const {sessionId} = req.body;
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== "paid") {
        return res.status(400).json({ message: "Payment has not completed" });
      }

      const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
      if (existingOrder) {
        await User.findByIdAndUpdate(existingOrder.user, { cartItems: [] });
        return res.status(200).json({
          success: true,
          message: "Payment was already recorded.",
          orderId: existingOrder._id,
        });
      }
      
        if(session.metadata.couponCode) {
            await Coupon.findOneAndUpdate({
                code: session.metadata.couponCode, userId:session.metadata.userId
            }, {
                isActive:false
            })
        }

        const products = JSON.parse(session.metadata.products);
        const newOrder = new Order({
            user:session.metadata.userId,
            products: products.map(product => ({
                product: product.id,
                quantity: product.quantity,
                price: product.price,
                name: product.name,
                image: product.image,
            })),
            totalAmount: session.amount_total / 100,
            stripeSessionId: sessionId,
            customerEmail: session.customer_details?.email || "",
            shippingAddress: session.shipping_details?.address ? {
                name: session.shipping_details.name || "",
                line1: session.shipping_details.address.line1 || "",
                line2: session.shipping_details.address.line2 || "",
                city: session.shipping_details.address.city || "",
                state: session.shipping_details.address.state || "",
                postalCode: session.shipping_details.address.postal_code || "",
                country: session.shipping_details.address.country || "",
            } : undefined,
        })

        await newOrder.save();
        await User.findByIdAndUpdate(session.metadata.userId, { cartItems: [] });

        res.status(200).json({
            success: true,
            message: "Payment successful, order created, and coupon deactivated if used.",
            orderId: newOrder._id,
        });
    } catch (error) {
        console.error("Error processing successful checkout:", error);
        res.status(500).json({ message:"Error processing successful checkout", error: error.message });
    }
};

async function createStripeCoupon(discountPercentage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    })

    return coupon.id;
}

async function createNewCoupon(userId){
    const newCoupon = new Coupon({
        code:"GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage:10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId:userId
    })

    await newCoupon.save();

    return newCoupon
}
