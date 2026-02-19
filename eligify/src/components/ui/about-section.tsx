"use client"
import React from "react";
import { motion } from "framer-motion";
import { MoveRight, Target, Lightbulb, Users, FileText, Cpu, CheckCircle2, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function AboutSection() {
    return (
        <section id="about" className="py-24 bg-[var(--bg-page)] relative overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 grid-bg pointer-events-none" />

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-[var(--surface-1)] blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-[var(--surface-1)] blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 z-10 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    {/* Image/Visual Content - Redesigned to be richer */}
                    <div className="relative group order-2 lg:order-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--text-10)] to-[var(--text-05)] rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-all duration-700" />

                        <div className="relative rounded-3xl overflow-hidden border border-[#1a1a1a] bg-[var(--bg-card)] shadow-2xl h-[500px]">
                            {/* Grid Background */}
                            <div className="absolute inset-0 grid-bg-dense" />

                            {/* Interactive Flow Visualization */}
                            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">

                                {/* Step 1: Input Document */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-[#1a1a1a]/80 backdrop-blur-md border border-[#252525] p-4 rounded-xl flex items-center gap-4 w-64 shadow-lg group-hover:border-white/20 transition-colors"
                                >
                                    <div className="p-2 bg-[var(--surface-5)] rounded-lg">
                                        <FileText className="w-6 h-6 text-[var(--text-primary)]" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-2 w-20 bg-[#252525] rounded mb-2" />
                                        <div className="h-2 w-32 bg-[#252525]/50 rounded" />
                                    </div>
                                </motion.div>

                                {/* Connection 1 */}
                                <div className="h-16 w-[1px] bg-gradient-to-b from-[#252525] to-white/40 my-2 relative overflow-hidden">
                                    <motion.div
                                        className="absolute top-0 left-0 w-full h-1/2 bg-white/60 blur-[2px]"
                                        animate={{ y: [0, 64] }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    />
                                </div>

                                {/* Step 2: AI Processing Core */}
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="relative z-20"
                                >
                                    <div className="absolute inset-0 bg-white/10 blur-xl rounded-full" />
                                    <div className="relative bg-[var(--bg-page)] border border-white/30 p-5 rounded-full shadow-[0_0_30px_var(--surface-8)] flex items-center justify-center">
                                        <Cpu className="w-10 h-10 text-[var(--text-primary)]" />
                                    </div>
                                </motion.div>

                                {/* Connection 2 */}
                                <div className="h-16 w-[1px] bg-gradient-to-b from-[var(--text-40)] to-[var(--text-20)] my-2 relative overflow-hidden">
                                    <motion.div
                                        className="absolute top-0 left-0 w-full h-1/2 bg-white/40 blur-[2px]"
                                        animate={{ y: [0, 64] }}
                                        transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "linear" }}
                                    />
                                </div>

                                {/* Step 3: Success Output */}
                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                    className="bg-[var(--surface-3)] backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4 w-64 shadow-lg"
                                >
                                    <div className="p-2 bg-white/10 rounded-full">
                                        <CheckCircle2 className="w-6 h-6 text-[var(--text-primary)]" />
                                    </div>
                                    <div>
                                        <p className="text-[var(--text-primary)] font-bold text-sm">Eligible: Scholarship</p>
                                        <p className="text-[var(--text-60)] text-xs mt-1">Match Score: 98%</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Floating Stat Card 1 */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="absolute top-20 -left-6 p-4 bg-[var(--bg-card)] border border-[#1a1a1a] rounded-xl shadow-xl flex items-center gap-3"
                        >
                            <div className="p-2 bg-[var(--surface-5)] rounded-lg">
                                <Target className="w-6 h-6 text-[var(--text-primary)]" />
                            </div>
                            <div>
                                <p className="text-[var(--text-primary)] font-bold">Precision</p>
                                <p className="text-xs text-[#737373]">Policy Decoding</p>
                            </div>
                        </motion.div>

                        {/* Floating Stat Card 2 */}
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="absolute bottom-20 -right-8 p-6 bg-[#1a1a1a] rounded-xl shadow-2xl max-w-xs text-center border border-white/10"
                        >
                            <h4 className="text-3xl font-bold text-[var(--text-primary)] mb-1">100%</h4>
                            <p className="text-[var(--text-60)] text-xs uppercase tracking-wider">Transparency</p>
                        </motion.div>
                    </div>

                    {/* Text Content */}
                    <div className="space-y-10 order-1 lg:order-2">
                        <div className="space-y-4">
                            <h2 className="text-sm font-semibold text-[var(--text-60)] tracking-widest uppercase flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-white/40" /> About Eligify
                            </h2>
                            <h3 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] leading-tight">
                                Democratizing Access to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-60)]">Public Benefits</span>
                            </h3>
                        </div>

                        <div className="space-y-6 text-[#737373] text-lg leading-relaxed">
                            <p>
                                Government schemes are powerful tools for social upliftment, but their impact is often limited by complex eligibility criteria and bureaucratic hurdles.
                            </p>
                            <p>
                                <strong className="text-[var(--text-primary)]">Eligify changes the narrative.</strong> By leveraging advanced AI to decode policy documents, we provide instant, accurate, and personalized eligibility assessments. We empower citizens to claim what is rightfully theirs, without the confusion.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    <Lightbulb className="w-6 h-6 text-[var(--text-primary)]" />
                                </div>
                                <div>
                                    <h5 className="text-[var(--text-primary)] font-bold text-lg">Smart Interpretation</h5>
                                    <p className="text-[#737373] text-sm mt-1">Our AI understands nuances in policy language that keyword searches miss.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    <Users className="w-6 h-6 text-[var(--text-primary)]" />
                                </div>
                                <div>
                                    <h5 className="text-[var(--text-primary)] font-bold text-lg">Citizen Centric</h5>
                                    <p className="text-[#737373] text-sm mt-1">Designed for accessibility, ensuring no one is left behind due to complexity.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button className="flex items-center gap-3 px-8 py-4 bg-transparent border border-[#1a1a1a] hover:border-white/30 text-[var(--text-primary)] hover:text-[var(--text-80)] rounded-lg transition-all font-semibold group">
                                Read Our Full Story
                                <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
