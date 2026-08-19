import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Lock, ShieldCheck, ChevronLeft, Loader2 } from "lucide-react";
import { storage } from "@/lib/storage";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import Visa from "@/assets/visa.png";
import Mastercard from "@/assets/mastercard.png";
import Verve from "@/assets/verve.png";
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
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-all">
            <svg className="h-4.5 w-auto" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M59.64 14.28c0-4.47-2.18-8.02-6.38-8.02-4.22 0-6.78 3.55-6.78 8 0 5.29 3.03 7.94 7.37 7.94 2.12 0 3.73-.48 4.93-1.16v-3.41c-1.2.6-2.58.94-4.2.94-1.68 0-3.14-.62-3.37-2.31h8.34c.03-.3.09-1.29.09-1.98zm-8.4-1.6c0-1.57.96-2.22 2.07-2.22 1.07 0 1.99.65 1.99 2.22h-4.06zm-7.6 9.32h4.63V.5h-4.63v21.5zm-5.46-13.62c-1.1-.47-2.37-.8-3.37-.8-2.29 0-3.79 1.18-3.79 3.19 0 3.11 4.28 2.62 4.28 3.96 0 .54-.47.74-1.14.74-1.48 0-3.37-.62-4.88-1.46v3.74c1.62.7 3.39 1.01 4.88 1.01 2.37 0 4.02-1.16 4.02-3.23 0-3.35-4.29-2.77-4.29-4.02 0-.44.38-.67 1-.67 1.25 0 2.82.47 4.29 1.22v-3.68zm-11.45.62l-.32-1.64h-3.99v16.32h4.62v-11.2c1.08 1.39 2.53 1.98 4.14 1.98.54 0 .97-.05 1.3-.17v-4.14c-.39.11-.84.14-1.39.14-1.87 0-3.4-1.04-4.36-2.29zm-13.9 1.02h-4.48v-4.04h4.48V2.86l4.63-1.25v4.37h4.09v4.04h-4.09v8.32c0 1.31.62 1.83 1.83 1.83.74 0 1.48-.12 1.94-.33v3.79c-.77.34-1.89.54-3.29.54-3.23 0-5.11-1.68-5.11-4.99v-9.16zM4.63 22H0V6.68h4.63V22zm0-18.06c0 1.28-1.04 2.32-2.32 2.32C1.04 6.26 0 5.22 0 3.94 0 2.66 1.04 1.62 2.32 1.62c1.28 0 2.32 1.04 2.32 2.32z"
                    fill="#635BFF"
                />
            </svg>
        </div>
    );
}

function FlutterwaveLogo() {
    return (
        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-all">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 14C4 9.58 7.58 6 12 6C15.31 6 18.15 8.01 19.35 10.88C18.2 10.32 16.89 10 15.5 10C11.36 10 8 13.36 8 17.5C8 17.67 8.01 17.84 8.02 18H5.8C4.7 17.06 4 15.63 4 14Z" fill="#F5A623"/>
                <path d="M7 16C7.2 12.2 10.3 9.2 14.2 9.2C16.8 9.2 19.1 10.5 20.5 12.5C19.4 13.2 18 13.8 16.5 13.8C13.2 13.8 10.5 16.5 10.5 19.8C10.5 20.2 10.54 20.6 10.62 21H8.5C7.5 20.06 7 18.2 7 16Z" fill="#FF5964"/>
                <path d="M10 18C10.5 15.2 13 13 16 13C17.8 13 19.4 13.8 20.5 15C19.5 15.8 18.5 16.2 17.2 16.2C15 16.2 13.2 18 13.2 20.2C13.2 20.6 13.25 21 13.35 21.4H11.5C10.5 20.8 10 19.5 10 18Z" fill="#3B82F6"/>
            </svg>
            <span className="text-xs font-bold text-slate-800 tracking-tight">Flutterwave</span>
        </div>
    );
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
                        <img src={Mastercard} alt="Mastercard" className="h-4.5 w-auto object-contain" />
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
                        <img src={Mastercard} alt="Mastercard" className="h-4.5 w-auto object-contain" />
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
                                className={`group relative w-full bg-white border-2 rounded-2xl p-4 sm:p-5 md:p-6 flex items-center justify-between transition-all duration-200 ${
                                    isLoading
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

