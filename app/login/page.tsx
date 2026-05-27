"use client";

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE — Delma Health Platform
//
// FE-003 FIX: Single login flow for all roles
//
// Before:
//   - Two separate tabs (Patient / Doctor)
//   - Doctor tab called dead render.com URL (old Node.js monolith)
//   - Admin toggle switched endpoint
//
// After:
//   - One form, one endpoint: POST /auth/login
//   - Role determined from JWT response
//   - DOCTOR  → dispatch to doctorSlice → redirect /videocall
//   - ADMIN   → dispatch to userSlice   → redirect /dashboard/users
//   - USER    → dispatch to userSlice   → redirect /finddoc
//
// Why this is correct:
//   Spring Boot userservice /auth/login handles all roles.
//   The JWT payload contains the role — no need for separate endpoints
//   or separate login flows. The backend decides who you are.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, ArrowRight,
  Heart, Lock, Mail, Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import DemoIds from "@/components/DemoIds";
import axiosInstance from "./axiosInstance";
import { setUser } from "@/redux/userSlice";
import { setDoctor } from "@/redux/doctorSlice";

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const formSchema = z.object({
  email:    z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const dispatch = useDispatch();
  const router   = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [hydrated,     setHydrated]     = useState(false);

  useEffect(() => setHydrated(true), []);

  const form = useForm<FormValues>({
    resolver:      zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // LOGIN HANDLER — single handler for all roles
  //
  // Flow:
  //   1. POST /auth/login with email + password
  //   2. Parse role from JWT response
  //   3. Route based on role:
  //      DOCTOR → doctorSlice + /videocall
  //      ADMIN  → userSlice   + /dashboard/users
  //      USER   → userSlice   + /finddoc
  // ─────────────────────────────────────────────────────────────────────────

  const handleLogin = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.post("/auth/login", values);

      if (res.data.success === true) {
        toast({ description: res.data.message });

        const apiData = res.data.data;

        // Parse role string "[USER, DOCTOR]" → ["USER", "DOCTOR"]
        const rolesArray: string[] = apiData.role
          ?.replace(/[\[\]]/g, "")
          .split(", ")
          .map((r: string) => r.trim()) ?? [];

        const isDoctor = rolesArray.includes("DOCTOR");
        const isAdmin  = rolesArray.includes("ADMIN");

        if (isDoctor) {
          // Doctor — dispatch to doctorSlice, redirect to video consultations
          dispatch(setDoctor({
            doctor: {
              name:  apiData.username,
              email: values.email,
              id:    String(apiData.userId),
            },
            token: apiData.jwtToken,
          }));
          router.push("/videocall");

        } else {
          // Patient or Admin — dispatch to userSlice
          dispatch(setUser({
            user: {
              name:     apiData.username,
              email:    values.email,
              id:       String(apiData.userId),
              isAdmin:  isAdmin || apiData.isAdmin === "true",
              isDoctor: false,
            },
            token: apiData.jwtToken,
          }));

          // Route based on role
          router.push(isAdmin ? "/dashboard/users" : "/finddoc");
        }

      } else {
        toast({ variant: "destructive", description: res.data.message });
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      toast({ variant: "destructive", description: message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf0ee] via-white
                to-[#f9e4e8] flex items-center justify-center px-4
                pt-[72px]">
      <div className="w-full max-w-md mt-[-140px]">

        {/* ── Brand header ── */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#78355b] flex items-center
                          justify-center mx-auto mb-3">
            <Heart size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome to Delma</h1>
          <p className="text-gray-400 text-sm mt-1">
            Healthcare at your fingertips
          </p>
        </div>

        {/* ── Form card ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

          {/* Subtitle */}
          <p className="text-sm text-gray-500 text-center mb-6">
            Sign in with your email and password.
            <br />
            <span className="text-xs text-gray-400">
              Patients, doctors and admins all use the same form.
            </span>
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleLogin)}
              className="space-y-5"
            >

              {/* Email */}
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
                          className="absolute left-3 top-1/2 -translate-y-1/2
                                     text-gray-400"
                        />
                        <Input
                          placeholder="you@example.com"
                          className="pl-9 rounded-xl border-gray-200
                                     focus:border-[#78355b]
                                     focus:ring-[#78355b]/20"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Password */}
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
                          className="absolute left-3 top-1/2 -translate-y-1/2
                                     text-gray-400"
                        />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-9 pr-10 rounded-xl border-gray-200
                                     focus:border-[#78355b]
                                     focus:ring-[#78355b]/20"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2
                                     text-gray-400 hover:text-gray-600"
                        >
                          {showPassword
                            ? <EyeOff size={16} />
                            : <Eye    size={16} />
                          }
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Register link */}
              <p className="text-sm text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-[#78355b] font-medium hover:underline"
                >
                  Register here
                </Link>
              </p>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#78355b] hover:bg-[#5e2947] text-white
                           rounded-xl py-2.5 font-medium flex items-center
                           justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>

            </form>
          </Form>
        </div>

      

      </div>
    </div>
  );
}