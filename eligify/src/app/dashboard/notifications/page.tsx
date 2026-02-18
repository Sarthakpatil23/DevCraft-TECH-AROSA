"use client";
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard,
    User,
    Search,
    Upload,
    ClipboardList,
    FileCheck,
    BookOpen,
    Bell,
    LogOut,
    ChevronRight,
    Shield,
    CheckCircle2,
    X,
    Menu,
    AlertCircle,
    Clock,
    CalendarClock,
    Sparkles,
    FileWarning,
    UserX,
    BellRing,
    Check,
    Trash2,
    Eye,
    Filter,
    Inbox,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// ─── Sidebar Items ──────────────────────────────────────────────────
const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard", href: "/dashboard" },
    { icon: User, label: "Profile", id: "profile", href: "/dashboard/profile" },
    { icon: Search, label: "Explore Schemes", id: "explore", href: "/dashboard/explore" },
    { icon: Upload, label: "Upload Scheme", id: "upload", href: "/dashboard/upload" },
    { icon: ClipboardList, label: "My Evaluations", id: "evaluations", href: "/dashboard/evaluations" },
    { icon: FileCheck, label: "Get Your Docs", id: "docs", href: "/dashboard/docs" },
    { icon: BookOpen, label: "Resources", id: "resources", href: "/dashboard/resources" },
    { icon: Bell, label: "Notifications", id: "notifications", href: "/dashboard/notifications" },
];

// ─── Types ──────────────────────────────────────────────────────────
type NotificationType = "deadline" | "new-match" | "profile" | "document";

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    schemeName: string | null;
    schemeId: string | null;
    date: string;
    read: boolean;
}

// ─── Notification Config ────────────────────────────────────────────
const NOTIF_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    deadline: { icon: CalendarClock, color: "text-red-400", bg: "bg-red-500/10 border-red-500/15", label: "Deadline" },
    "new-match": { icon: Sparkles, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/15", label: "New Match" },
    profile: { icon: UserX, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/15", label: "Reminder" },
    document: { icon: FileWarning, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/15", label: "Document" },
};

// ─── Mock Data ──────────────────────────────────────────────────────
const INITIAL_NOTIFICATIONS: Notification[] = [
    {
        id: "notif-1",
        type: "deadline",
        title: "Deadline Approaching",
        message: "Only 12 days remaining to apply. Don't miss this opportunity.",
        schemeName: "National Scholarship Portal",
        schemeId: "national-scholarship",
        date: "2026-02-18",
        read: false,
    },
    {
        id: "notif-2",
        type: "new-match",
        title: "New Scheme Match Found",
        message: "Based on your profile, you're 88% eligible for this healthcare scheme.",
        schemeName: "Ayushman Bharat Yojana",
        schemeId: "ayushman-bharat",
        date: "2026-02-17",
        read: false,
    },
    {
        id: "notif-3",
        type: "profile",
        title: "Profile Incomplete",
        message: "Complete your education and income details to unlock 5 more scheme matches.",
        schemeName: null,
        schemeId: null,
        date: "2026-02-16",
        read: false,
    },
    {
        id: "notif-4",
        type: "document",
        title: "Document Expiry Warning",
        message: "Your Income Certificate will expire in 30 days. Renew it to maintain eligibility.",
        schemeName: null,
        schemeId: null,
        date: "2026-02-15",
        read: true,
    },
    {
        id: "notif-5",
        type: "deadline",
        title: "Deadline Approaching",
        message: "Application deadline is in 45 days. Start your application early.",
        schemeName: "PM Kisan Samman Nidhi",
        schemeId: "pm-kisan",
        date: "2026-02-14",
        read: true,
    },
    {
        id: "notif-6",
        type: "new-match",
        title: "New Scheme Match Found",
        message: "Your profile matches 82% of the eligibility criteria for this startup fund.",
        schemeName: "Startup India Seed Fund",
        schemeId: "startup-india",
        date: "2026-02-12",
        read: true,
    },
    {
        id: "notif-7",
        type: "profile",
        title: "DigiLocker Sync Available",
        message: "New documents are available in DigiLocker. Sync to update your verified profile.",
        schemeName: null,
        schemeId: null,
        date: "2026-02-10",
        read: true,
    },
    {
        id: "notif-8",
        type: "document",
        title: "Missing Document",
        message: "Domicile Certificate is required for 3 schemes you're interested in. Get it now.",
        schemeName: null,
        schemeId: null,
        date: "2026-02-08",
        read: true,
    },
];

type FilterKey = "all" | "unread" | "deadline" | "new-match" | "profile" | "document";

// ─── NotifBadge (sidebar) ───────────────────────────────────────────
function SidebarNotifBadge({ count }: { count: number }) {
    if (count === 0) return null;
    return (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-[#0a0a0a]">
            {count}
        </motion.span>
    );
}

// ═══════════════════════════════════════════════════════════════════
// NOTIFICATIONS PAGE
// ═══════════════════════════════════════════════════════════════════
export default function NotificationsPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
    const [filter, setFilter] = useState<FilterKey>("all");

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) router.push("/");
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/");
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const filtered = useMemo(() => {
        if (filter === "all") return notifications;
        if (filter === "unread") return notifications.filter((n) => !n.read);
        return notifications.filter((n) => n.type === filter);
    }, [notifications, filter]);

    const FILTERS: { key: FilterKey; label: string }[] = [
        { key: "all", label: "All" },
        { key: "unread", label: `Unread (${unreadCount})` },
        { key: "deadline", label: "Deadlines" },
        { key: "new-match", label: "New Matches" },
        { key: "profile", label: "Reminders" },
        { key: "document", label: "Documents" },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            {/* ═══ SIDEBAR ═══ */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden" />
                )}
            </AnimatePresence>
            <aside className={cn("fixed top-0 left-0 h-screen w-[260px] bg-[#0e0e0e] border-r border-white/[0.06] flex flex-col z-50 transition-transform duration-300 lg:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
                <div className="p-6 pb-4 flex items-center gap-3">
                    <img src="/logo.png" alt="Eligify" className="h-10 w-auto object-contain" />
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="mx-4 mb-4 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.12]">
                    <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" /><span className="text-xs font-semibold text-emerald-400">DigiLocker Connected</span></div>
                    <p className="text-[10px] text-white/30 mt-1">Documents verified & secure</p>
                </div>
                <div className="mx-4 border-t border-white/[0.04] mb-2" />
                <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.id === "notifications";
                        return (
                            <button key={item.id} onClick={() => { router.push(item.href); setSidebarOpen(false); }} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative", isActive ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]")}>
                                {isActive && <motion.div layoutId="sidebarActive" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-400 rounded-r-full" />}
                                <div className="relative"><Icon className="w-[18px] h-[18px]" />{item.id === "notifications" && <SidebarNotifBadge count={unreadCount} />}</div>
                                {item.label}
                            </button>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-white/[0.04]">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/[0.06] transition-all"><LogOut className="w-[18px] h-[18px]" />Logout</button>
                </div>
            </aside>

            {/* ═══ MAIN ═══ */}
            <main className="flex-1 lg:ml-[260px] min-h-screen">
                {/* Top Bar */}
                <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.04] px-4 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/50 hover:text-white"><Menu className="w-6 h-6" /></button>
                        <div className="flex items-center gap-2">
                            <button onClick={() => router.push("/dashboard")} className="text-white/30 hover:text-white/60 text-sm">Dashboard</button>
                            <ChevronRight className="w-3.5 h-3.5 text-white/15" />
                            <span className="text-sm text-white font-medium">Notifications</span>
                        </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/40 to-blue-500/40 flex items-center justify-center text-sm font-bold text-white/80 border border-white/[0.1]">R</div>
                </motion.header>

                <div className="px-4 lg:px-8 py-8 max-w-[720px] mx-auto">
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center relative">
                                        <Bell className="w-5 h-5 text-white/40" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{unreadCount}</span>
                                        )}
                                    </div>
                                    <h1 className="text-2xl font-bold text-white">Notifications</h1>
                                </div>
                                <p className="text-sm text-white/30">Stay updated with important alerts</p>
                            </div>
                            {notifications.length > 0 && (
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <Button variant="outline" size="sm" onClick={markAllRead} className="border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white text-[11px] h-8 gap-1.5">
                                            <Check className="w-3 h-3" />Mark All Read
                                        </Button>
                                    )}
                                    <Button variant="outline" size="sm" onClick={clearAll} className="border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-red-400 text-[11px] h-8 gap-1.5">
                                        <Trash2 className="w-3 h-3" />Clear All
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Filters */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
                        {FILTERS.map((f) => (
                            <button key={f.key} onClick={() => setFilter(f.key)} className={cn("px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap border", filter === f.key ? "bg-white/[0.08] text-white border-white/[0.1]" : "bg-transparent text-white/25 border-white/[0.04] hover:bg-white/[0.03] hover:text-white/40")}>
                                {f.label}
                            </button>
                        ))}
                    </motion.div>

                    {/* Notification List */}
                    {filtered.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mx-auto mb-5">
                                <Inbox className="w-7 h-7 text-white/15" />
                            </div>
                            <h3 className="text-base font-semibold text-white/50 mb-1">
                                {filter === "all" ? "No notifications" : "No matching notifications"}
                            </h3>
                            <p className="text-xs text-white/20 max-w-xs mx-auto">
                                {filter === "all"
                                    ? "You're all caught up! We'll notify you when something important happens."
                                    : "Try a different filter to see more notifications."}
                            </p>
                        </motion.div>
                    ) : (
                        <div className="space-y-2">
                            {filtered.map((notif, i) => {
                                const config = NOTIF_CONFIG[notif.type];
                                const Icon = config.icon;
                                return (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.03 * i }}
                                        onClick={() => !notif.read && markAsRead(notif.id)}
                                        className={cn(
                                            "relative bg-[#111111] border rounded-xl p-4 transition-all group",
                                            notif.read
                                                ? "border-white/[0.04] opacity-60"
                                                : "border-white/[0.08] hover:border-white/[0.12]"
                                        )}
                                    >
                                        {/* Unread dot */}
                                        {!notif.read && (
                                            <div className="absolute top-4 right-4">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 block animate-pulse" />
                                            </div>
                                        )}

                                        <div className="flex items-start gap-3.5">
                                            {/* Icon */}
                                            <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0", config.bg)}>
                                                <Icon className={cn("w-4 h-4", config.color)} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 pr-4">
                                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                    <h3 className="text-sm font-medium text-white/80">{notif.title}</h3>
                                                    <Badge className={cn("text-[8px] gap-0.5 px-1.5 py-0", config.bg, config.color)}>
                                                        {config.label}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-white/30 leading-relaxed mb-2">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    {notif.schemeName && (
                                                        <span className="text-[10px] text-white/35 flex items-center gap-1 bg-white/[0.03] px-2 py-0.5 rounded-full">
                                                            <FileCheck className="w-2.5 h-2.5" />
                                                            {notif.schemeName}
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-white/15 flex items-center gap-1">
                                                        <Clock className="w-2.5 h-2.5" />
                                                        {new Date(notif.date).toLocaleDateString("en-IN", {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                        })}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action */}
                                            {notif.schemeId && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/dashboard/explore/${notif.schemeId}`);
                                                    }}
                                                    className="border-white/[0.06] bg-white/[0.02] text-white/30 hover:text-white hover:bg-white/[0.06] text-[10px] h-7 gap-1 flex-shrink-0 hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Eye className="w-3 h-3" />View Scheme
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="text-center py-10 border-t border-white/[0.04] mt-12">
                        <p className="text-xs text-white/15">© 2026 Eligify · AI-Powered Policy Decision Engine</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
