import { create } from "zustand";
import { storage } from "@/lib/storage";

interface User {
    id: string;
    email: string;
    account_type: string;
    [key: string]: any;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setToken: (token: string) => void;
    setUser: (user: User) => void;
    logout: () => void;
    hydrate: () => void;
}

// Helper to get initial state from storage
const getInitialState = () => {
    try {
        const user = storage.get("user");
        const token = storage.get("fajiri_token");
        return {
            user,
            token,
            isAuthenticated: !!(user && token),
        };
    } catch (e) {
        return { user: null, token: null, isAuthenticated: false };
    }
};

const initialState = getInitialState();

export const useAuthStore = create<AuthState>((set) => ({
    ...initialState,

    setToken: (token) => {
        storage.set("fajiri_token", token);
        set({ token });
    },

    setUser: (user) => {
        storage.set("user", user);
        set((state) => ({
            user,
            isAuthenticated: !!(user && state.token),
        }));
    },

    logout: () => {
        storage.remove("user");
        storage.remove("fajiri_token");
        storage.remove("login_response");
        storage.remove("selected_plan_id");
        set({ user: null, token: null, isAuthenticated: false });
    },

    hydrate: () => {
        const updatedState = getInitialState();
        console.log(updatedState);
        set(updatedState);
    },
}));
