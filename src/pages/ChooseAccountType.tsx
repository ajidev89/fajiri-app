import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import AuthHeader from "@/components/auth/layout/header/AuthHeader";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function ChooseAccountType() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [accountType, setAccountType] = useState(user?.account_type || "identified-membership");
    const [subAccountType, setSubAccountType] = useState(user?.sub_account_type || "");

    const handleContinue = async () => {
        setLoading(true);
        try {
            await authApi.updateProfile({
                account_type: accountType,
                sub_account_type: accountType === "corporate-membership" ? subAccountType : null,
            });
            toast.success("Account type confirmed");
            navigate("/choose-plan");
        } catch (err) {
            console.error("Error updating account type:", err);
            toast.error("Failed to update account type");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/30 font-sans text-slate-900 selection:bg-[#002B49]/10">
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <AuthHeader />
            </header>

            <main className="container mx-auto px-6 pt-32 pb-24 text-center max-w-lg">
                <div className="mb-12">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="h-1.5 w-12 rounded-full bg-[#002B49]"></div>
                        <div className="h-1.5 w-8 rounded-full bg-slate-200"></div>
                        <div className="h-1.5 w-8 rounded-full bg-slate-200"></div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] block mb-2">
                        Step 1 of 3
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
                        Confirm Account Type
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Please review and confirm your account type before proceeding to choose a plan.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-left space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="account_type" className="text-slate-700 font-bold">
                            Account Type
                        </Label>
                        <select
                            id="account_type"
                            value={accountType}
                            onChange={(e) => {
                                setAccountType(e.target.value);
                                if (e.target.value !== "corporate-membership") {
                                    setSubAccountType("");
                                }
                            }}
                            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B49]/20 transition-all font-medium"
                        >
                            <option value="identified-membership">Identified Membership</option>
                            <option value="program-membership">Program Membership</option>
                            <option value="corporate-membership">Corporate Membership</option>
                        </select>
                    </div>

                    {accountType === "corporate-membership" && (
                        <div className="space-y-2">
                            <Label htmlFor="sub_account_type" className="text-slate-700 font-bold">
                                Sub Account Type
                            </Label>
                            <select
                                id="sub_account_type"
                                value={subAccountType}
                                onChange={(e) => setSubAccountType(e.target.value)}
                                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B49]/20 transition-all font-medium"
                            >
                                <option value="" disabled>Select sub type</option>
                                <option value="global-collaborators">Global Collaborators</option>
                                <option value="global-sponsors">Global Sponsors</option>
                            </select>
                        </div>
                    )}

                    <Button
                        onClick={handleContinue}
                        disabled={loading || (accountType === "corporate-membership" && !subAccountType)}
                        className="w-full h-14 bg-[#002B49] hover:bg-[#001F35] text-white font-bold text-lg rounded-xl transition-all mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "Continue"}
                    </Button>
                </div>
            </main>
        </div>
    );
}
