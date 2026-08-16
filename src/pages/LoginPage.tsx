import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Mail, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "@/assets/fajiri-logo.png";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

type LoginMethod = "email" | "phone";

export default function LoginPage() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthStore();
    const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [otpSent, setOtpSent] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            if (user?.plan) {
                navigate("/profile", { replace: true });
            } else {
                navigate("/choose-account-type", { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    const [rememberMe, setRememberMe] = useState(false);
    // Form State
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        password: "",
    });

    useEffect(() => {
        const rememberedMethod = (localStorage.getItem("fajiri_remembered_method") as LoginMethod) || "email";
        const rememberedIdentifier = localStorage.getItem("fajiri_remembered_identifier") || localStorage.getItem("fajiri_remembered_email");

        if (rememberedIdentifier) {
            setLoginMethod(rememberedMethod);
            if (rememberedMethod === "phone") {
                setFormData((prev) => ({ ...prev, phone: rememberedIdentifier }));
            } else {
                setFormData((prev) => ({ ...prev, email: rememberedIdentifier }));
            }
            setRememberMe(true);
        }
    }, []);

    // OTP State
    const [otp, setOtp] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
        setError(null);
    };

    const activeIdentifier = loginMethod === "email" ? formData.email : formData.phone;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const loginPayload =
                loginMethod === "email"
                    ? { email: formData.email, password: formData.password }
                    : { phone: formData.phone, password: formData.password };

            await authApi.login(loginPayload);

            if (rememberMe) {
                localStorage.setItem("fajiri_remembered_method", loginMethod);
                localStorage.setItem("fajiri_remembered_identifier", activeIdentifier);
            } else {
                localStorage.removeItem("fajiri_remembered_method");
                localStorage.removeItem("fajiri_remembered_identifier");
                localStorage.removeItem("fajiri_remembered_email");
            }

            setOtpSent(true);
        } catch (err: any) {
            console.error("Login error:", err);
            setError(
                err.response?.data?.message ||
                    "Invalid login credentials. Please check your credentials and try again.",
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
                identifier: activeIdentifier,
                channel: loginMethod === "email" ? "email" : "phone",
                code: otp,
            });

            // Get the updated user state to check for plan
            const updatedUser = useAuthStore.getState().user;

            // Redirect based on plan status
            if (updatedUser?.plan) {
                navigate("/profile", { replace: true });
            } else {
                navigate("/choose-account-type", { replace: true });
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
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        {otpSent ? "Verify OTP" : "Welcome Back"}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {otpSent
                            ? `We've sent a verification code to ${activeIdentifier}`
                            : "Glad to see you again. Login to your account"}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                {!otpSent ? (
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Login Method Segmented Switcher */}
                        <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
                            <button
                                type="button"
                                onClick={() => {
                                    setLoginMethod("email");
                                    setError(null);
                                }}
                                className={cn(
                                    "flex-1 py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer",
                                    loginMethod === "email"
                                        ? "bg-white text-[#002B49] shadow-xs"
                                        : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                <Mail className="w-4 h-4" />
                                Email
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setLoginMethod("phone");
                                    setError(null);
                                }}
                                className={cn(
                                    "flex-1 py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer",
                                    loginMethod === "phone"
                                        ? "bg-white text-[#002B49] shadow-xs"
                                        : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                <Phone className="w-4 h-4" />
                                Phone Number
                            </button>
                        </div>

                        {loginMethod === "email" ? (
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="email"
                                    className="text-slate-700 font-medium"
                                >
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="e.g. name@example.com"
                                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-xl"
                                />
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="phone"
                                    className="text-slate-700 font-medium"
                                >
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="e.g. +2348000000000"
                                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-xl"
                                />
                            </div>
                        )}

                        <div className="space-y-1.5 relative">
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
                                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors pr-12 rounded-xl"
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

                        <div className="flex justify-between items-center pt-1">
                            <div className="flex items-center gap-2">
                                <input
                                    id="remember_me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-[#002B49] focus:ring-[#002B49]/20"
                                />
                                <Label
                                    htmlFor="remember_me"
                                    className="text-sm text-slate-600 font-medium cursor-pointer select-none"
                                >
                                    Remember me
                                </Label>
                            </div>
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
                            className="w-full h-12 bg-[#002B49] hover:bg-[#001F35] text-white font-semibold text-base transition-all rounded-xl shadow-sm cursor-pointer"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin mr-2" />
                            ) : (
                                "Sign In"
                            )}
                        </Button>

                        <div className="text-center text-sm text-slate-600 pt-2">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className="font-semibold text-[#002B49] hover:underline"
                            >
                                Sign Up
                            </Link>
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
                                className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors text-center text-2xl tracking-[0.5em] font-bold rounded-xl"
                                maxLength={6}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || otp.length < 6}
                            className="w-full h-12 bg-[#002B49] hover:bg-[#001F35] text-white font-semibold text-base transition-all rounded-xl shadow-sm cursor-pointer"
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
                                className="text-sm font-semibold text-[#002B49] hover:underline cursor-pointer"
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
