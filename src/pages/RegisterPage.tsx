import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "@/assets/fajiri-logo.png";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

interface Country {
    id: number | string;
    name: string;
    code?: string;
}

export default function RegisterPage() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthStore();

    // Flow Step: 1 = Email Verification, 2 = Form Details, 3 = Password Setup, 4 = Login OTP Verification
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 1 States
    const [email, setEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [verifiedToken, setVerifiedToken] = useState("");

    // Step 4 States
    const [loginOtpCode, setLoginOtpCode] = useState("");
    const [consentChecked, setConsentChecked] = useState(false);

    // Step 2 States
    const [countries, setCountries] = useState<Country[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        account_type: "identified-membership", // identified-membership|program-membership|corporate-membership
        sub_account_type: "" as string | null, // null|global-collaborators|global-sponsors
        country_id: "",
        dob: "",
        address: "",
        occupation: "",
        avatar: "",
        password: "",
        password_confirmation: "",
        referral_code: "",
    });

    useEffect(() => {
        if (isAuthenticated) {
            if (user?.plan) {
                navigate("/profile", { replace: true });
            } else {
                navigate("/choose-plan", { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    // Fetch countries when moving to Step 2
    useEffect(() => {
        if (step === 2) {
            const fetchCountries = async () => {
                try {
                    const response = await authApi.getCountries();
                    // Handle structure variation if nested
                    const countriesList =
                        response.data?.data || response.data || [];
                    setCountries(countriesList);
                } catch (err) {
                    console.error("Failed to load countries:", err);
                    // Fallback to a default country list if API fails
                    const fallbackCountries = [
                        { id: "160", name: "Nigeria" },
                        { id: "233", name: "Ghana" },
                        { id: "254", name: "Kenya" },
                        { id: "27", name: "South Africa" },
                        { id: "840", name: "United States" },
                        { id: "826", name: "United Kingdom" },
                    ];
                    setCountries(fallbackCountries);
                }
            };
            fetchCountries();
        }
    }, [step]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await authApi.sendOtp({
                identifier: email,
                channel: "email",
            });
            setOtpSent(true);
            toast.success("Verification code sent to your email!");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    "Failed to send verification code. Please try again.",
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
            const data = await authApi.verifyOtpGeneral({
                identifier: email,
                channel: "email",
                code: otpCode,
            });
            // Extrapolate token from response data
            const token = data?.token || data;
            if (token) {
                setVerifiedToken(token);
                toast.success("Email verified successfully!");
                setStep(2);
            } else {
                throw new Error("Verification token not found in response.");
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    "Invalid verification code. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        const { id, value } = e.target;
        setFormData((prev) => {
            const updated = {
                ...prev,
                [id]: value === "" ? null : value,
            };
            if (id === "account_type" && value !== "corporate-membership") {
                updated.sub_account_type = null;
            }
            return updated;
        });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!consentChecked) {
            setError("You must give your consent to register.");
            setLoading(false);
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                email: {
                    token: verifiedToken,
                    value: email,
                },
                sub_account_type: formData.sub_account_type || null,
                referral_code: formData.referral_code || null,
            };

            await authApi.register(payload);
            toast.success("Account created successfully! Sending login OTP...");

            // Trigger login immediately to generate verification/login OTP
            await authApi.login({
                email: email,
                password: formData.password,
            });

            toast.success("Login OTP sent to your email!");
            setStep(4);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    "Registration failed. Please check your inputs and try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyLoginOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await authApi.verifyOtp({
                identifier: email,
                channel: "email",
                code: loginOtpCode,
            });

            toast.success("Logged in successfully!");

            // Get the updated user state to check for plan
            const updatedUser = useAuthStore.getState().user;

            // Redirect based on plan status
            if (updatedUser?.plan) {
                navigate("/profile", { replace: true });
            } else {
                navigate("/choose-plan", { replace: true });
            }
        } catch (err: any) {
            console.error("Login OTP Error:", err);
            setError(
                err.response?.data?.message ||
                    "Invalid OTP. Please check and try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-8 pb-16 px-4 font-sans">
            {/* Header / Logo */}
            <div className="mb-8">
                <Link to="/">
                    <img
                        src={logoImg}
                        alt="Fajiri Logo"
                        className="h-16 w-auto"
                    />
                </Link>
            </div>

            {/* Registration Card */}
            <div className="w-full max-w-[540px] bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12 transition-all">
                {step === 1 ? (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                Create Account
                            </h1>
                            <p className="text-slate-500">
                                {otpSent
                                    ? `Enter the 6-digit code sent to ${email}`
                                    : "Enter your email address to get started"}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                                {error}
                            </div>
                        )}

                        {!otpSent ? (
                            <form
                                onSubmit={handleSendOtp}
                                className="space-y-6"
                            >
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
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="Enter email address"
                                        className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-[#002B49] hover:bg-[#001F35] text-white font-semibold text-base transition-all"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin mr-2" />
                                    ) : (
                                        "Continue"
                                    )}
                                </Button>

                                <div className="text-center text-sm text-slate-600">
                                    Already have an account?{" "}
                                    <Link
                                        to="/login"
                                        className="font-semibold text-[#002B49] hover:underline"
                                    >
                                        Sign In
                                    </Link>
                                </div>
                            </form>
                        ) : (
                            <form
                                onSubmit={handleVerifyOtp}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="otpCode"
                                        className="text-slate-700 font-medium"
                                    >
                                        Verification Code
                                    </Label>
                                    <Input
                                        id="otpCode"
                                        type="text"
                                        required
                                        value={otpCode}
                                        onChange={(e) =>
                                            setOtpCode(e.target.value)
                                        }
                                        placeholder="Enter 6-digit code"
                                        className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors text-center text-2xl tracking-[0.5em] font-bold"
                                        maxLength={6}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading || otpCode.length < 6}
                                    className="w-full h-12 bg-[#002B49] hover:bg-[#001F35] text-white font-semibold text-base transition-all"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin mr-2" />
                                    ) : (
                                        "Verify Code"
                                    )}
                                </Button>

                                <div className="flex justify-between items-center text-sm">
                                    <button
                                        type="button"
                                        onClick={() => setOtpSent(false)}
                                        className="text-[#002B49] font-semibold hover:underline flex items-center gap-1"
                                    >
                                        <ArrowLeft size={16} /> Change Email
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        className="text-[#002B49] font-semibold hover:underline"
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                ) : step === 2 ? (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                Complete Profile
                            </h1>
                            <p className="text-slate-500">
                                Provide the remaining details to create your
                                profile
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setStep(3);
                            }}
                            className="space-y-5"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="first_name"
                                        className="text-slate-700 font-medium"
                                    >
                                        First Name
                                    </Label>
                                    <Input
                                        id="first_name"
                                        type="text"
                                        required
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. John"
                                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="last_name"
                                        className="text-slate-700 font-medium"
                                    >
                                        Last Name
                                    </Label>
                                    <Input
                                        id="last_name"
                                        type="text"
                                        required
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Doe"
                                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="account_type"
                                    className="text-slate-700 font-medium"
                                >
                                    Account Type
                                </Label>
                                <select
                                    id="account_type"
                                    required
                                    value={formData.account_type}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B49]/20 transition-all font-medium text-sm"
                                >
                                    <option value="identified-membership">
                                        Identified Membership
                                    </option>
                                    <option value="program-membership">
                                        Program Membership
                                    </option>
                                    <option value="corporate-membership">
                                        Corporate Membership
                                    </option>
                                </select>
                            </div>

                            {formData.account_type ===
                                "corporate-membership" && (
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="sub_account_type"
                                        className="text-slate-700 font-medium"
                                    >
                                        Sub Account Type
                                    </Label>
                                    <select
                                        id="sub_account_type"
                                        value={formData.sub_account_type || ""}
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B49]/20 transition-all font-medium text-sm"
                                    >
                                        <option value="global-collaborators">
                                            Global Collaborators
                                        </option>
                                        <option value="global-sponsors">
                                            Global Sponsors
                                        </option>
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="country_id"
                                        className="text-slate-700 font-medium"
                                    >
                                        Country
                                    </Label>
                                    <select
                                        id="country_id"
                                        required
                                        value={formData.country_id}
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B49]/20 transition-all font-medium text-sm"
                                    >
                                        <option value="" disabled>
                                            Select a country
                                        </option>
                                        {countries.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="dob"
                                        className="text-slate-700 font-medium"
                                    >
                                        Date of Birth
                                    </Label>
                                    <Input
                                        id="dob"
                                        type="date"
                                        required
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="occupation"
                                    className="text-slate-700 font-medium"
                                >
                                    Occupation
                                </Label>
                                <Input
                                    id="occupation"
                                    type="text"
                                    required
                                    value={formData.occupation}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Software developer"
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="address"
                                    className="text-slate-700 font-medium"
                                >
                                    Address
                                </Label>
                                <Input
                                    id="address"
                                    type="text"
                                    required
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 6 Emmanuel Close"
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="referral_code"
                                    className="text-slate-700 font-medium"
                                >
                                    Human Outreach Code
                                </Label>
                                <Input
                                    id="referral_code"
                                    type="text"
                                    value={formData.referral_code}
                                    onChange={handleInputChange}
                                    placeholder="e.g. FIM123456"
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-[#002B49] hover:bg-[#001F35] text-white font-semibold text-base transition-all mt-4"
                            >
                                Continue to Password Setup
                            </Button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-center text-sm font-semibold text-[#002B49] hover:underline mt-2"
                            >
                                Back to Step 1
                            </button>
                        </form>
                    </>
                ) : step === 3 ? (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                Secure Account
                            </h1>
                            <p className="text-slate-500">
                                Set up a strong password for your new account
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-5">
                            <div className="space-y-1.5 relative">
                                <Label
                                    htmlFor="password"
                                    className="text-slate-700 font-medium"
                                >
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        required
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter password"
                                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5 relative">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-slate-700 font-medium"
                                >
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        required
                                        value={formData.password_confirmation}
                                        onChange={handleInputChange}
                                        placeholder="Confirm your password"
                                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword,
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 my-4">
                                <input
                                    id="consentChecked"
                                    type="checkbox"
                                    required
                                    checked={consentChecked}
                                    onChange={(e) =>
                                        setConsentChecked(e.target.checked)
                                    }
                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#002B49] focus:ring-[#002B49]/20"
                                />
                                <label
                                    htmlFor="consentChecked"
                                    className="text-sm text-slate-600 font-normal leading-snug cursor-pointer select-none"
                                >
                                    I hereby give my consent to Fajiri to
                                    collect, process and store my personal data
                                    in accordance with the{" "}
                                    <a
                                        href="https://fajiri.org/privacy-policy/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#002B49] font-medium hover:underline"
                                    >
                                        Privacy Policy
                                    </a>{" "}
                                    and{" "}
                                    <a
                                        href="https://fajiri.org/terms-of-use/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#002B49] font-medium hover:underline"
                                    >
                                        Terms of Service
                                    </a>
                                    .
                                </label>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-[#002B49] hover:bg-[#001F35] text-white font-semibold text-base transition-all mt-4"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin mr-2" />
                                ) : (
                                    "Create Account"
                                )}
                            </Button>

                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="w-full text-center text-sm font-semibold text-[#002B49] hover:underline mt-2"
                            >
                                Back to Step 2
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                Verify Login
                            </h1>
                            <p className="text-slate-500">
                                We've sent a 6-digit login verification code to{" "}
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

                        <form
                            onSubmit={handleVerifyLoginOtp}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <Label
                                    htmlFor="loginOtpCode"
                                    className="text-slate-700 font-medium"
                                >
                                    Verification Code
                                </Label>
                                <Input
                                    id="loginOtpCode"
                                    type="text"
                                    required
                                    value={loginOtpCode}
                                    onChange={(e) =>
                                        setLoginOtpCode(e.target.value)
                                    }
                                    placeholder="Enter 6-digit code"
                                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors text-center text-2xl tracking-[0.5em] font-bold"
                                    maxLength={6}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || loginOtpCode.length < 6}
                                className="w-full h-12 bg-[#002B49] hover:bg-[#001F35] text-white font-semibold text-base transition-all"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin mr-2" />
                                ) : (
                                    "Verify and Login"
                                )}
                            </Button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
