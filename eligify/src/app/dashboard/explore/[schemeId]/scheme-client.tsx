"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
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
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── Sidebar Items ──────────────────────────────────────────────────
const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard", href: "/dashboard" },
    { icon: User, label: "Profile", id: "profile", href: "/dashboard/profile" },
    { icon: Search, label: "Explore Schemes", id: "explore", href: "/dashboard/explore" },
    { icon: Upload, label: "Upload Scheme", id: "upload", href: "/dashboard" },
    { icon: ClipboardList, label: "My Evaluations", id: "evaluations", href: "/dashboard" },
    { icon: FileCheck, label: "Get Your Docs", id: "docs", href: "/dashboard" },
    { icon: BookOpen, label: "Resources", id: "resources", href: "/dashboard" },
    { icon: Bell, label: "Notifications", id: "notifications", href: "/dashboard" },
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
const SCHEMES_DB: Record<string, SchemeDetail> = {
    "pm-kisan": {
        id: "pm-kisan",
        name: "PM Kisan Samman Nidhi",
        ministry: "Ministry of Agriculture & Farmers Welfare",
        matchPercent: 95,
        eligibility: "eligible",
        category: "Farmer",
        tags: ["Agriculture", "Central", "Direct Transfer"],
        deadline: "2026-03-31",
        benefitSummary: "₹6,000/year in 3 installments directly to bank account for land-holding farmers.",
        maxBenefit: "₹6,000/year",
        portalUrl: "https://pmkisan.gov.in",
        conditions: [
            { label: "Indian Citizenship", status: "satisfied", detail: "Must be an Indian citizen", yourValue: "Indian", required: "Indian" },
            { label: "Land Ownership", status: "satisfied", detail: "Must own cultivable land", yourValue: "Yes", required: "Yes" },
            { label: "Annual Income < ₹2 Lakh", status: "satisfied", detail: "Family income below the threshold", yourValue: "₹2.5-5L", required: "< ₹2 Lakh" },
            { label: "Not a Govt. Employee", status: "satisfied", detail: "Should not be a government employee or pensioner", yourValue: "Student", required: "Non-Govt Employee" },
            { label: "Active KYC (Aadhaar Linked)", status: "satisfied", detail: "Aadhaar must be linked to bank account", yourValue: "Linked", required: "Yes" },
        ],
        documents: [
            { name: "Aadhaar Card", available: true, digilocker: true },
            { name: "Land Ownership Record", available: true, digilocker: false },
            { name: "Bank Passbook (Front Page)", available: true, digilocker: false },
            { name: "Passport Size Photo", available: false, digilocker: false },
        ],
        steps: [
            { step: 1, title: "Visit Official Portal", description: "Go to pmkisan.gov.in and click 'New Farmer Registration'", done: false },
            { step: 2, title: "Enter Aadhaar Number", description: "Verify identity with Aadhaar-linked mobile OTP", done: false },
            { step: 3, title: "Fill Land Details", description: "Enter khasra/khata number and land area details", done: false },
            { step: 4, title: "Upload Documents", description: "Upload land records, bank passbook, and photo", done: false },
            { step: 5, title: "Submit Application", description: "Review all details and submit before the deadline", done: false },
        ],
    },
    "national-scholarship": {
        id: "national-scholarship",
        name: "National Scholarship Portal (NSP)",
        ministry: "Ministry of Education",
        matchPercent: 92,
        eligibility: "eligible",
        category: "Scholarship",
        tags: ["Education", "Central", "Merit-cum-Means"],
        deadline: "2026-04-15",
        benefitSummary: "Merit-cum-means scholarship for students from minority communities and economically weaker sections.",
        maxBenefit: "₹50,000/year",
        portalUrl: "https://scholarships.gov.in",
        conditions: [
            { label: "Indian Citizen", status: "satisfied", detail: "Must be an Indian citizen", yourValue: "Indian", required: "Indian" },
            { label: "Currently Enrolled Student", status: "satisfied", detail: "Must be enrolled in recognized institution", yourValue: "Yes (Undergraduate)", required: "Enrolled" },
            { label: "Minimum 50% Marks", status: "satisfied", detail: "Previous exam marks >= 50%", yourValue: "82%", required: ">= 50%" },
            { label: "Family Income < ₹8 Lakh", status: "satisfied", detail: "Annual family income must be below ₹8 Lakh", yourValue: "₹2.5-5 Lakh", required: "< ₹8 Lakh" },
            { label: "Domicile Certificate", status: "missing", detail: "State domicile certificate may be required", yourValue: "Not uploaded", required: "Required" },
        ],
        documents: [
            { name: "Aadhaar Card", available: true, digilocker: true },
            { name: "10th Marksheet", available: true, digilocker: true },
            { name: "12th Marksheet", available: true, digilocker: true },
            { name: "Income Certificate", available: true, digilocker: false },
            { name: "Domicile Certificate", available: false, digilocker: false },
            { name: "Caste Certificate (if applicable)", available: true, digilocker: false },
            { name: "Current Year Admission Letter", available: false, digilocker: false },
        ],
        steps: [
            { step: 1, title: "Register on NSP", description: "Create account on scholarships.gov.in with mobile verification", done: false },
            { step: 2, title: "Complete Profile", description: "Fill academic, personal, and bank details", done: false },
            { step: 3, title: "Select Scholarship", description: "Choose the matching scholarship from available options", done: false },
            { step: 4, title: "Upload Documents", description: "Upload all required certificates and marksheets", done: false },
            { step: 5, title: "Institute Verification", description: "Get application verified by your institute nodal officer", done: false },
            { step: 6, title: "Submit & Track", description: "Submit final application and track status online", done: false },
        ],
    },
    "ayushman-bharat": {
        id: "ayushman-bharat",
        name: "Ayushman Bharat Yojana (PM-JAY)",
        ministry: "Ministry of Health & Family Welfare",
        matchPercent: 88,
        eligibility: "eligible",
        category: "Healthcare",
        tags: ["Healthcare", "Central", "Insurance"],
        deadline: null,
        benefitSummary: "Health insurance coverage of ₹5 lakh per family per year for secondary and tertiary hospitalization.",
        maxBenefit: "₹5,00,000/year",
        portalUrl: "https://pmjay.gov.in",
        conditions: [
            { label: "Indian Citizenship", status: "satisfied", detail: "Must be an Indian citizen", yourValue: "Indian", required: "Indian" },
            { label: "SECC Database Listed", status: "satisfied", detail: "Family must be in SECC-2011 database", yourValue: "Listed", required: "Listed" },
            { label: "No Other Insurance", status: "missing", detail: "Should not have existing government health insurance", yourValue: "Unknown", required: "No overlap" },
            { label: "BPL / Eligible Category", status: "satisfied", detail: "Belongs to identified vulnerable category", yourValue: "OBC", required: "SECC Category" },
        ],
        documents: [
            { name: "Aadhaar Card", available: true, digilocker: true },
            { name: "Ration Card", available: false, digilocker: false },
            { name: "Income Certificate", available: true, digilocker: false },
            { name: "Family ID / HH Number", available: false, digilocker: false },
        ],
        steps: [
            { step: 1, title: "Check Eligibility", description: "Visit pmjay.gov.in or call 14555 to check if your family is eligible", done: false },
            { step: 2, title: "Visit CSC / Hospital", description: "Go to nearest CSC center or empaneled hospital with Aadhaar", done: false },
            { step: 3, title: "Verify Identity", description: "Complete Aadhaar-based e-KYC verification", done: false },
            { step: 4, title: "Get e-Card", description: "Receive Ayushman Bharat e-card for cashless treatment", done: false },
        ],
    },
    "startup-india": {
        id: "startup-india",
        name: "Startup India Seed Fund Scheme",
        ministry: "Department for Promotion of Industry & Internal Trade",
        matchPercent: 82,
        eligibility: "partial",
        category: "Entrepreneurship",
        tags: ["Entrepreneurship", "Central", "Funding"],
        deadline: "2026-06-30",
        benefitSummary: "Financial assistance up to ₹50 lakh for proof of concept, prototype development, and market entry.",
        maxBenefit: "₹50,00,000",
        portalUrl: "https://seedfund.startupindia.gov.in",
        conditions: [
            { label: "DPIIT Recognized Startup", status: "not-satisfied", detail: "Must have DPIIT recognition number", yourValue: "Not registered", required: "DPIIT Cert" },
            { label: "Incorporated < 2 Years", status: "satisfied", detail: "Startup must be incorporated within last 2 years", yourValue: "Within range", required: "< 2 years" },
            { label: "Indian Citizen Founder", status: "satisfied", detail: "At least one founder must be Indian citizen", yourValue: "Indian", required: "Indian" },
            { label: "Not a Subsidiary", status: "satisfied", detail: "Should not be a subsidiary of existing company", yourValue: "Independent", required: "Not subsidiary" },
            { label: "Minimum Viable Product", status: "missing", detail: "Must have a working MVP or prototype", yourValue: "No data", required: "MVP ready" },
        ],
        documents: [
            { name: "DPIIT Recognition Certificate", available: false, digilocker: false },
            { name: "Certificate of Incorporation", available: false, digilocker: false },
            { name: "PAN Card of Startup", available: false, digilocker: false },
            { name: "Business Plan / Pitch Deck", available: false, digilocker: false },
            { name: "Bank Statement (6 months)", available: false, digilocker: false },
        ],
        steps: [
            { step: 1, title: "Register DPIIT", description: "Get DPIIT recognition on startupindia.gov.in", done: false },
            { step: 2, title: "Select Incubator", description: "Choose from SISFS-approved incubators", done: false },
            { step: 3, title: "Submit Application", description: "Apply through the selected incubator portal", done: false },
            { step: 4, title: "Pitch & Evaluation", description: "Present to expert committee for evaluation", done: false },
            { step: 5, title: "Receive Funding", description: "If approved, receive seed fund in tranches", done: false },
        ],
    },
};

const DEFAULT_SCHEME: SchemeDetail = {
    id: "unknown", name: "Scheme Details", ministry: "", matchPercent: 0,
    eligibility: "not-eligible", category: "", tags: [], deadline: null,
    benefitSummary: "", maxBenefit: "", portalUrl: "#",
    conditions: [], documents: [], steps: [],
};

// ─── NotifBadge ─────────────────────────────────────────────────────
function NotifBadge({ count }: { count: number }) {
    if (count === 0) return null;
    return (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-[#0a0a0a]">{count}</motion.span>
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
                <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                <motion.circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2, ease: "easeOut" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white">{percent}%</span>
                <span className="text-[9px] text-white/30">Match</span>
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
        <div className="flex items-start gap-3 py-3 border-b border-white/[0.03] last:border-0">
            <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", c.bg)}>
                <c.icon className={cn("w-3.5 h-3.5", c.color)} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/80">{condition.label}</p>
                <p className="text-[10px] text-white/25 mt-0.5">{condition.detail}</p>
                {(condition.yourValue || condition.required) && (
                    <div className="flex items-center gap-3 mt-1.5">
                        {condition.yourValue && <span className="text-[10px] text-white/35">Yours: <span className={cn("font-medium", c.color)}>{condition.yourValue}</span></span>}
                        {condition.required && <span className="text-[10px] text-white/20">Required: <span className="text-white/40">{condition.required}</span></span>}
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
    const scheme = SCHEMES_DB[schemeId] || { ...DEFAULT_SCHEME, id: schemeId, name: `Scheme ${schemeId}` };

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { id: "welcome", role: "ai", content: `Welcome! I'm your AI assistant for **${scheme.name}**. I can help you understand eligibility criteria, required documents, and application steps. What would you like to know?`, timestamp: new Date() },
    ]);
    const [chatInput, setChatInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [whatIfOpen, setWhatIfOpen] = useState(false);
    const [activePanel, setActivePanel] = useState<"eligibility" | "chat" | "execution">("eligibility");

    useEffect(() => { const token = localStorage.getItem("access_token"); if (!token) router.push("/"); }, [router]);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

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
        await new Promise((r) => setTimeout(r, 1200 + Math.random() * 1000));
        let aiContent = "";
        const q = content.toLowerCase();
        if (q.includes("not eligible") || q.includes("why")) {
            if (notSatisfied > 0 || missingCount > 0) {
                const issues = scheme.conditions.filter((c) => c.status !== "satisfied").map((c) => `• **${c.label}**: ${c.status === "not-satisfied" ? "Does not meet requirement" : "Data missing"} — ${c.detail}`).join("\n");
                aiContent = `Based on the eligibility analysis for **${scheme.name}**, here are the issues:\n\n${issues}\n\nTo improve your match, update your profile with accurate data or fulfill the requirements listed above.`;
            } else {
                aiContent = `Great news! You meet **all eligibility criteria** for ${scheme.name}. You can proceed with the application directly.`;
            }
        } else if (q.includes("document") || q.includes("docs")) {
            const docList = scheme.documents.map((d) => `${d.available ? "✅" : "❌"} ${d.name}${d.digilocker ? " *(DigiLocker available)*" : ""}`).join("\n");
            aiContent = `Here are the required documents for **${scheme.name}**:\n\n${docList}\n\n${docsMissing > 0 ? `You're missing **${docsMissing} document(s)**. Please arrange them before applying.` : "You have all required documents ready!"}`;
        } else if (q.includes("improve") || q.includes("eligib")) {
            const tips = scheme.conditions.filter((c) => c.status !== "satisfied").map((c) => `• **${c.label}**: ${c.status === "missing" ? "Please update this information in your profile" : "This condition is not met. " + c.detail}`).join("\n");
            aiContent = tips ? `Here's how you can improve your eligibility for **${scheme.name}**:\n\n${tips}\n\nUpdating your profile with accurate data can unlock more matches.` : `You already meet all conditions for **${scheme.name}**! Proceed with the application steps on the right panel.`;
        } else if (q.includes("deadline") || q.includes("when") || q.includes("last date")) {
            aiContent = scheme.deadline ? `The deadline for **${scheme.name}** is **${new Date(scheme.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}** (${daysLeft} days remaining). I recommend applying at least a week before.` : `**${scheme.name}** has **no fixed deadline** — applications are accepted on a rolling basis.`;
        } else if (q.includes("benefit") || q.includes("amount") || q.includes("how much")) {
            aiContent = `**${scheme.name}** offers:\n\n**Maximum Benefit:** ${scheme.maxBenefit}\n\n${scheme.benefitSummary}\n\nThe benefit is provided by the ${scheme.ministry}.`;
        } else if (q.includes("apply") || q.includes("how to") || q.includes("steps")) {
            const stepList = scheme.steps.map((s) => `**Step ${s.step}:** ${s.title}\n   ${s.description}`).join("\n\n");
            aiContent = `Here's the step-by-step application guide for **${scheme.name}**:\n\n${stepList}\n\nYou can track your progress using the checklist on the right panel.`;
        } else {
            aiContent = `I can help you with information about **${scheme.name}**. Try asking about:\n\n• Eligibility requirements\n• Required documents\n• How to apply\n• Benefits & amounts\n• Deadline information\n• How to improve your match`;
        }
        setChatMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "ai", content: aiContent, timestamp: new Date() }]);
        setIsTyping(false);
    };

    const quickActions = [
        { label: "Why am I not eligible?", icon: HelpCircle },
        { label: "What documents are required?", icon: FileText },
        { label: "How can I improve eligibility?", icon: Sparkles },
    ];

    const handleLogout = () => { localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token"); router.push("/"); };
    const toggleStep = (step: number) => { setCompletedSteps((prev) => { const n = new Set(prev); if (n.has(step)) n.delete(step); else n.add(step); return n; }); };
    const eligBadge = {
        eligible: { label: "Eligible", bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
        partial: { label: "Partial Match", bg: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
        "not-eligible": { label: "Not Eligible", bg: "bg-red-500/15 text-red-400 border-red-500/20" },
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            {/* ═══ SIDEBAR ═══ */}
            <AnimatePresence>{sidebarOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden" />)}</AnimatePresence>
            <aside className={cn("fixed top-0 left-0 h-screen w-[260px] bg-[#0e0e0e] border-r border-white/[0.06] flex flex-col z-50 transition-transform duration-300 lg:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
                <div className="p-6 pb-4 flex items-center gap-3">
                    <img src="/logo.png" alt="Eligify Logo" className="h-10 w-auto object-contain" />
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="mx-4 mb-4 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.12]">
                    <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" /><span className="text-xs font-semibold text-emerald-400">DigiLocker Connected</span></div>
                    <p className="text-[10px] text-white/30 mt-1">Documents verified & secure</p>
                </div>
                <div className="mx-4 border-t border-white/[0.04] mb-2" />
                <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon; const isActive = item.id === "explore"; return (
                            <button key={item.id} onClick={() => { router.push(item.href); setSidebarOpen(false); }} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative", isActive ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]")}>
                                {isActive && <motion.div layoutId="sidebarActive" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-400 rounded-r-full" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                                <div className="relative"><Icon className="w-[18px] h-[18px]" />{item.id === "notifications" && <NotifBadge count={2} />}</div>
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
            <main className="flex-1 lg:ml-[260px] min-h-screen flex flex-col">
                <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.04] px-4 lg:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/50 hover:text-white transition-colors"><Menu className="w-6 h-6" /></button>
                        <div className="flex items-center gap-1.5 text-xs">
                            <button onClick={() => router.push("/dashboard")} className="text-white/25 hover:text-white/50 transition-colors">Dashboard</button>
                            <ChevronRight className="w-3 h-3 text-white/15" />
                            <button onClick={() => router.push("/dashboard/explore")} className="text-white/25 hover:text-white/50 transition-colors">Explore</button>
                            <ChevronRight className="w-3 h-3 text-white/15" />
                            <span className="text-white/70 font-medium truncate max-w-[200px]">{scheme.name}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/explore")} className="border-white/[0.08] bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.06] text-xs h-8"><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/40 to-blue-500/40 flex items-center justify-center text-xs font-bold text-white/80 border border-white/[0.1]">R</div>
                    </div>
                </motion.header>

                {/* Scheme Header */}
                <div className="px-4 lg:px-6 py-4 border-b border-white/[0.04] bg-[#0a0a0a]">
                    <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold text-white truncate">{scheme.name}</h1>
                            <p className="text-xs text-white/25 mt-0.5">{scheme.ministry}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                            {scheme.tags.map((t) => (<span key={t} className="px-2 py-0.5 rounded-full bg-white/[0.04] text-[10px] text-white/40 border border-white/[0.04]">{t}</span>))}
                            <Badge className={cn("gap-1 font-semibold", eligBadge[scheme.eligibility].bg)}>
                                {scheme.eligibility === "eligible" ? <CheckCircle2 className="w-3 h-3" /> : scheme.eligibility === "partial" ? <AlertCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                {eligBadge[scheme.eligibility].label}
                            </Badge>
                            {daysLeft !== null && (<Badge className={cn("gap-1", daysLeft <= 30 ? "bg-red-500/15 text-red-400 border-red-500/20" : "bg-white/[0.06] text-white/50 border-white/[0.06]")}><Clock className="w-3 h-3" />{daysLeft}d left</Badge>)}
                        </div>
                    </div>
                </div>

                {/* Mobile Tab Switcher */}
                <div className="lg:hidden px-4 py-2 border-b border-white/[0.04] flex gap-1 bg-[#0a0a0a]">
                    {([{ key: "eligibility" as const, label: "Eligibility", icon: CheckCircle2 }, { key: "chat" as const, label: "AI Chat", icon: MessageCircle }, { key: "execution" as const, label: "Execution", icon: BookOpenCheck }]).map((panel) => (
                        <button key={panel.key} onClick={() => setActivePanel(panel.key)} className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all", activePanel === panel.key ? "bg-white/[0.08] text-white" : "text-white/30 hover:text-white/50")}>
                            <panel.icon className="w-3.5 h-3.5" />{panel.label}
                        </button>
                    ))}
                </div>

                {/* ═══ 3-COLUMN LAYOUT ═══ */}
                <div className="flex-1 flex overflow-hidden">
                    {/* LEFT: Eligibility */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className={cn("w-full lg:w-[340px] xl:w-[380px] lg:flex-shrink-0 border-r border-white/[0.04] flex flex-col bg-[#0a0a0a]", activePanel === "eligibility" ? "flex" : "hidden lg:flex")}>
                        <ScrollArea className="flex-1">
                            <div className="p-5 space-y-5">
                                <div className="flex items-center gap-4">
                                    <MatchRingLg percent={scheme.matchPercent} />
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center gap-2"><span className="flex items-center gap-1 text-xs"><CheckCircle2 className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400 font-medium">{satisfied}</span><span className="text-white/25">Satisfied</span></span></div>
                                        <div className="flex items-center gap-2"><span className="flex items-center gap-1 text-xs"><X className="w-3 h-3 text-red-400" /><span className="text-red-400 font-medium">{notSatisfied}</span><span className="text-white/25">Not Met</span></span></div>
                                        <div className="flex items-center gap-2"><span className="flex items-center gap-1 text-xs"><AlertCircle className="w-3 h-3 text-amber-400" /><span className="text-amber-400 font-medium">{missingCount}</span><span className="text-white/25">Missing</span></span></div>
                                    </div>
                                </div>
                                <Separator className="bg-white/[0.04]" />
                                <div>
                                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Conditions Breakdown</h3>
                                    <div className="space-y-0">{scheme.conditions.map((c, i) => (<ConditionRow key={i} condition={c} />))}</div>
                                </div>
                                <Separator className="bg-white/[0.04]" />
                                <div>
                                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Benefit</h3>
                                    <div className="p-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/[0.08]">
                                        <p className="text-sm font-semibold text-emerald-400">{scheme.maxBenefit}</p>
                                        <p className="text-[11px] text-white/30 mt-1 leading-relaxed">{scheme.benefitSummary}</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </motion.div>

                    {/* CENTER: AI Chat */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cn("flex-1 flex flex-col bg-[#080808] min-w-0", activePanel === "chat" ? "flex" : "hidden lg:flex")}>
                        <div className="px-5 py-3.5 border-b border-white/[0.04] flex items-center justify-between bg-[#0a0a0a]/50">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center"><Zap className="w-3.5 h-3.5 text-emerald-400" /></div>
                                <div>
                                    <p className="text-xs font-semibold text-white">Scheme Intelligence AI</p>
                                    <p className="text-[10px] text-white/20">Context: {scheme.name}</p>
                                </div>
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-400/70 border-emerald-500/15 text-[9px]"><CircleDot className="w-2.5 h-2.5 mr-0.5 animate-pulse" />Active</Badge>
                        </div>
                        <ScrollArea className="flex-1 px-5 py-4">
                            <div className="space-y-4 max-w-[600px] mx-auto">
                                {chatMessages.map((msg) => (
                                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                                        <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed", msg.role === "user" ? "bg-white/[0.08] text-white/80 rounded-br-md" : "bg-[#111111] border border-white/[0.04] text-white/60 rounded-bl-md")}>
                                            {msg.role === "ai" && (<div className="flex items-center gap-1.5 mb-2"><Zap className="w-3 h-3 text-emerald-400" /><span className="text-[10px] font-semibold text-emerald-400/70">Eligify AI</span></div>)}
                                            <div className="whitespace-pre-line">{msg.content}</div>
                                            <p className="text-[9px] text-white/15 mt-2 text-right">{msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                                        </div>
                                    </motion.div>
                                ))}
                                {isTyping && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                        <div className="bg-[#111111] border border-white/[0.04] rounded-2xl rounded-bl-md px-4 py-3">
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
                                    <Button key={a.label} variant="outline" size="sm" onClick={() => sendMessage(a.label)} className="border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white/70 hover:bg-white/[0.04] text-[11px] h-7 rounded-full">
                                        <a.icon className="w-3 h-3 mr-1" />{a.label}
                                    </Button>
                                ))}
                            </div>
                        )}
                        <div className="p-4 border-t border-white/[0.04] bg-[#0a0a0a]/50">
                            <div className="flex gap-2 max-w-[600px] mx-auto">
                                <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(chatInput)} placeholder={`Ask about ${scheme.name}...`} className="flex-1 bg-[#111111] border-white/[0.06] text-white placeholder:text-white/15 h-10 rounded-xl text-xs" />
                                <Button onClick={() => sendMessage(chatInput)} disabled={!chatInput.trim() || isTyping} size="icon" className="bg-emerald-500 hover:bg-emerald-600 text-white w-10 h-10 rounded-xl shrink-0 disabled:opacity-30"><Send className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT: Execution */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className={cn("w-full lg:w-[320px] xl:w-[360px] lg:flex-shrink-0 border-l border-white/[0.04] flex flex-col bg-[#0a0a0a]", activePanel === "execution" ? "flex" : "hidden lg:flex")}>
                        <ScrollArea className="flex-1">
                            <div className="p-5 space-y-5">
                                {/* Documents */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Required Documents</h3>
                                        <span className="text-[10px] text-white/25">{docsAvailable}/{scheme.documents.length} ready</span>
                                    </div>
                                    <Progress value={(docsAvailable / Math.max(scheme.documents.length, 1)) * 100} className="h-1.5 mb-3 bg-white/[0.04] [&>[data-slot=progress-indicator]]:bg-emerald-500" />
                                    <div className="space-y-1.5">
                                        {scheme.documents.map((doc, i) => (
                                            <div key={i} className={cn("flex items-center gap-2.5 p-2.5 rounded-lg transition-colors", doc.available ? "bg-emerald-500/[0.03] border border-emerald-500/[0.06]" : "bg-red-500/[0.03] border border-red-500/[0.06]")}>
                                                {doc.available ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                                                <span className="text-[11px] text-white/60 flex-1 min-w-0 truncate">{doc.name}</span>
                                                {doc.digilocker && <span className="text-[9px] text-emerald-400/60 bg-emerald-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">DigiLocker</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Separator className="bg-white/[0.04]" />
                                {/* Steps */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Application Steps</h3>
                                        <span className="text-[10px] text-white/25">{completedSteps.size}/{scheme.steps.length}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {scheme.steps.map((step) => {
                                            const isDone = completedSteps.has(step.step); return (
                                                <button key={step.step} onClick={() => toggleStep(step.step)} className={cn("w-full text-left p-3 rounded-xl border transition-all group/step", isDone ? "bg-emerald-500/[0.04] border-emerald-500/[0.1]" : "bg-white/[0.01] border-white/[0.04] hover:border-white/[0.08]")}>
                                                    <div className="flex items-start gap-2.5">
                                                        <div className={cn("w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors", isDone ? "bg-emerald-500 text-white" : "bg-white/[0.04] text-white/25 group-hover/step:bg-white/[0.08]")}>
                                                            {isDone ? <Check className="w-3 h-3" /> : <span className="text-[10px] font-bold">{step.step}</span>}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={cn("text-xs font-medium", isDone ? "text-emerald-400/80 line-through" : "text-white/70")}>{step.title}</p>
                                                            <p className="text-[10px] text-white/20 mt-0.5 leading-relaxed">{step.description}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <Separator className="bg-white/[0.04]" />
                                {/* Official Portal */}
                                <div>
                                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Apply Now</h3>
                                    <a href={scheme.portalUrl} target="_blank" rel="noopener noreferrer" className="block">
                                        <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold border-0 shadow-lg shadow-emerald-500/20 h-10 text-xs gap-2">
                                            <Globe className="w-4 h-4" />Open Official Portal<ExternalLink className="w-3 h-3" />
                                        </Button>
                                    </a>
                                    <p className="text-center text-[10px] text-white/15 mt-2">Opens {scheme.portalUrl.replace("https://", "")}</p>
                                </div>
                                <Separator className="bg-white/[0.04]" />
                                {/* What-If */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">What-If Simulation</h3>
                                        <Switch checked={whatIfOpen} onCheckedChange={setWhatIfOpen} />
                                    </div>
                                    <AnimatePresence>
                                        {whatIfOpen && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                <div className="p-3 rounded-xl bg-blue-500/[0.04] border border-blue-500/[0.08] space-y-3">
                                                    <p className="text-[10px] text-blue-300/60 leading-relaxed">Test how changing your profile data affects eligibility.</p>
                                                    <div className="space-y-2">
                                                        <div><Label className="text-[10px] text-white/30">Modified Income</Label><Input placeholder="e.g. ₹2,00,000" className="bg-white/[0.03] border-white/[0.06] text-white h-8 text-xs mt-1" /></div>
                                                        <div><Label className="text-[10px] text-white/30">Modified Marks %</Label><Input placeholder="e.g. 85" className="bg-white/[0.03] border-white/[0.06] text-white h-8 text-xs mt-1" /></div>
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
            </main>
        </div>
    );
}
