"use client"
import React from "react";
import { motion } from "framer-motion";
import { MoveRight, Target, Lightbulb, Users, FileText, Cpu, CheckCircle2, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function AboutSection() {
    return (
        <section id="about" className="py-24 bg-[#0B1220] relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-[#1E3A8A]/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-[#06B6D4]/5 blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 z-10 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    {/* Image/Visual Content - Redesigned to be richer */}
                    <div className="relative group order-2 lg:order-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#06B6D4] to-[#1E3A8A] rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-all duration-700" />

                        <div className="relative rounded-3xl overflow-hidden border border-[#1F2937] bg-[#111827] shadow-2xl h-[500px]">
                            {/* Grid Background */}
                            <div className="absolute inset-0"
                                style={{
                                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(31, 41, 55, 0.4) 1px, transparent 0)',
                                    backgroundSize: '24px 24px'
                                }}
                            />

                            {/* Interactive Flow Visualization */}
                            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">

                                {/* Step 1: Input Document */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-[#1F2937]/80 backdrop-blur-md border border-[#374151] p-4 rounded-xl flex items-center gap-4 w-64 shadow-lg group-hover:border-[#06B6D4]/30 transition-colors"
                                >
                                    <div className="p-2 bg-[#1E3A8A]/20 rounded-lg">
                                        <FileText className="w-6 h-6 text-[#E5E7EB]" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-2 w-20 bg-[#374151] rounded mb-2" />
                                        <div className="h-2 w-32 bg-[#374151]/50 rounded" />
                                    </div>
                                </motion.div>

                                {/* Connection 1 */}
                                <div className="h-16 w-[1px] bg-gradient-to-b from-[#374151] to-[#06B6D4] my-2 relative overflow-hidden">
                                    <motion.div
                                        className="absolute top-0 left-0 w-full h-1/2 bg-[#06B6D4] blur-[2px]"
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
                                    <div className="absolute inset-0 bg-[#06B6D4]/20 blur-xl rounded-full" />
                                    <div className="relative bg-[#0B1220] border border-[#06B6D4] p-5 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.15)] flex items-center justify-center">
                                        <Cpu className="w-10 h-10 text-[#06B6D4]" />
                                    </div>
                                </motion.div>

                                {/* Connection 2 */}
                                <div className="h-16 w-[1px] bg-gradient-to-b from-[#06B6D4] to-[#10B981] my-2 relative overflow-hidden">
                                    <motion.div
                                        className="absolute top-0 left-0 w-full h-1/2 bg-[#10B981] blur-[2px]"
                                        animate={{ y: [0, 64] }}
                                        transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "linear" }}
                                    />
                                </div>

                                {/* Step 3: Success Output */}
                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                    className="bg-[#064E3B]/20 backdrop-blur-md border border-[#059669]/30 p-4 rounded-xl flex items-center gap-4 w-64 shadow-lg"
                                >
                                    <div className="p-2 bg-[#10B981]/20 rounded-full">
                                        <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                                    </div>
                                    <div>
                                        <p className="text-[#E5E7EB] font-bold text-sm">Eligible: Scholarship</p>
                                        <p className="text-[#10B981] text-xs mt-1">Match Score: 98%</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Floating Stat Card 1 */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="absolute top-20 -left-6 p-4 bg-[#111827] border border-[#1F2937] rounded-xl shadow-xl flex items-center gap-3"
                        >
                            <div className="p-2 bg-[#06B6D4]/10 rounded-lg">
                                <Target className="w-6 h-6 text-[#06B6D4]" />
                            </div>
                            <div>
                                <p className="text-[#E5E7EB] font-bold">Precision</p>
                                <p className="text-xs text-[#9CA3AF]">Policy Decoding</p>
                            </div>
                        </motion.div>

                        {/* Floating Stat Card 2 */}
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="absolute bottom-20 -right-8 p-6 bg-[#1E3A8A] rounded-xl shadow-2xl max-w-xs text-center border border-[#3B82F6]/30"
                        >
                            <h4 className="text-3xl font-bold text-white mb-1">100%</h4>
                            <p className="text-blue-100 text-xs uppercase tracking-wider">Transparency</p>
                        </motion.div>
                    </div>

                    {/* Text Content */}
                    <div className="space-y-10 order-1 lg:order-2">
                        <div className="space-y-4">
                            <h2 className="text-sm font-semibold text-[#06B6D4] tracking-widest uppercase flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-[#06B6D4]" /> About Eligify
                            </h2>
                            <h3 className="text-3xl md:text-5xl font-bold text-[#E5E7EB] leading-tight">
                                Democratizing Access to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] to-[#3B82F6]">Public Benefits</span>
                            </h3>
                        </div>

                        <div className="space-y-6 text-[#9CA3AF] text-lg leading-relaxed">
                            <p>
                                Government schemes are powerful tools for social upliftment, but their impact is often limited by complex eligibility criteria and bureaucratic hurdles.
                            </p>
                            <p>
                                <strong className="text-[#E5E7EB]">Eligify changes the narrative.</strong> By leveraging advanced AI to decode policy documents, we provide instant, accurate, and personalized eligibility assessments. We empower citizens to claim what is rightfully theirs, without the confusion.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    <Lightbulb className="w-6 h-6 text-[#06B6D4]" />
                                </div>
                                <div>
                                    <h5 className="text-[#E5E7EB] font-bold text-lg">Smart Interpretation</h5>
                                    <p className="text-[#9CA3AF] text-sm mt-1">Our AI understands nuances in policy language that keyword searches miss.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    <Users className="w-6 h-6 text-[#06B6D4]" />
                                </div>
                                <div>
                                    <h5 className="text-[#E5E7EB] font-bold text-lg">Citizen Centric</h5>
                                    <p className="text-[#9CA3AF] text-sm mt-1">Designed for accessibility, ensuring no one is left behind due to complexity.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button className="flex items-center gap-3 px-8 py-4 bg-transparent border border-[#1F2937] hover:border-[#06B6D4] text-[#E5E7EB] hover:text-[#06B6D4] rounded-lg transition-all font-semibold group">
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
