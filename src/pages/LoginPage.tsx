import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Phone, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "@/assets/fajiri-logo.png";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [otpSent, setOtpSent] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            if (user?.plan) {
                navigate("/profile", { replace: true });
            } else {
                navigate("/choose-plan", { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    const [loginType, setLoginType] = useState<"email" | "phone">("email");
    // Form State
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        password: "",
    });

    // OTP State
    const [otp, setOtp] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
        setError(null);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const loginData = loginType === "email" 
                ? { email: formData.email, password: formData.password }
                : { phone: formData.phone, password: formData.password };
                
            await authApi.login(loginData);

            setOtpSent(true);
            // The backend returns "Successfully sent otp"
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    "Invalid login credentials. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await authApi.verifyOtp({
                identifier: loginType === "email" ? formData.email : formData.phone,
                channel: loginType,
                code: otp,
            });

            // Get the updated user state to check for plan
            const updatedUser = useAuthStore.getState().user;

            // Redirect based on plan status
            if (updatedUser?.plan) {
                navigate("/profile", { replace: true });
            } else {
                navigate("/choose-plan", { replace: true });
            }
        } catch (err: any) {
            console.error("OTP Error:", err);
            setError(
                err.response?.data?.message ||
                    "Invalid OTP. Please check and try again.",
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-12 px-4 font-sans">
            {/* Header / Logo */}
            <div className="mb-12">
                <Link to="/">
                    <img
                        src={logoImg}
                        alt="Fajiri Logo"
                        className="h-16 w-auto"
                    />
                </Link>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12 transition-all">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        {otpSent ? "Verify OTP" : "Welcome Back"}
                    </h1>
                    <p className="text-slate-500">
                        {otpSent
                            ? `We've sent a verification code to ${loginType === "email" ? formData.email : formData.phone}`
                            : "Glad to see you again. Login to your account"}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                {!otpSent ? (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label
                                htmlFor={loginType}
                                className="text-slate-700 font-medium"
                            >
                                {loginType === "email" ? "Email Address" : "Phone Number"}
                            </Label>
                            <Input
                                id={loginType}
                                type={loginType === "email" ? "email" : "tel"}
                                required
                                value={loginType === "email" ? formData.email : formData.phone}
                                onChange={handleInputChange}
                                placeholder={loginType === "email" ? "Enter email address" : "Enter phone number (e.g. +234...)"}
                                className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            />
                        </div>

                        <div className="space-y-2 relative">
                            <div className="flex justify-between items-center">
                                <Label
                                    htmlFor="password"
                                    className="text-slate-700 font-medium"
                                >
                                    Password
                                </Label>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter password"
                                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
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

                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-sm font-semibold text-[#002B49] hover:underline"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-[#002B49] hover:bg-[#001F35] text-white font-semibold text-base transition-all"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin mr-2" />
                            ) : (
                                "Sign In"
                            )}
                        </Button>

                        <div className="text-center hidden text-sm text-slate-600">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className="font-semibold text-[#002B49] hover:underline"
                            >
                                Sign Up
                            </Link>
                        </div>

                        <div className="relative flex items-center py-4">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="flex-shrink mx-4 text-slate-400 text-sm">
                                or
                            </span>
                            <div className="flex-grow border-t border-slate-200"></div>
                        </div>

                        <div className="space-y-3">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => {
                                    setLoginType(loginType === "email" ? "phone" : "email");
                                    setError(null);
                                }}
                                className="w-full h-12 bg-white border-slate-200 text-slate-700 font-medium flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
                            >
                                {loginType === "email" ? (
                                    <>
                                        <Phone size={18} className="text-slate-600" />
                                        Continue with Phone
                                    </>
                                ) : (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
                                            <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                        </svg>
                                        Continue with Email
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div className="space-y-2">
                            <Label
                                htmlFor="otp"
                                className="text-slate-700 font-medium"
                            >
                                Verification Code
                            </Label>
                            <Input
                                id="otp"
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit code"
                                className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors text-center text-2xl tracking-[0.5em] font-bold"
                                maxLength={6}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || otp.length < 6}
                            className="w-full h-12 bg-[#002B49] hover:bg-[#001F35] text-white font-semibold text-base transition-all"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin mr-2" />
                            ) : (
                                "Verify & Login"
                            )}
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setOtpSent(false)}
                                className="text-sm font-semibold text-[#002B49] hover:underline"
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
