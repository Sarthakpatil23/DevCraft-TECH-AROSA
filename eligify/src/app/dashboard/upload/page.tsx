"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
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
    FileText,
    AlertCircle,
    AlertTriangle,
    UploadCloud,
    File,
    Trash2,
    Sparkles,
    ScanSearch,
    Brain,
    UserCheck,
    ArrowRight,
    RotateCcw,
    Lock,
    Eye,
    Save,
    Tag,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

// ─── Sidebar Items ──────────────────────────────────────────────────
const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard", href: "/dashboard" },
    { icon: User, label: "Profile", id: "profile", href: "/dashboard/profile" },
    { icon: Search, label: "Explore Schemes", id: "explore", href: "/dashboard/explore" },
    { icon: Upload, label: "Upload Scheme", id: "upload", href: "/dashboard/upload" },
    { icon: ClipboardList, label: "My Evaluations", id: "evaluations", href: "/dashboard" },
    { icon: FileCheck, label: "Get Your Docs", id: "docs", href: "/dashboard" },
    { icon: BookOpen, label: "Resources", id: "resources", href: "/dashboard" },
    { icon: Bell, label: "Notifications", id: "notifications", href: "/dashboard" },
];

// ─── Processing Steps ───────────────────────────────────────────────
interface ProcessingStep {
    id: number;
    title: string;
    description: string;
    icon: React.ElementType;
    duration: number; // ms
}

const PROCESSING_STEPS: ProcessingStep[] = [
    {
        id: 1,
        title: "Extracting Scheme Text",
        description: "Reading and parsing the uploaded document...",
        icon: ScanSearch,
        duration: 2800,
    },
    {
        id: 2,
        title: "Identifying Eligibility Rules",
        description: "Detecting conditions, criteria, and requirements...",
        icon: Brain,
        duration: 3200,
    },
    {
        id: 3,
        title: "Evaluating Against Your Profile",
        description: "Matching your profile data to scheme criteria...",
        icon: UserCheck,
        duration: 2500,
    },
];

// ─── Types ──────────────────────────────────────────────────────────
type PageState = "upload" | "preview" | "processing" | "error" | "complete";

// ─── NotifBadge ─────────────────────────────────────────────────────
function NotifBadge({ count }: { count: number }) {
    if (count === 0) return null;
    return (
        <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-[#0a0a0a]"
        >
            {count}
        </motion.span>
    );
}

// ─── Step Indicator ─────────────────────────────────────────────────
function StepIndicator({
    step,
    currentStep,
    isComplete,
}: {
    step: ProcessingStep;
    currentStep: number;
    isComplete: boolean;
}) {
    const isActive = step.id === currentStep;
    const isDone = step.id < currentStep || isComplete;
    const isPending = step.id > currentStep;
    const Icon = step.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: step.id * 0.15 }}
            className={cn(
                "flex items-start gap-4 p-4 rounded-xl border transition-all duration-500",
                isDone
                    ? "bg-emerald-500/[0.04] border-emerald-500/[0.1]"
                    : isActive
                        ? "bg-white/[0.03] border-white/[0.08] shadow-lg shadow-black/20"
                        : "bg-transparent border-white/[0.03] opacity-40"
            )}
        >
            {/* Icon */}
            <div
                className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-500",
                    isDone
                        ? "bg-emerald-500/15"
                        : isActive
                            ? "bg-white/[0.06]"
                            : "bg-white/[0.02]"
                )}
            >
                {isDone ? (
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </motion.div>
                ) : isActive ? (
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <Icon className="w-5 h-5 text-white/70" />
                    </motion.div>
                ) : (
                    <Icon className="w-5 h-5 text-white/20" />
                )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p
                    className={cn(
                        "text-sm font-medium transition-colors duration-500",
                        isDone
                            ? "text-emerald-400"
                            : isActive
                                ? "text-white"
                                : "text-white/30"
                    )}
                >
                    {step.title}
                </p>
                <p
                    className={cn(
                        "text-xs mt-0.5 transition-colors duration-500",
                        isDone
                            ? "text-emerald-400/50"
                            : isActive
                                ? "text-white/40"
                                : "text-white/15"
                    )}
                >
                    {isDone ? "Completed" : step.description}
                </p>

                {/* Active progress bar */}
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3"
                    >
                        <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-white/30 to-white/10 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: step.duration / 1000, ease: "easeInOut" }}
                            />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Step number */}
            <span
                className={cn(
                    "text-[10px] font-bold flex-shrink-0 mt-1",
                    isDone
                        ? "text-emerald-400/40"
                        : isActive
                            ? "text-white/30"
                            : "text-white/10"
                )}
            >
                {step.id}/3
            </span>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// UPLOAD CUSTOM SCHEME PAGE
// ═══════════════════════════════════════════════════════════════════
export default function UploadSchemePage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const profileCompletion = 80;

    // ── State ─────────────────────────────────────────────────────────
    const [pageState, setPageState] = useState<PageState>("upload");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [extractedName, setExtractedName] = useState("");
    const [editedName, setEditedName] = useState("");
    const [saveToEvaluations, setSaveToEvaluations] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) router.push("/");
    }, [router]);

    // ── File Handlers ─────────────────────────────────────────────────
    const validateFile = (file: File): string | null => {
        if (file.type !== "application/pdf") {
            return "Only PDF files are supported. Please upload a valid PDF document.";
        }
        if (file.size > 10 * 1024 * 1024) {
            return "File size exceeds 10 MB. Please upload a smaller document.";
        }
        return null;
    };

    const handleFileSelect = useCallback((file: File) => {
        const error = validateFile(file);
        if (error) {
            setErrorMessage(error);
            setPageState("error");
            return;
        }
        setUploadedFile(file);
        // Simulate extracting scheme name from filename
        const name = file.name
            .replace(/\.pdf$/i, "")
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
        setExtractedName(name);
        setEditedName(name);
        setPageState("preview");
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFileSelect(file);
        },
        [handleFileSelect]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
        },
        [handleFileSelect]
    );

    const removeFile = () => {
        setUploadedFile(null);
        setExtractedName("");
        setEditedName("");
        setPageState("upload");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ── Processing ────────────────────────────────────────────────────
    const startAnalysis = async () => {
        setPageState("processing");
        setCurrentStep(1);

        for (let i = 0; i < PROCESSING_STEPS.length; i++) {
            setCurrentStep(PROCESSING_STEPS[i].id);
            await new Promise((r) => setTimeout(r, PROCESSING_STEPS[i].duration));
        }

        // Simulate completion
        setCurrentStep(PROCESSING_STEPS.length + 1);
        setPageState("complete");

        // Short delay then redirect
        await new Promise((r) => setTimeout(r, 1200));

        // Redirect to a scheme intelligence page (simulate with a custom ID)
        const customId = editedName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        router.push(`/dashboard/explore/pm-kisan`); // Demo: redirect to an existing scheme
    };

    const retryUpload = () => {
        setUploadedFile(null);
        setExtractedName("");
        setEditedName("");
        setErrorMessage("");
        setCurrentStep(0);
        setPageState("upload");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/");
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            {/* ═══ SIDEBAR ═══ */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <aside
                className={cn(
                    "fixed top-0 left-0 h-screen w-[260px] bg-[#0e0e0e] border-r border-white/[0.06] flex flex-col z-50 transition-transform duration-300 lg:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-6 pb-4 flex items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="Eligify Logo"
                        className="h-10 w-auto object-contain"
                    />
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden ml-auto text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mx-4 mb-4 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.12]">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-400">
                            DigiLocker Connected
                        </span>
                    </div>
                    <p className="text-[10px] text-white/30 mt-1">
                        Documents verified & secure
                    </p>
                </div>

                <div className="mx-4 border-t border-white/[0.04] mb-2" />

                <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.id === "upload";
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
                                        ? "bg-white/[0.08] text-white"
                                        : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebarActive"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-400 rounded-r-full"
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30,
                                        }}
                                    />
                                )}
                                <div className="relative">
                                    <Icon className="w-[18px] h-[18px]" />
                                    {item.id === "notifications" && <NotifBadge count={2} />}
                                </div>
                                {item.label}
                                {item.id === "profile" && (
                                    <span className="ml-auto text-[10px] font-bold bg-white/[0.06] px-2 py-0.5 rounded-full text-white/50">
                                        {profileCompletion}%
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/[0.04]">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/[0.06] transition-all"
                    >
                        <LogOut className="w-[18px] h-[18px]" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* ═══ MAIN ═══ */}
            <main className="flex-1 lg:ml-[260px] min-h-screen">
                {/* Top Bar */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.04] px-4 lg:px-8 py-4 flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-white/50 hover:text-white transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="text-white/30 hover:text-white/60 text-sm transition-colors"
                            >
                                Dashboard
                            </button>
                            <ChevronRight className="w-3.5 h-3.5 text-white/15" />
                            <span className="text-sm text-white font-medium">
                                Upload Scheme
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/dashboard")}
                            className="border-white/[0.08] bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.06] text-xs"
                        >
                            <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
                            Dashboard
                        </Button>
                        <div className="flex items-center gap-3 pl-3 border-l border-white/[0.06]">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/40 to-blue-500/40 flex items-center justify-center text-sm font-bold text-white/80 border border-white/[0.1]">
                                R
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-semibold text-white leading-none">
                                    Rohit Sharma
                                </p>
                                <p className="text-[10px] text-emerald-400/80 flex items-center gap-1 mt-0.5">
                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.header>

                {/* Content */}
                <div className="px-4 lg:px-8 py-8 max-w-[680px] mx-auto relative">
                    {/* Ambient background */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/[0.012] rounded-full blur-[180px] pointer-events-none" />

                    {/* ── Header ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-10 relative z-10"
                    >
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-5">
                            <Upload className="w-6 h-6 text-white/50" />
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-white">
                            Upload Custom Scheme
                        </h1>
                        <p className="text-sm text-white/35 mt-2 max-w-md mx-auto leading-relaxed">
                            Upload any scheme PDF to check your eligibility instantly.
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <Lock className="w-3 h-3 text-white/15" />
                            <p className="text-[11px] text-white/20">
                                We analyze only eligibility criteria. Your documents are
                                processed securely.
                            </p>
                        </div>
                    </motion.div>

                    {/* ════════════════════════════════════════════════════════════ */}
                    {/* STATE: UPLOAD */}
                    {/* ════════════════════════════════════════════════════════════ */}
                    <AnimatePresence mode="wait">
                        {pageState === "upload" && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="relative z-10"
                            >
                                {/* Drop Zone */}
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 group overflow-hidden",
                                        isDragOver
                                            ? "border-emerald-400/40 bg-emerald-500/[0.04] scale-[1.01]"
                                            : "border-white/[0.08] bg-[#111111] hover:border-white/[0.15] hover:bg-[#131313]"
                                    )}
                                >
                                    {/* Glow on drag */}
                                    {isDragOver && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.03] to-transparent pointer-events-none"
                                        />
                                    )}

                                    <div className="relative py-16 px-8 flex flex-col items-center">
                                        {/* Icon */}
                                        <motion.div
                                            animate={
                                                isDragOver
                                                    ? { y: -8, scale: 1.1 }
                                                    : { y: 0, scale: 1 }
                                            }
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            className={cn(
                                                "w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300",
                                                isDragOver
                                                    ? "bg-emerald-500/15"
                                                    : "bg-white/[0.04] group-hover:bg-white/[0.06]"
                                            )}
                                        >
                                            <UploadCloud
                                                className={cn(
                                                    "w-7 h-7 transition-colors duration-300",
                                                    isDragOver
                                                        ? "text-emerald-400"
                                                        : "text-white/30 group-hover:text-white/50"
                                                )}
                                            />
                                        </motion.div>

                                        {/* Text */}
                                        <p className="text-sm font-medium text-white/70 mb-1">
                                            {isDragOver
                                                ? "Drop your PDF here"
                                                : "Drag & Drop PDF Here"}
                                        </p>
                                        <p className="text-xs text-white/25 mb-5">
                                            or click to browse from your computer
                                        </p>

                                        {/* Specs */}
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5 text-[10px] text-white/20">
                                                <FileText className="w-3 h-3" />
                                                PDF format only
                                            </span>
                                            <span className="w-px h-3 bg-white/[0.06]" />
                                            <span className="flex items-center gap-1.5 text-[10px] text-white/20">
                                                <Upload className="w-3 h-3" />
                                                Max 10 MB
                                            </span>
                                        </div>
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={handleInputChange}
                                        className="hidden"
                                    />
                                </div>

                                {/* Trust indicators */}
                                <div className="mt-6 flex items-center justify-center gap-6">
                                    {[
                                        { icon: Lock, text: "Encrypted upload" },
                                        { icon: Eye, text: "Privacy first" },
                                        { icon: Trash2, text: "Auto-deleted after analysis" },
                                    ].map((item) => (
                                        <span
                                            key={item.text}
                                            className="flex items-center gap-1.5 text-[10px] text-white/15"
                                        >
                                            <item.icon className="w-3 h-3" />
                                            {item.text}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ════════════════════════════════════════════════════════════ */}
                        {/* STATE: PREVIEW (File selected, before analysis) */}
                        {/* ════════════════════════════════════════════════════════════ */}
                        {pageState === "preview" && uploadedFile && (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="relative z-10 space-y-6"
                            >
                                {/* File Card */}
                                <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5">
                                    <div className="flex items-start gap-4">
                                        {/* File Icon */}
                                        <div className="w-12 h-12 rounded-xl bg-red-500/[0.08] border border-red-500/[0.12] flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-5 h-5 text-red-400" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">
                                                {uploadedFile.name}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[11px] text-white/25">
                                                    {formatFileSize(uploadedFile.size)}
                                                </span>
                                                <span className="text-[11px] text-white/25">•</span>
                                                <span className="text-[11px] text-white/25">PDF</span>
                                                <Badge className="bg-emerald-500/10 text-emerald-400/70 border-emerald-500/15 text-[9px] gap-1">
                                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                                    Valid
                                                </Badge>
                                            </div>
                                        </div>

                                        <button
                                            onClick={removeFile}
                                            className="text-white/20 hover:text-red-400 transition-colors p-1.5 -m-1.5 rounded-lg hover:bg-red-500/[0.06]"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Scheme Name Preview */}
                                <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-white/30" />
                                        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                                            Detected Scheme Name
                                        </h3>
                                    </div>

                                    <div>
                                        <Label className="text-[11px] text-white/25 mb-1.5 block">
                                            You can edit this before analysis
                                        </Label>
                                        <Input
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            className="bg-white/[0.03] border-white/[0.06] text-white h-10 text-sm focus-visible:border-white/[0.15]"
                                            placeholder="Enter scheme name..."
                                        />
                                    </div>

                                    {/* Save option */}
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-2">
                                            <Save className="w-3.5 h-3.5 text-white/20" />
                                            <span className="text-xs text-white/30">
                                                Save to My Evaluations
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setSaveToEvaluations(!saveToEvaluations)}
                                            className={cn(
                                                "w-8 h-5 rounded-full transition-colors flex items-center px-0.5",
                                                saveToEvaluations
                                                    ? "bg-emerald-500 justify-end"
                                                    : "bg-white/[0.08] justify-start"
                                            )}
                                        >
                                            <motion.div
                                                layout
                                                className="w-4 h-4 bg-white rounded-full shadow-sm"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 500,
                                                    damping: 30,
                                                }}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* User Uploaded Badge Info */}
                                <div className="flex items-center justify-center gap-2">
                                    <Badge className="bg-blue-500/10 text-blue-400/70 border-blue-500/15 text-[10px] gap-1">
                                        <Upload className="w-3 h-3" />
                                        Will be tagged as &quot;User Uploaded&quot;
                                    </Badge>
                                </div>

                                {/* Analyze Button */}
                                <Button
                                    onClick={startAnalysis}
                                    disabled={!editedName.trim()}
                                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold border-0 shadow-lg shadow-emerald-500/20 text-sm gap-2 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Analyze Eligibility
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </motion.div>
                        )}

                        {/* ════════════════════════════════════════════════════════════ */}
                        {/* STATE: PROCESSING */}
                        {/* ════════════════════════════════════════════════════════════ */}
                        {(pageState === "processing" || pageState === "complete") && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="relative z-10 space-y-5"
                            >
                                {/* File being processed */}
                                <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-4 h-4 text-white/30" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-white/60 truncate">
                                            {uploadedFile?.name}
                                        </p>
                                        <p className="text-[10px] text-white/20 mt-0.5">
                                            Analyzing as &quot;{editedName}&quot;
                                        </p>
                                    </div>
                                    {pageState === "complete" && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 20,
                                            }}
                                        >
                                            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 gap-1 text-[10px]">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Complete
                                            </Badge>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Processing Steps */}
                                <div className="space-y-3">
                                    {PROCESSING_STEPS.map((step) => (
                                        <StepIndicator
                                            key={step.id}
                                            step={step}
                                            currentStep={currentStep}
                                            isComplete={pageState === "complete"}
                                        />
                                    ))}
                                </div>

                                {/* Overall Progress */}
                                <div className="pt-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] text-white/25">
                                            {pageState === "complete"
                                                ? "Analysis complete"
                                                : "Processing..."}
                                        </span>
                                        <span className="text-[11px] text-white/25">
                                            {pageState === "complete"
                                                ? "100%"
                                                : `${Math.round(
                                                    ((currentStep - 1) / PROCESSING_STEPS.length) * 100
                                                )}%`}
                                        </span>
                                    </div>
                                    <Progress
                                        value={
                                            pageState === "complete"
                                                ? 100
                                                : ((currentStep - 1) / PROCESSING_STEPS.length) * 100
                                        }
                                        className="h-1.5 bg-white/[0.04] [&>[data-slot=progress-indicator]]:bg-emerald-500 [&>[data-slot=progress-indicator]]:transition-all [&>[data-slot=progress-indicator]]:duration-700"
                                    />
                                </div>

                                {/* Redirecting message */}
                                {pageState === "complete" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center pt-4"
                                    >
                                        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.1]">
                                            <motion.div
                                                animate={{ x: [0, 4, 0] }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 1,
                                                    ease: "easeInOut",
                                                }}
                                            >
                                                <ArrowRight className="w-4 h-4 text-emerald-400" />
                                            </motion.div>
                                            <span className="text-xs font-medium text-emerald-400">
                                                Redirecting to Scheme Intelligence...
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {/* ════════════════════════════════════════════════════════════ */}
                        {/* STATE: ERROR */}
                        {/* ════════════════════════════════════════════════════════════ */}
                        {pageState === "error" && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="relative z-10"
                            >
                                <div className="bg-[#111111] border border-red-500/[0.1] rounded-2xl p-8 text-center">
                                    {/* Error Icon */}
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/[0.08] border border-red-500/[0.12] mb-5">
                                        <AlertTriangle className="w-6 h-6 text-red-400" />
                                    </div>

                                    <h3 className="text-base font-semibold text-white mb-2">
                                        Could Not Process Document
                                    </h3>
                                    <p className="text-sm text-white/35 max-w-sm mx-auto leading-relaxed mb-6">
                                        {errorMessage ||
                                            "Could not detect eligibility criteria clearly. Please ensure the document contains structured eligibility rules."}
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                        <Button
                                            onClick={retryUpload}
                                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold border-0 shadow-lg shadow-emerald-500/20 h-10 text-sm gap-2 px-6"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Retry Upload
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => router.push("/dashboard/explore")}
                                            className="border-white/[0.08] bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.06] h-10 text-sm gap-2 px-6"
                                        >
                                            <Search className="w-4 h-4" />
                                            Browse Schemes
                                        </Button>
                                    </div>

                                    {/* Tips */}
                                    <div className="mt-8 pt-6 border-t border-white/[0.04]">
                                        <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider mb-3">
                                            Tips for best results
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                                            {[
                                                {
                                                    title: "Clear formatting",
                                                    desc: "Use scheme PDFs with structured text, not scanned images",
                                                },
                                                {
                                                    title: "Eligibility section",
                                                    desc: "Ensure the document contains a clear eligibility criteria section",
                                                },
                                                {
                                                    title: "Official documents",
                                                    desc: "Use official government or institutional scheme documents",
                                                },
                                            ].map((tip) => (
                                                <div
                                                    key={tip.title}
                                                    className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.03]"
                                                >
                                                    <p className="text-[11px] font-medium text-white/40">
                                                        {tip.title}
                                                    </p>
                                                    <p className="text-[10px] text-white/20 mt-0.5 leading-relaxed">
                                                        {tip.desc}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── How It Works (visible only on upload state) ── */}
                    {pageState === "upload" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-12 relative z-10"
                        >
                            <Separator className="bg-white/[0.04] mb-8" />

                            <h3 className="text-xs font-semibold text-white/25 uppercase tracking-wider text-center mb-6">
                                How It Works
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                {[
                                    {
                                        step: "1",
                                        icon: UploadCloud,
                                        title: "Upload PDF",
                                        desc: "Drop your scheme document",
                                    },
                                    {
                                        step: "2",
                                        icon: ScanSearch,
                                        title: "Extract Rules",
                                        desc: "We identify eligibility criteria",
                                    },
                                    {
                                        step: "3",
                                        icon: Brain,
                                        title: "Analyze",
                                        desc: "Match against your profile",
                                    },
                                    {
                                        step: "4",
                                        icon: CheckCircle2,
                                        title: "Results",
                                        desc: "Get your eligibility breakdown",
                                    },
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.step}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                        className="text-center group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.04] flex items-center justify-center mx-auto mb-3 group-hover:bg-white/[0.05] transition-colors">
                                            <item.icon className="w-4 h-4 text-white/25 group-hover:text-white/40 transition-colors" />
                                        </div>
                                        <p className="text-xs font-medium text-white/50 mb-0.5">
                                            {item.title}
                                        </p>
                                        <p className="text-[10px] text-white/20">{item.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center py-10 border-t border-white/[0.04] mt-12 relative z-10"
                    >
                        <p className="text-xs text-white/15">
                            © 2026 Eligify · AI-Powered Policy Decision Engine
                        </p>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
