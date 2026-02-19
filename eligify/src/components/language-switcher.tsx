"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLanguage, LANGUAGE_LABELS, type Language } from "@/context/language-context";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "EN" },
    { code: "hi", label: "हिन्दी", flag: "हि" },
    { code: "mr", label: "मराठी", flag: "म" },
];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
    const { lang, setLang } = useLanguage();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-1.5 rounded-lg border border-[var(--border-6)] bg-[var(--surface-2)] hover:bg-[var(--surface-5)] hover:border-[var(--border-10)] transition-all text-[var(--text-50)] hover:text-[var(--text-primary)] ${compact ? "px-2 py-1.5 text-[10px]" : "px-2.5 py-1.5 text-xs"}`}
            >
                <Globe className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
                <span className="font-medium">{current.flag}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-1.5 z-50 w-40 bg-[var(--bg-elevated)] border border-[var(--border-8)] rounded-xl overflow-hidden shadow-xl shadow-black/20"
                    >
                        <div className="p-1">
                            {LANGUAGES.map((l) => (
                                <button
                                    key={l.code}
                                    onClick={() => {
                                        setLang(l.code);
                                        setOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                                        lang === l.code
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : "text-[var(--text-50)] hover:bg-[var(--surface-4)] hover:text-[var(--text-primary)]"
                                    }`}
                                >
                                    <span className="w-6 h-6 rounded-md bg-[var(--surface-3)] border border-[var(--border-4)] flex items-center justify-center text-[10px] font-bold">
                                        {l.flag}
                                    </span>
                                    <span className="font-medium">{l.label}</span>
                                    {lang === l.code && (
                                        <Check className="w-3.5 h-3.5 ml-auto text-emerald-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
