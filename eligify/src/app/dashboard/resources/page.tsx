"use client";
import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
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
    Play,
    Clock,
    FileText,
    BookMarked,
    HelpCircle,
    Video,
    GraduationCap,
    AlertTriangle,
    ListChecks,
    ChevronDown,
    ChevronUp,
    Lightbulb,
    Target,
    FolderLock,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
interface Resource {
    id: string;
    title: string;
    description: string;
    type: "video" | "guide" | "faq";
    category: string;
    duration?: string;
    icon: React.ElementType;
    videoId?: string;
}

interface FAQ {
    id: string;
    question: string;
    answer: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────
const CATEGORIES = [
    { key: "all", label: "All" },
    { key: "scholarships", label: "Scholarships" },
    { key: "application", label: "Application Tips" },
    { key: "eligibility", label: "Eligibility" },
    { key: "walkthrough", label: "Walkthroughs" },
];

const RESOURCES: Resource[] = [
    {
        id: "vid-1",
        title: "How to Apply for Government Scholarships",
        description: "Complete walkthrough of the National Scholarship Portal application process, from registration to final submission.",
        type: "video",
        category: "scholarships",
        duration: "12 min",
        icon: GraduationCap,
        videoId: "vv1FRaj9OMY",
    },
    {
        id: "vid-2",
        title: "Step-by-Step NSP Application Guide",
        description: "Detailed screen recording showing every step of applying through the National Scholarship Portal.",
        type: "video",
        category: "walkthrough",
        duration: "18 min",
        icon: Video,
        videoId: "8omdOUB63_g",
    },
    {
        id: "vid-3",
        title: "Understanding Eligibility Criteria",
        description: "Learn how eligibility rules work across different government schemes and how to maximize your chances.",
        type: "video",
        category: "eligibility",
        duration: "8 min",
        icon: Target,
        videoId: "_EYkPRBvarY",
    },
    {
        id: "guide-1",
        title: "5 Common Mistakes in Scheme Applications",
        description: "Avoid these frequent errors that lead to application rejection. Based on analysis of 10,000+ applications.",
        type: "guide",
        category: "application",
        icon: AlertTriangle,
    },
    {
        id: "guide-2",
        title: "Scholarship Application Checklist",
        description: "A comprehensive pre-submission checklist to ensure your scholarship application is complete and error-free.",
        type: "guide",
        category: "scholarships",
        icon: ListChecks,
    },
    {
        id: "guide-3",
        title: "How to Read Scheme Eligibility Documents",
        description: "A beginner's guide to understanding complex government scheme documents and eligibility requirements.",
        type: "guide",
        category: "eligibility",
        icon: BookMarked,
    },
    {
        id: "guide-4",
        title: "Making the Most of DigiLocker",
        description: "How to use DigiLocker to speed up your scheme applications and keep your documents verified and accessible.",
        type: "guide",
        category: "application",
        icon: Lightbulb,
    },
    {
        id: "vid-4",
        title: "PM Kisan Registration Walkthrough",
        description: "Full video walkthrough of registering for PM Kisan Samman Nidhi including Aadhaar e-KYC steps.",
        type: "video",
        category: "walkthrough",
        duration: "15 min",
        icon: Play,
        videoId: "vUkRxMt0X5A",
    },
];

const FAQS: FAQ[] = [
    {
        id: "faq-1",
        question: "How does Eligify determine my eligibility?",
        answer: "Eligify uses a deterministic rule engine that compares your verified profile data against scheme eligibility criteria. We extract conditions from official scheme documents and check each requirement against your profile. No guesswork — only factual matching.",
    },
    {
        id: "faq-2",
        question: "Is my data secure on Eligify?",
        answer: "Absolutely. Your data is encrypted at rest and in transit. DigiLocker integration uses OAuth 2.0 for secure access. We never store your raw documents — only verified data points needed for eligibility checks. You can delete your account and data at any time.",
    },
    {
        id: "faq-3",
        question: "Can I apply for schemes directly through Eligify?",
        answer: "Eligify guides you through the application process and provides direct links to official portals. We don't submit applications on your behalf to ensure you maintain full control of your applications.",
    },
    {
        id: "faq-4",
        question: "What if my eligibility shows 'Partial Match'?",
        answer: "A partial match means you meet some but not all criteria. Check the Scheme Intelligence page to see which conditions aren't met. Some can be resolved by updating your profile, while others may indicate genuine ineligibility.",
    },
    {
        id: "faq-5",
        question: "How often are scheme databases updated?",
        answer: "We update our scheme database weekly with new schemes, deadline changes, and eligibility modifications. You'll receive notifications when schemes you've evaluated have important updates.",
    },
    {
        id: "faq-6",
        question: "Can I upload custom scheme documents?",
        answer: "Yes! Use the 'Upload Scheme' feature to upload any scheme PDF. Our engine will extract eligibility criteria and check them against your profile, just like preloaded schemes.",
    },
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

// ═══════════════════════════════════════════════════════════════════
// RESOURCES PAGE
// ═══════════════════════════════════════════════════════════════════
export default function ResourcesPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState("all");
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) { router.push("/"); return; }
        fetch("http://127.0.0.1:8000/api/auth/profile/", { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(d => { const u = d.user; setUserName(u?.first_name ? `${u.first_name}${u.last_name ? ' ' + u.last_name : ''}` : u?.email || ""); }).catch(() => { });
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/");
    };

    const filteredResources =
        activeCategory === "all"
            ? RESOURCES
            : RESOURCES.filter((r) => r.category === activeCategory);

    const videos = filteredResources.filter((r) => r.type === "video");
    const guides = filteredResources.filter((r) => r.type === "guide");

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
                        const isActive = item.id === "resources";
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
                            <span className="text-sm text-[var(--text-primary)] font-medium">{t("sidebar.resources")}</span>
                        </div>
                    </div>
                    <LanguageSwitcher compact />
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/40 to-blue-500/40 flex items-center justify-center text-sm font-bold text-[var(--text-80)] border border-[var(--border-10)]">{userName ? userName.charAt(0).toUpperCase() : "?"}</div>
                </motion.header>

                <div className="px-4 lg:px-8 py-8 max-w-[960px] mx-auto">
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-[var(--surface-4)] border border-[var(--border-6)] flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-[var(--text-40)]" />
                            </div>
                            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t("sidebar.resources")}</h1>
                        </div>
                        <p className="text-sm text-[var(--text-30)]">{t("resources.subtitle")}</p>
                    </motion.div>

                    {/* Category Tabs */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none">
                        {CATEGORIES.map((cat) => (
                            <button key={cat.key} onClick={() => setActiveCategory(cat.key)} className={cn("px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap border", activeCategory === cat.key ? "bg-[var(--surface-8)] text-[var(--text-primary)] border-[var(--border-10)]" : "bg-transparent text-[var(--text-30)] border-[var(--border-4)] hover:bg-[var(--surface-3)] hover:text-[var(--text-50)]")}>
                                {t(`resources.categories.${cat.key}`)}
                            </button>
                        ))}
                    </motion.div>

                    {/* ── Video Section ── */}
                    {videos.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-10">
                            <h2 className="text-xs font-semibold text-[var(--text-40)] uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Video className="w-3.5 h-3.5" />{t("resources.video_guides")}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {videos.map((resource, i) => {
                                    const Icon = resource.icon;
                                    const isPlaying = playingVideoId === resource.id;

                                    return (
                                        <motion.div key={resource.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="bg-[var(--bg-card)] border border-[var(--border-6)] rounded-xl overflow-hidden hover:border-[var(--border-12)] transition-all group">
                                            {/* Thumbnail / Video */}
                                            <div className="relative h-48 bg-black flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => resource.videoId && setPlayingVideoId(resource.id)}>
                                                {isPlaying && resource.videoId ? (
                                                    <iframe
                                                        width="100%"
                                                        height="100%"
                                                        src={`https://www.youtube.com/embed/${resource.videoId}?autoplay=1`}
                                                        title={resource.title}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        className="absolute inset-0 w-full h-full"
                                                    />
                                                ) : (
                                                    <>
                                                        {resource.videoId ? (
                                                            <img
                                                                src={`https://img.youtube.com/vi/${resource.videoId}/hqdefault.jpg`}
                                                                alt={resource.title}
                                                                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                                            />
                                                        ) : (
                                                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-4)] to-[var(--surface-2)]" />
                                                        )}
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />

                                                        {/* Play Button */}
                                                        <div className="absolute inset-0 flex items-center justify-center z-20">
                                                            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md group-hover:scale-110 group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all duration-300 shadow-lg">
                                                                <Play className="w-5 h-5 text-white ml-0.5 fill-current" />
                                                            </div>
                                                        </div>

                                                        {resource.duration && (
                                                            <Badge className="absolute bottom-2 right-2 z-20 bg-black/60 text-white border-none text-[10px] font-medium backdrop-blur-md px-1.5 py-0.5 rounded-md">
                                                                {resource.duration}
                                                            </Badge>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            {/* Info */}
                                            <div className="p-4">
                                                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 line-clamp-1 group-hover:text-emerald-400/80 transition-colors">{resource.title}</h3>
                                                <p className="text-[11px] text-[var(--text-25)] leading-relaxed line-clamp-2">{resource.description}</p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <Badge className="bg-[var(--surface-4)] text-[var(--text-20)] border-[var(--border-5)] text-[9px]">{CATEGORIES.find((c) => c.key === resource.category)?.label}</Badge>
                                                    <button onClick={(e) => { e.stopPropagation(); resource.videoId && setPlayingVideoId(resource.id); }} className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity hover:underline">
                                                        {t("resources.watch")}<Play className="w-2.5 h-2.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Guides Section ── */}
                    {guides.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
                            <h2 className="text-xs font-semibold text-[var(--text-40)] uppercase tracking-wider mb-4 flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5" />{t("resources.guides_articles")}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {guides.map((resource, i) => {
                                    const Icon = resource.icon;
                                    return (
                                        <motion.div key={resource.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="bg-[var(--bg-card)] border border-[var(--border-6)] rounded-xl p-5 hover:border-[var(--border-12)] transition-all group cursor-pointer">
                                            <div className="flex items-start gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-[var(--surface-4)] border border-[var(--border-5)] flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/[0.06] group-hover:border-emerald-500/[0.1] transition-colors">
                                                    <Icon className="w-4 h-4 text-[var(--text-25)] group-hover:text-emerald-400 transition-colors" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 line-clamp-1 group-hover:text-emerald-400/80 transition-colors">{resource.title}</h3>
                                                    <p className="text-[11px] text-[var(--text-25)] leading-relaxed line-clamp-2">{resource.description}</p>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <Badge className="bg-[var(--surface-4)] text-[var(--text-20)] border-[var(--border-5)] text-[9px]">{CATEGORIES.find((c) => c.key === resource.category)?.label}</Badge>
                                                        <span className="text-[10px] text-emerald-400/60 font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">{t("resources.read")}<ChevronRight className="w-3 h-3" /></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* ── FAQ Section ── */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <Separator className="bg-[var(--surface-4)] mb-8" />
                        <h2 className="text-xs font-semibold text-[var(--text-40)] uppercase tracking-wider mb-5 flex items-center gap-2">
                            <HelpCircle className="w-3.5 h-3.5" />{t("resources.faq")}
                        </h2>
                        <div className="space-y-2">
                            {FAQS.map((faq) => (
                                <div key={faq.id} className="bg-[var(--bg-card)] border border-[var(--border-6)] rounded-xl overflow-hidden">
                                    <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} className="w-full flex items-center justify-between p-4 text-left">
                                        <span className="text-sm font-medium text-[var(--text-70)] pr-4">{faq.question}</span>
                                        {expandedFaq === faq.id ? (
                                            <ChevronUp className="w-4 h-4 text-[var(--text-20)] flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-[var(--text-20)] flex-shrink-0" />
                                        )}
                                    </button>
                                    <AnimatePresence>
                                        {expandedFaq === faq.id && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                                <div className="px-4 pb-4 pt-0">
                                                    <Separator className="bg-[var(--surface-4)] mb-3" />
                                                    <p className="text-xs text-[var(--text-30)] leading-relaxed">{faq.answer}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Footer */}
                    <div className="text-center py-10 border-t border-[var(--border-4)] mt-12">
                        <p className="text-xs text-[var(--text-15)]">{t("common.footer")}</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

