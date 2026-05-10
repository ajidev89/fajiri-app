import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Phone, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "@/assets/fajiri-logo.png";
import { authApi } from "@/lib/api";

export default function LoginPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [otpSent, setOtpSent] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        email: "",
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
            await authApi.login({
                email: formData.email,
                password: formData.password,
            });

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
                identifier: formData.email,
                channel: "email",
                code: otp,
            });

            // Redirect to dashboard or home
            navigate("/choose-plan");
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

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError(null);
        try {
            const url = await authApi.loginWithGoogle();
            if (url) {
                window.location.href = url;
            } else {
                throw new Error("Failed to get Google login URL");
            }
        } catch (err: any) {
            console.error("Google Login Error:", err);
            setError("Could not initialize Google login. Please try again.");
        } finally {
            setGoogleLoading(false);
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
                        className="h-8 w-auto"
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
                            ? `We've sent a verification code to ${formData.email}`
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
                                placeholder="Enter email address"
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
                            <a
                                href="#"
                                className="text-sm font-semibold text-[#002B49] hover:underline"
                            >
                                Forgot Password?
                            </a>
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

                        <div className="text-center text-sm text-slate-600">
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
                                className="w-full h-12 bg-white border-slate-200 text-slate-700 font-medium flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
                            >
                                <Phone size={18} className="text-slate-600" />
                                Continue with Phone
                            </Button>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={googleLoading || loading}
                                className="w-full h-12 bg-white border-slate-200 text-slate-700 font-medium flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
                            >
                                {googleLoading ? (
                                    <Loader2 className="animate-spin h-5 w-5 text-slate-400" />
                                ) : (
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                )}
                                {googleLoading ? "Connecting..." : "Continue with Google"}
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
