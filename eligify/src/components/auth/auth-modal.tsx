"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
        />
    </svg>
);

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const router = useRouter();

    if (!isOpen) return null;

    const handleGoogleLogin = () => {
        // Redirect to Django's Google OAuth endpoint
        // This will redirect to Google, then back to our callback
        window.location.href = 'http://127.0.0.1:8000/accounts/google/login/';
    };

    const handleEmailAuth = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock Email Auth for now
        if (mode === "login") {
            router.push("/dashboard");
        } else {
            router.push("/onboarding");
        }
        onClose();
    };

    return (
        <AnimatePresence>
            {/* Backdrop and Modal... (reusing existing UI) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
                <div className="bg-[#111111] border border-[#1a1a1a] w-full max-w-md p-8 rounded-2xl shadow-2xl relative pointer-events-auto">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-[#737373] hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {mode === "login" ? "Welcome to Eligify" : "Create an Account"}
                        </h2>
                        <p className="text-[#737373] text-sm">
                            {mode === "login"
                                ? "Sign in to check your eligibility"
                                : "Join thousands of citizens getting benefits"}
                        </p>
                    </div>

                    {/* Google Button - Redirects to Django OAuth */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-3 rounded-lg hover:bg-gray-100 transition-colors mb-2"
                    >
                        <GoogleIcon />
                        Continue with Google
                    </button>

                    <div className="relative flex items-center justify-center my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#1a1a1a]"></div>
                        </div>
                        <span className="relative bg-[#111111] px-4 text-xs text-[#525252] uppercase">
                            Or continue with email
                        </span>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#737373]" />
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#252525] rounded-lg text-white focus:outline-none focus:border-white/30 placeholder:text-[#525252]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#737373]" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#252525] rounded-lg text-white focus:outline-none focus:border-white/30 placeholder:text-[#525252]"
                                    required
                                />
                            </div>
                        </div>

                        {mode === "signup" && (
                            <div className="space-y-2">
                                <div className="relative">
                                    <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#737373]" />
                                    <input
                                        type="password"
                                        placeholder="Confirm Password"
                                        className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#252525] rounded-lg text-white focus:outline-none focus:border-white/30 placeholder:text-[#525252]"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 hover:shadow-lg hover:shadow-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            {mode === "login" ? "Login" : "Create Account"}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-[#737373]">
                        {mode === "login" ? (
                            <>
                                New here?{" "}
                                <button
                                    onClick={() => setMode("signup")}
                                    className="text-white hover:underline transition-colors"
                                >
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <button
                                    onClick={() => setMode("login")}
                                    className="text-white hover:underline transition-colors"
                                >
                                    Log in
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
