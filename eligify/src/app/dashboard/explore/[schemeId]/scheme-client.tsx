"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
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
    Send,
    FileText,
    ExternalLink,
    AlertCircle,
    Clock,
    HelpCircle,
    Sparkles,
    ChevronDown,
    Check,
    CircleDot,
    SlidersHorizontal,
    ArrowLeft,
    Zap,
    MessageCircle,
    Globe,
    Download,
    Link2,
    AlertTriangle,
    Copy,
    BookOpenCheck,
    FolderLock,
    Bookmark,
    Save,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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

// ─── Types ──────────────────────────────────────────────────────────
type ConditionStatus = "satisfied" | "not-satisfied" | "missing";

interface Condition {
    label: string;
    status: ConditionStatus;
    detail: string;
    yourValue?: string;
    required?: string;
}

interface SchemeDocument {
    name: string;
    available: boolean;
    digilocker: boolean;
}

interface ApplicationStep {
    step: number;
    title: string;
    description: string;
    done: boolean;
}

interface ChatMessage {
    id: string;
    role: "user" | "ai";
    content: string;
    timestamp: Date;
}

interface SchemeDetail {
    id: string;
    name: string;
    ministry: string;
    matchPercent: number;
    eligibility: "eligible" | "partial" | "not-eligible";
    category: string;
    tags: string[];
    deadline: string | null;
    benefitSummary: string;
    maxBenefit: string;
    portalUrl: string;
    conditions: Condition[];
    documents: SchemeDocument[];
    steps: ApplicationStep[];
}

// ─── Mock Schemes Database ──────────────────────────────────────────
// (Removed: data now fetched from API)

const DEFAULT_SCHEME: SchemeDetail = {
    id: "unknown", name: "Loading...", ministry: "", matchPercent: 0,
    eligibility: "not-eligible", category: "", tags: [], deadline: null,
    benefitSummary: "", maxBenefit: "", portalUrl: "#",
    conditions: [], documents: [], steps: [],
};

// ─── NotifBadge ─────────────────────────────────────────────────────
function NotifBadge({ count }: { count: number }) {
    if (count === 0) return null;
    return (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-[var(--bg-page)]">{count}</motion.span>
    );
}

// ─── Match Ring ─────────────────────────────────────────────────────
function MatchRingLg({ percent }: { percent: number }) {
    const r = 38;
    const circ = 2 * Math.PI * r;
    const offset = circ - (percent / 100) * circ;
    const color = percent >= 80 ? "#22c55e" : percent >= 60 ? "#f59e0b" : "#ef4444";
    return (
        <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
                <circle cx="44" cy="44" r={r} fill="none" stroke="var(--border-5)" strokeWidth="5" />
                <motion.circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2, ease: "easeOut" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-[var(--text-primary)]">{percent}%</span>
                <span className="text-[9px] text-[var(--text-30)]">Match</span>
            </div>
        </div>
    );
}

// ─── Condition Row ──────────────────────────────────────────────────
function ConditionRow({ condition }: { condition: Condition }) {
    const config = {
        satisfied: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        "not-satisfied": { icon: X, color: "text-red-400", bg: "bg-red-500/10" },
        missing: { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10" },
    };
    const c = config[condition.status];
    return (
        <div className="flex items-start gap-3 py-3 border-b border-[var(--border-3)] last:border-0">
            <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", c.bg)}>
                <c.icon className={cn("w-3.5 h-3.5", c.color)} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[var(--text-80)]">{condition.label}</p>
                <p className="text-[10px] text-[var(--text-25)] mt-0.5">{condition.detail}</p>
                {(condition.yourValue || condition.required) && (
                    <div className="flex items-center gap-3 mt-1.5">
                        {condition.yourValue && <span className="text-[10px] text-[var(--text-35)]">Yours: <span className={cn("font-medium", c.color)}>{condition.yourValue}</span></span>}
                        {condition.required && <span className="text-[10px] text-[var(--text-20)]">Required: <span className="text-[var(--text-40)]">{condition.required}</span></span>}
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// SCHEME INTELLIGENCE CLIENT COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function SchemeIntelligencePage() {
    const router = useRouter();
    const params = useParams();
    const schemeId = params.schemeId as string;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [scheme, setScheme] = useState<SchemeDetail>({ ...DEFAULT_SCHEME, id: schemeId });
    const [loading, setLoading] = useState(true);

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [whatIfOpen, setWhatIfOpen] = useState(false);
    const [activePanel, setActivePanel] = useState<"eligibility" | "chat" | "execution">("eligibility");
    const [analysisSaved, setAnalysisSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [userName, setUserName] = useState("");
    const { t } = useLanguage();

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) { router.push("/"); return; }
        fetch("http://127.0.0.1:8000/api/auth/profile/", { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(d => { const u = d.user; setUserName(u?.first_name ? `${u.first_name}${u.last_name ? ' ' + u.last_name : ''}` : u?.email || ""); }).catch(() => { });
    }, [router]);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

    // Fetch scheme data from API
    useEffect(() => {
        const fetchScheme = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) return;
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/scheme/${schemeId}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setScheme(data);

                    // Restore persisted chat history if it exists
                    const history = data.chatHistory || [];
                    const restoredMessages: ChatMessage[] = [{
                        id: "welcome",
                        role: "ai",
                        content: `Welcome! I'm your AI assistant for **${data.name}**. I can help you understand eligibility criteria, required documents, and application steps. What would you like to know?`,
                        timestamp: new Date(),
                    }];

                    if (history.length > 0) {
                        history.forEach((msg: { sender: string; text: string }, idx: number) => {
                            restoredMessages.push({
                                id: `history-${idx}`,
                                role: msg.sender === "user" ? "user" : "ai",
                                content: msg.text,
                                timestamp: new Date(),
                            });
                        });
                    }

                    setChatMessages(restoredMessages);
                }
            } catch (err) {
                console.error("Failed to fetch scheme:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchScheme();
    }, [schemeId]);

    const satisfied = scheme.conditions.filter((c) => c.status === "satisfied").length;
    const notSatisfied = scheme.conditions.filter((c) => c.status === "not-satisfied").length;
    const missingCount = scheme.conditions.filter((c) => c.status === "missing").length;
    const docsAvailable = scheme.documents.filter((d) => d.available).length;
    const docsMissing = scheme.documents.filter((d) => !d.available).length;
    const daysLeft = scheme.deadline ? Math.max(0, Math.ceil((new Date(scheme.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;
        const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content, timestamp: new Date() };
        setChatMessages((prev) => [...prev, userMsg]);
        setChatInput("");
        setIsTyping(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`http://127.0.0.1:8000/api/scheme/${schemeId}/chat/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: content }),
            });
            if (res.ok) {
                const data = await res.json();
                setChatMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "ai", content: data.response, timestamp: new Date() }]);
            } else {
                setChatMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "ai", content: "Sorry, I couldn't process that. Please try again.", timestamp: new Date() }]);
            }
        } catch {
            setChatMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "ai", content: "Network error. Please check your connection and try again.", timestamp: new Date() }]);
        } finally {
            setIsTyping(false);
        }
    };

    const quickActions = [
        { label: t("scheme.why_not_eligible"), icon: HelpCircle },
        { label: t("scheme.required_documents"), icon: FileText },
        { label: t("scheme.improve_eligibility"), icon: Sparkles },
    ];

    const saveAnalysis = async () => {
        setSaving(true);
        try {
            // Chat history is already persisted per-message on the backend.
            // This function serves as an explicit "bookmark" action and navigates to evaluations.
            const token = localStorage.getItem("access_token");
            // Re-evaluate to ensure latest profile data is reflected
            await fetch(`http://127.0.0.1:8000/api/scheme/${schemeId}/re-evaluate/`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            setAnalysisSaved(true);
            // Brief delay then navigate to evaluations
            setTimeout(() => {
                router.push("/dashboard/evaluations");
            }, 1200);
        } catch {
            setAnalysisSaved(false);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => { localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token"); router.push("/"); };
    const toggleStep = (step: number) => { setCompletedSteps((prev) => { const n = new Set(prev); if (n.has(step)) n.delete(step); else n.add(step); return n; }); };
    const eligBadge = {
        eligible: { label: "Eligible", bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
        partial: { label: "Partial Match", bg: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
        "not-eligible": { label: "Not Eligible", bg: "bg-red-500/15 text-red-400 border-red-500/20" },
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Zap className="w-8 h-8 text-emerald-400" />
                    </motion.div>
                    <p className="text-sm text-[var(--text-40)]">Loading scheme data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex">
            {/* ═══ SIDEBAR ═══ */}
            <AnimatePresence>{sidebarOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-[var(--overlay)] z-40 lg:hidden" />)}</AnimatePresence>
            <aside className={cn("fixed top-0 left-0 h-screen w-[260px] bg-[var(--bg-sidebar)] border-r border-[var(--border-6)] flex flex-col z-50 transition-transform duration-300 lg:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
                <div className="p-6 pb-4 flex items-center gap-3">
                    <img src="/logo.png" alt="Eligify Logo" className="h-28 w-auto object-contain logo-themed" />
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-[var(--text-40)] hover:text-[var(--text-primary)] transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="mx-4 mb-4 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.12]">
                    <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" /><span className="text-xs font-semibold text-emerald-400">{t("sidebar.digilocker")}</span></div>
                    <p className="text-[10px] text-[var(--text-30)] mt-1">{t("sidebar.digilocker_desc")}</p>
                </div>
                <div className="mx-4 border-t border-[var(--border-4)] mb-2" />
                <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon; const isActive = item.id === "explore"; return (
                            <button key={item.id} onClick={() => { router.push(item.href); setSidebarOpen(false); }} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative", isActive ? "bg-[var(--surface-8)] text-[var(--text-primary)]" : "text-[var(--text-40)] hover:text-[var(--text-70)] hover:bg-[var(--surface-3)]")}>
                                {isActive && <motion.div layoutId="sidebarActive" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-400 rounded-r-full" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                                <div className="relative"><Icon className="w-[18px] h-[18px]" />{item.id === "notifications" && <NotifBadge count={2} />}</div>
                                {t(item.label)}
                            </button>
                        );
                    })}
                </nav>
                <div className="px-3 py-2 flex gap-2 items-center">
                    <ThemeToggle />
                    <LanguageSwitcher compact />
                </div>
                <div className="p-4 border-t border-[var(--border-4)]">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/[0.06] transition-all"><LogOut className="w-[18px] h-[18px]" />{t("sidebar.logout")}</button>
                </div>
            </aside>

            {/* ═══ MAIN ═══ */}
            <main className="flex-1 lg:ml-[260px] min-h-screen flex flex-col">
                <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-30 bg-[var(--bg-page)]/80 backdrop-blur-xl border-b border-[var(--border-4)] px-4 lg:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[var(--text-50)] hover:text-[var(--text-primary)] transition-colors"><Menu className="w-6 h-6" /></button>
                        <div className="flex items-center gap-1.5 text-xs">
                            <button onClick={() => router.push("/dashboard")} className="text-[var(--text-25)] hover:text-[var(--text-50)] transition-colors">{t("common.dashboard")}</button>
                            <ChevronRight className="w-3 h-3 text-[var(--text-15)]" />
                            <button onClick={() => router.push("/dashboard/explore")} className="text-[var(--text-25)] hover:text-[var(--text-50)] transition-colors">{t("sidebar.explore")}</button>
                            <ChevronRight className="w-3 h-3 text-[var(--text-15)]" />
                            <span className="text-[var(--text-70)] font-medium truncate max-w-[200px]">{scheme.name}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher compact />
                        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/explore")} className="border-[var(--border-8)] bg-[var(--surface-3)] text-[var(--text-60)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-6)] text-xs h-8"><ArrowLeft className="w-3.5 h-3.5 mr-1" />{t("common.back")}</Button>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/40 to-blue-500/40 flex items-center justify-center text-xs font-bold text-[var(--text-80)] border border-[var(--border-10)]">{userName ? userName.charAt(0).toUpperCase() : "?"}</div>
                    </div>
                </motion.header>

                {/* Scheme Header */}
                <div className="px-4 lg:px-6 py-4 border-b border-[var(--border-4)] bg-[var(--bg-page)]">
                    <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold text-[var(--text-primary)] truncate">{scheme.name}</h1>
                            <p className="text-xs text-[var(--text-25)] mt-0.5">{scheme.ministry}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                            {scheme.tags.map((t) => (<span key={t} className="px-2 py-0.5 rounded-full bg-[var(--surface-4)] text-[10px] text-[var(--text-40)] border border-[var(--border-4)]">{t}</span>))}
                            <Badge className={cn("gap-1 font-semibold", eligBadge[scheme.eligibility].bg)}>
                                {scheme.eligibility === "eligible" ? <CheckCircle2 className="w-3 h-3" /> : scheme.eligibility === "partial" ? <AlertCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                {eligBadge[scheme.eligibility].label}
                            </Badge>
                            {daysLeft !== null && (<Badge className={cn("gap-1", daysLeft <= 30 ? "bg-red-500/15 text-red-400 border-red-500/20" : "bg-[var(--surface-6)] text-[var(--text-50)] border-[var(--border-6)]")}><Clock className="w-3 h-3" />{daysLeft}d left</Badge>)}
                            <Button
                                onClick={saveAnalysis}
                                disabled={saving || analysisSaved}
                                size="sm"
                                className={cn(
                                    "text-xs h-8 gap-1.5 font-semibold transition-all",
                                    analysisSaved
                                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                                        : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/20"
                                )}
                            >
                                {saving ? (
                                    <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Zap className="w-3.5 h-3.5" /></motion.div>{t("scheme.saving")}</>
                                ) : analysisSaved ? (
                                    <><CheckCircle2 className="w-3.5 h-3.5" />{t("scheme.saved")}</>
                                ) : (
                                    <><Save className="w-3.5 h-3.5" />{t("scheme.save_analysis")}</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Tab Switcher */}
                <div className="lg:hidden px-4 py-2 border-b border-[var(--border-4)] flex gap-1 bg-[var(--bg-page)]">
                    {([
                        { key: "eligibility" as const, label: t("scheme.eligibility_criteria"), icon: CheckCircle2 },
                        { key: "chat" as const, label: t("scheme.chat_ai"), icon: MessageCircle },
                        { key: "execution" as const, label: t("scheme.application_steps"), icon: BookOpenCheck }
                    ]).map((panel) => (
                        <button key={panel.key} onClick={() => setActivePanel(panel.key)} className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all", activePanel === panel.key ? "bg-[var(--surface-8)] text-[var(--text-primary)]" : "text-[var(--text-30)] hover:text-[var(--text-50)]")}>
                            <panel.icon className="w-3.5 h-3.5" />{panel.label}
                        </button>
                    ))}
                </div>

                {/* ═══ 3-COLUMN LAYOUT ═══ */}
                <div className="flex-1 flex overflow-hidden">
                    {/* LEFT: Eligibility */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className={cn("w-full lg:w-[340px] xl:w-[380px] lg:flex-shrink-0 border-r border-[var(--border-4)] flex flex-col bg-[var(--bg-page)]", activePanel === "eligibility" ? "flex" : "hidden lg:flex")}>
                        <ScrollArea className="flex-1">
                            <div className="p-5 space-y-5">
                                <div className="flex items-center gap-4">
                                    <MatchRingLg percent={scheme.matchPercent} />
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center gap-2"><span className="flex items-center gap-1 text-xs"><CheckCircle2 className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400 font-medium">{satisfied}</span><span className="text-[var(--text-25)]">Satisfied</span></span></div>
                                        <div className="flex items-center gap-2"><span className="flex items-center gap-1 text-xs"><X className="w-3 h-3 text-red-400" /><span className="text-red-400 font-medium">{notSatisfied}</span><span className="text-[var(--text-25)]">Not Met</span></span></div>
                                        <div className="flex items-center gap-2"><span className="flex items-center gap-1 text-xs"><AlertCircle className="w-3 h-3 text-amber-400" /><span className="text-amber-400 font-medium">{missingCount}</span><span className="text-[var(--text-25)]">Missing</span></span></div>
                                    </div>
                                </div>
                                <Separator className="bg-[var(--surface-4)]" />
                                <div>
                                    <h3 className="text-xs font-semibold text-[var(--text-50)] uppercase tracking-wider mb-3">Conditions Breakdown</h3>
                                    <div className="space-y-0">{scheme.conditions.map((c, i) => (<ConditionRow key={i} condition={c} />))}</div>
                                </div>
                                <Separator className="bg-[var(--surface-4)]" />
                                <div>
                                    <h3 className="text-xs font-semibold text-[var(--text-50)] uppercase tracking-wider mb-2">Benefit</h3>
                                    <div className="p-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/[0.08]">
                                        <p className="text-sm font-semibold text-emerald-400">{scheme.maxBenefit}</p>
                                        <p className="text-[11px] text-[var(--text-30)] mt-1 leading-relaxed">{scheme.benefitSummary}</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </motion.div>

                    {/* CENTER: AI Chat */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cn("flex-1 flex flex-col bg-[var(--bg-deep)] min-w-0", activePanel === "chat" ? "flex" : "hidden lg:flex")}>
                        <div className="px-5 py-3.5 border-b border-[var(--border-4)] flex items-center justify-between bg-[var(--bg-page)]/50">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center"><Zap className="w-3.5 h-3.5 text-emerald-400" /></div>
                                <div>
                                    <p className="text-xs font-semibold text-[var(--text-primary)]">Scheme Intelligence AI</p>
                                    <p className="text-[10px] text-[var(--text-20)]">Context: {scheme.name}</p>
                                </div>
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-400/70 border-emerald-500/15 text-[9px]"><CircleDot className="w-2.5 h-2.5 mr-0.5 animate-pulse" />Active</Badge>
                        </div>
                        <ScrollArea className="flex-1 px-5 py-4">
                            <div className="space-y-4 max-w-[600px] mx-auto">
                                {chatMessages.map((msg) => (
                                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                                        <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed", msg.role === "user" ? "bg-[var(--surface-8)] text-[var(--text-80)] rounded-br-md" : "bg-[var(--bg-card)] border border-[var(--border-4)] text-[var(--text-60)] rounded-bl-md")}>
                                            {msg.role === "ai" && (<div className="flex items-center gap-1.5 mb-2"><Zap className="w-3 h-3 text-emerald-400" /><span className="text-[10px] font-semibold text-emerald-400/70">Eligify AI</span></div>)}
                                            {msg.role === "ai" ? (
                                                <div className="chat-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown></div>
                                            ) : (
                                                <div className="whitespace-pre-line">{msg.content}</div>
                                            )}
                                            <p className="text-[9px] text-[var(--text-15)] mt-2 text-right">{msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                                        </div>
                                    </motion.div>
                                ))}
                                {isTyping && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                        <div className="bg-[var(--bg-card)] border border-[var(--border-4)] rounded-2xl rounded-bl-md px-4 py-3">
                                            <div className="flex items-center gap-1.5 mb-1"><Zap className="w-3 h-3 text-emerald-400" /><span className="text-[10px] font-semibold text-emerald-400/70">Eligify AI</span></div>
                                            <div className="flex gap-1.5">{[0, 1, 2].map((i) => (<motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} className="w-2 h-2 rounded-full bg-white/20" />))}</div>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={chatEndRef} />
                            </div>
                        </ScrollArea>
                        {chatMessages.length <= 2 && (
                            <div className="px-5 py-2 flex gap-2 flex-wrap">
                                {quickActions.map((a) => (
                                    <Button key={a.label} variant="outline" size="sm" onClick={() => sendMessage(a.label)} className="border-[var(--border-6)] bg-[var(--surface-2)] text-[var(--text-40)] hover:text-[var(--text-70)] hover:bg-[var(--surface-4)] text-[11px] h-7 rounded-full">
                                        <a.icon className="w-3 h-3 mr-1" />{a.label}
                                    </Button>
                                ))}
                            </div>
                        )}
                        <div className="p-4 border-t border-[var(--border-4)] bg-[var(--bg-page)]/50">
                            <div className="flex gap-2 max-w-[600px] mx-auto">
                                <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(chatInput)} placeholder={t("scheme.ask_question")} className="flex-1 bg-[var(--bg-card)] border-[var(--border-6)] text-[var(--text-primary)] placeholder:text-[var(--text-15)] h-10 rounded-xl text-xs" />
                                <Button onClick={() => sendMessage(chatInput)} disabled={!chatInput.trim() || isTyping} size="icon" className="bg-emerald-500 hover:bg-emerald-600 text-[var(--text-primary)] w-10 h-10 rounded-xl shrink-0 disabled:opacity-30"><Send className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT: Execution */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className={cn("w-full lg:w-[320px] xl:w-[360px] lg:flex-shrink-0 border-l border-[var(--border-4)] flex flex-col bg-[var(--bg-page)]", activePanel === "execution" ? "flex" : "hidden lg:flex")}>
                        <ScrollArea className="flex-1">
                            <div className="p-5 space-y-5">
                                {/* Documents */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-semibold text-[var(--text-50)] uppercase tracking-wider">Required Documents</h3>
                                        <span className="text-[10px] text-[var(--text-25)]">{docsAvailable}/{scheme.documents.length} ready</span>
                                    </div>
                                    <Progress value={(docsAvailable / Math.max(scheme.documents.length, 1)) * 100} className="h-1.5 mb-3 bg-[var(--surface-4)] [&>[data-slot=progress-indicator]]:bg-emerald-500" />
                                    <div className="space-y-1.5">
                                        {scheme.documents.map((doc, i) => (
                                            <div key={i} className={cn("flex items-center gap-2.5 p-2.5 rounded-lg transition-colors", doc.available ? "bg-emerald-500/[0.03] border border-emerald-500/[0.06]" : "bg-red-500/[0.03] border border-red-500/[0.06]")}>
                                                {doc.available ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                                                <span className="text-[11px] text-[var(--text-60)] flex-1 min-w-0 truncate">{doc.name}</span>
                                                {doc.digilocker && <span className="text-[9px] text-emerald-400/60 bg-emerald-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">DigiLocker</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Separator className="bg-[var(--surface-4)]" />
                                {/* Steps */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-semibold text-[var(--text-50)] uppercase tracking-wider">Application Steps</h3>
                                        <span className="text-[10px] text-[var(--text-25)]">{completedSteps.size}/{scheme.steps.length}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {scheme.steps.map((step) => {
                                            const isDone = completedSteps.has(step.step); return (
                                                <button key={step.step} onClick={() => toggleStep(step.step)} className={cn("w-full text-left p-3 rounded-xl border transition-all group/step", isDone ? "bg-emerald-500/[0.04] border-emerald-500/[0.1]" : "bg-[var(--surface-1)] border-[var(--border-4)] hover:border-[var(--border-8)]")}>
                                                    <div className="flex items-start gap-2.5">
                                                        <div className={cn("w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors", isDone ? "bg-emerald-500 text-[var(--text-primary)]" : "bg-[var(--surface-4)] text-[var(--text-25)] group-hover/step:bg-[var(--surface-8)]")}>
                                                            {isDone ? <Check className="w-3 h-3" /> : <span className="text-[10px] font-bold">{step.step}</span>}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={cn("text-xs font-medium", isDone ? "text-emerald-400/80 line-through" : "text-[var(--text-70)]")}>{step.title}</p>
                                                            <p className="text-[10px] text-[var(--text-20)] mt-0.5 leading-relaxed">{step.description}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <Separator className="bg-[var(--surface-4)]" />
                                {/* Official Portal */}
                                <div>
                                    <h3 className="text-xs font-semibold text-[var(--text-50)] uppercase tracking-wider mb-3">Apply Now</h3>
                                    <a href={scheme.portalUrl} target="_blank" rel="noopener noreferrer" className="block">
                                        <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold border-0 shadow-lg shadow-emerald-500/20 h-10 text-xs gap-2">
                                            <Globe className="w-4 h-4" />Open Official Portal<ExternalLink className="w-3 h-3" />
                                        </Button>
                                    </a>
                                    <p className="text-center text-[10px] text-[var(--text-15)] mt-2">Opens {scheme.portalUrl.replace("https://", "")}</p>
                                </div>
                                <Separator className="bg-[var(--surface-4)]" />
                                {/* What-If */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-semibold text-[var(--text-50)] uppercase tracking-wider">What-If Simulation</h3>
                                        <Switch checked={whatIfOpen} onCheckedChange={setWhatIfOpen} />
                                    </div>
                                    <AnimatePresence>
                                        {whatIfOpen && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                <div className="p-3 rounded-xl bg-blue-500/[0.04] border border-blue-500/[0.08] space-y-3">
                                                    <p className="text-[10px] text-blue-300/60 leading-relaxed">Test how changing your profile data affects eligibility.</p>
                                                    <div className="space-y-2">
                                                        <div><Label className="text-[10px] text-[var(--text-30)]">Modified Income</Label><Input placeholder="e.g. ₹2,00,000" className="bg-[var(--surface-3)] border-[var(--border-6)] text-[var(--text-primary)] h-8 text-xs mt-1" /></div>
                                                        <div><Label className="text-[10px] text-[var(--text-30)]">Modified Marks %</Label><Input placeholder="e.g. 85" className="bg-[var(--surface-3)] border-[var(--border-6)] text-[var(--text-primary)] h-8 text-xs mt-1" /></div>
                                                        <Button variant="outline" size="sm" className="w-full border-blue-500/20 text-blue-400 bg-blue-500/[0.06] hover:bg-blue-500/[0.12] text-[11px] h-8"><SlidersHorizontal className="w-3 h-3 mr-1" />Run Simulation</Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </ScrollArea>
                    </motion.div>
                </div>
                {/* Footer */}
                <footer className="w-full text-center py-4 text-xs text-[var(--text-30)] bg-[var(--bg-page)] border-t border-[var(--border-4)]">
                    {t("common.footer")}
                </footer>
            </main>
        </div>
    );
}

