"use client";
import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/theme-context";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    if (compact) {
        return (
            <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-[var(--surface-4)] hover:bg-[var(--surface-8)] border border-[var(--border-6)]"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
                <motion.div
                    key={theme}
                    initial={{ rotate: -30, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    {isDark ? (
                        <Sun className="w-4 h-4 text-[var(--text-40)]" />
                    ) : (
                        <Moon className="w-4 h-4 text-[var(--text-40)]" />
                    )}
                </motion.div>
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-[var(--text-40)] hover:text-[var(--text-70)] hover:bg-[var(--surface-3)]"
        >
            <motion.div
                key={theme}
                initial={{ rotate: -30, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                {isDark ? (
                    <Sun className="w-[18px] h-[18px]" />
                ) : (
                    <Moon className="w-[18px] h-[18px]" />
                )}
            </motion.div>
            {isDark ? "Light Mode" : "Dark Mode"}
        </button>
    );
}
