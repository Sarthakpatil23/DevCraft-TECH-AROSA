"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLanguage } from "@/context/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// Create an axios instance with auto-refresh interceptor
const api = axios.create();

// Always inject the latest token from localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("refresh_token");
            if (refreshToken) {
                try {
                    const { data } = await axios.post("http://127.0.0.1:8000/api/auth/token/refresh/", {
                        refresh: refreshToken,
                    });
                    localStorage.setItem("access_token", data.access);
                    if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
                    originalRequest.headers.Authorization = `Bearer ${data.access}`;
                    return api(originalRequest);
                } catch {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    window.location.href = "/";
                }
            } else {
                localStorage.removeItem("access_token");
                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);

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
    FolderOpen,
    Plus,
    Trash2,
    Download,
    MoreVertical,
    Filter,
    CloudUpload,
    File,
    FileImage,
    FileSpreadsheet,
    Eye,
    Pencil,
    AlertTriangle,
    HardDrive,
    FolderLock,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
interface DocumentItem {
    id: number;
    name: string;
    category: string;
    file: string;
    file_size: number;
    file_type: string;
    notes: string | null;
    uploaded_at: string;
    updated_at: string;
}

const CATEGORIES = [
    { value: "identity", label: "Identity", icon: User },
    { value: "education", label: "Education", icon: FileText },
    { value: "income", label: "Income & Financial", icon: FileSpreadsheet },
    { value: "property", label: "Property & Land", icon: HardDrive },
    { value: "certificates", label: "Certificates", icon: CheckCircle2 },
    { value: "other", label: "Other", icon: File },
];

// ─── Helpers ────────────────────────────────────────────────────────
function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function getFileIcon(fileType: string) {
    if (fileType.includes("image")) return FileImage;
    if (fileType.includes("spreadsheet") || fileType.includes("excel") || fileType.includes("csv"))
        return FileSpreadsheet;
    return FileText;
}

function getCategoryLabel(value: string): string {
    return CATEGORIES.find((c) => c.value === value)?.label || "Other";
}

function getCategoryColor(value: string): string {
    const colors: Record<string, string> = {
        identity: "text-blue-400 bg-blue-400/10 border-blue-400/20",
        education: "text-violet-400 bg-violet-400/10 border-violet-400/20",
        income: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
        property: "text-amber-400 bg-amber-400/10 border-amber-400/20",
        certificates: "text-teal-400 bg-teal-400/10 border-teal-400/20",
        other: "text-gray-400 bg-gray-400/10 border-gray-400/20",
    };
    return colors[value] || colors.other;
}

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

const API_BASE = "http://127.0.0.1:8000/api/auth";

// ═══════════════════════════════════════════════════════════════════
// DOCUMENT VAULT PAGE
// ═══════════════════════════════════════════════════════════════════
export default function DocumentVaultPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Data
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState<string>("all");

    // Upload dialog
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadName, setUploadName] = useState("");
    const [uploadCategory, setUploadCategory] = useState("other");
    const [uploadNotes, setUploadNotes] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Delete dialog
    const [deleteTarget, setDeleteTarget] = useState<DocumentItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Rename dialog
    const [renameTarget, setRenameTarget] = useState<DocumentItem | null>(null);
    const [renameName, setRenameName] = useState("");
    const [renaming, setRenaming] = useState(false);

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [userName, setUserName] = useState("");

    const getToken = () => localStorage.getItem("access_token");

    // ── Fetch documents ───────────────────────────────────────────────
    const fetchDocuments = useCallback(async () => {
        try {
            const token = getToken();
            if (!token) return;
            const res = await api.get(`${API_BASE}/documents/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDocuments(res.data);
        } catch (err) {
            console.error("Failed to fetch documents:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = getToken();
        if (!token) { router.push("/"); return; }
        fetch("http://127.0.0.1:8000/api/auth/profile/", { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(d => { const u = d.user; setUserName(u?.first_name ? `${u.first_name}${u.last_name ? ' ' + u.last_name : ''}` : u?.email || ""); }).catch(() => {});
        fetchDocuments();
    }, [router, fetchDocuments]);

    // ── Upload ────────────────────────────────────────────────────────
    const handleUpload = async () => {
        if (!uploadFile) return;
        setUploading(true);
        setUploadProgress(0);
        setUploadError(null);

        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("name", uploadName || uploadFile.name);
        formData.append("category", uploadCategory);
        if (uploadNotes) formData.append("notes", uploadNotes);

        try {
            await api.post(`${API_BASE}/documents/`, formData, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
                onUploadProgress: (e) => {
                    if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
                },
            });
            setUploadOpen(false);
            resetUploadForm();
            setSuccessMsg("Document uploaded successfully!");
            setTimeout(() => setSuccessMsg(null), 3000);
            fetchDocuments();
        } catch (err: any) {
            console.error("Upload failed:", err);
            const msg = err?.response?.data?.error || err?.response?.data?.detail || err?.message || "Upload failed. Please try again.";
            setUploadError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setUploading(false);
        }
    };

    const resetUploadForm = () => {
        setUploadFile(null);
        setUploadName("");
        setUploadCategory("other");
        setUploadNotes("");
        setUploadProgress(0);
        setUploadError(null);
    };

    // ── Delete ────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`${API_BASE}/documents/${deleteTarget.id}/`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) {
            console.error("Delete failed:", err);
        } finally {
            setDeleting(false);
        }
    };

    // ── Rename ────────────────────────────────────────────────────────
    const handleRename = async () => {
        if (!renameTarget || !renameName.trim()) return;
        setRenaming(true);
        try {
            await api.patch(
                `${API_BASE}/documents/${renameTarget.id}/`,
                { name: renameName.trim() },
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );
            setDocuments((prev) =>
                prev.map((d) => (d.id === renameTarget.id ? { ...d, name: renameName.trim() } : d))
            );
            setRenameTarget(null);
        } catch (err) {
            console.error("Rename failed:", err);
        } finally {
            setRenaming(false);
        }
    };

    // ── Download ──────────────────────────────────────────────────────
    const handleDownload = async (doc: DocumentItem) => {
        try {
            const res = await api.get(`${API_BASE}/documents/${doc.id}/download/`, {
                headers: { Authorization: `Bearer ${getToken()}` },
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = doc.name;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);
        }
    };

    // ── Drag & Drop ───────────────────────────────────────────────────
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            setUploadFile(file);
            setUploadName(file.name.replace(/\.[^.]+$/, ""));
            setUploadOpen(true);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadFile(file);
            setUploadName(file.name.replace(/\.[^.]+$/, ""));
            setUploadOpen(true);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/");
    };

    // ── Filtered docs ─────────────────────────────────────────────────
    const filteredDocs = filterCategory === "all"
        ? documents
        : documents.filter((d) => d.category === filterCategory);

    const totalSize = documents.reduce((s, d) => s + d.file_size, 0);

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
                        const isActive = item.id === "vault";
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
                            <span className="text-sm text-[var(--text-primary)] font-medium">{t("sidebar.vault")}</span>
                        </div>
                    </div>
                    <LanguageSwitcher compact />
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => { setUploadOpen(true); resetUploadForm(); }}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold border-0 shadow-lg shadow-emerald-500/20 h-9 text-xs gap-1.5"
                        >
                            <Plus className="w-4 h-4" />{t("vault.upload")}
                        </Button>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/40 to-blue-500/40 flex items-center justify-center text-sm font-bold text-[var(--text-80)] border border-[var(--border-10)]">{userName ? userName.charAt(0).toUpperCase() : "?"}</div>
                    </div>
                </motion.header>

                <div className="px-4 lg:px-8 py-8 max-w-[1100px] mx-auto">
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-[var(--surface-4)] border border-[var(--border-6)] flex items-center justify-center">
                                <FolderLock className="w-5 h-5 text-[var(--text-40)]" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t("sidebar.vault")}</h1>
                                <p className="text-sm text-[var(--text-30)]">{t("vault.subtitle")}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Row */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
                    >
                        {[
                            { label: t("vault.stats.total_docs"), value: documents.length.toString(), icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10" },
                            { label: t("vault.stats.categories_used"), value: new Set(documents.map((d) => d.category)).size.toString(), icon: FolderOpen, color: "text-violet-400", bg: "bg-violet-400/10" },
                            { label: t("vault.stats.storage_used"), value: formatFileSize(totalSize), icon: HardDrive, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                            { label: t("vault.stats.recent_upload"), value: documents.length > 0 ? formatDate(documents[0].uploaded_at) : t("vault.stats.none"), icon: CloudUpload, color: "text-amber-400", bg: "bg-amber-400/10" },
                        ].map((stat, i) => (
                            <div
                                key={stat.label}
                                className="bg-[var(--bg-card)] border border-[var(--border-6)] rounded-xl p-4 flex items-center gap-3"
                            >
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-[var(--text-primary)]">{stat.value}</p>
                                    <p className="text-[10px] text-[var(--text-30)]">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Filter Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 }}
                        className="flex items-center gap-3 mb-6 flex-wrap"
                    >
                        <div className="flex items-center gap-2 text-xs text-[var(--text-30)]">
                            <Filter className="w-3.5 h-3.5" />{t("vault.filter")}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => setFilterCategory("all")}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                    filterCategory === "all"
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                        : "bg-[var(--surface-2)] border-[var(--border-4)] text-[var(--text-30)] hover:border-[var(--border-8)]"
                                )}
                            >
                                {t("vault.all")} ({documents.length})
                            </button>
                            {CATEGORIES.map((cat) => {
                                const count = documents.filter((d) => d.category === cat.value).length;
                                if (count === 0) return null;
                                return (
                                    <button
                                        key={cat.value}
                                        onClick={() => setFilterCategory(cat.value)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                            filterCategory === cat.value
                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                : "bg-[var(--surface-2)] border-[var(--border-4)] text-[var(--text-30)] hover:border-[var(--border-8)]"
                                        )}
                                    >
                                        {t(`vault.categories.${cat.value}`)} ({count})
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Drop Zone + Document Grid */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                            "relative rounded-2xl transition-colors",
                            isDragging && "ring-2 ring-emerald-400/40 ring-dashed bg-emerald-400/[0.03]"
                        )}
                    >
                        {/* Drag overlay */}
                        <AnimatePresence>
                            {isDragging && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--bg-page)]/90 rounded-2xl border-2 border-dashed border-emerald-400/40"
                                >
                                    <CloudUpload className="w-10 h-10 text-emerald-400 mb-3" />
                                    <p className="text-sm font-semibold text-emerald-400">{t("vault.drop_here")}</p>
                                    <p className="text-xs text-[var(--text-30)] mt-1">{t("vault.supported_types")}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full"
                                />
                            </div>
                        ) : filteredDocs.length === 0 ? (
                            /* Empty State */
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-16"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-[var(--surface-4)] border border-[var(--border-6)] flex items-center justify-center mx-auto mb-5">
                                    <FolderOpen className="w-7 h-7 text-[var(--text-20)]" />
                                </div>
                                <h3 className="text-lg font-semibold text-[var(--text-60)] mb-2">
                                    {filterCategory !== "all" ? t("vault.empty_category") : t("vault.empty")}
                                </h3>
                                <p className="text-sm text-[var(--text-25)] mb-6 max-w-sm mx-auto">
                                    {filterCategory !== "all"
                                        ? t("vault.empty_category_desc")
                                        : t("vault.empty_desc")}
                                </p>
                                <Button
                                    onClick={() => { setUploadOpen(true); resetUploadForm(); }}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold border-0 shadow-lg shadow-emerald-500/20 gap-2"
                                >
                                    <CloudUpload className="w-4 h-4" />{t("vault.upload_first")}
                                </Button>
                            </motion.div>
                        ) : (
                            /* Document Grid */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredDocs.map((doc, i) => {
                                    const Icon = getFileIcon(doc.file_type);
                                    return (
                                        <motion.div
                                            key={doc.id}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.03 * i }}
                                            className="bg-[var(--bg-card)] border border-[var(--border-6)] rounded-xl p-5 hover:border-[var(--border-12)] transition-all group relative"
                                        >
                                            {/* Actions Menu */}
                                            <div className="absolute top-4 right-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="p-1.5 rounded-lg text-[var(--text-20)] hover:text-[var(--text-60)] hover:bg-[var(--surface-4)] transition-colors opacity-0 group-hover:opacity-100">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-[var(--bg-card)] border-[var(--border-8)] min-w-[160px]">
                                                        <DropdownMenuItem onClick={() => handleDownload(doc)} className="text-xs gap-2 cursor-pointer">
                                                            <Download className="w-3.5 h-3.5" />Download
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => { setRenameTarget(doc); setRenameName(doc.name); }}
                                                            className="text-xs gap-2 cursor-pointer"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />Rename
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setDeleteTarget(doc)}
                                                            className="text-xs gap-2 cursor-pointer text-red-400 focus:text-red-400"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            {/* Icon */}
                                            <div className="w-10 h-10 rounded-xl bg-[var(--surface-4)] border border-[var(--border-5)] flex items-center justify-center mb-4">
                                                <Icon className="w-4.5 h-4.5 text-[var(--text-30)]" />
                                            </div>

                                            {/* Name */}
                                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 pr-8 truncate">{doc.name}</h3>
                                            {doc.notes && (
                                                <p className="text-[11px] text-[var(--text-25)] leading-relaxed mb-3 line-clamp-2">{doc.notes}</p>
                                            )}

                                            {/* Category Badge */}
                                            <Badge className={cn("text-[9px] gap-1 mb-3 border", getCategoryColor(doc.category))}>
                                                {getCategoryLabel(doc.category)}
                                            </Badge>

                                            <Separator className="bg-[var(--surface-4)] my-3" />

                                            {/* Meta */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-[var(--text-15)]">{formatFileSize(doc.file_size)}</span>
                                                <span className="text-[10px] text-[var(--text-15)]">{formatDate(doc.uploaded_at)}</span>
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {/* Upload Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.03 * filteredDocs.length }}
                                    onClick={() => { setUploadOpen(true); resetUploadForm(); }}
                                    className="bg-[var(--bg-card)]/50 border-2 border-dashed border-[var(--border-6)] rounded-xl p-5 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px] group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-3)] border border-[var(--border-5)] flex items-center justify-center mb-3 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors">
                                        <Plus className="w-5 h-5 text-[var(--text-20)] group-hover:text-emerald-400 transition-colors" />
                                    </div>
                                    <span className="text-xs font-medium text-[var(--text-30)] group-hover:text-emerald-400 transition-colors">{t("vault.upload")}</span>
                                    <span className="text-[10px] text-[var(--text-15)] mt-1">{t("vault.or_drag")}</span>
                                </motion.div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-center py-10 border-t border-[var(--border-4)] mt-12">
                        <p className="text-xs text-[var(--text-15)]">{t("common.footer")}</p>
                    </div>
                </div>
            </main>

            {/* Success Toast */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-6 right-6 z-[100] bg-emerald-500/90 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" />{successMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                onChange={handleFileSelect}
            />

            {/* ═══ UPLOAD DIALOG ═══ */}
            <Dialog open={uploadOpen} onOpenChange={(open) => { if (!uploading) { setUploadOpen(open); if (!open) resetUploadForm(); } }}>
                <DialogContent className="bg-[var(--bg-card)] border-[var(--border-8)] max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[var(--text-primary)] flex items-center gap-2">
                            <CloudUpload className="w-5 h-5 text-emerald-400" />Upload Document
                        </DialogTitle>
                        <DialogDescription className="text-[var(--text-30)] text-xs">
                            Upload a document to your secure vault. Supported: PDF, Images, DOC, XLS.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {/* File picker */}
                        {uploadFile ? (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-4)]">
                                <FileText className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-[var(--text-70)] truncate">{uploadFile.name}</p>
                                    <p className="text-[10px] text-[var(--text-25)]">{formatFileSize(uploadFile.size)}</p>
                                </div>
                                <button onClick={() => setUploadFile(null)} className="text-[var(--text-30)] hover:text-red-400 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-[var(--border-6)] rounded-xl p-6 text-center cursor-pointer hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-colors"
                            >
                                <CloudUpload className="w-8 h-8 text-[var(--text-20)] mx-auto mb-2" />
                                <p className="text-xs text-[var(--text-40)] font-medium">Click to choose a file</p>
                                <p className="text-[10px] text-[var(--text-20)] mt-1">PDF, JPG, PNG, DOC, XLS up to 10MB</p>
                            </div>
                        )}

                        {/* Document Name */}
                        <div className="space-y-1.5">
                            <Label className="text-[var(--text-50)] text-xs">Document Name</Label>
                            <Input
                                value={uploadName}
                                onChange={(e) => setUploadName(e.target.value)}
                                placeholder="e.g. Aadhaar Card"
                                className="bg-[var(--surface-2)] border-[var(--border-6)] text-[var(--text-80)] h-9 text-sm"
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-1.5">
                            <Label className="text-[var(--text-50)] text-xs">Category</Label>
                            <Select value={uploadCategory} onValueChange={setUploadCategory}>
                                <SelectTrigger className="bg-[var(--surface-2)] border-[var(--border-6)] text-[var(--text-70)] h-9 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[var(--bg-card)] border-[var(--border-8)]">
                                    {CATEGORIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value} className="text-sm">
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Notes */}
                        <div className="space-y-1.5">
                            <Label className="text-[var(--text-50)] text-xs">Notes <span className="text-[var(--text-20)]">(optional)</span></Label>
                            <Input
                                value={uploadNotes}
                                onChange={(e) => setUploadNotes(e.target.value)}
                                placeholder="e.g. Valid until 2028"
                                className="bg-[var(--surface-2)] border-[var(--border-6)] text-[var(--text-80)] h-9 text-sm"
                            />
                        </div>

                        {/* Upload error */}
                        {uploadError && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <span>{uploadError}</span>
                            </div>
                        )}

                        {/* Upload progress */}
                        {uploading && (
                            <div className="space-y-2">
                                <Progress
                                    value={uploadProgress}
                                    className="h-2 bg-[var(--surface-4)] [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-emerald-500 [&>[data-slot=progress-indicator]]:to-teal-400"
                                />
                                <p className="text-[10px] text-[var(--text-30)] text-center">{uploadProgress}% uploaded</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => { setUploadOpen(false); resetUploadForm(); }}
                            disabled={uploading}
                            className="border-[var(--border-6)] bg-[var(--surface-3)] text-[var(--text-50)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-6)] text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!uploadFile || uploading}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold border-0 shadow-lg shadow-emerald-500/20 text-xs gap-1.5"
                        >
                            {uploading ? (
                                <>
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                        <CloudUpload className="w-4 h-4" />
                                    </motion.div>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <CloudUpload className="w-4 h-4" />Upload
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ═══ DELETE DIALOG ═══ */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <AlertDialogContent className="bg-[var(--bg-card)] border-[var(--border-8)]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[var(--text-primary)] flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-400" />Delete Document
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[var(--text-30)] text-sm">
                            Are you sure you want to delete <span className="font-semibold text-[var(--text-60)]">{deleteTarget?.name}</span>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-[var(--border-6)] bg-[var(--surface-3)] text-[var(--text-50)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-6)] text-xs">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs"
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ═══ RENAME DIALOG ═══ */}
            <Dialog open={!!renameTarget} onOpenChange={(open) => { if (!open) setRenameTarget(null); }}>
                <DialogContent className="bg-[var(--bg-card)] border-[var(--border-8)] max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-[var(--text-primary)] flex items-center gap-2">
                            <Pencil className="w-4 h-4 text-emerald-400" />Rename Document
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <Input
                            value={renameName}
                            onChange={(e) => setRenameName(e.target.value)}
                            placeholder="Document name"
                            className="bg-[var(--surface-2)] border-[var(--border-6)] text-[var(--text-80)] h-9 text-sm"
                            autoFocus
                        />
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setRenameTarget(null)}
                            className="border-[var(--border-6)] bg-[var(--surface-3)] text-[var(--text-50)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-6)] text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRename}
                            disabled={!renameName.trim() || renaming}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold border-0 shadow-lg shadow-emerald-500/20 text-xs"
                        >
                            {renaming ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

