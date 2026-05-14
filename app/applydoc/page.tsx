"use client";

// ─────────────────────────────────────────────────────────────────────────────
// APPLY AS DOCTOR PAGE — Delma Health Platform
//
// This page allows a logged-in user to apply as a doctor on Delma.
//
// Flow:
//   1. User fills in professional details
//   2. POST /api/v1/doctor/apply (with userId as query param)
//   3. On success → logout user → redirect to login
//      (Doctor account is separate from user account — requires re-login)
//
// Notes:
//   - languages field accepts comma-separated values → converted to array
//   - experience and fees are parsed as numbers before sending
//   - User must be logged in (userId from Redux)
//   - After applying, user is logged out because the role changes
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  User, Mail, Lock, Phone, MapPin, Languages,
  Stethoscope, Clock, IndianRupee, ArrowRight,
  Heart, CheckCircle, Eye, EyeOff
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import axiosInstance from "../login/axiosInstance";
import { clearUser, selectToken, selectUser } from "@/redux/userSlice";
import { clearDoctor } from "@/redux/doctorSlice";

// ─────────────────────────────────────────────────────────────────────────────
// SPECIALIZATIONS — dropdown options for the specialization field
// ─────────────────────────────────────────────────────────────────────────────

const SPECIALIZATIONS = [
  "Cardiology", "Neurology", "Orthopedics", "Dermatology",
  "Pediatrics", "General Surgery", "Ophthalmology", "Psychiatry",
  "Gynecology", "Urology", "ENT", "Gastroenterology",
  "Pulmonology", "Endocrinology", "General Medicine",
  "Internal Medicine", "Radiology",
];

// ─────────────────────────────────────────────────────────────────────────────
// APPLY DOC COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ApplyDoc() {
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const dispatch = useDispatch();
  const router = useRouter();

  // ── Form field state ──
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [languages, setLanguages] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [feesPerConsultation, setFeesPerConsultation] = useState("");

  // ── Submission state ──
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // LOGOUT HELPER
  // Called after successful application — clears Redux state
  // ─────────────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8089/auth/logout",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      dispatch(clearUser());
      dispatch(clearDoctor());
    } catch (err) {
      console.error("Logout error:", err);
      // Still clear Redux even if logout API fails
      dispatch(clearUser());
      dispatch(clearDoctor());
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SUBMIT APPLICATION
  // Validates, transforms, and sends doctor application to backend
  // ─────────────────────────────────────────────────────────────────────────

  const handleRegister = async () => {
    // Basic validation
    if (!firstname || !lastname || !email || !password || !phone ||
      !address || !specialization || !experience || !feesPerConsultation) {
      toast({ variant: "destructive", description: "All fields are required" });
      return;
    }

    setLoading(true);
    try {
      // Transform string inputs to correct types before sending
      const experienceNumber = parseInt(experience);
      const feesNumber = parseFloat(feesPerConsultation);
      const phoneNumber = parseFloat(phone);

      if (isNaN(experienceNumber) || isNaN(feesNumber) || isNaN(phoneNumber)) {
        toast({ variant: "destructive", description: "Please enter valid numbers for phone, experience, and fees" });
        return;
      }

      const res = await axiosInstance.post(
        "http://localhost:8089/api/v1/doctor/apply",
        {
          name: firstname,          // Backend uses 'name' for firstName
          lastName: lastname,
          phoneNo: phoneNumber,
          experience: experienceNumber,
          feesPerCunsaltation: feesNumber, // Note: backend has typo in field name
          email,
          password,
          address,
          specialization,
        },
        {
          params: { userId: user?.id }, // Pass userId as query param
        }
      );

      if (res.data.success) {
        setSubmitted(true);
        toast({ description: "Application submitted! You'll be notified once approved." });

        // Logout and redirect — doctor account requires separate login
        setTimeout(async () => {
          await handleLogout();
          router.push("/login");
        }, 2000);
      } else {
        toast({ variant: "destructive", description: res.data.message });
      }
    } catch (err: any) {
      console.error("Doctor application error:", err);
      toast({
        variant: "destructive",
        description: err.response?.data?.message || "Application failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SUCCESS SCREEN — shown after successful submission
  // ─────────────────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdf0ee] via-white to-[#f9e4e8] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Application Submitted!</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Your application is under review. Our team will verify your credentials
            and notify you within 24-48 hours.
          </p>
          <p className="text-xs text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN FORM
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf0ee] via-white to-[#f9e4e8] py-12 px-4">
      <div className="max-w-lg mx-auto">

        {/* ── Brand header ── */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#78355b] flex items-center justify-center mx-auto mb-3">
            <Heart size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Apply as a Doctor</h1>
          <p className="text-gray-400 text-sm mt-1">
            Join Delma's verified network of specialists
          </p>
        </div>

        {/* ── Info banner ── */}
        <div className="bg-[#78355b]/5 border border-[#78355b]/15 rounded-2xl p-4 mb-6 flex gap-3">
          <Stethoscope size={18} className="text-[#78355b] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 leading-relaxed">
            After submitting, your application will be reviewed by our team.
            Once approved, you can log in with your doctor credentials.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="space-y-5">

            {/* ── Personal Info section ── */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Personal Information
            </p>

            {/* First + Last name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  First Name
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="John"
                    value={firstname}
                    onChange={e => setFirstName(e.target.value)}
                    className="pl-8 rounded-xl border-gray-200 focus:border-[#78355b] text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Last Name
                </label>
                <Input
                  placeholder="Doe"
                  value={lastname}
                  onChange={e => setLastName(e.target.value)}
                  className="rounded-xl border-gray-200 focus:border-[#78355b] text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  placeholder="doctor@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-8 rounded-xl border-gray-200 focus:border-[#78355b] text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-8 pr-10 rounded-xl border-gray-200 focus:border-[#78355b] text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="pl-8 rounded-xl border-gray-200 focus:border-[#78355b] text-sm"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Clinic / Hospital Address
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="123 MG Road, Mumbai"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="pl-8 rounded-xl border-gray-200 focus:border-[#78355b] text-sm"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 pt-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Professional Details
              </p>
            </div>

            {/* Languages */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Languages Spoken
              </label>
              <div className="relative">
                <Languages size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="English, Hindi, Marathi"
                  value={languages}
                  onChange={e => setLanguages(e.target.value)}
                  className="pl-8 rounded-xl border-gray-200 focus:border-[#78355b] text-sm"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Separate multiple languages with commas</p>
            </div>

            {/* Specialization — dropdown */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Specialization
              </label>
              <div className="relative">
                <Stethoscope size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                <select
                  value={specialization}
                  onChange={e => setSpecialization(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#78355b] text-gray-700 appearance-none bg-white"
                >
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Experience + Fees row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Experience (years)
                </label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="5"
                    min="0"
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    className="pl-8 rounded-xl border-gray-200 focus:border-[#78355b] text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Fees per Consultation
                </label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="500"
                    min="0"
                    value={feesPerConsultation}
                    onChange={e => setFeesPerConsultation(e.target.value)}
                    className="pl-8 rounded-xl border-gray-200 focus:border-[#78355b] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Already a doctor link */}
            <p className="text-sm text-gray-400">
              Already registered as a doctor?{" "}
              <Link href="/login" className="text-[#78355b] font-medium hover:underline">
                Login here
              </Link>
            </p>

            {/* Submit button */}
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
                  Submitting...
                </span>
              ) : (
                <>Submit Application <ArrowRight size={16} /></>
              )}
            </Button>

          </div>
        </div>
      </div>
    </div>
  );
}
