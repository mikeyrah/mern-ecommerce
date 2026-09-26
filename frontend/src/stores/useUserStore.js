import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
    user:null,
    loading:false,
    checkingAuth: true,

    signup: async (name,email,password,confirmPassword) => {
        set({ loading: true });

        if(password !== confirmPassword){
            set({ loading: false });
            return toast.error("Passwords do not match");
        }

        try {
            const res = await axios.post("/auth/signup", {name,email,password});
            set ({ user: res.data.user,loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data.message || "An error occurred, please try again");
        }
    },

    login: async (email,password) => {
        set({ loading: true });

        try {
            const res = await axios.post("/auth/login", { email, password });

            set ({ user: res.data, loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data.message || "An error occurred");
        }
    },

    logout:async () => {
        try {
         await axios.post("/auth/logout");
         set({ user: null });   
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred during logout");
        }
    },

    checkAuth: async () => {
        set({ checkingAuth: true });
        try {
            const response = await axios.get("/auth/profile");
            set({ user: response.data, checkingAuth: false });

        } catch (error) {
            set({ checkingAuth: false, user: null });
        }
    },

    updateProfilePicture: async (image) => {
        set({ loading: true });
        try {
            const response = await axios.put("/auth/profile-picture", { image });
            set({ user: response.data.user, loading: false });
            toast.success("Profile picture updated");
            return true;
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "Unable to update profile picture");
            return false;
        }
    },

    removeProfilePicture: async () => {
        set({ loading: true });
        try {
            const response = await axios.delete("/auth/profile-picture");
            set({ user: response.data.user, loading: false });
            toast.success("Profile picture removed");
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "Unable to remove profile picture");
        }
    },

    refreshToken: async () => {
        if (get().checkingAuth) return;

        set({ checkingAuth: true });
        try {
            const response = await axios.post('/auth/refresh-token');
            set({ checkingAuth: false });
            return response.data;
        } catch (error) {
            set({ user: null, checkAuth: false });
            throw error;
        }
    },
}));

let refreshPromise = null;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                if (refreshPromise) {
                    await refreshPromise;
                    return axios(originalRequest);
                }
                refreshPromise = useUserStore.getState().refreshToken();
                await refreshPromise;
                refreshPromise = null;
                return axios(originalRequest);
            } catch (refreshError) {
                useUserStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
