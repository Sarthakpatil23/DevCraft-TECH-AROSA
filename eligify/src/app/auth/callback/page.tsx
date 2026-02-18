"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');
        const redirect = searchParams.get('redirect');
        const error = searchParams.get('error');

        if (error) {
            console.error("Authentication error:", error);
            router.push('/?error=' + error);
            return;
        }

        if (access_token && refresh_token) {
            // Save tokens to localStorage
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);

            console.log("Tokens saved, redirecting to:", redirect);

            // Redirect based on backend decision
            if (redirect === 'dashboard') {
                router.push('/dashboard');
            } else if (redirect === 'onboarding') {
                router.push('/onboarding');
            } else {
                router.push('/dashboard'); // Default fallback
            }
        } else {
            console.error("Missing tokens in callback");
            router.push('/?error=missing_tokens');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#06B6D4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#E5E7EB] text-lg">Completing sign in...</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#06B6D4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#E5E7EB] text-lg">Loading...</p>
                </div>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
