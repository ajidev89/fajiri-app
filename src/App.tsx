import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import VerifyMagicLink from "@/pages/VerifyMagicLink";
import ChoosePlan from "@/pages/ChoosePlan";
import PaymentMethod from "@/pages/PaymentMethod";
import PaymentSuccess from "@/pages/PaymentSuccess";
import GoogleCallback from "@/pages/GoogleCallback";
import ForgotPassword from "@/pages/ForgotPassword";
import VerifyPasswordOtp from "@/pages/VerifyPasswordOtp";
import ResetPassword from "@/pages/ResetPassword";
import Profile from "@/pages/Profile";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Toaster } from "sonner";

function App() {
    return (
        <Router>
            <Toaster position="top-right" richColors />
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/profile/complete-profile"
                    element={<VerifyMagicLink />}
                />
                <Route
                    path="/auth/google/callback"
                    element={<GoogleCallback />}
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                    path="/verify-password-otp"
                    element={<VerifyPasswordOtp />}
                />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/choose-plan" element={<ChoosePlan />} />
                    <Route path="/payment-method" element={<PaymentMethod />} />
                    <Route
                        path="/payment-success"
                        element={<PaymentSuccess />}
                    />
                    <Route path="/profile" element={<Profile />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
