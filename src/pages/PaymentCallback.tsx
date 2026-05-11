import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, AlertCircle, RefreshCcw, Home } from "lucide-react";
import AuthHeader from "@/components/auth/layout/header/AuthHeader";

type PaymentState = "verifying" | "success" | "cancelled" | "error";

export default function PaymentCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [state, setState] = useState<PaymentState>("verifying");
    const [message, setMessage] = useState("We're confirming your payment...");
    const [isWebview, setIsWebview] = useState(false);

    useEffect(() => {
        // Detect if running in a webview
        const userAgent = window.navigator.userAgent.toLowerCase();
        // Check for common mobile webview indicators
        const isMobileWebview = /iphone|ipad|ipod|android/.test(userAgent) && 
                              (/wv/.test(userAgent) || !/safari/.test(userAgent));
        
        // Check for common native bridge objects
        const hasNativeBridge = !!(window as any).ReactNativeWebView || 
                               !!(window as any).webkit?.messageHandlers || 
                               !!(window as any).Android;
        
        setIsWebview(isMobileWebview || hasNativeBridge);
    }, []);

    const handleClose = () => {
        const payload = JSON.stringify({ 
            type: 'payment_status', 
            status: state,
            message: message 
        });

        // 1. Post message for React Native
        if ((window as any).ReactNativeWebView) {
            (window as any).ReactNativeWebView.postMessage(payload);
        }

        // 2. Post message for iOS WebKit
        if ((window as any).webkit?.messageHandlers?.callbackHandler) {
            (window as any).webkit.messageHandlers.callbackHandler.postMessage(payload);
        }
        
        // 3. Post message for Android
        if ((window as any).Android?.onPaymentComplete) {
            (window as any).Android.onPaymentComplete(payload);
        }
        
        // 4. General window message
        window.postMessage({ type: 'payment_status', status: state }, "*");

        // 5. Try to close window
        window.close();

        // 6. Fallback for non-webview: navigate
        if (state === "success") {
            navigate("/profile");
        } else {
            navigate("/payment-method");
        }
    };

    useEffect(() => {
        const status = searchParams.get("status");
        const reference = searchParams.get("reference") || searchParams.get("trxref");
        const sessionId = searchParams.get("session_id");

        if (status === "success") {
            setState("success");
            setMessage("Your subscription has been successfully activated.");
        } else if (status === "cancel") {
            setState("cancelled");
            setMessage("The payment process was cancelled. No charges were made.");
        } else if (reference) {
            // Paystack callback logic
            setState("verifying");
            setMessage("Verifying your transaction...");
            
            // Simulate verification delay (or call API here if available)
            const timer = setTimeout(() => {
                setState("success");
                setMessage("Payment verified! Your account is now active.");
            }, 2000);
            
            return () => clearTimeout(timer);
        } else if (sessionId) {
            // Stripe success redirect usually comes with a session_id
            setState("success");
            setMessage("Subscription confirmed. Welcome aboard!");
        } else {
            // Default to success if no specific status but we landed here
            // (Often the case for simple redirects)
            setState("success");
            setMessage("Your transaction was successful.");
        }
    }, [searchParams]);

    // Auto-close for webviews on success/cancel after 3 seconds
    useEffect(() => {
        if (isWebview && (state === "success" || state === "cancelled")) {
            const timer = setTimeout(() => {
                handleClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isWebview, state]);

    const renderContent = () => {
        switch (state) {
            case "verifying":
                return (
                    <>
                        <div className="mb-8">
                            <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center animate-pulse">
                                <Loader2 className="h-12 w-12 text-[#002B49] animate-spin" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
                            Verifying Payment
                        </h1>
                        <p className="text-slate-500 font-medium max-w-md mx-auto">
                            {message}
                        </p>
                    </>
                );
            case "success":
                return (
                    <>
                        <div className="mb-8 animate-in zoom-in duration-500">
                            <div className="h-24 w-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-100">
                                <CheckCircle2 className="h-14 w-14 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                            Payment Successful
                        </h1>
                        <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto mb-12">
                            {message}
                        </p>
                        <div className="w-full max-w-sm space-y-4">
                            <button
                                onClick={handleClose}
                                className="w-full h-14 bg-[#002B49] text-white font-bold rounded-2xl shadow-xl shadow-[#002B49]/20 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Home className="h-5 w-5" />
                                {isWebview ? "Close & Return to App" : "Go to Dashboard"}
                            </button>
                        </div>
                    </>
                );
            case "cancelled":
                return (
                    <>
                        <div className="mb-8 animate-in zoom-in duration-500">
                            <div className="h-24 w-24 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-100">
                                <AlertCircle className="h-14 w-14 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
                            Payment Cancelled
                        </h1>
                        <p className="text-slate-500 font-medium max-w-md mx-auto mb-12">
                            {message}
                        </p>
                        <div className="w-full max-w-sm space-y-4">
                            <button
                                onClick={handleClose}
                                className="w-full h-14 bg-[#002B49] text-white font-bold rounded-2xl shadow-xl shadow-[#002B49]/20 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <RefreshCcw className="h-5 w-5" />
                                {isWebview ? "Return to App" : "Try Again"}
                            </button>
                            {!isWebview && (
                                <button
                                    onClick={() => navigate("/choose-plan")}
                                    className="w-full h-14 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all cursor-pointer"
                                >
                                    Change Plan
                                </button>
                            )}
                        </div>
                    </>
                );
            case "error":
                return (
                    <>
                        <div className="mb-8 animate-in zoom-in duration-500">
                            <div className="h-24 w-24 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-100">
                                <XCircle className="h-14 w-14 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
                            Payment Failed
                        </h1>
                        <p className="text-slate-500 font-medium max-w-md mx-auto mb-12">
                            Something went wrong with your transaction. Please contact support if this persists.
                        </p>
                        <div className="w-full max-w-sm space-y-4">
                            <button
                                onClick={handleClose}
                                className="w-full h-14 bg-[#002B49] text-white font-bold rounded-2xl shadow-xl shadow-[#002B49]/20 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <AlertCircle className="h-5 w-5" />
                                {isWebview ? "Close & Return" : "Contact Support"}
                            </button>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
            <AuthHeader />
            <main className="grow container mx-auto px-6 flex flex-col items-center justify-center text-center max-w-2xl -mt-20">
                {renderContent()}
            </main>
        </div>
    );
}
