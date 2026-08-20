import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Lock, ShieldCheck, ChevronLeft, Loader2 } from "lucide-react";
import { storage } from "@/lib/storage";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import Visa from "@/assets/visa.png";
import Mastercard from "@/assets/mastercard.png";
import Verve from "@/assets/verve.png";
import flutterwaveLogo from "@/assets/flutterwave.png";
import stripe from "@/assets/stripe.webp";
import AuthHeader from "@/components/auth/layout/header/AuthHeader";

interface PaymentGatewayOption {
    id: string;
    name: string;
    description: string;
    badge?: string;
    renderLogos: () => React.ReactNode;
}

function PaystackLogo() {
    return (
        <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-all">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="20" height="3" rx="1.5" fill="#00C3F7" />
                <rect x="2" y="8.5" width="15" height="3" rx="1.5" fill="#00C3F7" />
                <rect x="2" y="14" width="20" height="3" rx="1.5" fill="#00C3F7" />
                <rect x="2" y="19.5" width="11" height="3" rx="1.5" fill="#00C3F7" />
            </svg>
            <span className="text-xs font-black tracking-tight text-[#001C38]">paystack</span>
        </div>
    );
}

function StripeLogo() {
    return (
        <img src={stripe} className="h-4" />);
}

function FlutterwaveLogo() {

    return (
        <img src={flutterwaveLogo} className="h-8" />);
}

// function NombaLogo() {
//     return (
//         <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-all">
//             <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <rect width="24" height="24" rx="5" fill="#FFB703" />
//                 <path
//                     d="M7 16.5V7.5H9.5L14.5 13.5V7.5H17V16.5H14.5L9.5 10.5V16.5H7Z"
//                     fill="#023047"
//                 />
//             </svg>
//             <span className="text-xs font-black tracking-tight text-slate-800">nomba</span>
//         </div>
//     );
// }

function PayPalLogo() {
    return (
        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-all">
            <svg className="h-5 w-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.945 2.502a.64.64 0 0 1 .632-.544h7.02c3.084 0 5.485.835 6.275 2.181.696 1.185.642 2.766-.164 4.836-1.026 2.637-3.088 4.316-6.13 4.99-.444.098-.921.147-1.42.147H9.27a.64.64 0 0 0-.632.544l-1.05 6.643a.64.64 0 0 1-.512.238z"
                    fill="#003087"
                />
                <path
                    d="M9.467 14.112l1.05-6.643a.64.64 0 0 1 .633-.544h3.69c2.475 0 4.39.557 5.021 1.635.557.948.513 2.213-.131 3.868-.82 2.11-2.47 3.453-4.904 3.993-.355.078-.737.118-1.136.118h-3.69a.64.64 0 0 0-.633.544l-1.242 7.854a.641.641 0 0 1-.633.74H7.525a.64.64 0 0 1-.632-.74l1.942-10.825a.64.64 0 0 1 .632-.544z"
                    fill="#0079C1"
                />
            </svg>
            <span className="text-xs font-extrabold italic tracking-tight text-[#003087]">
                Pay<span className="text-[#0079C1]">Pal</span>
            </span>
        </div>
    );
}

export default function PaymentMethod() {
    const navigate = useNavigate();
    const [loadingGateway, setLoadingGateway] = useState<string | null>(null);

    const handleBack = () => {
        navigate("/choose-plan");
    };

    const paymentGateways: PaymentGatewayOption[] = [
        {
            id: "paystack",
            name: "Debit or Credit Card (Paystack)",
            description: "Instant checkout with Visa, Mastercard, Verve card, Bank Transfer or USSD (NGN)",
            badge: "Default • NGN",
            renderLogos: () => (
                <div className="flex items-center gap-2">
                    <PaystackLogo />
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-all">
                        <img src={Visa} alt="Visa" className="h-3 w-auto object-contain" />
                        <img src={Mastercard} alt="Mastercard" className="h-5 w-auto object-contain" />
                        <img src={Verve} alt="Verve" className="h-3 w-auto object-contain" />
                    </div>
                </div>
            ),
        },
        {
            id: "stripe",
            name: "International Card (Stripe)",
            description: "Instant checkout with International Visa, Mastercard, Amex, Apple Pay (USD & Global)",
            badge: "Default • USD",
            renderLogos: () => (
                <div className="flex items-center gap-2">
                    <StripeLogo />
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-all">
                        <img src={Visa} alt="Visa" className="h-3 w-auto object-contain" />
                        <img src={Mastercard} alt="Mastercard" className="h-5 w-auto object-contain" />
                    </div>
                </div>
            ),
        },
        {
            id: "flutterwave",
            name: "Flutterwave",
            description: "Cards, Bank Transfer, USSD, Mobile Money & Barter",
            badge: "Popular",
            renderLogos: () => <FlutterwaveLogo />,
        },
        // {
        //     id: "nomba",
        //     name: "Nomba",
        //     description: "Quick checkout via Card, Bank Transfer, or QR payment",
        //     renderLogos: () => <NombaLogo />,
        // },
        {
            id: "paypal",
            name: "PayPal",
            description: "Pay with PayPal balance or international debit / credit cards",
            badge: "International",
            renderLogos: () => <PayPalLogo />,
        },
    ];

    const handleSelectPayment = async (gatewayId: string = "paystack") => {
        const selectedPlanId = storage.get("selected_plan_id");
        if (!selectedPlanId) {
            toast.error("No plan selected. Please choose a plan first.");
            navigate("/choose-plan");
            return;
        }

        setLoadingGateway(gatewayId);
        try {
            const response = await authApi.initializeSubscription({
                plan_id: selectedPlanId,
                gateway: gatewayId,
                payment_method: gatewayId,
                success_url: `${window.location.origin}/payment/callback?${['stripe', 'paypal'].includes(gatewayId) ? 'status=success&' : ''}gateway=${gatewayId}`,
                cancel_url: `${window.location.origin}/payment/callback?status=cancel&gateway=${gatewayId}`,
            });

            const data = response.data?.data || response.data || {};
            const redirectUrl =
                data.authorization_url ||
                data.checkout_url ||
                data.url ||
                data.link ||
                data.payment_url ||
                response.data?.url ||
                response.data?.authorization_url;

            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                // If it's a free plan or direct activation without external redirect
                navigate("/payment-success");
            }
        } catch (err: any) {
            console.error("Payment initialization error:", err);
            const errorMsg =
                err?.response?.data?.message ||
                err?.message ||
                `Failed to initialize payment with ${gatewayId}. Please try again.`;
            toast.error(errorMsg);
        } finally {
            setLoadingGateway(null);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col overflow-x-hidden w-full">
            <AuthHeader className="sticky top-0 z-50" />

            <main className="container mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20 sm:pb-24 text-center max-w-2xl relative flex-1 w-full">
                {/* Back Button & Step Row */}
                <div className="relative flex items-center justify-center mb-6 sm:mb-8">
                    <button
                        onClick={handleBack}
                        className="absolute left-0 p-2 text-slate-400 hover:text-[#002B49] transition-colors rounded-full hover:bg-slate-50 flex items-center gap-1.5 font-semibold text-sm cursor-pointer"
                        aria-label="Go back"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Step 3 of 3
                    </span>
                </div>

                {/* Onboarding Steps */}
                <div className="mb-8 sm:mb-10">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 sm:mb-4 tracking-tight">
                        Choose how to pay
                    </h1>

                    <div className="space-y-1.5 text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
                        <p>
                            Your payment is encrypted and you can change how you pay anytime.
                        </p>
                        <p className="font-bold text-slate-800">
                            Secure for peace of mind.
                        </p>
                    </div>
                </div>

                {/* Encryption Badge */}
                <div className="flex justify-end items-center gap-1.5 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>End-to-end encrypted</span>
                    <Lock className="h-3 w-3" />
                </div>

                {/* Payment Options List */}
                <div className="space-y-3 sm:space-y-3.5 text-left">
                    {paymentGateways.map((gateway) => {
                        const isLoading = loadingGateway === gateway.id;
                        const isDisabled = loadingGateway !== null && !isLoading;

                        return (
                            <div
                                key={gateway.id}
                                onClick={() => !loadingGateway && handleSelectPayment(gateway.id)}
                                className={`group relative w-full bg-white border-2 rounded-2xl p-4 sm:p-5 md:p-6 flex items-center justify-between transition-all duration-200 ${isLoading
                                    ? "border-[#002B49] bg-slate-50/50 shadow-md ring-2 ring-[#002B49]/10"
                                    : isDisabled
                                        ? "opacity-50 border-slate-100 cursor-not-allowed"
                                        : "border-slate-100 hover:border-[#002B49] hover:shadow-lg cursor-pointer md:hover:-translate-y-0.5"
                                    }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 flex-1 min-w-0 mr-3">
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-[#002B49] transition-colors">
                                                {gateway.name}
                                            </span>
                                            {gateway.badge && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full group-hover:bg-[#002B49]/10 group-hover:text-[#002B49] transition-colors shrink-0">
                                                    {gateway.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium break-words">
                                            {gateway.description}
                                        </p>
                                    </div>

                                    {/* Logos / Brand Icons */}
                                    <div className="flex items-center shrink-0">
                                        {gateway.renderLogos()}
                                    </div>
                                </div>

                                {/* Arrow / Spinner */}
                                <div className="shrink-0 flex items-center justify-center w-6 h-6">
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 text-[#002B49] animate-spin" />
                                    ) : (
                                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[#002B49] group-hover:translate-x-0.5 transition-all" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Secure Badge */}
                <div className="mt-10 sm:mt-14 flex flex-col items-center gap-2.5 sm:gap-3">
                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-green-50 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                    <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest max-w-[220px]">
                        Guaranteed secure transactions with 256-bit encryption
                    </p>
                </div>

                {/* Navigation Actions */}
                <div className="mt-8 sm:mt-10 flex justify-center">
                    <button
                        onClick={handleBack}
                        className="text-xs sm:text-sm font-bold text-[#002B49] hover:underline cursor-pointer"
                    >
                        Go back to plans
                    </button>
                </div>
            </main>
        </div>
    );
}

