import { useNavigate } from "react-router-dom";
import { ChevronRight, Lock, ShieldCheck } from "lucide-react";
import { storage } from "@/lib/storage";
import { authApi } from "@/lib/api";
import AuthHeader from "@/components/auth/layout/header/AuthHeader";

export default function PaymentMethod() {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate("/choose-plan");
    };

    const handleSelectPayment = async () => {
        const selectedPlanId = storage.get("selected_plan_id");
        if (!selectedPlanId) {
            console.error("No plan selected");
            return;
        }

        try {
            const response = await authApi.initializeSubscription({
                plan_id: selectedPlanId,
                success_url: `${window.location.origin}/payment-success`,
                cancel_url: `${window.location.origin}/payment-method`,
            });

            // If the API returns a redirect URL (for Stripe/Paystack)
            if (response.data.data?.authorization_url) {
                window.location.href = response.data.data.authorization_url;
            } else if (response.data.data?.url) {
                window.location.href = response.data.data.url;
            } else {
                // If it's a free plan or direct activation
                navigate("/payment-success");
            }
        } catch (err) {
            console.error("Payment initialization error:", err);
            alert("Failed to initialize payment. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <AuthHeader />

            <main className="container mx-auto px-6 pt-12 pb-24 text-center max-w-2xl">
                {/* Onboarding Steps */}
                <div className="mb-12">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">
                        Step 3 of 3
                    </span>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
                        Choose how to pay
                    </h1>

                    <div className="space-y-2 text-slate-500 font-medium">
                        <p>
                            Your payment is encrypted and you can change how you
                            pay anytime.
                        </p>
                        <p className="font-bold text-slate-800">
                            Secure for peace of mind.
                        </p>
                    </div>
                </div>

                {/* Encryption Badge */}
                <div className="flex justify-end items-center gap-2 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>End-to-end encrypted</span>
                    <Lock className="h-3 w-3" />
                </div>

                {/* Payment Option Card */}
                <div
                    onClick={handleSelectPayment}
                    className="group w-full bg-white border-2 border-slate-100 rounded-2xl p-6 flex items-center justify-between hover:border-[#002B49] hover:shadow-xl transition-all cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                        <div className="text-sm font-bold text-slate-700">
                            Credit or Debit Card
                        </div>
                        <div className="flex items-center gap-2 opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                            {/* Card Network Placeholders */}
                            <div className="flex items-center gap-1">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                                    alt="Visa"
                                    className="h-3 w-auto"
                                />
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                                    alt="Mastercard"
                                    className="h-5 w-auto"
                                />
                                <div className="text-[10px] font-black text-blue-800 italic">
                                    Verve
                                </div>
                            </div>
                        </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[#002B49] transition-colors" />
                </div>

                {/* Secure Badge */}
                <div className="mt-16 flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                        <ShieldCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-[200px]">
                        Guaranteed secure transactions with 256-bit encryption
                    </p>
                </div>

                {/* Navigation Actions */}
                <div className="mt-12 flex justify-center">
                    <button
                        onClick={handleBack}
                        className="text-sm font-bold text-[#002B49] hover:underline"
                    >
                        Go back to plans
                    </button>
                </div>
            </main>
        </div>
    );
}
