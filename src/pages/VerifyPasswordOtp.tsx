import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import logoImg from "@/assets/fajiri-logo.png";
import { authApi } from "@/lib/api";

export default function VerifyPasswordOtp() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!email) {
            navigate("/forgot-password");
        }
    }, [email, navigate]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await authApi.verifyOtpGeneral({
                identifier: email,
                channel: "email",
                code: otp,
            });
            // Redirect to reset password with the token in state
            navigate("/reset-password", { state: { token: data.token, email } });
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid code. Please check and try again.");
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
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Verify Code</h1>
                    <p className="text-slate-500">
                        We've sent a 6-digit code to <span className="font-semibold text-slate-900">{email}</span>
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleVerify} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="otp" className="text-slate-700 font-medium">Verification Code</Label>
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
                        {loading ? <Loader2 className="animate-spin mr-2" /> : "Verify Code"}
                    </Button>

                    <div className="text-center">
                        <Link
                            to="/forgot-password"
                            className="text-sm font-semibold text-[#002B49] hover:underline flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Change Email
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
