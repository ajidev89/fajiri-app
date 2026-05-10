import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import logoImg from "@/assets/fajiri-logo.png";
import { authApi } from "@/lib/api";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await authApi.sendOtp({
                identifier: email,
                channel: "email",
            });
            // Redirect to verify OTP with email in state
            navigate("/verify-password-otp", { state: { email } });
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to send reset code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-12 px-4 font-sans">
            <div className="mb-12">
                <Link to="/">
                    <img src={logoImg} alt="Fajiri Logo" className="h-8 w-auto" />
                </Link>
            </div>

            <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Forgot Password</h1>
                    <p className="text-slate-500">
                        Enter your email address and we'll send you a code to reset your password.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-[#002B49] hover:bg-[#001F35] text-white font-semibold text-base transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : "Send Reset Code"}
                    </Button>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="text-sm font-semibold text-[#002B49] hover:underline flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
