import React from "react";
import Image from "next/image";

export const EligifyLogo = ({ className }: { className?: string }) => (
    <div className={`relative h-10 w-auto ${className}`}>
        <Image
            src="/logo.png"
            alt="Eligify Logo"
            width={120} // Approximated width based on aspect ratio
            height={40}
            className="object-contain"
            priority
        />
    </div>
);
