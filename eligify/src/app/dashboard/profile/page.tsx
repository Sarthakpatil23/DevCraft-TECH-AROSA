"use client";
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import axios from "axios";
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
    Plus,
    Trash2,
    ShieldCheck,
    Lock,
    AlertTriangle,
    Calendar,
    Briefcase,
    GraduationCap,
    Users,
    IndianRupee,
    Home,
    Info,
    Sparkles,
    Save,
    FolderLock,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useLanguage } from "@/context/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";

// ─── Constants ──────────────────────────────────────────────────────
const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir",
];

const OCCUPATIONS = [
    "Student", "Farmer", "Self-Employed", "Private Employee",
    "Government Employee", "Unemployed", "Homemaker", "Other",
];

const EDUCATION_LEVELS = [
    "Below 10th", "10th Pass", "12th Pass", "Diploma",
    "Undergraduate", "Postgraduate", "Doctorate",
];

const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"];

const INCOME_BRACKETS = [
    "Below ₹1 Lakh", "₹1 – 2.5 Lakh", "₹2.5 – 5 Lakh",
    "₹5 – 8 Lakh", "₹8 – 10 Lakh", "Above ₹10 Lakh",
];

const RELATIONS = [
    "Father", "Mother", "Spouse", "Sibling", "Son", "Daughter", "Other",
];

// ─── Sidebar Navigation Items (mirroring dashboard) ─────────────────
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

// ─── Types ──────────────────────────────────────────────────────────
interface FamilyMember {
    id: string;
    relation: string;
    occupation: string;
    income: string;
    landOwnership: boolean;
}

interface ProfileData {
    // Basic Info
    fullName: string;
    email: string;
    state: string;
    gender: string;
    dob: string;
    occupation: string;

    // Education
    educationLevel: string;
    marksPercentage: string;

    // Social & Financial
    category: string;
    minorityStatus: boolean;
    disabilityStatus: boolean;
    areaType: string;
    annualIncome: string;

    // Family
    familyMembers: FamilyMember[];
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

// ─── Section Card ───────────────────────────────────────────────────
function SectionCard({
    children,
    title,
    subtitle,
    icon: Icon,
    delay = 0,
    sectionComplete,
    sectionWeight,
    id,
}: {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    delay?: number;
    sectionComplete: boolean;
    sectionWeight: string;
    id?: string;
}) {
    return (
        <motion.div
            id={id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className="bg-[var(--bg-card)] border border-[#1a1a1a] rounded-2xl overflow-hidden group transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
        >
            {/* Section Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-4)]">
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                            sectionComplete
                                ? "bg-emerald-400/10 text-emerald-400"
                                : "bg-[var(--surface-4)] text-[var(--text-40)]"
                        )}
                    >
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                            {title}
                            {sectionComplete && (
                                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0">
                                    <CheckCircle2 className="w-3 h-3 mr-0.5" />
                                    Complete
                                </Badge>
                            )}
                        </h3>
                        <p className="text-xs text-[var(--text-30)] mt-0.5">{subtitle}</p>
                    </div>
                </div>
                <span className="text-[10px] font-semibold text-[var(--text-20)] bg-[var(--surface-3)] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {sectionWeight}
                </span>
            </div>

            {/* Section Body */}
            <div className="px-6 py-6">{children}</div>
        </motion.div>
    );
}

// ─── Verified Field Badge ───────────────────────────────────────────
function VerifiedTag() {
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" />
            DigiLocker Verified
        </span>
    );
}

// ─── Required Mark ──────────────────────────────────────────────────
function RequiredMark() {
    return <span className="text-red-400 ml-0.5">*</span>;
}

// ─── Helper: Calculate age ──────────────────────────────────────────
function calcAge(dob: string): number | null {
    if (!dob) return null;
    const bd = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - bd.getFullYear();
    const m = today.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
    return age >= 0 ? age : null;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PROFILE PAGE
// ═══════════════════════════════════════════════════════════════════
export default function ProfilePage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [digiLockerConnected, setDigiLockerConnected] = useState(true);
    const hasFetched = useRef(false);
    const { t } = useLanguage();

    // ── Profile State ─────────────────────────────────────────────────
    const [profile, setProfile] = useState<ProfileData>({
        fullName: "",
        email: "",
        state: "",
        gender: "",
        dob: "",
        occupation: "",
        educationLevel: "",
        marksPercentage: "",
        category: "",
        minorityStatus: false,
        disabilityStatus: false,
        areaType: "",
        annualIncome: "",
        familyMembers: [],
    });

    // ── Auth check & fetch profile from backend ───────────────────────
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) { router.push("/"); return; }
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchProfile = async () => {
            try {
                const res = await axios.get("http://127.0.0.1:8000/api/auth/profile/", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const user = res.data.user;
                const p = user.profile;
                setProfile({
                    fullName: user.first_name || "",
                    email: user.email || "",
                    state: p.state || "",
                    gender: p.gender || "",
                    dob: p.dob || "",
                    occupation: p.occupation || "",
                    educationLevel: p.education_level || "",
                    marksPercentage: p.marks_percentage || "",
                    category: p.category || "",
                    minorityStatus: p.minority_status || false,
                    disabilityStatus: p.disability_status || false,
                    areaType: p.area_type || "",
                    annualIncome: p.annual_income || "",
                    familyMembers: (p.family_members || []).map((m: any, i: number) => ({
                        id: m.id || String(i + 1),
                        relation: m.relation || "",
                        occupation: m.occupation || "",
                        income: m.income || "",
                        landOwnership: m.landOwnership || false,
                    })),
                });
            } catch (err: any) {
                if (err?.response?.status === 401) {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    router.push("/");
                }
                console.error("Failed to fetch profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [router]);

    // ── Updater helpers ───────────────────────────────────────────────
    const update = useCallback(
        <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
            setProfile((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    const addFamilyMember = () => {
        setProfile((prev) => ({
            ...prev,
            familyMembers: [
                ...prev.familyMembers,
                {
                    id: Date.now().toString(),
                    relation: "",
                    occupation: "",
                    income: "",
                    landOwnership: false,
                },
            ],
        }));
    };

    const removeFamilyMember = (id: string) => {
        setProfile((prev) => ({
            ...prev,
            familyMembers: prev.familyMembers.filter((m) => m.id !== id),
        }));
    };

    const updateFamilyMember = (
        id: string,
        field: keyof FamilyMember,
        value: string | boolean
    ) => {
        setProfile((prev) => ({
            ...prev,
            familyMembers: prev.familyMembers.map((m) =>
                m.id === id ? { ...m, [field]: value } : m
            ),
        }));
    };

    // ── Completion Calculation ────────────────────────────────────────
    const completion = useMemo(() => {
        // Basic Info – 30%
        const basicFields = [
            profile.fullName,
            profile.email,
            profile.state,
            profile.gender,
            profile.dob,
            profile.occupation,
        ];
        const basicFilled = basicFields.filter(Boolean).length;
        const basicPercent = (basicFilled / basicFields.length) * 30;

        // Education – 25%
        const eduFields = [profile.educationLevel, profile.marksPercentage];
        const eduFilled = eduFields.filter(Boolean).length;
        const eduPercent = (eduFilled / eduFields.length) * 25;

        // Social & Financial – 35%
        // category + income mandatory, minority + disability + areaType optional but counted
        const socialMandatory = [profile.category, profile.annualIncome];
        const socialAll = [...socialMandatory, profile.areaType];
        // minority & disability are booleans, always filled once toggled; count as filled
        const socialFilled = socialAll.filter(Boolean).length + 2; // +2 for the booleans
        const socialTotal = socialAll.length + 2;
        const socialPercent = (socialFilled / socialTotal) * 35;

        // Family – 10%
        const familyPercent = profile.familyMembers.length > 0
            ? profile.familyMembers.some((m) => m.relation && m.occupation && m.income)
                ? 10
                : 5
            : 0;

        const total = Math.round(basicPercent + eduPercent + socialPercent + familyPercent);
        return {
            total: Math.min(total, 100),
            basic: basicFilled === basicFields.length,
            education: eduFilled === eduFields.length,
            social: socialMandatory.filter(Boolean).length === socialMandatory.length,
            family: profile.familyMembers.length > 0,
            basicPercent: Math.round(basicPercent),
            eduPercent: Math.round(eduPercent),
            socialPercent: Math.round(socialPercent),
            familyPercent,
        };
    }, [profile]);

    const age = useMemo(() => calcAge(profile.dob), [profile.dob]);

    // ── Save handler ──────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        setSaveMessage(null);
        try {
            const token = localStorage.getItem("access_token");
            const res = await axios.patch(
                "http://127.0.0.1:8000/api/auth/profile/full-update/",
                {
                    first_name: profile.fullName,
                    state: profile.state || null,
                    gender: profile.gender || null,
                    dob: profile.dob || null,
                    occupation: profile.occupation || null,
                    education_level: profile.educationLevel || null,
                    marks_percentage: profile.marksPercentage || null,
                    category: profile.category || null,
                    minority_status: profile.minorityStatus,
                    disability_status: profile.disabilityStatus,
                    area_type: profile.areaType || null,
                    annual_income: profile.annualIncome || null,
                    family_members: profile.familyMembers.map((m) => ({
                        id: m.id,
                        relation: m.relation,
                        occupation: m.occupation,
                        income: m.income,
                        landOwnership: m.landOwnership,
                    })),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSaveMessage({ type: "success", text: "Profile updated successfully!" });
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (err: any) {
            console.error("Failed to save profile:", err);
            setSaveMessage({ type: "error", text: "Failed to save. Please try again." });
            setTimeout(() => setSaveMessage(null), 4000);
        } finally {
            setSaving(false);
        }
    };

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
                {/* Logo */}
                <div className="p-6 pb-4 flex items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="Eligify Logo"
                        className="h-28 w-auto object-contain logo-themed"
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

                <div className="mx-4 border-t border-[var(--border-4)] mb-2" />

                {/* Navigation */}
                <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.id === "profile";
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    router.push(item.href);
                                    setSidebarOpen(false);
                                }}
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
                                        {completion.total}%
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
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="text-[var(--text-30)] hover:text-[var(--text-60)] text-sm transition-colors"
                            >
                                {t("common.dashboard")}
                            </button>
                            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-15)]" />
                            <span className="text-sm text-[var(--text-primary)] font-medium">{t("profile.title")}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/dashboard")}
                            className="border-[var(--border-8)] bg-[var(--surface-3)] text-[var(--text-60)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-6)] text-xs"
                        >
                            <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
                            {t("common.dashboard")}
                        </Button>

                        <LanguageSwitcher compact />

                        <div className="flex items-center gap-3 pl-3 border-l border-[var(--border-6)]">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/40 to-blue-500/40 flex items-center justify-center text-sm font-bold text-[var(--text-80)] border border-[var(--border-10)]">
                                {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : "?"}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-semibold text-[var(--text-primary)] leading-none">
                                    {profile.fullName || "Loading..."}
                                </p>
                                <p className="text-[10px] text-emerald-400/80 flex items-center gap-1 mt-0.5">
                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.header>

                {/* Content */}
                <div className="px-4 lg:px-8 py-6 max-w-[900px] mx-auto space-y-6 relative">
                    {/* Background glows */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.015] rounded-full blur-[150px] pointer-events-none" />
                    <div className="absolute bottom-[30%] left-0 w-[400px] h-[400px] bg-blue-500/[0.015] rounded-full blur-[120px] pointer-events-none" />

                    {/* ═══ TOP SECTION: Completion Overview ═══ */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-[var(--bg-card)] border border-[#1a1a1a] rounded-2xl overflow-hidden relative z-10"
                    >
                        {/* Subtle gradient accent at top */}
                        <div className="h-[2px] bg-gradient-to-r from-emerald-500/50 via-teal-400/50 to-blue-500/50" />

                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                                        <User className="w-6 h-6 text-[var(--text-40)]" />
                                        {t("profile.title")}
                                    </h1>
                                    <p className="text-sm text-[var(--text-30)] mt-1">
                                        Keep your profile complete for accurate recommendations
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {digiLockerConnected ? (
                                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 gap-1">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            DigiLocker Connected
                                        </Badge>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-blue-500/20 text-blue-400 bg-blue-500/[0.06] hover:bg-blue-500/[0.12] hover:text-blue-300"
                                        >
                                            <Lock className="w-3.5 h-3.5 mr-1" />
                                            Connect DigiLocker
                                        </Button>
                                    )}
                                    <Badge
                                        className={cn(
                                            "gap-1",
                                            completion.total >= 80
                                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                                                : "bg-amber-500/15 text-amber-400 border-amber-500/20"
                                        )}
                                    >
                                        {completion.total >= 100 ? (
                                            <>
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                                            </>
                                        ) : (
                                            <>
                                                <AlertTriangle className="w-3.5 h-3.5" /> Incomplete
                                            </>
                                        )}
                                    </Badge>
                                </div>
                            </div>

                            {/* Main Progress */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-[var(--text-60)]">
                                        Profile Completion
                                    </span>
                                    <span className="text-2xl font-bold text-[var(--text-primary)]">
                                        {completion.total}%
                                    </span>
                                </div>
                                <Progress
                                    value={completion.total}
                                    className="h-3 bg-[var(--surface-4)] [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-emerald-500 [&>[data-slot=progress-indicator]]:to-teal-400 [&>[data-slot=progress-indicator]]:transition-all [&>[data-slot=progress-indicator]]:duration-1000"
                                />

                                {/* Section breakdown */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                                    {[
                                        { label: "Basic Info", weight: "30%", value: completion.basicPercent, done: completion.basic, icon: User },
                                        { label: "Education", weight: "25%", value: completion.eduPercent, done: completion.education, icon: GraduationCap },
                                        { label: "Social & Financial", weight: "35%", value: completion.socialPercent, done: completion.social, icon: IndianRupee },
                                        { label: "Family", weight: "10%", value: completion.familyPercent, done: completion.family, icon: Users },
                                    ].map((s) => (
                                        <div
                                            key={s.label}
                                            className={cn(
                                                "p-3 rounded-xl border transition-colors",
                                                s.done
                                                    ? "bg-emerald-500/[0.04] border-emerald-500/[0.1]"
                                                    : "bg-[var(--surface-1)] border-[var(--border-4)]"
                                            )}
                                        >
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <s.icon className={cn("w-3.5 h-3.5", s.done ? "text-emerald-400" : "text-[var(--text-30)]")} />
                                                <p className="text-[11px] font-medium text-[var(--text-50)] truncate">{s.label}</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className={cn("text-lg font-bold", s.done ? "text-emerald-400" : "text-[var(--text-primary)]")}>
                                                    {s.value}%
                                                </span>
                                                <span className="text-[9px] text-[var(--text-20)] font-semibold uppercase">{s.weight}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Incomplete message */}
                            {completion.total < 100 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="mt-4 p-3.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/[0.1] flex items-start gap-3"
                                >
                                    <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-300/80 leading-relaxed">
                                        Complete your profile to unlock{" "}
                                        <span className="text-amber-300 font-semibold">
                                            personalized scheme recommendations
                                        </span>
                                        . Fields marked with{" "}
                                        <span className="text-red-400 font-bold">*</span> are
                                        required.
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* ═══ SECTION 1: Basic Information ═══ */}
                    <SectionCard
                        title="Basic Information"
                        subtitle="Personal details used for eligibility"
                        icon={User}
                        sectionComplete={completion.basic}
                        sectionWeight="30% weight"
                        delay={0.15}
                        id="section-basic"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label className="text-[var(--text-60)] text-xs">
                                    Full Name <RequiredMark />
                                    {digiLockerConnected && (
                                        <span className="ml-2"><VerifiedTag /></span>
                                    )}
                                </Label>
                                <Input
                                    value={profile.fullName}
                                    readOnly
                                    className="bg-[var(--surface-3)] border-[var(--border-6)] text-[var(--text-80)] cursor-not-allowed opacity-70 h-10"
                                />
                                <p className="text-[10px] text-[var(--text-20)]">Auto-filled from Google. Read-only.</p>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label className="text-[var(--text-60)] text-xs">
                                    Email <RequiredMark />
                                    {digiLockerConnected && (
                                        <span className="ml-2"><VerifiedTag /></span>
                                    )}
                                </Label>
                                <Input
                                    value={profile.email}
                                    readOnly
                                    className="bg-[var(--surface-3)] border-[var(--border-6)] text-[var(--text-80)] cursor-not-allowed opacity-70 h-10"
                                />
                                <p className="text-[10px] text-[var(--text-20)]">Auto-filled from Google. Read-only.</p>
                            </div>

                            {/* State */}
                            <div className="space-y-2">
                                <Label className="text-[var(--text-60)] text-xs">
                                    State <RequiredMark />
                                </Label>
                                <Select
                                    value={profile.state}
                                    onValueChange={(v) => update("state", v)}
                                >
                                    <SelectTrigger className="w-full bg-[var(--surface-3)] border-[var(--border-6)] text-[var(--text-primary)] h-10">
                                        <SelectValue placeholder="Select State" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-[var(--border-8)] text-[var(--text-primary)] max-h-60">
                                        {STATES.map((s) => (
                                            <SelectItem key={s} value={s} className="hover:bg-[var(--surface-6)] focus:bg-[var(--surface-6)]">
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Gender */}
                            <div className="space-y-2">
                                <Label className="text-[var(--text-60)] text-xs">
                                    Gender <RequiredMark />
                                </Label>
                                <RadioGroup
                                    value={profile.gender}
                                    onValueChange={(v) => update("gender", v)}
                                    className="flex gap-3"
                                >
                                    {["Male", "Female", "Other"].map((g) => (
                                        <Label
                                            key={g}
                                            htmlFor={`gender-${g}`}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-2 cursor-pointer border rounded-lg py-2.5 px-3 text-sm transition-all",
                                                profile.gender === g
                                                    ? "bg-[var(--surface-8)] border-white/[0.2] text-[var(--text-primary)]"
                                                    : "bg-[var(--surface-2)] border-[var(--border-6)] text-[var(--text-40)] hover:border-[var(--border-10)]"
                                            )}
                                        >
                                            <RadioGroupItem value={g} id={`gender-${g}`} className="sr-only" />
                                            {g}
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </div>

                            {/* Date of Birth */}
                            <div className="space-y-2">
                                <Label className="text-[var(--text-60)] text-xs flex items-center justify-between">
                                    <span>Date of Birth <RequiredMark /></span>
                                    {age !== null && (
                                        <span className="text-[var(--text-30)] font-normal">Age: {age} years</span>
                                    )}
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        value={profile.dob}
                                        onChange={(e) => update("dob", e.target.value)}
                                        className="bg-[var(--surface-3)] border-[var(--border-6)] text-[var(--text-primary)] h-10 [&::-webkit-calendar-picker-indicator]:invert"
                                    />
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-20)] pointer-events-none" />
                                </div>
                            </div>

                            {/* Occupation */}
                            <div className="space-y-2">
                                <Label className="text-[var(--text-60)] text-xs">
                                    Current Occupation <RequiredMark />
                                </Label>
                                <Select
                                    value={profile.occupation}
                                    onValueChange={(v) => update("occupation", v)}
                                >
                                    <SelectTrigger className="w-full bg-[var(--surface-3)] border-[var(--border-6)] text-[var(--text-primary)] h-10">
                                        <SelectValue placeholder="Select Occupation" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-[var(--border-8)] text-[var(--text-primary)]">
                                        {OCCUPATIONS.map((o) => (
                                            <SelectItem key={o} value={o} className="hover:bg-[var(--surface-6)] focus:bg-[var(--surface-6)]">
                                                {o}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </SectionCard>

                    {/* ═══ SECTION 2: Education Details ═══ */}
                    <SectionCard
                        title="Education Details"
                        subtitle="Current education level and academic performance"
                        icon={GraduationCap}
                        sectionComplete={completion.education}
                        sectionWeight="25% weight"
                        delay={0.25}
                        id="section-education"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Education Level */}
                            <div className="space-y-2">
                                <Label className="text-[var(--text-60)] text-xs">
                                    Current Education Level <RequiredMark />
                                </Label>
                                <Select
                                    value={profile.educationLevel}
                                    onValueChange={(v) => update("educationLevel", v)}
                                >
                                    <SelectTrigger className="w-full bg-[var(--surface-3)] border-[var(--border-6)] text-[var(--text-primary)] h-10">
                                        <SelectValue placeholder="Select Level" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-[var(--border-8)] text-[var(--text-primary)]">
                                        {EDUCATION_LEVELS.map((l) => (
                                            <SelectItem key={l} value={l} className="hover:bg-[var(--surface-6)] focus:bg-[var(--surface-6)]">
                                                {l}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Marks Percentage */}
                            <div className="space-y-2">
                                <Label className="text-[var(--text-60)] text-xs">
                                    Marks Percentage (Latest Exam) <RequiredMark />
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={profile.marksPercentage}
                                        onChange={(e) => update("marksPercentage", e.target.value)}
                                        placeholder="e.g. 85"
                                        className="bg-[var(--surface-3)] border-[var(--border-6)] text-[var(--text-primary)] h-10 pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-20)] text-sm">
                                        %
                                    </span>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* ═══ SECTION 3: Social & Financial Details ═══ */}
                    <SectionCard
                        title="Social & Financial Details"
                        subtitle="Social category, disability status, and income details"
                        icon={IndianRupee}
                        sectionComplete={completion.social}
                        sectionWeight="35% weight"
                        delay={0.35}
                        id="section-social"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Category */}
                            <div className="space-y-2">
                                <Label className="text-[var(--text-60)] text-xs">
                                    Category <RequiredMark />
                                </Label>
                                <Select
                                    value={profile.category}
                                    onValueChange={(v) => update("category", v)}
                                >
                                    <SelectTrigger className="w-full bg-[var(--surface-3)] border-[var(--border-6)] text-[var(--text-primary)] h-10">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-[var(--border-8)] text-[var(--text-primary)]">
                                        {CATEGORIES.map((c) => (
                                            <SelectItem key={c} value={c} className="hover:bg-[var(--surface-6)] focus:bg-[var(--surface-6)]">
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Annual Income */}
                            <div className="space-y-2">
                                <Label className="text-[var(--text-60)] text-xs">
                                    Annual Family Income <RequiredMark />
                                </Label>
                                <Select
                                    value={profile.annualIncome}
                                    onValueChange={(v) => update("annualIncome", v)}
                                >
                                    <SelectTrigger className="w-full bg-[var(--surface-3)] border-[var(--border-6)] text-[var(--text-primary)] h-10">
                                        <SelectValue placeholder="Select Income Range" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-[var(--border-8)] text-[var(--text-primary)]">
                                        {INCOME_BRACKETS.map((i) => (
                                            <SelectItem key={i} value={i} className="hover:bg-[var(--surface-6)] focus:bg-[var(--surface-6)]">
                                                {i}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Minority Status */}
                            <div className="space-y-2">
                                <Label className="text-[var(--text-60)] text-xs">Minority Status</Label>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border-4)]">
                                    <span className="text-sm text-[var(--text-60)]">
                                        {profile.minorityStatus ? "Yes — Minority" : "No"}
                                    </span>
                                    <Switch
                                        checked={profile.minorityStatus}
                                        onCheckedChange={(v) => update("minorityStatus", v)}
                                    />
                                </div>
                            </div>

                            {/* Disability Status */}
                            <div className="space-y-2">
                                <Label className="text-[var(--text-60)] text-xs">Disability Status</Label>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border-4)]">
                                    <span className="text-sm text-[var(--text-60)]">
                                        {profile.disabilityStatus ? "Yes — PwD" : "No"}
                                    </span>
                                    <Switch
                                        checked={profile.disabilityStatus}
                                        onCheckedChange={(v) => update("disabilityStatus", v)}
                                    />
                                </div>
                            </div>

                            {/* Rural / Urban */}
                            <div className="space-y-2 sm:col-span-2">
                                <Label className="text-[var(--text-60)] text-xs">
                                    Area Type
                                </Label>
                                <RadioGroup
                                    value={profile.areaType}
                                    onValueChange={(v) => update("areaType", v)}
                                    className="flex gap-3"
                                >
                                    {["Rural", "Urban", "Semi-Urban"].map((a) => (
                                        <Label
                                            key={a}
                                            htmlFor={`area-${a}`}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-2 cursor-pointer border rounded-lg py-2.5 px-3 text-sm transition-all",
                                                profile.areaType === a
                                                    ? "bg-[var(--surface-8)] border-white/[0.2] text-[var(--text-primary)]"
                                                    : "bg-[var(--surface-2)] border-[var(--border-6)] text-[var(--text-40)] hover:border-[var(--border-10)]"
                                            )}
                                        >
                                            <RadioGroupItem value={a} id={`area-${a}`} className="sr-only" />
                                            <Home className="w-3.5 h-3.5" />
                                            {a}
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </div>
                        </div>
                    </SectionCard>

                    {/* ═══ SECTION 4: Family Details (Optional) ═══ */}
                    <SectionCard
                        title="Family Details"
                        subtitle="Optional but recommended for better scheme matching"
                        icon={Users}
                        sectionComplete={completion.family}
                        sectionWeight="10% weight"
                        delay={0.45}
                        id="section-family"
                    >
                        {/* Tip */}
                        <div className="mb-5 p-3 rounded-xl bg-blue-500/[0.04] border border-blue-500/[0.08] flex items-start gap-2.5">
                            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-300/70 leading-relaxed">
                                Adding family details improves scheme recommendations. Many
                                government schemes consider family income and member occupations.
                            </p>
                        </div>

                        {/* Family Members List */}
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {profile.familyMembers.map((member, idx) => (
                                    <motion.div
                                        key={member.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-[var(--surface-2)] border border-[var(--border-5)] rounded-xl p-5 relative"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-sm font-semibold text-[var(--text-70)]">
                                                Family Member {idx + 1}
                                            </p>
                                            <button
                                                onClick={() => removeFamilyMember(member.id)}
                                                className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-400/[0.06] transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Relation */}
                                            <div className="space-y-1.5">
                                                <Label className="text-[var(--text-50)] text-xs">Relation</Label>
                                                <Select
                                                    value={member.relation}
                                                    onValueChange={(v) =>
                                                        updateFamilyMember(member.id, "relation", v)
                                                    }
                                                >
                                                    <SelectTrigger className="w-full bg-[var(--surface-3)] border-[var(--border-6)] text-[var(--text-primary)] h-10">
                                                        <SelectValue placeholder="Select Relation" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#1a1a1a] border-[var(--border-8)] text-[var(--text-primary)]">
                                                        {RELATIONS.map((r) => (
                                                            <SelectItem key={r} value={r} className="hover:bg-[var(--surface-6)] focus:bg-[var(--surface-6)]">
                                                                {r}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Occupation */}
                                            <div className="space-y-1.5">
                                                <Label className="text-[var(--text-50)] text-xs">Occupation</Label>
                                                <Select
                                                    value={member.occupation}
                                                    onValueChange={(v) =>
                                                        updateFamilyMember(member.id, "occupation", v)
                                                    }
                                                >
                                                    <SelectTrigger className="w-full bg-[var(--surface-3)] border-[var(--border-6)] text-[var(--text-primary)] h-10">
                                                        <SelectValue placeholder="Select Occupation" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#1a1a1a] border-[var(--border-8)] text-[var(--text-primary)]">
                                                        {OCCUPATIONS.map((o) => (
                                                            <SelectItem key={o} value={o} className="hover:bg-[var(--surface-6)] focus:bg-[var(--surface-6)]">
                                                                {o}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Income */}
                                            <div className="space-y-1.5">
                                                <Label className="text-[var(--text-50)] text-xs">Income</Label>
                                                <Select
                                                    value={member.income}
                                                    onValueChange={(v) =>
                                                        updateFamilyMember(member.id, "income", v)
                                                    }
                                                >
                                                    <SelectTrigger className="w-full bg-[var(--surface-3)] border-[var(--border-6)] text-[var(--text-primary)] h-10">
                                                        <SelectValue placeholder="Select Income" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#1a1a1a] border-[var(--border-8)] text-[var(--text-primary)]">
                                                        {INCOME_BRACKETS.map((i) => (
                                                            <SelectItem key={i} value={i} className="hover:bg-[var(--surface-6)] focus:bg-[var(--surface-6)]">
                                                                {i}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Land Ownership */}
                                            <div className="space-y-1.5">
                                                <Label className="text-[var(--text-50)] text-xs">
                                                    Land Ownership
                                                </Label>
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border-4)] h-10">
                                                    <span className="text-sm text-[var(--text-50)]">
                                                        {member.landOwnership ? "Yes" : "No"}
                                                    </span>
                                                    <Switch
                                                        checked={member.landOwnership}
                                                        onCheckedChange={(v) =>
                                                            updateFamilyMember(member.id, "landOwnership", v)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Add Member Button */}
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={addFamilyMember}
                                className="w-full py-3 rounded-xl border-2 border-dashed border-[var(--border-6)] hover:border-[var(--border-12)] text-[var(--text-30)] hover:text-[var(--text-50)] text-sm font-medium transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Family Member
                            </motion.button>
                        </div>
                    </SectionCard>

                    {/* ═══ SAVE ACTIONS ═══ */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="sticky bottom-4 z-20"
                    >
                        <div className="bg-[var(--bg-card)]/90 backdrop-blur-xl border border-[var(--border-6)] rounded-2xl p-4 flex flex-col gap-2 shadow-[0_-4px_30px_rgba(0,0,0,0.4)]">
                            {/* Save feedback message */}
                            <AnimatePresence>
                                {saveMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        className={cn(
                                            "text-xs font-medium px-3 py-1.5 rounded-lg text-center",
                                            saveMessage.type === "success"
                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                                        )}
                                    >
                                        {saveMessage.text}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="flex items-center justify-between">
                                <div className="hidden sm:block">
                                    <p className="text-sm text-[var(--text-40)]">
                                        Profile completion:{" "}
                                        <span className="text-[var(--text-primary)] font-semibold">{completion.total}%</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push("/dashboard")}
                                        className="flex-1 sm:flex-none border-[var(--border-6)] bg-[var(--surface-3)] text-[var(--text-50)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-6)]"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving || loading}
                                        className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold border-0 shadow-lg shadow-emerald-500/20"
                                    >
                                        {saving ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                >
                                                    <Save className="w-4 h-4" />
                                                </motion.div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Update Profile
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Footer spacer */}
                    <div className="h-2" />
                    <footer className="text-center text-xs text-[var(--text-30)] py-4">
                        {t("common.footer")}
                    </footer>
                </div>
            </main>
        </div>
    );
}

