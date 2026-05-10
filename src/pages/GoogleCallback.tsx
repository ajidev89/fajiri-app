import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function GoogleCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get("code");
            if (!code) {
                setError("No authorization code found.");
                return;
            }

            try {
                await authApi.handleGoogleCallback(code);
                // Redirect to onboarding or dashboard
                navigate("/choose-plan");
            } catch (err: any) {
                console.error("Google Callback Error:", err);
                setError(err.response?.data?.message || "Failed to authenticate with Google.");
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Failed</h1>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full h-12 bg-[#002B49] text-white rounded-xl font-semibold"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <Loader2 className="h-12 w-12 animate-spin text-[#002B49] mb-4" />
            <h1 className="text-xl font-bold text-slate-900">Authenticating with Google...</h1>
            <p className="text-slate-500">Please wait while we set up your account.</p>
        </div>
    );
}
