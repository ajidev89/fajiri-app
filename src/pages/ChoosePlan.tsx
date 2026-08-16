import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check, ArrowRight, ChevronLeft } from "lucide-react";
import { authApi } from "@/lib/api";
import { storage } from "@/lib/storage";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import AuthHeader from "@/components/auth/layout/header/AuthHeader";

interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
    features: string[];
    description: string;
}

export default function ChoosePlan() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const searchParams = new URLSearchParams(location.search);
    const isUpgrade = searchParams.get("upgrade") === "true";
    const currentPlanId = user?.plan?.id;
    const accountType = searchParams.get("account_type") || user?.account_type;
    const subAccountType = searchParams.get("sub_account_type") || user?.sub_account_type;

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await authApi.getPlans(accountType, subAccountType);
                // Ensure features is handled as an array
                const formattedPlans = (response.data.data || []).map(
                    (p: any) => ({
                        ...p,
                        features: Array.isArray(p.features) ? p.features : [],
                    }),
                );
                setPlans(formattedPlans);
            } catch (err) {
                console.error("Error fetching plans:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, [accountType, subAccountType]);

    const handleSubscribe = async () => {
        if (!selectedPlanId) return;

        setSubmitting(true);
        try {
            // Store selected plan in storage temporarily or pass via state
            storage.set("selected_plan_id", selectedPlanId);
            navigate("/payment-method");
        } catch (err) {
            console.error("Subscription error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <Loader2 className="h-12 w-12 animate-spin text-[#002B49] mb-4" />
                <p className="text-slate-500 font-medium animate-pulse">
                    Loading available plans...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/30 font-sans text-slate-900 selection:bg-[#002B49]/10 flex flex-col overflow-x-hidden w-full">
            {/* Header */}
            <AuthHeader className="sticky top-0 z-50" />

            <main className="container mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20 sm:pb-24 text-center max-w-7xl flex-1 w-full relative">
                {/* Navigation & Stepper Header */}
                <div className="relative flex items-center justify-center mb-6 sm:mb-8">
                    <button 
                        onClick={() => navigate("/choose-account-type")} 
                        className="absolute left-0 p-2 text-slate-400 hover:text-[#002B49] transition-colors rounded-full hover:bg-slate-100 flex items-center gap-1.5 font-semibold text-sm cursor-pointer"
                        aria-label="Go back"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    {/* Onboarding Steps Indicator */}
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-6 sm:w-8 rounded-full bg-green-500"></div>
                        <div className="h-1.5 w-8 sm:w-12 rounded-full bg-[#002B49]"></div>
                        <div className="h-1.5 w-6 sm:w-8 rounded-full bg-slate-200"></div>
                    </div>
                </div>

                {/* Heading & Subtitle */}
                <div className="mb-10 sm:mb-14 max-w-3xl mx-auto px-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] block mb-2">
                        {isUpgrade ? "Account Management" : "Step 2 of 3"}
                    </span>
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 tracking-tight capitalize break-words">
                        {isUpgrade ? "Upgrade your " : "Choose the "}
                        {subAccountType || accountType ? (
                            <span className="text-[#002B49]">
                                {(subAccountType || accountType)?.replace(/-/g, " ")}
                            </span>
                        ) : (
                            ""
                        )}{" "}
                        plan
                    </h1>
                    <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
                        Select the plan that best fits your contribution and membership level.
                    </p>
                </div>

                {/* Plan Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto mb-16 sm:mb-20">
                    {plans.map((plan) => {
                        const isCurrentPlan = isUpgrade && plan.id === currentPlanId;
                        const isSelected = selectedPlanId === plan.id;
                        
                        return (
                            <div
                                key={plan.id}
                                onClick={() => !isCurrentPlan && setSelectedPlanId(plan.id)}
                                className={`group relative bg-white rounded-3xl md:rounded-[2.5rem] p-6 sm:p-8 md:p-10 border-2 transition-all duration-300 text-left flex flex-col ${
                                    isCurrentPlan 
                                        ? "opacity-60 cursor-not-allowed border-slate-100" 
                                        : isSelected
                                            ? "border-[#002B49] shadow-[0_20px_40px_-12px_rgba(0,43,73,0.15)] ring-2 ring-[#002B49]/10 md:scale-[1.02] z-10 cursor-pointer"
                                            : "border-slate-100 hover:border-slate-300 hover:shadow-xl md:hover:-translate-y-1 cursor-pointer"
                                }`}
                            >
                                <div className="mb-6 sm:mb-8">
                                    <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] break-words">
                                            {plan.name}
                                        </span>
                                        {isSelected && (
                                            <div className="bg-green-500 text-white p-1 rounded-full shrink-0">
                                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-baseline gap-1.5">
                                        <span className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 break-all">
                                            {plan.currency === "NGN"
                                                ? "₦"
                                                : plan.currency}
                                            {Number(plan.price).toLocaleString()}
                                        </span>
                                        <span className="text-slate-400 font-bold text-xs sm:text-sm">
                                            / year
                                        </span>
                                    </div>
                                    <p className="mt-3 sm:mt-4 text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
                                        {plan.description ||
                                            `The perfect plan for ${plan.name} members who want the best experience.`}
                                    </p>
                                </div>

                                <div className="h-px w-full bg-slate-100 mb-6 sm:mb-8"></div>

                                <ul className="space-y-4 sm:space-y-5 mb-8 sm:mb-10 flex-grow">
                                    {plan.features.map((feature, idx) => (
                                        <li
                                            key={idx}
                                            className="flex items-start gap-3 sm:gap-4 text-xs sm:text-sm font-medium leading-relaxed text-slate-600"
                                        >
                                            <div className="mt-0.5 h-5 w-5 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-green-50 transition-colors">
                                                <Check
                                                    className={`h-3 w-3 transition-colors ${
                                                        isSelected ? "text-green-600" : "text-slate-300 group-hover:text-green-600"
                                                    }`}
                                                />
                                            </div>
                                            <span className="break-words">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    type="button"
                                    className={`w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                                        isCurrentPlan
                                            ? "bg-slate-100 text-slate-400"
                                            : isSelected
                                                ? "bg-[#002B49] text-white shadow-md shadow-[#002B49]/15"
                                                : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600"
                                    }`}
                                >
                                    {isCurrentPlan
                                        ? "Current Plan"
                                        : isSelected
                                            ? "Selected Plan"
                                            : "Choose Plan"}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Sticky Action Button at bottom */}
                <div className="sticky bottom-4 sm:bottom-8 z-30 max-w-md mx-auto px-4 sm:px-0 w-full">
                    <div className="bg-white/90 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-900/10">
                        <Button
                            size="lg"
                            disabled={!selectedPlanId || submitting}
                            onClick={handleSubscribe}
                            className={`w-full h-14 sm:h-16 text-base sm:text-lg font-black rounded-xl sm:rounded-[1.25rem] transition-all duration-300 group overflow-hidden cursor-pointer ${
                                selectedPlanId
                                    ? "bg-[#002B49] hover:bg-[#001F35] text-white shadow-md shadow-[#002B49]/20"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            }`}
                        >
                            <span className="relative z-10 flex items-center justify-center">
                                {submitting ? (
                                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                ) : (
                                    <>
                                        Proceed to Payment
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform shrink-0" />
                                    </>
                                )}
                            </span>
                        </Button>
                    </div>
                    <p className="mt-2.5 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                        Secure 256-bit encrypted checkout
                    </p>
                </div>
            </main>
        </div>
    );
}
