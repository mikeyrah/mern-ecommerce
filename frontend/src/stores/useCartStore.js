import { create } from 'zustand';
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
    cart:[],
    coupon:null,
    total:0,
    subtotal:0,
    isCouponApplied: false,

    clearCart: () => set({
        cart: [],
        coupon: null,
        isCouponApplied: false,
        subtotal: 0,
        total: 0,
    }),

    getCoupon: async () => {
        try {
            const { data: coupon } = await axios.get("/coupons");
            set({ coupon });
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load coupon");
        }
    },

    applyCoupon: async (code) => {
        try {
            const { data } = await axios.post("/coupons/validate", { code });
            set({
                coupon: { code: data.code, discountPercentage: data.discountPercentage },
                isCouponApplied: true,
            });
            get().calculateTotals();
            toast.success("Coupon applied");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to apply coupon");
        }
    },

    removeCoupon: () => {
        set({ isCouponApplied: false });
        get().calculateTotals();
    },

    getCartItems: async() => {
        try {
            const res = await axios.get("/cart");
            set({cart:res.data});
            get().calculateTotals();
        } catch (error) {
            set({ cart: [], subtotal: 0, total: 0 });
            toast.error(error.response?.data?.message || "Unable to load cart");
        }
    },
    addToCart: async(product) => {
        try {
            await axios.post("/cart", {productId:product._id});
            toast.success("Added to cart");

            set((prevState) => {
                const existingItem = prevState.cart.find((item) => item._id === product._id);
                const newCart = existingItem
                ? prevState.cart.map((item) => (item._id === product._id ? { ...item, quantity: item.quantity + 1} : item))
                : [...prevState.cart, { ...product, quantity: 1 }];
                return { cart: newCart };
            });
            get().calculateTotals();

        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to add item to cart");
        }
    },

    removeFromCart: async (productId) => {
        try {
            await axios.delete(`/cart`, { data: { productId } });
            set((prevState) => ({ cart: prevState.cart.filter((item) => item._id !== productId) }));
            get().calculateTotals();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to remove item from cart");
        }
        },

    updateQuantity: async (productId, quantity) => {
        if (!Number.isInteger(quantity) || quantity < 0) {
            return;
        }

        if (quantity === 0) {
            await get().removeFromCart(productId);
            return;
        }
        try {
            await axios.put(`/cart/${productId}`, { quantity });
            set((prevState) => ({
                cart: prevState.cart.map((item) => (item._id === productId ? { ...item, quantity } : item)),
            }));
            get().calculateTotals();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update cart quantity");
        }
    },
    

    calculateTotals: () => {
        const { cart, coupon, isCouponApplied } = get();
        const subtotal = cart.reduce(
            (sum, item) => sum + Number(item.price) * item.quantity,
            0
        );
        let total = subtotal;

        if(coupon && isCouponApplied){
            const discount = subtotal * (coupon.discountPercentage / 100);
            total = subtotal - discount;
        }

        set({ subtotal, total });
    },
}));
