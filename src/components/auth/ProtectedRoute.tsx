import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { authApi } from "@/lib/api";

export default function ProtectedRoute() {
    const { isAuthenticated, user } = useAuthStore();
    const location = useLocation();

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

    // If user has a plan and is trying to access onboarding pages, redirect to profile
    // UNLESS they are explicitly upgrading (checked via query param)
    const isOnboardingRoute = ["/choose-plan", "/payment-method"].includes(
        location.pathname,
    );
    const isUpgrading = new URLSearchParams(location.search).get("upgrade") === "true";

    if (user?.plan && isOnboardingRoute && !isUpgrading) {
        return <Navigate to="/profile" replace />;
    }

    return <Outlet />;
}
