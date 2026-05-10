import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { authApi } from "@/lib/api";
import logoImg from "@/assets/fajiri-logo.png";

export default function VerifyMagicLink() {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [message, setMessage] = useState("Verifying your magic link...");

    useEffect(() => {
        const verify = async () => {
            try {
                // Pass the entire query string (including ?) to the API
                await authApi.verifyMagicLink(location.search);
                
                setStatus("success");
                setMessage("Successfully authenticated! Redirecting...");
                
                // Wait 2 seconds then redirect
                setTimeout(() => {
                    navigate("/choose-plan");
                }, 2000);
            } catch (err: any) {
                console.error("Magic Link Verification Error:", err);
                setStatus("error");
                setMessage(err.response?.data?.message || "Invalid or expired magic link. Please try again.");
            }
        };

        if (location.search) {
            verify();
        } else {
            setStatus("error");
            setMessage("No verification data found in the URL.");
        }
    }, [location.search, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
            <div className="mb-8">
                <img src={logoImg} alt="Fajiri Logo" className="h-16 w-auto" />
            </div>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
                {status === "verifying" && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <Loader2 className="h-12 w-12 animate-spin text-[#002B49]" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Verifying...</h2>
                        <p className="text-slate-500">{message}</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Success!</h2>
                        <p className="text-slate-600">{message}</p>
                    </div>
                )}

                {status === "error" && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <AlertCircle className="h-12 w-12 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Verification Failed</h2>
                        <p className="text-red-500">{message}</p>
                        <button 
                            onClick={() => navigate("/login")}
                            className="mt-4 px-6 py-2 bg-[#002B49] text-white rounded-lg font-medium hover:bg-[#001F35] transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
