import axios from "axios";

const axiosInstance = axios.create({
    // Vite proxies /api to the backend during development. Keeping this
    // relative also lets the browser send the login cookie with protected
    // requests instead of treating the frontend and backend as separate
    // origins.
    baseURL: "/api",
    withCredentials: true,
});

export default axiosInstance
