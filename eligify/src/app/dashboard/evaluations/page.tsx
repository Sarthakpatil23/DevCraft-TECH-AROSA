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
    ExternalLink,
    AlertCircle,
    Clock,
    Sparkles,
    ArrowUpDown,
    Calendar,
    TrendingUp,
    Tag,
    FileText,
    Eye,
    Inbox,
    FolderLock,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

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
interface Evaluation {
    schemeName: string;
    schemeId: string;
    source: "preloaded" | "uploaded";
    matchPercent: number;
    eligibility: "eligible" | "partial" | "not-eligible";
    dateChecked: string;
    category: string;
    benefitSummary: string;
    chatCount: number;
}

// ─── Mock Data ──────────────────────────────────────────────────────
// (Removed: data now fetched from API)

// ─── Sort Options ───────────────────────────────────────────────────
type SortKey = "latest" | "match" | "name";
const SORT_OPTIONS: { key: SortKey; label: string; icon: React.ElementType }[] = [
    { key: "latest", label: "evaluations.sort_latest", icon: Calendar },
    { key: "match", label: "evaluations.sort_match", icon: TrendingUp },
    { key: "name", label: "evaluations.sort_name", icon: ArrowUpDown },
];

// ─── NotifBadge ─────────────────────────────────────────────────────
function NotifBadge({ count }: { count: number }) {
    if (count === 0) return null;
    return (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-[var(--bg-page)]">
            {count}
        </motion.span>
    );
}

// ─── Match Ring Small ───────────────────────────────────────────────
function MatchRingSm({ percent }: { percent: number }) {
    const r = 18;
    const circ = 2 * Math.PI * r;
    const offset = circ - (percent / 100) * circ;
    const color = percent >= 80 ? "#22c55e" : percent >= 60 ? "#f59e0b" : "#ef4444";
    return (
        <div className="relative w-12 h-12 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r={r} fill="none" stroke="var(--border-4)" strokeWidth="3" />
                <motion.circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }} transition={{ duration: 0.8, ease: "easeOut" }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-[var(--text-primary)]">{percent}%</span>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// MY EVALUATIONS PAGE
// ═══════════════════════════════════════════════════════════════════
export default function MyEvaluationsPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortKey>("latest");
    const [sortOpen, setSortOpen] = useState(false);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("");

    const { t } = useLanguage();

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) { router.push("/"); return; }
        fetch("http://127.0.0.1:8000/api/auth/profile/", { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(d => { const u = d.user; setUserName(u?.first_name ? `${u.first_name}${u.last_name ? ' ' + u.last_name : ''}` : u?.email || ""); }).catch(() => {});
        const fetchEvaluations = async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/api/my-evaluations/", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setEvaluations(data);
                }
            } catch (err) {
                console.error("Failed to fetch evaluations:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvaluations();
    }, [router]);

    const eligBadge = {
        eligible: { label: t("common.eligible"), class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
        partial: { label: t("common.partial"), class: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
        "not-eligible": { label: t("common.not_eligible"), class: "bg-red-500/15 text-red-400 border-red-500/20" },
    };

    const filtered = useMemo(() => {
        let items = [...evaluations];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            items = items.filter(
                (e) =>
                    e.schemeName.toLowerCase().includes(q) ||
                    e.category.toLowerCase().includes(q)
            );
        }
        items.sort((a, b) => {
            if (sortBy === "latest") return new Date(b.dateChecked).getTime() - new Date(a.dateChecked).getTime();
            if (sortBy === "match") return b.matchPercent - a.matchPercent;
            return a.schemeName.localeCompare(b.schemeName);
        });
        return items;
    }, [searchQuery, sortBy, evaluations]);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/");
    };

    const eligibleCount = evaluations.filter((e) => e.eligibility === "eligible").length;
    const partialCount = evaluations.filter((e) => e.eligibility === "partial").length;

    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex">
            {/* ═══ SIDEBAR ═══ */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-[var(--overlay)] z-40 lg:hidden" />
                )}
            </AnimatePresence>
            <aside className={cn("fixed top-0 left-0 h-screen w-[260px] bg-[var(--bg-sidebar)] border-r border-[var(--border-6)] flex flex-col z-50 transition-transform duration-300 lg:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
                <div className="p-6 pb-4 flex items-center gap-3">
                    <img src="/logo.png" alt="Eligify" className="h-28 w-auto object-contain logo-themed" />
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-[var(--text-40)] hover:text-[var(--text-primary)]"><X className="w-5 h-5" /></button>
                </div>
                <div className="mx-4 mb-4 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.12]">
                    <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" /><span className="text-xs font-semibold text-emerald-400">{t("sidebar.digilocker")}</span></div>
                    <p className="text-[10px] text-[var(--text-30)] mt-1">{t("sidebar.digilocker_desc")}</p>
                </div>
                <div className="mx-4 border-t border-[var(--border-4)] mb-2" />
                <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.id === "evaluations";
                        return (
                            <button key={item.id} onClick={() => { router.push(item.href); setSidebarOpen(false); }} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative", isActive ? "bg-[var(--surface-8)] text-[var(--text-primary)]" : "text-[var(--text-40)] hover:text-[var(--text-70)] hover:bg-[var(--surface-3)]")}>
                                {isActive && <motion.div layoutId="sidebarActive" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-400 rounded-r-full" />}
                                <div className="relative"><Icon className="w-[18px] h-[18px]" />{item.id === "notifications" && <NotifBadge count={2} />}</div>
                                {t(item.label)}
                            </button>
                        );
                    })}
                </nav>
                <div className="px-3 py-2"><ThemeToggle /></div>
        <div className="p-4 border-t border-[var(--border-4)]">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/[0.06] transition-all"><LogOut className="w-[18px] h-[18px]" />{t("sidebar.logout")}</button>
                </div>
            </aside>

            {/* ═══ MAIN ═══ */}
            <main className="flex-1 lg:ml-[260px] min-h-screen">
                {/* Top Bar */}
                <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-30 bg-[var(--bg-page)]/80 backdrop-blur-xl border-b border-[var(--border-4)] px-4 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[var(--text-50)] hover:text-[var(--text-primary)]"><Menu className="w-6 h-6" /></button>
                        <div className="flex items-center gap-2">
                            <button onClick={() => router.push("/dashboard")} className="text-[var(--text-30)] hover:text-[var(--text-60)] text-sm">{t("common.dashboard")}</button>
                            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-15)]" />
                            <span className="text-sm text-[var(--text-primary)] font-medium">{t("evaluations.title")}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <LanguageSwitcher compact />
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/40 to-blue-500/40 flex items-center justify-center text-sm font-bold text-[var(--text-80)] border border-[var(--border-10)]">{userName ? userName.charAt(0).toUpperCase() : "?"}</div>
                    </div>
                </motion.header>

                <div className="px-4 lg:px-8 py-8 max-w-[960px] mx-auto">
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-4)] border border-[var(--border-6)] flex items-center justify-center">
                                        <ClipboardList className="w-5 h-5 text-[var(--text-40)]" />
                                    </div>
                                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t("evaluations.title")}</h1>
                                </div>
                                <p className="text-sm text-[var(--text-30)]">{t("evaluations.subtitle")}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-emerald-500/10 text-emerald-400/70 border-emerald-500/15 text-[10px] gap-1"><CheckCircle2 className="w-3 h-3" />{eligibleCount} {t("common.eligible")}</Badge>
                                <Badge className="bg-amber-500/10 text-amber-400/70 border-amber-500/15 text-[10px] gap-1"><AlertCircle className="w-3 h-3" />{partialCount} {t("common.partial")}</Badge>
                                <Badge className="bg-[var(--surface-4)] text-[var(--text-30)] border-[var(--border-6)] text-[10px] gap-1"><FileText className="w-3 h-3" />{evaluations.length} {t("common.total")}</Badge>
                            </div>
                        </div>
                    </motion.div>

                    {/* Filters */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-20)]" />
                            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t("evaluations.search_placeholder")}
                                className="pl-10 bg-[var(--bg-card)] border-[var(--border-6)] text-[var(--text-primary)] placeholder:text-[var(--text-20)] h-10 text-sm" />
                        </div>
                        <div className="relative">
                            <Button variant="outline" onClick={() => setSortOpen(!sortOpen)} className="border-[var(--border-8)] bg-[var(--bg-card)] text-[var(--text-50)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-6)] h-10 text-xs gap-2 w-full sm:w-auto">
                                <ArrowUpDown className="w-3.5 h-3.5" />
                                {t(SORT_OPTIONS.find((s) => s.key === sortBy)?.label || "")}
                            </Button>
                            <AnimatePresence>
                                {sortOpen && (
                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute top-12 right-0 z-20 w-48 bg-[var(--bg-elevated)] border border-[var(--border-8)] rounded-xl overflow-hidden shadow-xl">
                                        {SORT_OPTIONS.map((opt) => (
                                            <button key={opt.key} onClick={() => { setSortBy(opt.key); setSortOpen(false); }} className={cn("w-full flex items-center gap-2 px-4 py-2.5 text-xs transition-colors", sortBy === opt.key ? "bg-[var(--surface-6)] text-[var(--text-primary)]" : "text-[var(--text-40)] hover:bg-[var(--surface-3)] hover:text-[var(--text-60)]")}>
                                                <opt.icon className="w-3.5 h-3.5" />{t(opt.label)}
                                                {sortBy === opt.key && <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-auto" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Results */}
                    {filtered.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--surface-3)] border border-[var(--border-5)] flex items-center justify-center mx-auto mb-5">
                                <Inbox className="w-7 h-7 text-[var(--text-15)]" />
                            </div>
                            <h3 className="text-base font-semibold text-[var(--text-50)] mb-1">
                                {searchQuery ? t("evaluations.no_results") : t("evaluations.no_schemes")}
                            </h3>
                            <p className="text-xs text-[var(--text-20)] mb-5 max-w-xs mx-auto">
                                {searchQuery ? t("evaluations.try_different") : t("evaluations.no_schemes_desc")}
                            </p>
                            <div className="flex items-center gap-3 justify-center">
                                {searchQuery ? (
                                    <Button onClick={() => setSearchQuery("")} variant="outline" className="border-[var(--border-8)] bg-[var(--surface-3)] text-[var(--text-50)] hover:text-[var(--text-primary)] text-xs h-9 gap-2">
                                        <X className="w-3 h-3" />{t("evaluations.clear_search")}
                                    </Button>
                                ) : (
                                    <>
                                        <Button onClick={() => router.push("/dashboard/upload")} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 gap-2">
                                            <Upload className="w-3 h-3" />{t("evaluations.upload_pdf")}
                                        </Button>
                                        <Button onClick={() => router.push("/dashboard/explore")} variant="outline" className="border-[var(--border-8)] bg-[var(--surface-3)] text-[var(--text-50)] hover:text-[var(--text-primary)] text-xs h-9 gap-2">
                                            <Search className="w-3 h-3" />{t("dashboard.explore_schemes")}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((evaluation, i) => (
                                <motion.div key={evaluation.schemeId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="bg-[var(--bg-card)] border border-[var(--border-6)] rounded-xl p-4 hover:border-[var(--border-10)] transition-all group cursor-pointer" onClick={() => router.push(`/dashboard/explore/${evaluation.schemeId}`)}>
                                    <div className="flex items-center gap-4">
                                        <MatchRingSm percent={evaluation.matchPercent} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">{evaluation.schemeName}</h3>
                                                <Badge className={cn("text-[9px] gap-0.5 flex-shrink-0", evaluation.source === "uploaded" ? "bg-blue-500/10 text-blue-400/70 border-blue-500/15" : "bg-[var(--surface-4)] text-[var(--text-30)] border-[var(--border-6)]")}>
                                                    {evaluation.source === "uploaded" ? <Upload className="w-2.5 h-2.5" /> : <Tag className="w-2.5 h-2.5" />}
                                                    {evaluation.source === "uploaded" ? t("common.uploaded") : t("common.preloaded")}
                                                </Badge>
                                            </div>
                                            {evaluation.benefitSummary && (
                                                <p className="text-[11px] text-[var(--text-30)] line-clamp-1 mb-1.5">{evaluation.benefitSummary}</p>
                                            )}
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <Badge className={cn("text-[9px] gap-1", eligBadge[evaluation.eligibility].class)}>
                                                    {evaluation.eligibility === "eligible" ? <CheckCircle2 className="w-2.5 h-2.5" /> : evaluation.eligibility === "partial" ? <AlertCircle className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                                                    {eligBadge[evaluation.eligibility].label}
                                                </Badge>
                                                <span className="text-[10px] text-[var(--text-20)]">{evaluation.category}</span>
                                                <span className="text-[10px] text-[var(--text-15)] flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{new Date(evaluation.dateChecked).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                                {evaluation.chatCount > 0 && (
                                                    <span className="text-[10px] text-blue-400/70 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" />{evaluation.chatCount} {evaluation.chatCount !== 1 ? t("evaluations.chats") : t("evaluations.chat")}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                            <Button variant="outline" size="sm" className="border-[var(--border-6)] bg-[var(--surface-2)] text-[var(--text-40)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-6)] text-[11px] h-8 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                                                <Eye className="w-3 h-3" />{evaluation.chatCount > 0 ? t("evaluations.resume_chat") : t("common.view_details")}
                                            </Button>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[var(--text-10)] sm:hidden flex-shrink-0" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="text-center py-10 border-t border-[var(--border-4)] mt-12">
                        <p className="text-xs text-[var(--text-15)]">{t("common.footer")}</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

