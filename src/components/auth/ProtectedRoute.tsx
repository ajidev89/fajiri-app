import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { authApi } from "@/lib/api";

export default function ProtectedRoute() {
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            authApi.getCurrentUser().catch((err) => {
                console.error("Failed to refresh user data:", err);
            });
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
