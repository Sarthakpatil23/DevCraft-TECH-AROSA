import React from "react";

export const EligifyLogo = ({ className }: { className?: string }) => (
    <div className={`flex items-center ${className}`}>
        {/* Using standard img tag for automatic aspect ratio based on height */}
        <img
            src="/logo.png"
            alt="Eligify Logo"
            className="h-[60px] w-auto object-contain hover:scale-105 transition-transform duration-300"
        />
    </div>
);
