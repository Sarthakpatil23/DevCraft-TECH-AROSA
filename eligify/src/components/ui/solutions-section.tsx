"use client"
import React from "react";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, Search, FileText, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const solutions = [
    {
        icon: <Search className="w-8 h-8 text-white" />,
        title: "Instant Discovery",
        description: "AI scans thousands of schemes to find matches for your specific profile in seconds."
    },
    {
        icon: <FileText className="w-8 h-8 text-white" />,
        title: "Document Analysis",
        description: "Upload your documents and let our engine verify eligibility criteria automatically."
    },
    {
        icon: <ShieldCheck className="w-8 h-8 text-white" />,
        title: "Secure & Private",
        description: "Your data is encrypted and processed securely. We prioritize your privacy above all."
    },
    {
        icon: <Zap className="w-8 h-8 text-white" />,
        title: "Real-time Updates",
        description: "Stay informed with instant notifications when new schemes or policy changes occur."
    },
    {
        icon: <CheckCircle2 className="w-8 h-8 text-white" />,
        title: "Actionable Insights",
        description: "Get a clear 'Eligible' or 'Not Eligible' result with step-by-step guidance."
    },
    {
        icon: <TrendingUp className="w-8 h-8 text-white" />,
        title: "Impact Analytics",
        description: "For agencies: Monitor scheme performance and citizen reach with detailed dashboards."
    },
];

export function SolutionsSection() {
    return (
        <section id="solutions" className="py-24 bg-[#0a0a0a] relative overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 grid-bg pointer-events-none" />

            {/* Subtle glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-sm font-semibold text-white/60 tracking-widest uppercase">
                        Our Solutions
                    </h2>
                    <h3 className="text-3xl md:text-5xl font-bold text-white">
                        Empowering Citizens & Agencies
                    </h3>
                    <p className="text-[#737373] text-lg">
                        Bridging the gap between policy and people with cutting-edge AI technology.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {solutions.map((solution, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-2xl bg-[#111111] border border-[#1a1a1a] hover:border-white/20 transition-all group"
                        >
                            <div className="mb-6 p-4 rounded-xl bg-white/[0.04] w-fit group-hover:bg-white/[0.08] transition-colors">
                                {solution.icon}
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                                {solution.title}
                            </h4>
                            <p className="text-[#737373] leading-relaxed">
                                {solution.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
