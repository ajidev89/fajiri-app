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
        const loginData = { ...data };
        if (loginData.email) {
            loginData.email = loginData.email.trim().toLowerCase();
        }
        const response = await api.post("/auth/login", loginData);
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
        const verifyData = { ...data };
        if (verifyData.channel === "email") {
            verifyData.identifier = verifyData.identifier.trim().toLowerCase();
        }
        const response = await api.post("/auth/generate-token", verifyData);
        const { token } = response.data.data;
        useAuthStore.getState().setToken(token);
        await authApi.getCurrentUser(); // Fetch user data immediately
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
        const otpData = { ...data };
        if (otpData.channel === "email") {
            otpData.identifier = otpData.identifier.trim().toLowerCase();
        }
        return await api.post("/otp/send", otpData);
    },

    verifyOtpGeneral: async (data: {
        identifier: string;
        channel: string;
        code: string;
    }) => {
        const verifyData = { ...data };
        if (verifyData.channel === "email") {
            verifyData.identifier = verifyData.identifier.trim().toLowerCase();
        }
        const response = await api.post("/otp/verify", verifyData);
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

    register: async (data: any) => {
        const registerData = { ...data };
        if (registerData.email?.value) {
            registerData.email.value = registerData.email.value.trim().toLowerCase();
        }
        const response = await api.post("/auth/register", registerData);
        const { token, user } = response.data.data || {};
        if (token && user) {
            useAuthStore.getState().setToken(token);
            useAuthStore.getState().setUser(user);
        }
        return response;
    },

    getCountries: async () => {
        return await api.get("/countries");
    },
};

export default api;

