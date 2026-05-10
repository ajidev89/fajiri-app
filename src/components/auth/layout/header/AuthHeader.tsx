import { useNavigate } from "react-router-dom";
import logoImg from "@/assets/fajiri-logo.png";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthHeader() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleSignOut = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="container mx-auto px-6 py-8 flex justify-between items-center">
            <img 
                src={logoImg} 
                alt="Fajiri Logo" 
                className="h-12 w-auto cursor-pointer" 
                onClick={() => navigate("/")} 
            />
            <div className="flex items-center gap-6">
                {user && (
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Active Account</span>
                        <span className="text-sm font-semibold text-[#002B49]">{user.email}</span>
                    </div>
                )}
                <button 
                    onClick={handleSignOut}
                    className="text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors"
                >
                    Sign Out
                </button>
            </div>
        </header>
    );
}
