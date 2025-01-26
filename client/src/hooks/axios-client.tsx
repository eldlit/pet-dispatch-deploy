import axios from "axios";

// Create an axios instance
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
});

axiosClient.interceptors.request.use((config) => {
    // Get token from localStorage (or context)
    const token = localStorage.getItem("token");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;
