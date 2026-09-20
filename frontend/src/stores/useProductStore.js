import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
    products: [],
    loading:false,

    setProducts: (products) => set({products}),

    createProduct: async (productData) => {
        set({ loading: true });
        try {
            const res = await axios.post("/products", productData);
            set((state) => ({
                products: [...state.products, res.data.product],
                loading: false,
            }));
            toast.success("Product created successfully");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to create product");
            set({ loading: false })
            return false;
        }
    },

    fetchAllProducts: async() => {
        set({ loading: true });
        try {
            const response = await axios.get("/products");
            set({ products: response.data.products, loading: false });
        } catch (error) {
            set({ error: "Failed to fetch products", loading: false });
            toast.error(error.response.data.error || "Failed to fetch products");
        }
    },
    fetchProductsByCategory: async (category) => {
        set({ loading: true });
        try {
            const response = await axios.get(`/products/category/${category}`);
            set({ products: response.data.products, loading: false });
        } catch (error) {
            set({ error: "Failed to fetch products", loading: false });
            toast.error(error.response.data.error || "Failed to fetch products");
        }
    },
    fetchProductsByBrand: async (brand) => {
        set({ loading: true });
        try {
            const response = await axios.get(`/products/brand/${brand}`);
            set({ products: response.data.products, loading: false });
        } catch (error) {
            set({ error: "Failed to fetch brand products", loading: false });
            toast.error(error.response?.data?.message || "Failed to fetch brand products");
        }
    },
    deleteProduct: async (productId) => {
        set({ loading: true });
        try {
            await axios.delete(`/products/${productId}`);
            set((prevProducts) => ({
                products: prevProducts.products.filter((product) => product._id !== productId),
                loading: false,
            }));
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data.error || "Failed to delete product");
        }
    },
    updateProduct: async (productId, productData) => {
        set({ loading: true });
        try {
            const response = await axios.put(`/products/${productId}`, productData);
            set((state) => ({
                products: state.products.map((product) =>
                    product._id === productId ? response.data.product : product
                ),
                loading: false,
            }));
            toast.success("Product updated successfully");
            return true;
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "Failed to update product");
            return false;
        }
    },
    toggleFeaturedProduct: async (productId) => {
        set({ loading: true });
        try {
            const response = await axios.patch(`/products/${productId}`);
            set((state) => ({
                products: state.products.map((product) =>
                product._id === productId ? response.data.product : product
            ),
            loading: false,
            }));
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "Failed to update product");
        }  
    },

    fetchFeaturedProducts: async () => {
        set({ loading: true });
        try {
            const response = await axios.get("/products/featured");
            set({ products: response.data, loading: false });
        } catch (error) {
            set({ error: "Failed to fetch featured products", loading: false });
            toast.error(error.response?.data?.message || "Failed to fetch featured products");
        }
    },
}));
