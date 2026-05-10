import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import AuthHeader from "@/components/auth/layout/header/AuthHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    User,
    CreditCard,
    History as HistoryIcon,
    Loader2,
    CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";

export default function Profile() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState("information");

    const tabs = [
        { id: "information", label: "Information", icon: User },
        { id: "billing", label: "Billing", icon: CreditCard },
        { id: "history", label: "History", icon: HistoryIcon },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            <AuthHeader />

            <main className="container mx-auto px-6 py-12 max-w-5xl">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Account Settings
                    </h1>
                    <p className="text-slate-500">
                        Manage your profile, billing, and view your transaction
                        history.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <aside className="w-full md:w-64 shrink-0">
                        <nav className="flex flex-row md:flex-col gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto md:overflow-visible">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                                            activeTab === tab.id
                                                ? "bg-[#002B49] text-white shadow-lg shadow-[#002B49]/10"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    >
                                        <Icon size={18} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <div className="grow">
                        {activeTab === "information" && (
                            <InformationTab user={user} />
                        )}
                        {activeTab === "billing" && <BillingTab user={user} />}
                        {activeTab === "history" && <HistoryTab />}
                    </div>
                </div>
            </main>
        </div>
    );
}

function InformationTab({ user }: { user: any }) {
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState(user?.profile?.first_name || "");
    const [lastName, setLastName] = useState(user?.profile?.last_name || "");
    const [phone, setPhone] = useState(user?.phone || "");

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            await authApi.updateProfile({
                first_name: firstName,
                last_name: lastName,
                phone: phone,
            });
            toast.success("Profile updated successfully!");
        } catch (err: any) {
            toast.error(
                err.response?.data?.message ||
                    "Failed to update profile. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-50 p-6">
                <CardTitle className="text-xl font-bold">
                    Profile Information
                </CardTitle>
                <CardDescription>
                    Update your personal details and account settings.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="h-12 bg-slate-50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="h-12 bg-slate-50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input
                            defaultValue={user?.email}
                            disabled
                            className="h-12 bg-slate-50 opacity-60"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="h-12 bg-slate-50"
                        />
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button
                        onClick={handleSaveChanges}
                        disabled={loading}
                        className="bg-[#002B49] hover:bg-[#001F35] px-8 h-12 rounded-xl font-bold"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function BillingTab({ user }: { user: any }) {
    const navigate = useNavigate();
    const plan = user?.plan;

    return (
        <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-50 p-6">
                <CardTitle className="text-xl font-bold">
                    Current Subscription
                </CardTitle>
                <CardDescription>
                    View and manage your active membership plan.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
                {plan ? (
                    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6 text-left w-full md:w-auto">
                            <div className="h-16 shrink-0 w-16 bg-[#002B49] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#002B49]/20">
                                <CheckCircle2 size={32} />
                            </div>
                            <div>
                                <Badge className="mb-2 bg-green-500 text-white border-0 font-bold px-3">
                                    ACTIVE
                                </Badge>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {plan.name}
                                </h3>
                                <p className="text-slate-500 font-medium">
                                    Billed annually • {plan.currency}{" "}
                                    {Number(plan.price).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => navigate("/choose-plan?upgrade=true")}
                            variant="outline"
                            className="h-12 border-slate-200 text-[#002B49] font-bold rounded-xl px-6 hover:bg-slate-100"
                        >
                            Change Plan
                        </Button>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-500 mb-6">
                            You don't have an active subscription.
                        </p>
                        <Button
                            onClick={() => navigate("/choose-plan")}
                            className="bg-[#002B49]"
                        >
                            Choose a Plan
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function HistoryTab() {
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const data = await authApi.getSubscriptions();
                setSubscriptions(data || []);
            } catch (err) {
                console.error("Failed to fetch subscriptions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptions();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "bg-green-100 text-green-700";
            case "pending":
                return "bg-amber-100 text-amber-700";
            case "expired":
                return "bg-red-100 text-red-700";
            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    return (
        <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-50 p-6">
                <CardTitle className="text-xl font-bold">
                    Membership History
                </CardTitle>
                <CardDescription>
                    A record of all your plan subscriptions and renewals.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin h-8 w-8 text-[#002B49]" />
                    </div>
                ) : subscriptions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Plan Name
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Started Date
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {subscriptions.map((sub) => (
                                    <tr
                                        key={sub.id}
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">
                                                {sub.name}
                                            </div>
                                            {sub.expires_at && (
                                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                                                    EXPIRES:{" "}
                                                    {new Date(
                                                        sub.expires_at,
                                                    ).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                            {new Date(
                                                sub.started_at,
                                            ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            {sub.currency}{" "}
                                            {Number(sub.price).toLocaleString(
                                                undefined,
                                                {
                                                    minimumFractionDigits: 2,
                                                },
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                className={`${getStatusColor(
                                                    sub.status,
                                                )} hover:inherit border-0 font-bold px-2 uppercase text-[10px]`}
                                            >
                                                {sub.status || "UNKNOWN"}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-50 text-slate-300 mb-4">
                            <HistoryIcon size={32} />
                        </div>
                        <p className="text-slate-500 font-medium">
                            No subscription history found.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
