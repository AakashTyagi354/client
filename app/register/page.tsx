"use client";

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER PAGE — Delma Health Platform
//
// Two-screen flow on a single page:
//   Screen 1 — Signup form (username, email, password)
//              → POST /auth/signup → saves user as UNVERIFIED → sends OTP email
//   Screen 2 — OTP verification
//              → POST /auth/verify-otp → marks user as VERIFIED → redirect to login
//
// Additional:
//   - Resend OTP → POST /auth/resend-otp
//   - Back button returns to signup form
//   - OTP input only accepts digits (numeric filter applied)
//   - Enter key submits OTP
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart, User, Mail, Lock, Eye, EyeOff,
  ArrowRight, ArrowLeft, ShieldCheck, RefreshCw
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import axiosInstance from "../login/axiosInstance";

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();

  // ── Signup form state ──
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── OTP screen state ──
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1: SIGNUP
  // Sends user details to backend → backend saves as UNVERIFIED and emails OTP
  // On success → switch to OTP verification screen
  // ─────────────────────────────────────────────────────────────────────────

  const handleRegister = async () => {
    if (!username || !email || !password) {
      toast({ variant: "destructive", description: "All fields are required" });
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/signup", {
        name: username,
        email,
        password,
      });

      if (res.data.success === true) {
        toast({ description: "OTP sent to your email. Please verify." });
        setShowOtpScreen(true);
      } else {
        toast({ variant: "destructive", description: res.data.message });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        description: err.response?.data?.message || "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2: OTP VERIFICATION
  // Sends the 6-digit OTP → backend marks user as VERIFIED
  // On success → redirect to login page
  // ─────────────────────────────────────────────────────────────────────────

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast({ variant: "destructive", description: "Please enter a valid 6-digit OTP" });
      return;
    }
    setOtpLoading(true);
    try {
      const res = await axiosInstance.post("/auth/verify-otp", {
        email,
        otp,
      });

      if (res.data.success === true) {
        toast({ description: "Email verified successfully! Please login." });
        router.push("/login");
      } else {
        toast({ variant: "destructive", description: res.data.message });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        description: err.response?.data?.message || "Invalid or expired OTP",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RESEND OTP
  // Regenerates OTP in Redis and sends a new email
  // Clears the current OTP input on success
  // ─────────────────────────────────────────────────────────────────────────

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      const res = await axiosInstance.post("/auth/resend-otp", { email });
      if (res.data.success === true) {
        toast({ description: "OTP resent. Check your email." });
        setOtp(""); // Clear old OTP so user enters the new one
      } else {
        toast({ variant: "destructive", description: res.data.message });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        description: err.response?.data?.message || "Failed to resend OTP",
      });
    } finally {
      setResendLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf0ee] via-white to-[#f9e4e8] flex items-center justify-center py-12 px-4">
     <div className="w-full max-w-md mt-[-140px]">

        {/* ── Brand header ── */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#78355b] flex items-center justify-center mx-auto mb-3">
            <Heart size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {showOtpScreen ? "Verify your email" : "Join Delma"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {showOtpScreen
              ? `We sent a 6-digit code to ${email}`
              : "Create your account in seconds"
            }
          </p>
        </div>

        {/* ── SCREEN 1: Signup form ── */}
        {!showOtpScreen ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="space-y-5">

              {/* Username */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="John Doe"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="pl-9 rounded-xl border-gray-200 focus:border-[#78355b]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-9 rounded-xl border-gray-200 focus:border-[#78355b]"
                  />
                </div>
              </div>

              {/* Password with show/hide toggle */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleRegister()}
                    className="pl-9 pr-10 rounded-xl border-gray-200 focus:border-[#78355b]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Already registered link */}
              <p className="text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-[#78355b] font-medium hover:underline">
                  Login here
                </Link>
              </p>

              {/* Register button */}
              <Button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-[#78355b] hover:bg-[#5e2947] text-white rounded-xl py-2.5 font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  <>Create Account <ArrowRight size={16} /></>
                )}
              </Button>
            </div>
          </div>

        ) : (

          /* ── SCREEN 2: OTP Verification ── */
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

            {/* OTP sent indicator */}
            <div className="flex items-center gap-3 p-4 bg-[#78355b]/5 rounded-2xl border border-[#78355b]/15 mb-6">
              <div className="w-9 h-9 rounded-xl bg-[#78355b]/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={18} className="text-[#78355b]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#78355b]">OTP Sent</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Check your inbox at <span className="font-medium text-gray-700">{email}</span>
                </p>
              </div>
            </div>

            <div className="space-y-5">

              {/* OTP input — digits only, max 6 chars */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Enter 6-digit OTP
                </label>
                <Input
                  placeholder="123456"
                  value={otp}
                  maxLength={6}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} // Strip non-digits
                  onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
                  className="rounded-xl border-gray-200 focus:border-[#78355b] text-center text-xl font-bold tracking-[0.5em] h-14"
                />
                <p className="text-xs text-gray-400 mt-1.5 text-center">
                  OTP expires in 10 minutes
                </p>
              </div>

              {/* Verify button */}
              <Button
                onClick={handleVerifyOtp}
                disabled={otpLoading || otp.length !== 6}
                className="w-full bg-[#78355b] hover:bg-[#5e2947] text-white rounded-xl py-2.5 font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {otpLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Verify Email
                  </>
                )}
              </Button>

              {/* Resend OTP + Back */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setShowOtpScreen(false)}
                  className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <button
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className="text-sm text-[#78355b] font-medium hover:underline disabled:opacity-50 flex items-center gap-1"
                >
                  {resendLoading ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={13} /> Resend OTP
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
