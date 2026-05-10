import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import logoImg from "@/assets/fajiri-logo.png";
import { authApi } from "@/lib/api";

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = location.state?.token;
    const email = location.state?.email;

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate("/forgot-password");
        }
    }, [token, navigate]);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await authApi.changePassword({
                token,
                password,
            });
            setSuccess(true);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    "Failed to reset password. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-12 px-4 font-sans">
                <div className="mb-12">
                    <img
                        src={logoImg}
                        alt="Fajiri Logo"
                        className="h-8 w-auto"
                    />
                </div>

                <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">
                        Password Reset!
                    </h1>
                    <p className="text-slate-500 mb-8">
                        Your password has been successfully updated. You can now
                        log in with your new password.
                    </p>
                    <Button
                        onClick={() => navigate("/login")}
                        className="w-full h-12 bg-[#002B49] hover:bg-[#001F35] text-white font-semibold text-base transition-all"
                    >
                        Back to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-12 px-4 font-sans">
            <div className="mb-12">
                <img src={logoImg} alt="Fajiri Logo" className="h-8 w-auto" />
            </div>

            <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        New Password
                    </h1>
                    <p className="text-slate-500">
                        Create a strong password for{" "}
                        <span className="font-semibold text-slate-900">
                            {email}
                        </span>
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleReset} className="space-y-6">
                    <div className="space-y-2 relative">
                        <Label
                            htmlFor="password"
                            className="text-slate-700 font-medium"
                        >
                            New Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="confirmPassword"
                            className="text-slate-700 font-medium"
                        >
                            Confirm New Password
                        </Label>
                        <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={
                            loading || !password || password !== confirmPassword
                        }
                        className="w-full h-12 bg-[#002B49] hover:bg-[#001F35] text-white font-semibold text-base transition-all"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin mr-2" />
                        ) : (
                            "Reset Password"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
