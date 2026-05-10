import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import AuthHeader from "@/components/auth/layout/header/AuthHeader";

export default function PaymentSuccess() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
            <AuthHeader />

            <main className="grow container mx-auto px-6 flex flex-col items-center justify-center text-center max-w-2xl -mt-20">
                {/* Success Icon */}
                <div className="mb-8">
                    <div className="h-24 w-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-100">
                        <CheckCircle2 className="h-14 w-14 text-white" />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4 mb-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Membership Verification Complete
                    </h1>
                    <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
                        Your access has been successfully activated. You can now
                        continue in the NGO app.
                    </p>
                </div>

                {/* Actions */}
                <div className="w-full max-w-sm space-y-4">
                    <button
                        onClick={() => navigate("/")}
                        className="w-full h-14 bg-[#002B49] text-white font-bold rounded-2xl shadow-xl shadow-[#002B49]/20 hover:bg-[#001F35] transition-all"
                    >
                        Open App
                    </button>

                    <button
                        onClick={() => navigate("/")}
                        className="w-full h-14 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                    >
                        Return Later
                    </button>
                </div>
            </main>
        </div>
    );
}
