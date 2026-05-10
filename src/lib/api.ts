import axios from "axios";
import { storage } from "./storage";
import { useAuthStore } from "@/store/useAuthStore";

const api = axios.create({
    baseURL: "https://api.fajiri.org/v1",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token || storage.get("fajiri_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            Optional: window.location.href = "/login";
        }
        return Promise.reject(error);
    },
);

export const authApi = {
    login: async (data: {
        email?: string;
        phone?: string;
        password: string;
    }) => {
        const response = await api.post("/auth/login", data);
        const user = response.data.data || {};
        if (user) {
            useAuthStore.getState().setUser(user);
        }
        return response;
    },

    verifyOtp: async (data: {
        identifier: string;
        channel: string;
        code: string;
    }) => {
        const response = await api.post("/auth/generate-token", data);
        const { token } = response.data.data;
        useAuthStore.getState().setToken(token);
        return response;
    },

    verifyMagicLink: async (queryString: string) => {
        const response = await api.get(`/auth/magic-link/verify${queryString}`);
        const { token, user } = response.data.data;
        useAuthStore.getState().setToken(token);
        useAuthStore.getState().setUser(user);
        return response;
    },

    getPlans: async (accountType?: string) => {
        const response = await api.get("/plans", {
            params: { account_type: accountType },
        });
        return response;
    },

    sendOtp: async (data: { identifier: string; channel: string }) => {
        return await api.post("/otp/send", data);
    },

    verifyOtpGeneral: async (data: {
        identifier: string;
        channel: string;
        code: string;
    }) => {
        const response = await api.post("/otp/verify", data);
        return response.data.data; // contains the token needed for change-password
    },

    changePassword: async (data: { token: string; password: string }) => {
        return await api.post("/auth/change-password", data);
    },

    loginWithGoogle: async () => {
        const response = await api.post("/google/generate-url", {
            callback_url: `${window.location.origin}/auth/google/callback`,
        });
        return response.data.url;
    },

    handleGoogleCallback: async (code: string) => {
        const response = await api.get(`/google/callback?code=${code}`);
        const { token, user } = response.data;
        useAuthStore.getState().setToken(token);
        useAuthStore.getState().setUser(user);
        return response;
    },

    getCurrentUser: async () => {
        const response = await api.get("/user");
        const user = response.data.data;
        useAuthStore.getState().setUser(user);
        return user;
    },

    updateProfile: async (data: any) => {
        const response = await api.put("/user/profile", data);
        await authApi.getCurrentUser(); // Refresh store
        return response.data;
    },

    getSubscriptions: async () => {
        const response = await api.get("/user/subscriptions");
        return response.data.data;
    },

    initializeSubscription: async (data: {
        plan_id: string;
        success_url?: string;
        cancel_url?: string;
    }) => {
        const response = await api.post("/plans/initialize-subscription", data);
        return response;
    },
};

export default api;
