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
    Clock,
    AlertCircle,
    X,
    Menu,
    Sparkles,
    FileText,
    ArrowUpRight,
    Filter,
    SlidersHorizontal,
    TrendingUp,
    Calendar,
    IndianRupee,
    GraduationCap,
    Landmark,
    Wheat,
    Star,
    AlertTriangle,
    ExternalLink,
    FolderLock,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/context/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";

// ─── Sidebar Items ──────────────────────────────────────────────────
const sidebarItems = [
    { icon: LayoutDashboard, label: "sidebar.dashboard", id: "dashboard", href: "/dashboard" },
    { icon: User, label: "sidebar.profile", id: "profile", href: "/dashboard/profile" },
    { icon: Search, label: "sidebar.explore", id: "explore", href: "/dashboard/explore" },
    { icon: Upload, label: "sidebar.upload", id: "upload", href: "/dashboard/upload" },
    { icon: ClipboardList, label: "sidebar.evaluations", id: "evaluations", href: "/dashboard/evaluations" },
    { icon: FileCheck, label: "sidebar.docs", id: "docs", href: "/dashboard/docs" },
    { icon: FolderLock, label: "sidebar.vault", id: "vault", href: "/dashboard/vault" },
    { icon: BookOpen, label: "sidebar.resources", id: "resources", href: "/dashboard/resources" },
    { icon: Bell, label: "sidebar.notifications", id: "notifications", href: "/dashboard/notifications" },
];

// ─── Scheme Types ───────────────────────────────────────────────────
type EligibilityStatus = "eligible" | "partial" | "not-eligible";
type SchemeCategory = "recommended" | "scholarship" | "state" | "central" | "farmer";

interface Scheme {
    id: string;
    name: string;
    category: SchemeCategory;
    tags: string[];
    matchPercent: number;
    eligibility: EligibilityStatus;
    benefitSummary: string;
    deadline: string | null;
    ministry: string;
    maxBenefit: string;
}

// ─── Mock Schemes ───────────────────────────────────────────────────
const ALL_SCHEMES: Scheme[] = [
    {
        id: "pm-kisan",
        name: "PM Kisan Samman Nidhi",
        category: "farmer",
        tags: ["Agriculture", "Central"],
        matchPercent: 95,
        eligibility: "eligible",
        benefitSummary: "₹6,000/year in 3 installments directly to bank account for land-holding farmers.",
        deadline: "2026-03-31",
        ministry: "Ministry of Agriculture",
        maxBenefit: "₹6,000/year",
    },
    {
        id: "national-scholarship",
        name: "National Scholarship Portal (NSP)",
        category: "scholarship",
        tags: ["Education", "Central"],
        matchPercent: 92,
        eligibility: "eligible",
        benefitSummary: "Merit-cum-means scholarship for students from minority communities and economically weaker sections.",
        deadline: "2026-04-15",
        ministry: "Ministry of Education",
        maxBenefit: "₹50,000/year",
    },
    {
        id: "ayushman-bharat",
        name: "Ayushman Bharat Yojana (PM-JAY)",
        category: "central",
        tags: ["Healthcare", "Central"],
        matchPercent: 88,
        eligibility: "eligible",
        benefitSummary: "Health insurance coverage of ₹5 lakh per family per year for secondary and tertiary hospitalization.",
        deadline: null,
        ministry: "Ministry of Health",
        maxBenefit: "₹5,00,000/year",
    },
    {
        id: "startup-india",
        name: "Startup India Seed Fund Scheme",
        category: "central",
        tags: ["Entrepreneurship", "Central"],
        matchPercent: 82,
        eligibility: "partial",
        benefitSummary: "Financial assistance up to ₹50 lakh for proof of concept, prototype development, and market entry.",
        deadline: "2026-06-30",
        ministry: "DPIIT",
        maxBenefit: "₹50,00,000",
    },
    {
        id: "pm-awas",
        name: "PM Awas Yojana (Urban)",
        category: "central",
        tags: ["Housing", "Central"],
        matchPercent: 79,
        eligibility: "partial",
        benefitSummary: "Affordable housing with interest subsidy on home loans for EWS/LIG/MIG categories.",
        deadline: "2026-12-31",
        ministry: "Ministry of Housing",
        maxBenefit: "₹2,67,000 subsidy",
    },
    {
        id: "maha-dbt",
        name: "Maha-DBT Scholarship",
        category: "state",
        tags: ["Education", "Maharashtra"],
        matchPercent: 90,
        eligibility: "eligible",
        benefitSummary: "Direct benefit transfer scholarship for students from Maharashtra belonging to backward classes.",
        deadline: "2026-05-15",
        ministry: "Govt. of Maharashtra",
        maxBenefit: "₹60,000/year",
    },
    {
        id: "mudra-loan",
        name: "MUDRA Loan Scheme",
        category: "central",
        tags: ["Finance", "Entrepreneurship"],
        matchPercent: 76,
        eligibility: "partial",
        benefitSummary: "Collateral-free loans up to ₹10 lakh for micro and small enterprises under Shishu, Kishore, Tarun categories.",
        deadline: null,
        ministry: "Ministry of Finance",
        maxBenefit: "₹10,00,000",
    },
    {
        id: "sukanya-samriddhi",
        name: "Sukanya Samriddhi Yojana",
        category: "central",
        tags: ["Savings", "Women"],
        matchPercent: 45,
        eligibility: "not-eligible",
        benefitSummary: "High-interest savings scheme for girl child. Deposit ₹250–₹1.5L/year with tax benefits under 80C.",
        deadline: null,
        ministry: "Ministry of Finance",
        maxBenefit: "8.2% interest",
    },
    {
        id: "pm-kaushal",
        name: "PM Kaushal Vikas Yojana",
        category: "central",
        tags: ["Skill Training", "Central"],
        matchPercent: 84,
        eligibility: "eligible",
        benefitSummary: "Free skill development training with certification for unemployed youth and school/college dropouts.",
        deadline: "2026-09-30",
        ministry: "Ministry of Skill Development",
        maxBenefit: "Free Training + Certificate",
    },
    {
        id: "farmer-credit",
        name: "Kisan Credit Card (KCC)",
        category: "farmer",
        tags: ["Agriculture", "Finance"],
        matchPercent: 91,
        eligibility: "eligible",
        benefitSummary: "Short-term credit for cultivation and other farm needs at subsidized 4% interest rate.",
        deadline: null,
        ministry: "Ministry of Agriculture",
        maxBenefit: "₹3,00,000 credit",
    },
    {
        id: "obc-scholarship",
        name: "Post Matric Scholarship for OBC",
        category: "scholarship",
        tags: ["Education", "OBC"],
        matchPercent: 87,
        eligibility: "eligible",
        benefitSummary: "Tuition fee, maintenance allowance, and other grants for OBC students pursuing post-matric education.",
        deadline: "2026-04-30",
        ministry: "Ministry of Social Justice",
        maxBenefit: "Full tuition + ₹1,200/month",
    },
    {
        id: "state-farmer",
        name: "Maharashtra Shetkari Sanman Yojana",
        category: "state",
        tags: ["Agriculture", "Maharashtra"],
        matchPercent: 86,
        eligibility: "eligible",
        benefitSummary: "₹12,000/year to small and marginal farmers in Maharashtra as direct income support.",
        deadline: "2026-03-15",
        ministry: "Govt. of Maharashtra",
        maxBenefit: "₹12,000/year",
    },
];

// ─── NotifBadge ─────────────────────────────────────────────────────
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

// ─── Eligibility Badge ──────────────────────────────────────────────
function EligibilityBadge({ status }: { status: EligibilityStatus }) {
    const config = {
        eligible: {
            label: "Eligible",
            icon: CheckCircle2,
            classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
        },
        partial: {
            label: "Partial Match",
            icon: AlertCircle,
            classes: "bg-amber-500/15 text-amber-400 border-amber-500/20",
        },
        "not-eligible": {
            label: "Not Eligible",
            icon: X,
            classes: "bg-red-500/15 text-red-400 border-red-500/20",
        },
    };
    const c = config[status];
    return (
        <Badge className={cn("gap-1 text-[10px] border", c.classes)}>
            <c.icon className="w-3 h-3" />
            {c.label}
        </Badge>
    );
}

// ─── Match Ring (small) ─────────────────────────────────────────────
function MatchRing({ percent }: { percent: number }) {
    const r = 18;
    const circ = 2 * Math.PI * r;
    const offset = circ - (percent / 100) * circ;
    const color =
        percent >= 80
            ? "#22c55e"
            : percent >= 60
                ? "#f59e0b"
                : "#ef4444";

    return (
        <div className="relative w-12 h-12 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r={r} fill="none" stroke="var(--surface-6)" strokeWidth="3" />
                <circle
                    cx="22"
                    cy="22"
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[var(--text-primary)]">
                {percent}%
            </span>
        </div>
    );
}

// ─── Scheme Card ────────────────────────────────────────────────────
function SchemeCard({ scheme, index }: { scheme: Scheme; index: number }) {
    const router = useRouter();

    const daysLeft = scheme.deadline
        ? Math.max(
            0,
            Math.ceil(
                (new Date(scheme.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
        )
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.4 }}
            whileHover={{ y: -3, borderColor: "rgba(255,255,255,0.12)" }}
            onClick={() => router.push(`/dashboard/explore/${scheme.id}`)}
            className="bg-[var(--bg-card)] border border-[#1a1a1a] rounded-2xl p-5 cursor-pointer group transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative overflow-hidden"
        >
            {/* Hover glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.015] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="relative z-10">
                {/* Row 1: Title + Match Ring */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--text-primary)] truncate">
                            {scheme.name}
                        </h3>
                        <p className="text-[11px] text-[var(--text-25)] mt-0.5">{scheme.ministry}</p>
                    </div>
                    <MatchRing percent={scheme.matchPercent} />
                </div>

                {/* Tags + Eligibility */}
                <div className="flex items-center flex-wrap gap-1.5 mb-3">
                    {scheme.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-[var(--surface-4)] text-[10px] font-medium text-[var(--text-40)] border border-[var(--border-4)]"
                        >
                            {tag}
                        </span>
                    ))}
                    <EligibilityBadge status={scheme.eligibility} />
                </div>

                {/* Benefit Summary */}
                <p className="text-xs text-[var(--text-35)] leading-relaxed line-clamp-2 mb-3">
                    {scheme.benefitSummary}
                </p>

                {/* Bottom Row */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-4)]">
                    <div className="flex items-center gap-3">
                        {/* Max Benefit */}
                        <span className="flex items-center gap-1 text-[11px] text-[var(--text-30)]">
                            <IndianRupee className="w-3 h-3" />
                            {scheme.maxBenefit}
                        </span>
                        {/* Deadline */}
                        {daysLeft !== null && (
                            <span
                                className={cn(
                                    "flex items-center gap-1 text-[11px]",
                                    daysLeft <= 30
                                        ? "text-red-400"
                                        : daysLeft <= 90
                                            ? "text-amber-400/70"
                                            : "text-[var(--text-30)]"
                                )}
                            >
                                <Calendar className="w-3 h-3" />
                                {daysLeft}d left
                            </span>
                        )}
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-[var(--text-40)] group-hover:text-[var(--text-70)] transition-colors">
                        View Details
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Tab Config ─────────────────────────────────────────────────────
const TAB_CONFIG = [
    { value: "recommended", label: "Recommended", icon: Sparkles },
    { value: "scholarship", label: "Scholarships", icon: GraduationCap },
    { value: "state", label: "State Schemes", icon: Landmark },
    { value: "central", label: "Central Schemes", icon: FileText },
    { value: "farmer", label: "Farmer Schemes", icon: Wheat },
];

// ═══════════════════════════════════════════════════════════════════
// EXPLORE SCHEMES PAGE
// ═══════════════════════════════════════════════════════════════════
export default function ExploreSchemesPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("recommended");
    const [searchQuery, setSearchQuery] = useState("");
    const profileCompletion = 80;
    const [userName, setUserName] = useState("");
    const { t } = useLanguage();

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) { router.push("/"); return; }
        fetch("http://127.0.0.1:8000/api/auth/profile/", {
            headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json()).then(data => {
            const u = data.user;
            setUserName(u?.first_name ? `${u.first_name}${u.last_name ? ' ' + u.last_name : ''}` : u?.email || "");
        }).catch(() => {});
    }, [router]);

    // ── Filter & Sort Logic ───────────────────────────────────────────
    const filteredSchemes = useMemo(() => {
        let schemes = [...ALL_SCHEMES];

        // Tab filter
        if (activeTab !== "recommended") {
            schemes = schemes.filter((s) => s.category === activeTab);
        }

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            schemes = schemes.filter(
                (s) =>
                    s.name.toLowerCase().includes(q) ||
                    s.tags.some((t) => t.toLowerCase().includes(q)) ||
                    s.benefitSummary.toLowerCase().includes(q) ||
                    s.ministry.toLowerCase().includes(q)
            );
        }

        // Sort: highest match → closest deadline → name
        schemes.sort((a, b) => {
            if (b.matchPercent !== a.matchPercent) return b.matchPercent - a.matchPercent;
            // Closer deadline first (null = no deadline = sort last)
            const deadA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
            const deadB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
            if (deadA !== deadB) return deadA - deadB;
            return a.name.localeCompare(b.name);
        });

        return schemes;
    }, [activeTab, searchQuery]);

    const eligibleCount = ALL_SCHEMES.filter((s) => s.eligibility === "eligible").length;
    const partialCount = ALL_SCHEMES.filter((s) => s.eligibility === "partial").length;

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex">
            {/* ═══ SIDEBAR ═══ */}
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
                className={cn(
                    "fixed top-0 left-0 h-screen w-[260px] bg-[var(--bg-sidebar)] border-r border-[var(--border-6)] flex flex-col z-50 transition-transform duration-300 lg:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-6 pb-4 flex items-center gap-3">
                    <img src="/logo.png" alt="Eligify Logo" className="h-28 w-auto object-contain logo-themed" />
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden ml-auto text-[var(--text-40)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mx-4 mb-4 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.12]">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-400">{t("sidebar.digilocker")}</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-30)] mt-1">{t("sidebar.digilocker_desc")}</p>
                </div>

                <div className="mx-4 border-t border-[var(--border-4)] mb-2" />

                <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.id === "explore";
                        return (
                            <button
                                key={item.id}
                                onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative",
                                    isActive
                                        ? "bg-[var(--surface-8)] text-[var(--text-primary)]"
                                        : "text-[var(--text-40)] hover:text-[var(--text-70)] hover:bg-[var(--surface-3)]"
                                )}
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
                                    {item.id === "notifications" && <NotifBadge count={2} />}
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

            {/* ═══ MAIN ═══ */}
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
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="text-[var(--text-30)] hover:text-[var(--text-60)] text-sm transition-colors"
                            >
                                {t("common.dashboard")}
                            </button>
                            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-15)]" />
                            <span className="text-sm text-[var(--text-primary)] font-medium">{t("explore.title")}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <LanguageSwitcher compact />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/dashboard")}
                            className="border-[var(--border-8)] bg-[var(--surface-3)] text-[var(--text-60)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-6)] text-xs"
                        >
                            <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
                            {t("common.dashboard")}
                        </Button>
                        <div className="flex items-center gap-3 pl-3 border-l border-[var(--border-6)]">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/40 to-blue-500/40 flex items-center justify-center text-sm font-bold text-[var(--text-80)] border border-[var(--border-10)]">
                                {userName ? userName.charAt(0).toUpperCase() : "?"}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-semibold text-[var(--text-primary)] leading-none">{userName || "Loading..."}</p>
                                <p className="text-[10px] text-emerald-400/80 flex items-center gap-1 mt-0.5">
                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.header>

                {/* Content */}
                <div className="px-4 lg:px-8 py-6 max-w-[1200px] mx-auto relative">
                    {/* Background */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.015] rounded-full blur-[150px] pointer-events-none" />

                    {/* ── Header ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 relative z-10"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                                    <Search className="w-7 h-7 text-[var(--text-30)]" />
                                    {t("explore.title")}
                                </h1>
                                <p className="text-sm text-[var(--text-35)] mt-1">
                                    Personalized recommendations based on your profile
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {eligibleCount} Eligible
                                </Badge>
                                <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20 gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {partialCount} Partial
                                </Badge>
                                <Badge className="bg-[var(--surface-6)] text-[var(--text-50)] border-[var(--border-6)] gap-1">
                                    Profile {profileCompletion}%
                                </Badge>
                            </div>
                        </div>

                        {/* Profile Incomplete Warning */}
                        {profileCompletion < 100 && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-4 p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/[0.08] flex items-center gap-3"
                            >
                                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                <p className="text-xs text-amber-300/70">
                                    Complete your profile to unlock{" "}
                                    <span className="text-amber-300 font-semibold">accurate recommendations</span>.
                                    Some schemes may show partial matches due to missing data.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push("/dashboard/profile")}
                                    className="ml-auto flex-shrink-0 border-amber-500/20 text-amber-400 bg-amber-500/[0.06] hover:bg-amber-500/[0.12] text-[11px] h-7 px-3"
                                >
                                    Complete Profile
                                </Button>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* ── Search + Filters ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4 mb-6 relative z-10"
                    >
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-20)]" />
                            <Input
                                placeholder={t("explore.search_placeholder")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 h-12 bg-[var(--bg-card)] border-[#1a1a1a] text-[var(--text-primary)] placeholder:text-[var(--text-20)] focus-visible:border-[var(--border-15)] rounded-xl text-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-20)] hover:text-[var(--text-50)] transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="bg-[var(--bg-card)] border border-[#1a1a1a] p-1 h-auto rounded-xl flex-wrap gap-1">
                                {TAB_CONFIG.map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="data-[state=active]:bg-[var(--surface-8)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-40)] rounded-lg px-3 py-2 text-xs font-medium gap-1.5 transition-all"
                                    >
                                        <tab.icon className="w-3.5 h-3.5" />
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </motion.div>

                    {/* ── Results Count ── */}
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <p className="text-xs text-[var(--text-25)]">
                            Showing{" "}
                            <span className="text-[var(--text-50)] font-medium">{filteredSchemes.length}</span>{" "}
                            scheme{filteredSchemes.length !== 1 ? "s" : ""}
                            {searchQuery && (
                                <span>
                                    {" "}for &quot;<span className="text-[var(--text-50)]">{searchQuery}</span>&quot;
                                </span>
                            )}
                        </p>
                        <span className="text-[10px] text-[var(--text-20)] flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Sorted by match % & deadline
                        </span>
                    </div>

                    {/* ── Scheme Grid ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 relative z-10">
                        <AnimatePresence mode="popLayout">
                            {filteredSchemes.map((scheme, i) => (
                                <SchemeCard key={scheme.id} scheme={scheme} index={i} />
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* ── Empty State ── */}
                    {filteredSchemes.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <Search className="w-12 h-12 text-[var(--text-10)] mx-auto mb-4" />
                            <p className="text-[var(--text-30)] text-sm">No schemes found matching your criteria.</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery("");
                                    setActiveTab("recommended");
                                }}
                                className="mt-4 border-[var(--border-8)] text-[var(--text-50)]"
                            >
                                Clear Filters
                            </Button>
                        </motion.div>
                    )}

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center py-10 border-t border-[var(--border-4)] mt-10 relative z-10"
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

