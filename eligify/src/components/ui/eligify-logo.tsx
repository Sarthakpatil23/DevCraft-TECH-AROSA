import React from "react";
import { cn } from "@/lib/utils";

interface EligifyLogoProps {
    className?: string; // Wrapper classes
    imgClassName?: string; // Image specific classes
}

export const EligifyLogo = ({ className, imgClassName }: EligifyLogoProps) => (
    <div className={cn("flex items-center justify-center", className)}>
        {/* Optimized image tag with flexible sizing */}
        <img
            src="/logo.png"
            alt="Eligify Logo"
            className={cn("h-[60px] w-auto object-contain hover:scale-105 transition-transform duration-300", imgClassName)}
        />
    </div>
);
