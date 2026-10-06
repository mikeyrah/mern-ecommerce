import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useWishlistStore = create((set, get) => ({
  wishlist: [], loading: false,
  fetchWishlist: async () => { set({ loading: true }); try { const { data } = await axios.get("/wishlist"); set({ wishlist: data.wishlist || [], loading: false }); } catch { set({ wishlist: [], loading: false }); } },
  clearWishlist: () => set({ wishlist: [] }),
  isSaved: (productId) => get().wishlist.some((item) => item.product?._id === productId),
  toggleWishlist: async (product) => {
    const saved = get().isSaved(product._id);
    try { const { data } = saved ? await axios.delete(`/wishlist/${product._id}`) : await axios.post(`/wishlist/${product._id}`); set({ wishlist: data.wishlist || [] }); toast.success(data.message); return true; }
    catch (error) { toast.error(error.response?.data?.message || "Unable to update your wishlist"); return false; }
  },
  toggleStockAlert: async (productId, enabled) => { try { const { data } = await axios.patch(`/wishlist/${productId}/notification`, { enabled }); set({ wishlist: data.wishlist || [] }); toast.success(data.message); } catch (error) { toast.error(error.response?.data?.message || "Unable to update alerts"); } },
}));
