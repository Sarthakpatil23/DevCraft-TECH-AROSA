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
    Clock,
    MapPin,
    FileText,
    Globe,
    ArrowLeft,
    Building2,
    BadgeCheck,
    Hash,
    ChevronDown,
    Info,
    Landmark,
    Monitor,
    Fingerprint,
    GraduationCap,
    HeartPulse,
    Wallet,
    Home,
    Users,
    Receipt,
    FolderLock,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
interface ProcessStep {
    step: number;
    title: string;
    description: string;
}

interface DocumentGuide {
    id: string;
    name: string;
    icon: React.ElementType;
    description: string;
    schemesCount: number;
    category: string;
    whereToApply: string[];
    estimatedTime: string;
    portalUrl: string | null;
    requiredDocs: string[];
    steps: ProcessStep[];
}

// ─── Mock Data ──────────────────────────────────────────────────────
const DOCUMENTS: DocumentGuide[] = [
    {
        id: "income-cert",
        name: "Income Certificate",
        icon: Wallet,
        description: "Official proof of annual family income issued by local revenue authority.",
        schemesCount: 12,
        category: "Revenue",
        whereToApply: ["Tehsildar Office", "Online (e-District)", "CSC Center"],
        estimatedTime: "7–15 working days",
        portalUrl: "https://edistrict.maharashtra.gov.in",
        requiredDocs: ["Aadhaar Card", "Ration Card", "Salary Slip / Self Declaration", "Address Proof"],
        steps: [
            { step: 1, title: "Visit e-District Portal", description: "Go to your state's e-District portal and register or login." },
            { step: 2, title: "Fill Application Form", description: "Select 'Income Certificate' and fill family income details." },
            { step: 3, title: "Upload Documents", description: "Upload Aadhaar, ration card, and salary/income proof." },
            { step: 4, title: "Pay Fees", description: "Pay the nominal application fee online (₹10–50)." },
            { step: 5, title: "Verification", description: "Revenue officer may schedule physical verification." },
            { step: 6, title: "Download Certificate", description: "Once approved, download the digitally signed certificate." },
        ],
    },
    {
        id: "domicile-cert",
        name: "Domicile Certificate",
        icon: Home,
        description: "Proof that you've been a resident of a particular state for a specified period.",
        schemesCount: 9,
        category: "Revenue",
        whereToApply: ["Tehsildar Office", "Online (e-District)", "CSC Center"],
        estimatedTime: "10–20 working days",
        portalUrl: "https://edistrict.maharashtra.gov.in",
        requiredDocs: ["Aadhaar Card", "School Leaving Certificate", "Ration Card", "Electricity Bill"],
        steps: [
            { step: 1, title: "Visit e-District Portal", description: "Navigate to your state e-District website." },
            { step: 2, title: "Select Service", description: "Choose 'Domicile Certificate' under Revenue services." },
            { step: 3, title: "Fill Details", description: "Enter your personal details and duration of residence." },
            { step: 4, title: "Upload Documents", description: "Upload required proofs of residence and identity." },
            { step: 5, title: "Pay & Submit", description: "Complete payment and submit the application." },
            { step: 6, title: "Track & Download", description: "Track status and download after approval." },
        ],
    },
    {
        id: "caste-cert",
        name: "Caste Certificate",
        icon: Users,
        description: "Official document certifying your caste under SC/ST/OBC categories.",
        schemesCount: 15,
        category: "Social Welfare",
        whereToApply: ["Tehsildar Office", "Online (e-District)", "District Collector"],
        estimatedTime: "15–30 working days",
        portalUrl: "https://edistrict.maharashtra.gov.in",
        requiredDocs: ["Aadhaar Card", "School Leaving Certificate", "Father's Caste Certificate", "Ration Card"],
        steps: [
            { step: 1, title: "Register on Portal", description: "Create account on your state's e-District portal." },
            { step: 2, title: "Select Caste Certificate", description: "Choose 'Caste Certificate' from Social Welfare services." },
            { step: 3, title: "Provide Family Details", description: "Enter father's/family's caste certificate details." },
            { step: 4, title: "Upload Proof", description: "Upload identity proof, school LC, and father's certificate." },
            { step: 5, title: "Verification Visit", description: "A local inquiry may be conducted by revenue officials." },
            { step: 6, title: "Issuance", description: "Certificate issued after successful verification." },
        ],
    },
    {
        id: "disability-cert",
        name: "Disability Certificate",
        icon: HeartPulse,
        description: "Medical certificate indicating type and percentage of disability.",
        schemesCount: 6,
        category: "Health",
        whereToApply: ["Govt. District Hospital", "Medical Board"],
        estimatedTime: "15–30 working days",
        portalUrl: "https://swavlambancard.gov.in",
        requiredDocs: ["Aadhaar Card", "Medical Records", "Passport Photo", "Doctor's Referral Letter"],
        steps: [
            { step: 1, title: "Get Referral", description: "Obtain a referral letter from your primary doctor." },
            { step: 2, title: "Visit District Hospital", description: "Go to the government district hospital on medical board day." },
            { step: 3, title: "Medical Examination", description: "The medical board evaluates disability type and percentage." },
            { step: 4, title: "Apply for UDID", description: "Register on swavlambancard.gov.in for UDID card." },
            { step: 5, title: "Collect Certificate", description: "Receive disability certificate with unique ID." },
        ],
    },
    {
        id: "birth-cert",
        name: "Birth Certificate",
        icon: BadgeCheck,
        description: "Official record of birth registered with local municipal authority.",
        schemesCount: 8,
        category: "Municipal",
        whereToApply: ["Municipal Corporation", "Online Portal", "CSC Center"],
        estimatedTime: "3–7 working days",
        portalUrl: "https://crsorgi.gov.in",
        requiredDocs: ["Hospital Discharge Summary", "Parent Aadhaar Cards", "Marriage Certificate"],
        steps: [
            { step: 1, title: "Visit CRS Portal", description: "Go to crsorgi.gov.in or your local municipal website." },
            { step: 2, title: "Fill Birth Details", description: "Enter child's details, hospital name, and parent information." },
            { step: 3, title: "Upload Hospital Records", description: "Upload hospital discharge summary as proof." },
            { step: 4, title: "Submit & Pay", description: "Submit the application and pay registration fees." },
            { step: 5, title: "Download Certificate", description: "Download the digitally signed birth certificate." },
        ],
    },
    {
        id: "education-cert",
        name: "Education Certificates",
        icon: GraduationCap,
        description: "Marksheets, degree certificates, and enrollment letters from institutions.",
        schemesCount: 11,
        category: "Education",
        whereToApply: ["DigiLocker", "University / Board Website", "Institution Office"],
        estimatedTime: "Instant (DigiLocker) / 5–15 days",
        portalUrl: "https://digilocker.gov.in",
        requiredDocs: ["Roll Number / Exam Seat Number", "Aadhaar (for DigiLocker)"],
        steps: [
            { step: 1, title: "Login to DigiLocker", description: "Visit digilocker.gov.in and login with Aadhaar." },
            { step: 2, title: "Search Issuer", description: "Search your board or university under 'Issued Documents'." },
            { step: 3, title: "Fetch Certificates", description: "Enter your roll number to fetch marksheets/certificates." },
            { step: 4, title: "Save to Account", description: "Save to DigiLocker for instant verified access." },
        ],
    },
    {
        id: "ration-card",
        name: "Ration Card",
        icon: Receipt,
        description: "Government-issued card for subsidized food grains under PDS.",
        schemesCount: 7,
        category: "Food & Civil Supplies",
        whereToApply: ["Online (NFSA Portal)", "Tehsildar Office", "CSC Center"],
        estimatedTime: "15–30 working days",
        portalUrl: "https://nfsa.gov.in",
        requiredDocs: ["Aadhaar Cards (all family members)", "Address Proof", "Income Certificate", "Gas Connection Details"],
        steps: [
            { step: 1, title: "Visit NFSA Portal", description: "Go to your state's PDS or NFSA portal." },
            { step: 2, title: "New Application", description: "Select 'Apply for New Ration Card' option." },
            { step: 3, title: "Enter Family Details", description: "Add all family members with Aadhaar numbers." },
            { step: 4, title: "Upload & Submit", description: "Upload address proof and income certificate." },
            { step: 5, title: "Field Verification", description: "An inspector may visit your residence for verification." },
            { step: 6, title: "Collect Card", description: "Receive ration card at your registered address." },
        ],
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
// GET YOUR DOCS PAGE
// ═══════════════════════════════════════════════════════════════════
export default function GetYourDocsPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<DocumentGuide | null>(null);
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) { router.push("/"); return; }
        fetch("http://127.0.0.1:8000/api/auth/profile/", { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(d => { const u = d.user; setUserName(u?.first_name ? `${u.first_name}${u.last_name ? ' ' + u.last_name : ''}` : u?.email || ""); }).catch(() => {});
    }, [router]);

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
                        const isActive = item.id === "docs";
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
                            <span className="text-sm text-[var(--text-primary)] font-medium">{t("sidebar.docs")}</span>
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
                                <FileCheck className="w-5 h-5 text-[var(--text-40)]" />
                            </div>
                            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t("sidebar.docs")}</h1>
                        </div>
                        <p className="text-sm text-[var(--text-30)]">{t("docs.subtitle")}</p>
                    </motion.div>

                    {/* Document Detail Panel */}
                    <AnimatePresence mode="wait">
                        {selectedDoc ? (
                            <motion.div key="detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5">
                                {/* Back */}
                                <Button variant="outline" size="sm" onClick={() => setSelectedDoc(null)} className="border-[var(--border-8)] bg-[var(--surface-3)] text-[var(--text-50)] hover:text-[var(--text-primary)] text-xs h-8 gap-1.5">
                                    <ArrowLeft className="w-3.5 h-3.5" />{t("docs.back")}
                                </Button>

                                {/* Doc Header */}
                                <div className="bg-[var(--bg-card)] border border-[var(--border-6)] rounded-2xl p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/[0.12] flex items-center justify-center flex-shrink-0">
                                            <selectedDoc.icon className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-lg font-bold text-[var(--text-primary)]">{selectedDoc.name}</h2>
                                            <p className="text-xs text-[var(--text-30)] mt-1">{selectedDoc.description}</p>
                                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                                                <Badge className="bg-[var(--surface-4)] text-[var(--text-30)] border-[var(--border-6)] text-[9px] gap-1"><Hash className="w-2.5 h-2.5" />Required for {selectedDoc.schemesCount} schemes</Badge>
                                                <Badge className="bg-[var(--surface-4)] text-[var(--text-30)] border-[var(--border-6)] text-[9px] gap-1"><Clock className="w-2.5 h-2.5" />{selectedDoc.estimatedTime}</Badge>
                                                <Badge className="bg-[var(--surface-4)] text-[var(--text-30)] border-[var(--border-6)] text-[9px] gap-1"><Building2 className="w-2.5 h-2.5" />{selectedDoc.category}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                    {/* Steps */}
                                    <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-6)] rounded-2xl p-5">
                                        <h3 className="text-xs font-semibold text-[var(--text-50)] uppercase tracking-wider mb-4">{t("docs.step_by_step")}</h3>
                                        <div className="space-y-3">
                                            {selectedDoc.steps.map((step, i) => (
                                                <div key={step.step} className="flex items-start gap-3">
                                                    <div className="w-7 h-7 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/[0.1] flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-[10px] font-bold text-emerald-400">{step.step}</span>
                                                    </div>
                                                    <div className="flex-1 pb-3 border-b border-[var(--border-3)] last:border-0">
                                                        <p className="text-sm font-medium text-[var(--text-70)]">{step.title}</p>
                                                        <p className="text-[11px] text-[var(--text-25)] mt-0.5 leading-relaxed">{step.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sidebar Info */}
                                    <div className="space-y-4">
                                        {/* Where to Apply */}
                                        <div className="bg-[var(--bg-card)] border border-[var(--border-6)] rounded-2xl p-5">
                                            <h3 className="text-xs font-semibold text-[var(--text-50)] uppercase tracking-wider mb-3">{t("docs.where_to_apply")}</h3>
                                            <div className="space-y-2">
                                                {selectedDoc.whereToApply.map((place) => (
                                                    <div key={place} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border-3)]">
                                                        <MapPin className="w-3 h-3 text-[var(--text-20)] flex-shrink-0" />
                                                        <span className="text-[11px] text-[var(--text-50)]">{place}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Required Docs */}
                                        <div className="bg-[var(--bg-card)] border border-[var(--border-6)] rounded-2xl p-5">
                                            <h3 className="text-xs font-semibold text-[var(--text-50)] uppercase tracking-wider mb-3">{t("docs.required_documents")}</h3>
                                            <div className="space-y-1.5">
                                                {selectedDoc.requiredDocs.map((doc) => (
                                                    <div key={doc} className="flex items-center gap-2">
                                                        <FileText className="w-3 h-3 text-[var(--text-15)] flex-shrink-0" />
                                                        <span className="text-[11px] text-[var(--text-40)]">{doc}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Portal */}
                                        {selectedDoc.portalUrl && (
                                            <a href={selectedDoc.portalUrl} target="_blank" rel="noopener noreferrer">
                                                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold border-0 shadow-lg shadow-emerald-500/20 h-10 text-xs gap-2">
                                                    <Globe className="w-4 h-4" />{t("docs.visit_portal")}<ExternalLink className="w-3 h-3" />
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {/* Document Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {DOCUMENTS.map((doc, i) => {
                                        const Icon = doc.icon;
                                        return (
                                            <motion.div key={doc.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} onClick={() => setSelectedDoc(doc)} className="bg-[var(--bg-card)] border border-[var(--border-6)] rounded-xl p-5 hover:border-[var(--border-12)] transition-all cursor-pointer group">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--surface-4)] border border-[var(--border-5)] flex items-center justify-center mb-4 group-hover:bg-emerald-500/[0.06] group-hover:border-emerald-500/[0.1] transition-colors">
                                                    <Icon className="w-4.5 h-4.5 text-[var(--text-30)] group-hover:text-emerald-400 transition-colors" />
                                                </div>
                                                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{doc.name}</h3>
                                                <p className="text-[11px] text-[var(--text-25)] leading-relaxed mb-3 line-clamp-2">{doc.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <Badge className="bg-[var(--surface-4)] text-[var(--text-25)] border-[var(--border-5)] text-[9px] gap-1">
                                                        <Hash className="w-2.5 h-2.5" />Required for {doc.schemesCount} schemes
                                                    </Badge>
                                                </div>
                                                <Separator className="bg-[var(--surface-4)] my-3" />
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-[var(--text-15)] flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{doc.estimatedTime}</span>
                                                    <span className="text-[10px] text-emerald-400/60 font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">{t("docs.view_process")}<ChevronRight className="w-3 h-3" /></span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Footer */}
                    <div className="text-center py-10 border-t border-[var(--border-4)] mt-12">
                        <p className="text-xs text-[var(--text-15)]">{t("common.footer")}</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

