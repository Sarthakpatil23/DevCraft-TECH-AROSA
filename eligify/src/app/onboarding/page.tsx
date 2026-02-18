"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight, Calendar } from "lucide-react";
import { EligifyLogo } from "@/components/ui/eligify-logo";
import axios from "axios";

const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir"
];

const GENDERS = ["Male", "Female", "Other"];

export default function Onboarding() {
    const router = useRouter();
    const [formData, setFormData] = useState({ state: "", gender: "", dob: "" });
    const [age, setAge] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            window.history.replaceState({}, document.title, '/onboarding');
        }
        
        // Check if user has access token
        const token = localStorage.getItem('access_token');
        if (!token) {
            // Redirect to home if not authenticated
            router.push('/');
        }
    }, [router]);

    useEffect(() => {
        if (formData.dob) {
            const birthDate = new Date(formData.dob);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }
            setAge(calculatedAge >= 0 ? calculatedAge : null);
        } else {
            setAge(null);
        }
    }, [formData.dob]);

    const isValid = formData.state && formData.gender && age !== null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Submit profile data to Django backend
            const response = await axios.patch(
                'http://127.0.0.1:8000/api/auth/profile/update/',
                {
                    state: formData.state,
                    gender: formData.gender,
                    dob: formData.dob
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Profile updated successfully:', response.data);
            
            // Redirect to dashboard after successful update
            router.push("/dashboard");
        } catch (err: any) {
            console.error('Profile update error:', err);
            setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1220] flex flex-col items-center justify-center p-4">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#1E3A8A]/10 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-[#06B6D4]/10 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl p-8 relative z-10"
            >
                <div className="flex justify-center mb-6">
                    <EligifyLogo imgClassName="h-10" />
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-[#E5E7EB]">Complete your basic details</h2>
                    <p className="text-[#9CA3AF] text-sm mt-2">
                        This helps us determine your eligibility accurately
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* State Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#E5E7EB]">State of Residence</label>
                        <select
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#06B6D4] appearance-none"
                            required
                        >
                            <option value="" disabled>Select State</option>
                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Gender Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#E5E7EB]">Gender</label>
                        <div className="flex gap-4">
                            {GENDERS.map((g) => (
                                <label
                                    key={g}
                                    className={cn(
                                        "flex-1 cursor-pointer border rounded-lg py-3 flex items-center justify-center text-sm font-medium transition-all",
                                        formData.gender === g
                                            ? "bg-[#06B6D4]/10 border-[#06B6D4] text-[#06B6D4]"
                                            : "bg-[#1F2937] border-[#374151] text-[#9CA3AF] hover:border-[#4B5563]"
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="gender"
                                        value={g}
                                        checked={formData.gender === g}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="hidden"
                                    />
                                    {g}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Date of Birth Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#E5E7EB] flex justify-between">
                            Date of Birth
                            {age !== null && <span className="text-[#06B6D4]">Age: {age} years</span>}
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={formData.dob}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#06B6D4] appearance-none [&::-webkit-calendar-picker-indicator]:invert"
                                required
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Calendar className="w-5 h-5 text-[#9CA3AF]" />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!isValid || loading}
                        className={cn(
                            "w-full py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all mt-8",
                            isValid && !loading
                                ? "bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                                : "bg-[#1F2937] text-[#4B5563] cursor-not-allowed"
                        )}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Updating Profile...
                            </>
                        ) : (
                            <>
                                Continue to Dashboard
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
