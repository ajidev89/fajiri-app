import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import VerifyMagicLink from "@/pages/VerifyMagicLink";
import ChoosePlan from "@/pages/ChoosePlan";
import PaymentMethod from "@/pages/PaymentMethod";
import PaymentSuccess from "@/pages/PaymentSuccess";
import GoogleCallback from "@/pages/GoogleCallback";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function App() {
    return (
        <Router>
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

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/choose-plan" element={<ChoosePlan />} />
                    <Route path="/payment-method" element={<PaymentMethod />} />
                    <Route
                        path="/payment-success"
                        element={<PaymentSuccess />}
                    />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
