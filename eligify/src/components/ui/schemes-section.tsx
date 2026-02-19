"use client"
import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Heart, Home, DollarSign, ArrowRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const schemes = [
    {
        icon: <GraduationCap className="h-6 w-6" />,
        title: "National Scholarship Portal",
        category: "Education",
        description: "Financial aid for higher education students based on merit and means.",
        benefits: ["upto ₹50,000/yr", "Tuition Waiver"],
        color: "from-[var(--surface-3)] to-[var(--surface-6)]",
        iconColor: "text-[var(--text-primary)]"
    },
    {
        icon: <Home className="h-6 w-6" />,
        title: "PM Awas Yojana",
        category: "Housing",
        description: "Credit-linked subsidy scheme for first-time home buyers in urban areas.",
        benefits: ["Interest Subsidy", " Affordable Loands"],
        color: "from-purple-500/20 to-blue-500/20",
        iconColor: "text-purple-400"
    },
    {
        icon: <Heart className="h-6 w-6" />,
        title: "Ayushman Bharat",
        category: "Healthcare",
        description: "Comprehensive health coverage of ₹5 Lakhs per family per year.",
        benefits: ["Free Treatment", "50Cr+ Covered"],
        color: "from-red-500/20 to-pink-500/20",
        iconColor: "text-red-400"
    },
    {
        icon: <Briefcase className="h-6 w-6" />,
        title: "Mudra Yojana",
        category: "Business",
        description: " collateral-free loans for small and micro enterprises to boost entrepreneurship.",
        benefits: ["Loans upto ₹10L", "Low Interest"],
        color: "from-amber-500/20 to-orange-500/20",
        iconColor: "text-amber-400"
    },
    {
        icon: <DollarSign className="h-6 w-6" />,
        title: "Atal Pension Yojana",
        category: "Social Security",
        description: "Guaranteed pension scheme for unorganized sector workers.",
        benefits: ["Guaranteed Returns", "Tax Benefits"],
        color: "from-emerald-500/20 to-green-500/20",
        iconColor: "text-emerald-400"
    },
    {
        icon: <TrendingUp className="h-6 w-6" />,
        title: "Skill India Mission",
        category: "Skill Development",
        description: "Training programs to empower youth with industry-relevant skills.",
        benefits: ["Free Training", "Job Placement"],
        color: "from-indigo-500/20 to-violet-500/20",
        iconColor: "text-indigo-400"
    }
];

export function SchemesSection() {
    return (
        <section id="schemes" className="py-24 bg-[var(--bg-sidebar)] relative overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 grid-bg pointer-events-none" />

            {/* Background blobs */}
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[var(--surface-2)] blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-[var(--surface-1)] blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold text-[var(--text-60)] tracking-widest uppercase flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-white/40" /> Popular Schemes
                        </h2>
                        <h3 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)]">
                            Explore Opportunities
                        </h3>
                        <p className="text-[#737373] max-w-lg">
                            Discover government initiatives tailored to your needs. From education to healthcare, find what you are eligible for today.
                        </p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1a1a1a] hover:bg-[#252525] text-[var(--text-primary)] border border-[#252525] transition-all font-medium group">
                        View All Schemes
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schemes.map((scheme, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative rounded-2xl bg-[var(--bg-page)] border border-[#1a1a1a] hover:border-white/20 overflow-hidden flex flex-col h-full hover:-translate-y-1 transition-transform duration-300"
                        >
                            {/* Gradient Header */}
                            <div className={cn("absolute inset-0 h-32 bg-gradient-to-b opacity-50 transition-opacity group-hover:opacity-70", scheme.color)} />

                            <div className="relative p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn("p-3 rounded-xl bg-[var(--bg-card)] border border-[#1a1a1a] shadow-lg text-[var(--text-primary)]", scheme.iconColor)}>
                                        {scheme.icon}
                                    </div>
                                    <span className="text-xs font-medium text-[#737373] bg-[#1a1a1a] px-3 py-1 rounded-full uppercase tracking-wider">
                                        {scheme.category}
                                    </span>
                                </div>

                                <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--text-80)] transition-colors line-clamp-1">
                                    {scheme.title}
                                </h4>
                                <p className="text-[#737373] text-sm mb-6 line-clamp-2 flex-grow">
                                    {scheme.description}
                                </p>

                                <div className="space-y-3 pt-6 border-t border-[#1a1a1a]">
                                    <p className="text-xs text-[#737373] font-semibold uppercase">Key Benefits</p>
                                    <div className="flex flex-wrap gap-2">
                                        {scheme.benefits.map((benefit, idx) => (
                                            <span key={idx} className="text-xs font-medium text-[var(--text-80)] bg-[var(--surface-4)] border border-white/10 px-2 py-1 rounded">
                                                {benefit}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-[var(--bg-sidebar)] border-t border-[#1a1a1a] flex items-center justify-between group-hover:bg-[var(--bg-card)] transition-colors">
                                <span className="text-sm font-medium text-[var(--text-60)]">Check Eligibility</span>
                                <ArrowRight className="w-4 h-4 text-[var(--text-60)] -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section >
    );
}
