import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import AuthHeader from "@/components/auth/layout/header/AuthHeader";
import { toast } from "sonner";
import AccountTypeSelector from "@/components/auth/AccountTypeSelector";

export default function ChooseAccountType() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [accountType, setAccountType] = useState(user?.account_type || "identified-membership");
    const [subAccountType, setSubAccountType] = useState(user?.sub_account_type || (user?.account_type === "corporate-membership" ? "global-collaborators" : ""));

    const handleContinue = async () => {
        setLoading(true);
        try {
            const finalSubAccountType = accountType === "corporate-membership" ? (subAccountType || "global-collaborators") : null;
            await authApi.updateProfile({
                account_type: accountType,
                sub_account_type: finalSubAccountType,
            });
            toast.success("Account type confirmed");

            const params = new URLSearchParams();
            if (accountType) params.set("account_type", accountType);
            if (finalSubAccountType) params.set("sub_account_type", finalSubAccountType);

            navigate(`/choose-plan?${params.toString()}`);
        } catch (err) {
            console.error("Error updating account type:", err);
            toast.error("Failed to update account type");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/30 font-sans text-slate-900 selection:bg-[#002B49]/10 flex flex-col overflow-x-hidden w-full">
            <AuthHeader className="sticky top-0 z-50" />

            <main className="container mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20 sm:pb-24 text-center max-w-xl flex-1 w-full">
                <div className="mb-8 sm:mb-10">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="h-1.5 w-8 sm:w-12 rounded-full bg-[#002B49]"></div>
                        <div className="h-1.5 w-6 sm:w-8 rounded-full bg-slate-200"></div>
                        <div className="h-1.5 w-6 sm:w-8 rounded-full bg-slate-200"></div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] block mb-2">
                        Step 1 of 3
                    </span>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3 sm:mb-4">
                        Confirm Account Type
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
                        Please review and confirm your account type before proceeding to choose a plan.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 text-left space-y-6">
                    <AccountTypeSelector
                        value={accountType}
                        subValue={subAccountType}
                        onChange={(val) => {
                            setAccountType(val);
                            if (val === "corporate-membership") {
                                if (!subAccountType) setSubAccountType("global-collaborators");
                            } else {
                                setSubAccountType("");
                            }
                        }}
                        onSubChange={(subVal) => setSubAccountType(subVal)}
                        disabled={loading}
                    />

                    <Button
                        onClick={handleContinue}
                        disabled={loading || (accountType === "corporate-membership" && !subAccountType)}
                        className="w-full h-14 bg-[#002B49] hover:bg-[#001F35] text-white font-bold text-lg rounded-xl transition-all shadow-md shadow-[#002B49]/10 mt-4 cursor-pointer"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "Continue"}
                    </Button>
                </div>
            </main>
        </div>
    );
}
