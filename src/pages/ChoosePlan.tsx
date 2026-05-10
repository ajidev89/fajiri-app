import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check, ArrowRight } from "lucide-react";
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

    const isUpgrade = new URLSearchParams(location.search).get("upgrade") === "true";
    const currentPlanId = user?.plan?.id;
    const accountType = user?.account_type;

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await authApi.getPlans(accountType);
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
    }, [accountType]);

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
        <div className="min-h-screen bg-slate-50/30 font-sans text-slate-900 selection:bg-[#002B49]/10">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <AuthHeader />
            </header>

            <main className="container mx-auto px-6 pt-32 pb-24 text-center">
                {/* Onboarding Steps */}
                <div className="mb-16">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="h-1.5 w-8 rounded-full bg-green-500"></div>
                        <div className="h-1.5 w-12 rounded-full bg-[#002B49]"></div>
                        <div className="h-1.5 w-8 rounded-full bg-slate-200"></div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] block mb-2">
                        {isUpgrade ? "Account Management" : "Step 2 of 3"}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                        {isUpgrade ? "Upgrade your " : "Choose the "}
                        {accountType ? (
                            <span className="text-[#002B49]">
                                {accountType}
                            </span>
                        ) : (
                            ""
                        )}{" "}
                        plan
                    </h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
                    {plans.map((plan) => {
                        const isCurrentPlan = isUpgrade && plan.id === currentPlanId;
                        
                        return (
                            <div
                                key={plan.id}
                                onClick={() => !isCurrentPlan && setSelectedPlanId(plan.id)}
                                className={`group relative bg-white rounded-[2.5rem] p-10 border-2 transition-all duration-500 text-left flex flex-col ${
                                    isCurrentPlan 
                                        ? "opacity-60 cursor-not-allowed border-slate-100" 
                                        : selectedPlanId === plan.id
                                            ? "border-[#002B49] shadow-[0_32px_64px_-12px_rgba(0,43,73,0.15)] scale-[1.02] z-10 cursor-pointer"
                                            : "border-slate-100 hover:border-slate-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                                }`}
                            >
                            <div className="mb-8">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                                        {plan.name}
                                    </span>
                                    {selectedPlanId === plan.id && (
                                        <div className="bg-green-500 text-white p-1 rounded-full">
                                            <Check className="h-3 w-3" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black tracking-tighter text-slate-900">
                                        {plan.currency === "NGN"
                                            ? "₦"
                                            : plan.currency}
                                        {Number(plan.price).toLocaleString()}
                                    </span>
                                    <span className="text-slate-400 font-bold text-sm">
                                        / year
                                    </span>
                                </div>
                                <p className="mt-4 text-slate-500 text-sm leading-relaxed font-medium">
                                    {plan.description ||
                                        `The perfect plan for ${plan.name} members who want the best experience.`}
                                </p>
                            </div>

                            <div className="h-px w-full bg-slate-50 mb-8"></div>

                            <ul className="space-y-5 mb-10 flex-grow">
                                {plan.features.map((feature, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-start gap-4 text-sm font-medium leading-relaxed text-slate-600"
                                    >
                                        <div className="mt-1 h-5 w-5 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-50 transition-colors">
                                            <Check
                                                className={`h-3 w-3 transition-colors ${selectedPlanId === plan.id ? "text-green-600" : "text-slate-300 group-hover:text-green-600"}`}
                                            />
                                        </div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${
                                    isCurrentPlan
                                        ? "bg-slate-100 text-slate-400"
                                        : selectedPlanId === plan.id
                                            ? "bg-[#002B49] text-white"
                                            : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600"
                                }`}
                            >
                                {isCurrentPlan
                                    ? "Current Plan"
                                    : selectedPlanId === plan.id
                                        ? "Selected Plan"
                                        : "Choose Plan"}
                            </button>
                        </div>
                    );
                })}
                </div>

                <div className="max-w-md mx-auto sticky z-30 bottom-8">
                    <Button
                        size="lg"
                        disabled={!selectedPlanId || submitting}
                        onClick={handleSubscribe}
                        className={`w-full h-16 text-lg font-black rounded-[1.25rem] transition-all duration-500 group overflow-hidden ${
                            selectedPlanId
                                ? "bg-[#002B49] hover:bg-[#001F35] text-white shadow-[0_20px_40px_-10px_rgba(0,43,73,0.3)] hover:scale-[1.02]"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                    >
                        <span className="relative z-10 flex items-center justify-center">
                            {submitting ? (
                                <Loader2 className="animate-spin mr-2" />
                            ) : (
                                <>
                                    Proceed to Payment
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </span>
                    </Button>
                    <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Secure 256-bit encrypted checkout
                    </p>
                </div>
            </main>
        </div>
    );
}
