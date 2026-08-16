import { useNavigate } from "react-router-dom";
import logoImg from "@/assets/fajiri-logo.png";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

interface AuthHeaderProps {
    className?: string;
}

export default function AuthHeader({ className }: AuthHeaderProps) {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleSignOut = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className={cn("w-full bg-white/90 backdrop-blur-md border-b border-slate-100", className)}>
            <div className="container mx-auto px-4 sm:px-6 py-3.5 sm:py-4 md:py-5 flex justify-between items-center">
                <img 
                    src={logoImg} 
                    alt="Fajiri Logo" 
                    className="h-8 sm:h-9 md:h-10 w-auto cursor-pointer object-contain" 
                    onClick={() => navigate("/")} 
                />
                <div className="flex items-center gap-3 sm:gap-6">
                    {user && (
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Active Account</span>
                            <span className="text-sm font-semibold text-[#002B49] truncate max-w-[200px]">{user.email}</span>
                        </div>
                    )}
                    <button 
                        onClick={handleSignOut}
                        className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-50"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </header>
    );
}
