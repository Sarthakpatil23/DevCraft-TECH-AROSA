"use client";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    // Google OAuth is now handled entirely by Django backend
    return <>{children}</>;
}
