"use client";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const router = useRouter();

    useEffect(() => {
        // Check if tokens are passed via URL parameters (from OAuth callback)
        const urlParams = new URLSearchParams(window.location.search);
        const urlAccessToken = urlParams.get('access_token');
        const urlRefreshToken = urlParams.get('refresh_token');
        
        if (urlAccessToken && urlRefreshToken) {
            // Store tokens from URL
            localStorage.setItem('access_token', urlAccessToken);
            localStorage.setItem('refresh_token', urlRefreshToken);
            
            // Clean URL by removing query parameters
            window.history.replaceState({}, document.title, '/dashboard');
        }
        
        // Check if user has access token
        const token = localStorage.getItem('access_token');
        if (!token) {
            // Redirect to home if not authenticated
            router.push('/');
        }
    }, [router]);

    return (
        <main className="min-h-screen bg-[#0B1220] text-[#E5E7EB] flex items-center justify-center">
            <div className="text-center space-y-4">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] to-[#3B82F6]"
                >
                    Welcome to Your Dashboard
                </motion.h1>
                <p className="text-[#9CA3AF]">Your eligibility journey begins here.</p>
                <div className="p-8 border border-[#1F2937] rounded-xl bg-[#111827] w-full max-w-md mx-auto mt-8">
                    <p className="text-sm text-[#9CA3AF]">Status: Active</p>
                    <div className="h-2 w-full bg-[#1F2937] rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-[#10B981] w-1/3 animate-pulse" />
                    </div>
                </div>
            </div>
        </main>
    );
}
