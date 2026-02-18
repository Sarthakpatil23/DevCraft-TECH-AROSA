"use client"
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FileText, Brain, CheckCircle, Users } from "lucide-react";

interface FeatureIcon {
    icon: React.ReactNode;
    label: string;
    position: { x: string; y: string };
}

interface EligifyHeroProps {
    logo?: string | React.ReactNode;
    navigation?: Array<{
        label: string;
        onClick?: () => void;
    }>;
    contactButton?: {
        label: string;
        onClick: () => void;
    };
    title: string;
    highlightedText: string;
    subtitle: string;
    ctaButton?: {
        label: string;
        onClick: () => void;
    };
    featureIcons?: FeatureIcon[];
    trustedByText?: string;
    brands?: Array<{
        name: string;
        logo: React.ReactNode;
    }>;
    className?: string;
    children?: React.ReactNode;
}

export function EligifyHero({
    logo = "Eligify",
    navigation = [
        { label: "Home" },
        { label: "Features" },
        { label: "Pricing" },
        { label: "About us" },
    ],
    contactButton,
    title,
    highlightedText = "With Eligify",
    subtitle,
    ctaButton,
    featureIcons = [],
    trustedByText = "Trusted by",
    brands = [],
    className,
    children,
}: EligifyHeroProps) {
    return (
        <section
            className={cn(
                "relative w-full min-h-screen flex flex-col overflow-hidden",
                className
            )}
            style={{
                background: "linear-gradient(180deg, #0B1220 0%, #111827 100%)",
            }}
            role="banner"
            aria-label="Hero section"
        >
            {/* Radial Glow Background */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div
                    className="absolute"
                    style={{
                        width: "1200px",
                        height: "1200px",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        background: "radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(30, 58, 138, 0) 70%)",
                        filter: "blur(80px)",
                    }}
                />
            </div>

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-20 flex flex-row justify-between items-center px-8 lg:px-16"
                style={{
                    paddingTop: "24px",
                    paddingBottom: "24px",
                }}
            >
                {/* Logo */}
                <div>
                    {typeof logo === "string" ? (
                        <div
                            style={{
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 700,
                                fontSize: "20px",
                                color: "#E5E7EB",
                            }}
                        >
                            <span style={{ fontWeight: 400 }}>{logo.split(" ")[0]}</span>
                            <span style={{ fontWeight: 700 }}>{logo.split(" ")[1] || ""}</span>
                        </div>
                    ) : (
                        logo
                    )}
                </div>

                {/* Navigation */}
                <nav className="hidden lg:flex flex-row items-center gap-8" aria-label="Main navigation">
                    {navigation.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.onClick}
                            className="hover:opacity-70 transition-opacity"
                            style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "15px",
                                fontWeight: 400,
                                color: "#E5E7EB",
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Contact Button */}
                {contactButton && (
                    <button
                        onClick={contactButton.onClick}
                        className="px-6 py-2.5 rounded-full transition-all hover:scale-105"
                        style={{
                            background: "transparent",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "15px",
                            fontWeight: 400,
                            color: "#E5E7EB",
                        }}
                    >
                        {contactButton.label}
                    </button>
                )}
            </motion.header>

            {/* Main Content */}
            {children ? (
                <div className="relative z-10 flex-1 flex items-center justify-center w-full">
                    {children}
                </div>
            ) : (
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
                    {/* Floating Feature Icons */}
                    {featureIcons.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="absolute flex flex-col items-center gap-2"
                            style={{
                                left: feature.position.x,
                                top: feature.position.y,
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: [0, -20, 0],
                            }}
                            transition={{
                                opacity: { duration: 0.6, delay: 0.3 + index * 0.1 },
                                scale: { duration: 0.6, delay: 0.3 + index * 0.1 },
                                y: {
                                    duration: 3 + index * 0.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                },
                            }}
                        >
                            <div
                                style={{
                                    width: "80px",
                                    height: "80px",
                                    borderRadius: "50%",
                                    background: "rgba(30, 58, 138, 0.3)",
                                    backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(6, 182, 212, 0.3)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 0 30px rgba(6, 182, 212, 0.2)",
                                }}
                            >
                                {feature.icon}
                            </div>
                            <span
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: "#E5E7EB",
                                    textTransform: "uppercase",
                                }}
                            >
                                {feature.label}
                            </span>
                        </motion.div>
                    ))}

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex flex-col items-center text-center max-w-4xl"
                        style={{ gap: "32px" }}
                    >
                        {/* Logo Badge -> Replaced with Logo */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="flex justify-center w-full mb-4"
                        >
                            <img
                                src="/logo.png"
                                alt="Eligify Logo"
                                className="h-64 w-auto object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                            />
                        </motion.div>

                        {/* Title */}
                        <h1
                            style={{
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 500,
                                fontSize: "clamp(32px, 5vw, 64px)",
                                lineHeight: "1.2",
                                color: "#E5E7EB",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            {title}
                            <br />
                            <span
                                style={{
                                    background: "linear-gradient(90deg, #06B6D4 0%, #3B82F6 50%, #06B6D4 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                    fontWeight: 600,
                                }}
                            >
                                {highlightedText}
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p
                            style={{
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 400,
                                fontSize: "clamp(14px, 2vw, 16px)",
                                lineHeight: "1.6",
                                color: "#9CA3AF",
                                maxWidth: "600px",
                            }}
                        >
                            {subtitle}
                        </p>

                        {/* CTA Button */}
                        {ctaButton && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={ctaButton.onClick}
                                className="px-8 py-3 rounded-md transition-all"
                                style={{
                                    background: "transparent",
                                    border: "1px solid rgba(6, 182, 212, 0.4)",
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "15px",
                                    fontWeight: 500,
                                    color: "#E5E7EB",
                                    boxShadow: "0 4px 20px rgba(6, 182, 212, 0.15)",
                                }}
                            >
                                {ctaButton.label}
                            </motion.button>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Brand Slider */}
            {brands.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="relative z-10 w-full overflow-hidden"
                    style={{
                        paddingTop: "60px",
                        paddingBottom: "60px",
                    }}
                >
                    {/* "Trusted by" Text */}
                    <div className="text-center mb-8">
                        <span
                            style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "12px",
                                fontWeight: 400,
                                color: "#9CA3AF",
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                            }}
                        >
                            {trustedByText}
                        </span>
                    </div>

                    {/* Gradient Overlays */}
                    <div
                        className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
                        style={{
                            width: "200px",
                            background: "linear-gradient(90deg, #0B1220 0%, rgba(11, 18, 32, 0) 100%)",
                        }}
                    />
                    <div
                        className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
                        style={{
                            width: "200px",
                            background: "linear-gradient(270deg, #0B1220 0%, rgba(11, 18, 32, 0) 100%)",
                        }}
                    />

                    {/* Scrolling Brands */}
                    <motion.div
                        className="flex items-center"
                        animate={{
                            x: [0, -(brands.length * 200)],
                        }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: brands.length * 5,
                                ease: "linear",
                            },
                        }}
                        style={{
                            gap: "80px",
                            paddingLeft: "80px",
                        }}
                    >
                        {/* Duplicate brands for seamless loop */}
                        {[...brands, ...brands].map((brand, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 flex items-center justify-center opacity-40 hover:opacity-70 transition-opacity"
                                style={{
                                    width: "120px",
                                    height: "40px",
                                }}
                            >
                                {brand.logo}
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </section>
    );
}
