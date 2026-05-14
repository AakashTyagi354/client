"use client";

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE — Delma Health Platform
//
// Two login flows:
//   1. Patient Login  — POST /auth/login → dispatches user to Redux store
//   2. Doctor Login   — POST /auth/login → dispatches doctor to Redux store
//
// Validation is handled by react-hook-form + zod schema.
// Admin toggle switches the login endpoint to /auth/admin-login.
//
// After successful login:
//   - User  → redirected to /finddoc
//   - Doctor → redirected to /finddoc (with doctor role in Redux)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  Stethoscope, User, Shield, Eye, EyeOff,
  ArrowRight, Heart, Lock, Mail
} from "lucide-react";

import WidthWrapper from "@/components/WidthWrapper";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import DemoIds from "@/components/DemoIds";
import axiosInstance from "./axiosInstance";
import { setUser } from "@/redux/userSlice";
import { setDoctor } from "@/redux/doctorSlice";

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION SCHEMA
// email: must be valid email format
// password: minimum 6 characters
// ─────────────────────────────────────────────────────────────────────────────

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  // ── Tab state — "patient" or "doctor" ──
  const [activeTab, setActiveTab] = useState<"patient" | "doctor">("patient");

  // ── Admin toggle — switches endpoint to /auth/admin-login ──
  const [isAdmin, setIsAdmin] = useState(false);

  // ── Password visibility toggle ──
  const [showPassword, setShowPassword] = useState(false);

  // ── Loading state for button ──
  const [isLoading, setIsLoading] = useState(false);

  // ── Hydration guard — prevents SSR mismatch ──
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // ── Form setup with zod validation ──
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // PATIENT LOGIN HANDLER
  // Sends credentials to /auth/login or /auth/admin-login
  // On success: dispatches user to Redux and redirects to /finddoc
  // ─────────────────────────────────────────────────────────────────────────

  const handleLogin = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const url = isAdmin
        ? "http://localhost:8089/auth/admin-login"
        : "http://localhost:8089/auth/login";

      const res = await axiosInstance.post(url, values);

      if (res.data.success === true) {
        toast({ description: res.data.message });

        const apiData = res.data.data;

        // Parse role string "[USER]" or "[DOCTOR]" into array
        const rolesArray = apiData.role
          ?.replace(/[\[\]]/g, "")
          .split(", ") ?? [];
        const isDoctor = rolesArray.includes("DOCTOR");

        const user = {
          name: apiData.username,
          email: values.email,
          id: String(apiData.userId),
          isAdmin: apiData.isAdmin === "true",
          isDoctor,
        };

        dispatch(setUser({ user, token: apiData.jwtToken }));
        router.push("/finddoc");
      } else {
        toast({ variant: "destructive", description: res.data.message });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed. Please try again.";
      toast({ variant: "destructive", description: message });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DOCTOR LOGIN HANDLER
  // NOTE: Currently points to old backend URL — update when doctorservice
  // login endpoint is ready on the new microservices stack
  // ─────────────────────────────────────────────────────────────────────────

  const handleDoctorLogin = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        "https://doc-app-7im8.onrender.com/api/v1/doctor/doctor-login",
        values
      );

      if (res.data.success === true) {
        toast({ description: res.data.message });

        const doctor = {
          name: res.data.doctor.firstName,
          email: res.data.doctor.email,
          id: res.data.doctor._id,
        };

        dispatch(setDoctor({ doctor, token: res.data.token }));
        router.push("/finddoc");
      } else {
        toast({ variant: "destructive", description: res.data.message });
      }
    } catch (error) {
      toast({ variant: "destructive", description: "Doctor login failed. Please try again." });
      console.error("Doctor login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf0ee] via-white to-[#f9e4e8] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">

        {/* ── Logo / Brand header ── */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#78355b] flex items-center justify-center mx-auto mb-3">
            <Heart size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome to Delma</h1>
          <p className="text-gray-400 text-sm mt-1">
            Healthcare at your fingertips
          </p>
        </div>

        {/* ── Tab switcher — Patient vs Doctor ── */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          <button
            onClick={() => { setActiveTab("patient"); form.reset(); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === "patient"
                ? "bg-white text-[#78355b] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <User size={15} />
            Patient Login
          </button>
          <button
            onClick={() => { setActiveTab("doctor"); form.reset(); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === "doctor"
                ? "bg-white text-[#78355b] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Stethoscope size={15} />
            Doctor Login
          </button>
        </div>

        {/* ── Login form card ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                activeTab === "patient" ? handleLogin : handleDoctorLogin
              )}
              className="space-y-5"
            >

              {/* Email field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <Input
                          placeholder="you@example.com"
                          className="pl-9 rounded-xl border-gray-200 focus:border-[#78355b] focus:ring-[#78355b]/20"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Password field with visibility toggle */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-9 pr-10 rounded-xl border-gray-200 focus:border-[#78355b] focus:ring-[#78355b]/20"
                          {...field}
                        />
                        {/* Toggle password visibility */}
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword
                            ? <EyeOff size={16} />
                            : <Eye size={16} />
                          }
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Admin toggle — only shown on Patient tab */}
              {activeTab === "patient" && (
                <div className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-xl">
                  <Shield size={15} className="text-gray-400" />
                  <span className="text-sm text-gray-500 flex-1">
                    Login as Admin
                  </span>
                  <Switch
                    checked={isAdmin}
                    onCheckedChange={setIsAdmin}
                  />
                </div>
              )}

              {/* Register / Apply link */}
              <p className="text-sm text-gray-400">
                {activeTab === "patient" ? (
                  <>
                    Don't have an account?{" "}
                    <Link
                      href="/register"
                      className="text-[#78355b] font-medium hover:underline"
                    >
                      Register here
                    </Link>
                  </>
                ) : (
                  <>
                    Want to join as a doctor?{" "}
                    <Link
                      href="/applydoc"
                      className="text-[#78355b] font-medium hover:underline"
                    >
                      Apply here
                    </Link>
                  </>
                )}
              </p>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#78355b] hover:bg-[#5e2947] text-white rounded-xl py-2.5 font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <>
                    Sign In <ArrowRight size={16} />
                  </>
                )}
              </Button>

            </form>
          </Form>
        </div>

        {/* Demo credentials helper */}
        <div className="mt-6">
          <DemoIds />
        </div>

      </div>
    </div>
  );
}
