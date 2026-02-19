"use client";
import { ThemeToggle } from "@/components/theme-toggle";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
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
    Clock,
    AlertCircle,
    Play,
    ExternalLink,
    X,
    Menu,
    Sparkles,
    TrendingUp,
    Lock,
    FileText,
    ArrowUpRight,
    FolderLock,
    Zap,
    Eye,
    Download,
    RefreshCw,
    Star,
    CircleDot,
    Info,
    Award,
} from "lucide-react";

// ─── Sidebar Navigation Items ───────────────────────────────────────
const sidebarItems = [
    { icon: LayoutDashboard, label: "sidebar.dashboard", id: "dashboard" },
    { icon: User, label: "sidebar.profile", id: "profile" },
    { icon: Search, label: "sidebar.explore", id: "explore" },
    { icon: Upload, label: "sidebar.upload", id: "upload" },
    { icon: ClipboardList, label: "sidebar.evaluations", id: "evaluations" },
    { icon: FileCheck, label: "sidebar.docs", id: "docs" },
    { icon: FolderLock, label: "sidebar.vault", id: "vault" },
    { icon: BookOpen, label: "sidebar.resources", id: "resources" },
    { icon: Bell, label: "sidebar.notifications", id: "notifications" },
];

// ─── Circular Progress Ring ─────────────────────────────────────────
function ProfileRing({ percentage }: { percentage: number }) {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="var(--surface-6)"
                    strokeWidth="8"
                />
                <motion.circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                />
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    className="text-2xl font-bold text-[var(--text-primary)]"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                >
                    {percentage}%
                </motion.span>
                <span className="text-[10px] text-[var(--text-40)] uppercase tracking-wider">
                    Complete
                </span>
            </div>
        </div>
    );
}

// ─── Notification Badge ─────────────────────────────────────────────
function NotifBadge({ count }: { count: number }) {
    if (count === 0) return null;
    return (
        <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-[var(--bg-page)]"
        >
            {count}
        </motion.span>
    );
}

// ─── Dashboard Card Wrapper ─────────────────────────────────────────
function DashCard({
    children,
    className = "",
    delay = 0,
    id,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    id?: string;
}) {
    return (
        <motion.div
            id={id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            whileHover={{
                y: -4,
                borderColor: "var(--border-15)",
                transition: { duration: 0.2 },
            }}
            className={`bg-[var(--bg-card)] border border-[#1a1a1a] rounded-2xl p-6 relative overflow-hidden group transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] ${className}`}
        >
            {/* subtle glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}

// ─── Scheme Item (for Explore & Evaluations) ────────────────────────
function SchemeItem({
    title,
    category,
    match,
    status,
}: {
    title: string;
    category: string;
    match?: number;
    status?: "eligible" | "partial" | "pending";
}) {
    const statusColors = {
        eligible: "text-emerald-400 bg-emerald-400/10",
        partial: "text-amber-400 bg-amber-400/10",
        pending: "text-blue-400 bg-blue-400/10",
    };
    const statusLabels = {
        eligible: "Eligible",
        partial: "Partial Match",
        pending: "Pending",
    };
    const statusIcons = {
        eligible: CheckCircle2,
        partial: AlertCircle,
        pending: Clock,
    };

    const StatusIcon = status ? statusIcons[status] : null;

    return (
        <motion.div
            whileHover={{ x: 4 }}
            className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-5)] border border-transparent hover:border-[var(--border-6)] transition-all cursor-pointer group/item"
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[var(--surface-4)] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[var(--text-50)]" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{title}</p>
                    <p className="text-xs text-[var(--text-30)]">{category}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
                {match !== undefined && (
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
                        {match}% match
                    </span>
                )}
                {status && StatusIcon && (
                    <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${statusColors[status]}`}
                    >
                        <StatusIcon className="w-3 h-3" />
                        {statusLabels[status]}
                    </span>
                )}
                <ArrowUpRight className="w-4 h-4 text-[var(--text-20)] group-hover/item:text-[var(--text-60)] transition-colors" />
            </div>
        </motion.div>
    );
}

// ─── Document Step Item ─────────────────────────────────────────────
function DocStep({
    step,
    title,
    desc,
    done,
}: {
    step: number;
    title: string;
    desc: string;
    done: boolean;
}) {
    return (
        <div className="flex gap-4 items-start">
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors ${done
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-[var(--surface-4)] text-[var(--text-40)] border border-[var(--border-6)]"
                    }`}
            >
                {done ? <CheckCircle2 className="w-4 h-4" /> : step}
            </div>
            <div>
                <p className={`text-sm font-medium ${done ? "text-[var(--text-50)] line-through" : "text-[var(--text-primary)]"}`}>
                    {title}
                </p>
                <p className="text-xs text-[var(--text-30)] mt-0.5">{desc}</p>
            </div>
        </div>
    );
}

// ─── Resource Card ──────────────────────────────────────────────────
function ResourceCard({
    title,
    type,
    duration,
    thumbnail,
}: {
    title: string;
    type: "video" | "guide";
    duration: string;
    thumbnail: string;
}) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-xl overflow-hidden bg-[var(--surface-2)] border border-[var(--border-4)] hover:border-[var(--border-10)] transition-all cursor-pointer group/res"
        >
            <div
                className="relative h-28 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${thumbnail})`,
                    backgroundColor: "#1a1a1a",
                }}
            >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent" />
                {type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover/res:bg-white/30 transition-colors"
                        >
                            <Play className="w-4 h-4 text-[var(--text-primary)] ml-0.5" />
                        </motion.div>
                    </div>
                )}
                <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[var(--text-70)]">
                    {type}
                </span>
            </div>
            <div className="p-3">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{title}</p>
                <p className="text-xs text-[var(--text-30)] mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {duration}
                </p>
            </div>
        </motion.div>
    );
}

// ─── Notification Item ──────────────────────────────────────────────
function NotifItem({
    title,
    desc,
    time,
    type,
    unread,
}: {
    title: string;
    desc: string;
    time: string;
    type: "deadline" | "match" | "update";
    unread: boolean;
}) {
    const icons = {
        deadline: Clock,
        match: Sparkles,
        update: Info,
    };
    const colors = {
        deadline: "text-red-400 bg-red-400/10",
        match: "text-emerald-400 bg-emerald-400/10",
        update: "text-blue-400 bg-blue-400/10",
    };
    const Icon = icons[type];

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex gap-3 p-4 rounded-xl transition-all cursor-pointer hover:bg-[var(--surface-3)] ${unread ? "bg-[var(--surface-2)] border border-[var(--border-6)]" : ""
                }`}
        >
            <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[type]}`}
            >
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${unread ? "text-[var(--text-primary)]" : "text-[var(--text-60)]"}`}>
                        {title}
                    </p>
                    {unread && (
                        <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                    )}
                </div>
                <p className="text-xs text-[var(--text-30)] mt-0.5 line-clamp-2">{desc}</p>
                <p className="text-[10px] text-[var(--text-20)] mt-1">{time}</p>
            </div>
        </motion.div>
    );
}

// ─── Mock Data ──────────────────────────────────────────────────────

const recommendedSchemes = [
    { title: "PM Kisan Samman Nidhi", category: "Agriculture", match: 95 },
    { title: "National Scholarship Portal", category: "Education", match: 88 },
    { title: "Ayushman Bharat Yojana", category: "Healthcare", match: 82 },
    { title: "Startup India Seed Fund", category: "Entrepreneurship", match: 76 },
];

const evaluationHistory = [
    {
        title: "PM Awas Yojana (Urban)",
        category: "Housing",
        status: "eligible" as const,
    },
    {
        title: "Sukanya Samriddhi Account",
        category: "Savings",
        status: "partial" as const,
    },
    {
        title: "MUDRA Loan Scheme",
        category: "Finance",
        status: "pending" as const,
    },
    {
        title: "Digital India Scheme",
        category: "Technology",
        status: "eligible" as const,
    },
];

const docSteps = [
    { title: "Income Certificate", desc: "Visit nearest Tehsil office or apply online via e-District portal", done: true },
    { title: "Caste Certificate", desc: "Submit application at SDM office with supporting documents", done: true },
    { title: "Domicile Certificate", desc: "Apply at District Magistrate office or state portal", done: false },
    { title: "Bank Account Link", desc: "Link your Aadhaar-seeded bank account for DBT", done: false },
];

const resources = [
    { title: "How to Apply for PM Kisan", type: "video" as const, duration: "8 min", thumbnail: "" },
    { title: "Understanding Scholarship Eligibility", type: "guide" as const, duration: "5 min read", thumbnail: "" },
    { title: "DigiLocker Setup Guide", type: "video" as const, duration: "4 min", thumbnail: "" },
    { title: "Income Certificate Process", type: "guide" as const, duration: "3 min read", thumbnail: "" },
];

const notifications = [
    {
        title: "PM Kisan: Deadline Approaching",
        desc: "Last date to apply for PM Kisan 16th installment is March 31, 2026.",
        time: "2 hours ago",
        type: "deadline" as const,
        unread: true,
    },
    {
        title: "New Scheme Match Found!",
        desc: "Based on your profile, you may be eligible for the Skill India Mission.",
        time: "5 hours ago",
        type: "match" as const,
        unread: true,
    },
    {
        title: "Profile Verification Complete",
        desc: "Your DigiLocker documents have been verified successfully.",
        time: "1 day ago",
        type: "update" as const,
        unread: false,
    },
    {
        title: "Scholarship Portal Updated",
        desc: "New academic year scholarships are now available for evaluation.",
        time: "2 days ago",
        type: "match" as const,
        unread: false,
    },
];

// ─── Main Dashboard Component ───────────────────────────────────────
export default function Dashboard() {
    const router = useRouter();
    const { t } = useLanguage();
    const [activeSection, setActiveSection] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const hasFetched = useRef(false);

    // ── Profile data from backend ─────────────────────────────────
    const [userName, setUserName] = useState("");
    const [profileCompletion, setProfileCompletion] = useState(0);
    const [profileFields, setProfileFields] = useState([
        { name: t("profile.basic_info"), done: false },
        { name: t("profile.education"), done: false },
        { name: t("profile.social_financial"), done: false },
        { name: t("profile.family_details"), done: false },
    ]);

    useEffect(() => {
        // Check if tokens are passed via URL parameters (from OAuth callback)
        const urlParams = new URLSearchParams(window.location.search);
        const urlAccessToken = urlParams.get("access_token");
        const urlRefreshToken = urlParams.get("refresh_token");

        if (urlAccessToken && urlRefreshToken) {
            localStorage.setItem("access_token", urlAccessToken);
            localStorage.setItem("refresh_token", urlRefreshToken);
            window.history.replaceState({}, document.title, "/dashboard");
        }

        const token = localStorage.getItem("access_token");
        if (!token) {
            router.push("/");
            return;
        }

        // Fetch profile data from backend
        if (!hasFetched.current) {
            hasFetched.current = true;
            axios.get("http://127.0.0.1:8000/api/auth/profile/", {
                headers: { Authorization: `Bearer ${token}` },
            }).then((res) => {
                const user = res.data.user;
                const completion = res.data.profile_completion;
                setUserName(user.first_name || user.email || "");
                setProfileCompletion(completion.total || 0);
                setProfileFields([
                    { name: "Basic Info", done: completion.basic_complete },
                    { name: "Education", done: completion.education_complete },
                    { name: "Social & Financial", done: completion.social_complete },
                    { name: "Family Details", done: completion.family_complete },
                ]);
            }).catch((err) => {
                console.error("Failed to fetch profile:", err);
                if (err?.response?.status === 401) {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    router.push("/");
                }
            });
        }
    }, [router]);

    const scrollToSection = useCallback((id: string) => {
        if (id === "profile") {
            router.push("/dashboard/profile");
            setSidebarOpen(false);
            return;
        }
        if (id === "explore") {
            router.push("/dashboard/explore");
            setSidebarOpen(false);
            return;
        }
        if (id === "upload") {
            router.push("/dashboard/upload");
            setSidebarOpen(false);
            return;
        }
        if (id === "evaluations") {
            router.push("/dashboard/evaluations");
            setSidebarOpen(false);
            return;
        }
        if (id === "docs") {
            router.push("/dashboard/docs");
            setSidebarOpen(false);
            return;
        }
        if (id === "vault") {
            router.push("/dashboard/vault");
            setSidebarOpen(false);
            return;
        }
        if (id === "resources") {
            router.push("/dashboard/resources");
            setSidebarOpen(false);
            return;
        }
        if (id === "notifications") {
            router.push("/dashboard/notifications");
            setSidebarOpen(false);
            return;
        }
        setActiveSection(id);
        if (id === "dashboard") {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        const el = document.getElementById(`section-${id}`);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setSidebarOpen(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/");
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type === "application/pdf") {
            setUploadedFile(file.name);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file.name);
        }
    };

    const unreadNotifs = notifications.filter((n) => n.unread).length;

    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex">
            {/* ═══ SIDEBAR ═══ */}
            {/* Mobile overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-[var(--overlay)] z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <aside
                className={`fixed top-0 left-0 h-screen w-[260px] bg-[var(--bg-sidebar)] border-r border-[var(--border-6)] flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Logo */}
                <div className="p-6 pb-4 flex items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="Eligify Logo"
                        className="h-20 w-auto object-contain logo-themed"
                    />
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden ml-auto text-[var(--text-40)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* DigiLocker Badge */}
                <div className="mx-4 mb-4 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.12]">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-400">
                            {t("sidebar.digilocker")}
                        </span>
                    </div>
                    <p className="text-[10px] text-[var(--text-30)] mt-1">
                        {t("sidebar.digilocker_desc")}
                    </p>
                </div>

                {/* Separator */}
                <div className="mx-4 border-t border-[var(--border-4)] mb-2" />

                {/* Navigation */}
                <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${isActive
                                    ? "bg-[var(--surface-8)] text-[var(--text-primary)]"
                                    : "text-[var(--text-40)] hover:text-[var(--text-70)] hover:bg-[var(--surface-3)]"
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebarActive"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-400 rounded-r-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div className="relative">
                                    <Icon className="w-[18px] h-[18px]" />
                                    {item.id === "notifications" && (
                                        <NotifBadge count={unreadNotifs} />
                                    )}
                                </div>
                                {t(item.label)}
                                {item.id === "profile" && (
                                    <span className="ml-auto text-[10px] font-bold bg-[var(--surface-6)] px-2 py-0.5 rounded-full text-[var(--text-50)]">
                                        {profileCompletion}%
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="px-3 py-2"><ThemeToggle /></div>
                <div className="p-4 border-t border-[var(--border-4)]">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/[0.06] transition-all"
                    >
                        <LogOut className="w-[18px] h-[18px]" />
                        {t("sidebar.logout")}
                    </button>
                </div>
            </aside>

            {/* ═══ MAIN CONTENT ═══ */}
            <main className="flex-1 lg:ml-[260px] min-h-screen">
                {/* Top Bar */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sticky top-0 z-30 bg-[var(--bg-page)]/80 backdrop-blur-xl border-b border-[var(--border-4)] px-4 lg:px-8 py-4 flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-[var(--text-50)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        {/* Search */}
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-20)]" />
                            <input
                                type="text"
                                placeholder={t("dashboard.search_placeholder")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-[300px] lg:w-[380px] pl-10 pr-4 py-2.5 bg-[var(--surface-3)] border border-[var(--border-6)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-20)] focus:outline-none focus:border-[var(--border-15)] focus:bg-[var(--surface-5)] transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <LanguageSwitcher compact />
                        {/* Notifications bell */}
                        <button
                            onClick={() => scrollToSection("notifications")}
                            className="relative p-2.5 rounded-xl bg-[var(--surface-3)] border border-[var(--border-6)] hover:bg-[var(--surface-6)] transition-all"
                        >
                            <Bell className="w-[18px] h-[18px] text-[var(--text-50)]" />
                            <NotifBadge count={unreadNotifs} />
                        </button>

                        {/* User Avatar */}
                        <div className="flex items-center gap-3 pl-3 border-l border-[var(--border-6)]">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/40 to-blue-500/40 flex items-center justify-center text-sm font-bold text-[var(--text-80)] border border-[var(--border-10)]">
                                {userName ? userName.charAt(0).toUpperCase() : "?"}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-semibold text-[var(--text-primary)] leading-none">
                                    {userName || t("common.loading")}
                                </p>
                                <p className="text-[10px] text-emerald-400/80 flex items-center gap-1 mt-0.5">
                                    <CheckCircle2 className="w-3 h-3" /> {t("profile.verified")}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.header>

                {/* Content Area */}
                <div className="px-4 lg:px-8 py-6 space-y-6 max-w-[1400px] mx-auto relative">
                    {/* Background Elements */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/[0.02] rounded-full blur-[150px] pointer-events-none" />
                    <div className="absolute bottom-[40%] left-0 w-[400px] h-[400px] bg-blue-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

                    {/* ── Welcome Header ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10"
                    >
                        <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
                            {t("dashboard.welcome", { name: userName ? userName.split(' ')[0] : "" })}
                        </h1>
                        <p className="text-[var(--text-40)] mt-2 text-base">
                            {t("dashboard.welcome_subtitle")}
                        </p>
                    </motion.div>

                    {/* ── Quick Stats Row ── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                        {[
                            {
                                label: t("dashboard.stats.schemes_matched"),
                                value: "12",
                                icon: Sparkles,
                                color: "text-emerald-400",
                                bg: "bg-emerald-400/10",
                            },
                            {
                                label: t("dashboard.stats.evaluations_done"),
                                value: "4",
                                icon: ClipboardList,
                                color: "text-blue-400",
                                bg: "bg-blue-400/10",
                            },
                            {
                                label: t("dashboard.stats.docs_verified"),
                                value: "3",
                                icon: Shield,
                                color: "text-violet-400",
                                bg: "bg-violet-400/10",
                            },
                            {
                                label: t("dashboard.stats.pending_actions"),
                                value: "2",
                                icon: AlertCircle,
                                color: "text-amber-400",
                                bg: "bg-amber-400/10",
                            },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.08 }}
                                className="bg-[var(--bg-card)] border border-[#1a1a1a] rounded-2xl p-4 flex items-center gap-4 hover:border-[var(--border-8)] transition-all group"
                            >
                                <div
                                    className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                                >
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                                    <p className="text-[11px] text-[var(--text-30)] leading-tight">
                                        {stat.label}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* ── Profile + Explore ── */}
                    <div
                        className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative z-10"
                        id="section-profile"
                    >
                        {/* Profile Card */}
                        <DashCard className="lg:col-span-2" delay={0.2}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                        <User className="w-5 h-5 text-[var(--text-40)]" />
                                        {t("sidebar.profile")}
                                    </h3>
                                    <p className="text-xs text-[var(--text-30)] mt-1">
                                        {t("profile.completion")}
                                    </p>
                                </div>
                                <ProfileRing percentage={profileCompletion} />
                            </div>

                            {/* Fields */}
                            <div className="space-y-2 mt-2">
                                {profileFields.map((f) => (
                                    <div
                                        key={f.name}
                                        className="flex items-center justify-between py-1.5"
                                    >
                                        <span className="text-sm text-[var(--text-50)]">{f.name}</span>
                                        {f.done ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                            <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                                                {t("profile.incomplete")}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => router.push("/dashboard/profile")}
                                className="mt-4 w-full py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 hover:shadow-lg hover:shadow-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                {t("profile.update")}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </DashCard>

                        {/* Explore Schemes Card */}
                        <DashCard
                            className="lg:col-span-3"
                            delay={0.3}
                            id="section-explore"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                        <Search className="w-5 h-5 text-[var(--text-40)]" />
                                        {t("sidebar.explore")}
                                    </h3>
                                    <p className="text-xs text-[var(--text-30)] mt-1">
                                        {t("explore.recommendations")}
                                    </p>
                                </div>
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                    <Sparkles className="w-5 h-5 text-emerald-400/40" />
                                </motion.div>
                            </div>

                            <div className="space-y-2">
                                {recommendedSchemes.map((scheme) => (
                                    <SchemeItem key={scheme.title} {...scheme} />
                                ))}
                            </div>

                            <button
                                onClick={() => router.push("/dashboard/explore")}
                                className="mt-4 w-full py-2.5 rounded-xl bg-[var(--surface-4)] hover:bg-[var(--surface-8)] border border-[var(--border-6)] text-[var(--text-primary)] text-sm font-medium transition-all flex items-center justify-center gap-2"
                            >
                                {t("explore.view_all")}
                                <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                        </DashCard>
                    </div>

                    {/* ── Upload + Evaluations ── */}
                    <div
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10"
                        id="section-upload"
                    >
                        {/* Upload Custom Scheme */}
                        <DashCard delay={0.35}>
                            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 mb-1">
                                <Upload className="w-5 h-5 text-[var(--text-40)]" />
                                {t("sidebar.upload")}
                            </h3>
                            <p className="text-xs text-[var(--text-30)] mb-4">
                                {t("upload.subtitle")}
                            </p>

                            {/* Simplified upload teaser */}
                            <div
                                onClick={() => router.push("/dashboard/upload")}
                                className="relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all border-[var(--border-8)] bg-[var(--surface-1)] hover:border-[var(--border-15)] hover:bg-[var(--surface-2)]"
                            >
                                <motion.div
                                    animate={{ y: [0, -6, 0] }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="w-12 h-12 rounded-full bg-[var(--surface-4)] flex items-center justify-center"
                                >
                                    <Upload className="w-6 h-6 text-[var(--text-30)]" />
                                </motion.div>
                                <p className="text-sm text-[var(--text-50)]">
                                    <span className="text-[var(--text-primary)] font-medium">
                                        {t("upload.click_to_upload")}
                                    </span>{" "}
                                    {t("upload.or_drag")}
                                </p>
                                <p className="text-[10px] text-[var(--text-20)]">
                                    {t("upload.pdf_only")}
                                </p>
                            </div>

                            <button
                                onClick={() => router.push("/dashboard/upload")}
                                className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                                <Zap className="w-4 h-4" />
                                {t("upload.upload_analyze")}
                            </button>
                        </DashCard>

                        {/* My Evaluations */}
                        <DashCard delay={0.4} id="section-evaluations">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                        <ClipboardList className="w-5 h-5 text-[var(--text-40)]" />
                                        {t("sidebar.evaluations")}
                                    </h3>
                                    <p className="text-xs text-[var(--text-30)] mt-1">
                                        {t("evaluations.subtitle")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-[var(--text-30)]">
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Updated recently
                                </div>
                            </div>

                            <div className="space-y-2">
                                {evaluationHistory.map((ev) => (
                                    <SchemeItem key={ev.title} {...ev} />
                                ))}
                            </div>

                            <button className="mt-4 w-full py-2.5 rounded-xl bg-[var(--surface-4)] hover:bg-[var(--surface-8)] border border-[var(--border-6)] text-[var(--text-primary)] text-sm font-medium transition-all flex items-center justify-center gap-2">
                                {t("evaluations.view_history")}
                                <Clock className="w-3.5 h-3.5" />
                            </button>
                        </DashCard>
                    </div>

                    {/* ── Get Docs + Resources ── */}
                    <div
                        className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative z-10"
                        id="section-docs"
                    >
                        {/* Get Your Docs */}
                        <DashCard className="lg:col-span-2" delay={0.45}>
                            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 mb-1">
                                <FileCheck className="w-5 h-5 text-[var(--text-40)]" />
                                {t("sidebar.docs")}
                            </h3>
                            <p className="text-xs text-[var(--text-30)] mb-5">
                                {t("docs.subtitle")}
                            </p>

                            <div className="space-y-5">
                                {docSteps.map((step, i) => (
                                    <DocStep
                                        key={step.title}
                                        step={i + 1}
                                        title={step.title}
                                        desc={step.desc}
                                        done={step.done}
                                    />
                                ))}
                            </div>

                            {/* Progress bar */}
                            <div className="mt-5 pt-4 border-t border-[var(--border-4)]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-[var(--text-30)]">
                                        {t("docs.progress")}
                                    </span>
                                    <span className="text-xs font-semibold text-[var(--text-50)]">
                                        2/4
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-[var(--surface-4)] rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: "50%" }}
                                        transition={{ duration: 1, delay: 0.8 }}
                                    />
                                </div>
                            </div>
                        </DashCard>

                        {/* Resources */}
                        <DashCard
                            className="lg:col-span-3"
                            delay={0.5}
                            id="section-resources"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-[var(--text-40)]" />
                                        {t("sidebar.resources")}
                                    </h3>
                                    <p className="text-xs text-[var(--text-30)] mt-1">
                                        {t("resources.subtitle")}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {resources.map((res) => (
                                    <ResourceCard key={res.title} {...res} />
                                ))}
                            </div>

                            <button className="mt-4 w-full py-2.5 rounded-xl bg-[var(--surface-4)] hover:bg-[var(--surface-8)] border border-[var(--border-6)] text-[var(--text-primary)] text-sm font-medium transition-all flex items-center justify-center gap-2">
                                {t("resources.browse_all")}
                                <BookOpen className="w-3.5 h-3.5" />
                            </button>
                        </DashCard>
                    </div>

                    {/* ── Notifications ── */}
                    <div id="section-notifications" className="relative z-10">
                        <DashCard delay={0.55}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-[var(--text-40)]" />
                                        {t("sidebar.notifications")}
                                        {unreadNotifs > 0 && (
                                            <span className="ml-1 text-xs font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                                                {unreadNotifs} new
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-xs text-[var(--text-30)] mt-1">
                                        {t("notifications.subtitle")}
                                    </p>
                                </div>
                                <button className="text-xs text-[var(--text-30)] hover:text-[var(--text-60)] transition-colors">
                                    {t("notifications.mark_all_read")}
                                </button>
                            </div>

                            <div className="space-y-2">
                                {notifications.map((notif, i) => (
                                    <NotifItem key={i} {...notif} />
                                ))}
                            </div>
                        </DashCard>
                    </div>

                    {/* ── Footer ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="relative z-10 text-center py-8 border-t border-[var(--border-4)]"
                    >
                        <p className="text-xs text-[var(--text-15)]">
                            {t("common.footer")}
                        </p>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
