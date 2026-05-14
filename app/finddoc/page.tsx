"use client";

// ─────────────────────────────────────────────────────────────────────────────
// DOCTORS PAGE — Delma Health Platform
//
// This page handles:
//   1. Fetching and displaying all approved doctors
//   2. AI-powered symptom checker (Groq AI via /api/v1/ai/symptom-check)
//   3. Manual search with debouncing (500ms delay)
//   4. Filter by specialization, gender, experience sort
//   5. Date picker for slot availability check
//   6. Razorpay payment flow for appointment booking
//   7. Slot selection modal
//   8. Pagination (6 doctors per page)
//
// Key state:
//   docs            — currently displayed doctors (may be filtered/sorted)
//   originalDocs    — unmodified full list, always used as filter source
//   memoizedDocs    — memoized version of docs for performance
//   availableSlots  — slots returned for a selected doctor+date
//   selectedSlotId  — slot chosen by user
//   activeDoctor    — doctor currently being booked
//   aiResult        — AI symptom analysis result
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Image from "next/image";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Brain, Filter, Loader2, MapPin, Clock,
  IndianRupee, Search, X, ChevronLeft,
  ChevronRight, Stethoscope, Calendar
} from "lucide-react";

import WidthWrapper from "@/components/WidthWrapper";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "../login/axiosInstance";
import { selectToken, selectUser } from "@/redux/userSlice";

import homeImg from "../../public/images/img2.svg";
import img3 from "../../public/images/img3.jpeg";
import helpImg from "../../public/images/helpimg.png";
import "react-datepicker/dist/react-datepicker.css";

dayjs.extend(customParseFormat);

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const POSTS_PER_PAGE = 6;
const SEARCH_DEBOUNCE_MS = 500;
const DATE_FORMAT = "YYYY-MM-DD";
const RAZORPAY_KEY = "rzp_test_S9jVkGSiveLNXR"; // TODO: move to .env.local

const SPECIALIZATIONS = [
  "Orthopedics", "Internal Medicine", "Obstetrics and Gynecology",
  "Dermatology", "Pediatrics", "Radiology", "General Surgery", "Ophthalmology",
];

const FAQ_ITEMS = [
  {
    title: "Who is an orthopedist? What is the difference between an orthopedist and an orthopedic surgeon?",
    desc: "An orthopedist specializes in the treatment of functional or congenital abnormalities of the musculoskeletal system. Treatment methods include surgery, medicines, physical therapy, bracing, and exercise.",
    show: false,
  },
  {
    title: "How do I book an appointment on Delma?",
    desc: "Select a doctor, choose your preferred date, check available slots, and complete payment via Razorpay. Your appointment is confirmed instantly.",
    show: false,
  },
  {
    title: "Is my medical data secure on Delma?",
    desc: "Yes. All documents are stored with AES-256 encryption and accessed via time-limited presigned URLs. Your data is never shared without consent.",
    show: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function getTodaysDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function DoctorsPage() {
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);
  const currentUser = useSelector(selectUser);
  const { toast } = useToast();

  // ── Doctor list state ──
  const [docs, setDocs] = useState<DoctorInputProps[]>([]);
  // originalDocs stores the full unfiltered list.
  // IMPORTANT: handleFilter always filters from originalDocs, never from docs.
  // This prevents filter stacking — applying gender after specialization
  // would otherwise filter an already-filtered list.
  const [originalDocs, setOriginalDocs] = useState<DoctorInputProps[]>([]);
  const memoizedDocs = useMemo(() => docs, [docs]);
  const [isLoading, setIsLoading] = useState(false);

  // ── Date selection state ──
  const [startDate, setStartDate] = useState<Date | null>(new Date());

  // ── Slot booking modal state ──
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [activeDoctor, setActiveDoctor] = useState<{ id: number; name: string; fees: number } | null>(null);

  // ── AI Symptom Checker state ──
  const [symptoms, setSymptoms] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    specialization: string;
    message: string;
    disclaimer: string;
  } | null>(null);

  // ── Search state ──
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DoctorInputProps[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Filter state ──
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedSortBy, setSelectedSortBy] = useState("");

  // ── Pagination state ──
  const [currentPage, setCurrentPage] = useState(1);
  const lastIdx = currentPage * POSTS_PER_PAGE;
  const firstIdx = lastIdx - POSTS_PER_PAGE;
  const currentPosts = memoizedDocs.slice(firstIdx, lastIdx);

  // ── FAQ state ──
  const [faq, setFaq] = useState(FAQ_ITEMS);

  // ── Hydration guard — prevents SSR/CSR mismatch with antd DatePicker ──
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // ─────────────────────────────────────────────────────────────────────────
  // DATA FETCHING
  // ─────────────────────────────────────────────────────────────────────────

  // Fetch all approved doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get("/api/users/doctors");
        setDocs(res.data.data);
        setOriginalDocs(res.data.data); // Always save original for filter resets
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        toast({ variant: "destructive", title: "Could not load doctors" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Debounced doctor search — waits 500ms after typing stops before calling API
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        return;
      }
      try {
        const res = await axiosInstance.get(`/api/v1/doctor/search/${searchQuery}`);
        setSearchResults(res.data.data || []);
      } catch (err) {
        console.error("Search failed:", err);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // Close search dropdown when clicking outside the search container
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (showSearchDropdown && target && !target.closest(".search-container")) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearchDropdown]);

  // ─────────────────────────────────────────────────────────────────────────
  // AI SYMPTOM CHECKER
  // Flow: user types symptoms → POST /api/v1/ai/symptom-check
  //       → get specialization → GET /api/v1/doctor/search/{specialization}
  //       → update doctor list
  // ─────────────────────────────────────────────────────────────────────────

  const handleSymptomCheck = async () => {
    if (!symptoms.trim()) {
      toast({ variant: "destructive", title: "Please describe your symptoms" });
      return;
    }
    setAiLoading(true);
    setAiResult(null);
    try {
      // Step 1: Ask AI for specialization recommendation
      const aiRes = await axiosInstance.post("/api/v1/ai/symptom-check", { symptoms });
      const result = aiRes.data.data;
      setAiResult(result);

      // Step 2: Filter doctors by returned specialization
      const doctorRes = await axiosInstance.get(`/api/v1/doctor/search/${result.specialization}`);
      const filtered = doctorRes.data.data || [];
      setDocs(filtered);
      setCurrentPage(1);

      toast({
        title: `Found ${filtered.length} ${result.specialization} specialists`,
        description: result.message,
      });
    } catch (err) {
      console.error("AI symptom check failed:", err);
      toast({
        variant: "destructive",
        title: "AI unavailable",
        description: "Try manual search instead.",
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Clears AI filter and restores original full doctor list
  const handleClearAiFilter = async () => {
    const res = await axiosInstance.get("/api/users/doctors");
    setDocs(res.data.data);
    setOriginalDocs(res.data.data); // Reset originalDocs too in case AI changed it
    setAiResult(null);
    setSymptoms("");
    setCurrentPage(1);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FILTER & SORT
  //
  // CRITICAL: Always filter from originalDocs, NEVER from memoizedDocs.
  // If we filter from memoizedDocs, applying a second filter stacks on top
  // of the first (e.g. Male Cardiologists → then filter Female = empty list).
  // originalDocs is always the complete unmodified list.
  // ─────────────────────────────────────────────────────────────────────────

  const handleFilter = () => {
    setIsLoading(true);
    let filtered = [...originalDocs]; // ← Always start from the full unfiltered list

    if (selectedSpecialization) {
      filtered = filtered.filter(d => d.specialization === selectedSpecialization);
    }
    if (selectedGender) {
      filtered = filtered.filter(d => d.gender === selectedGender);
    }
    if (selectedSortBy === "experience-low-high") {
      filtered.sort((a, b) => a.experience - b.experience);
    } else if (selectedSortBy === "experience-high-low") {
      filtered.sort((a, b) => b.experience - a.experience);
    }

    setTimeout(() => setIsLoading(false), 300);
    setDocs(filtered);
    setCurrentPage(1);
  };

  // Resets all filters and restores the full doctor list
  const handleClearFilters = () => {
    setDocs(originalDocs);
    setSelectedSpecialization("");
    setSelectedGender("");
    setSelectedSortBy("");
    setCurrentPage(1);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SLOT AVAILABILITY CHECK
  // Fetches available time slots for a given doctor and date
  // ─────────────────────────────────────────────────────────────────────────

  const handleAvailabilityCheck = async (
    doctorId: number,
    firstName: string,
    doctor: DoctorInputProps
  ) => {
    setIsLoading(true);
    try {
      const dateStr = startDate ? dayjs(startDate).format(DATE_FORMAT) : getTodaysDate();
      const res = await axiosInstance.get("/api/v1/appointments/slots", {
        params: { doctorId, date: dateStr },
      });
      setAvailableSlots(res.data.data || []);
      setActiveDoctor({ id: doctorId, name: firstName, fees: doctor.feesPerConsultation });
      setSelectedSlotId(null); // Clear any previously selected slot
      setIsSlotModalOpen(true);
    } catch (err) {
      console.error("Slot fetch failed:", err);
      toast({ variant: "destructive", title: "Could not fetch slots" });
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RAZORPAY PAYMENT FLOW
  //
  // 1. POST /api/v1/payments/create  → get Razorpay order ID
  // 2. Open Razorpay checkout modal
  // 3. On payment success → POST /api/v1/payments/verify (signature check)
  // 4. On verification success → POST /api/v1/appointments/book
  // ─────────────────────────────────────────────────────────────────────────

  const loadRazorpayScript = () => {
    return new Promise<void>((resolve) => {
      // Avoid injecting the script multiple times
      if (document.querySelector('script[src*="razorpay"]')) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  };

  const makePayment = async () => {
    if (!selectedSlotId || !activeDoctor) return;

    try {
      // Step 1: Create Razorpay order on backend
      const createRes = await axiosInstance.post("/api/v1/payments/create", {
        amount: activeDoctor.fees * 100, // Razorpay expects paise (₹1 = 100 paise)
        refId: `SLOT_${selectedSlotId}`,
        sourceType: "APPOINTMENT",
      });
      const rzpOrderId = createRes.data.data;

      // Step 2: Open Razorpay modal
      await loadRazorpayScript();

      const options = {
        key: RAZORPAY_KEY,
        amount: activeDoctor.fees * 100,
        currency: "INR",
        name: "Delma Health",
        description: `Consultation with Dr. ${activeDoctor.name}`,
        order_id: rzpOrderId,
        handler: async (response: any) => {
          // Step 3: Verify payment signature
          try {
            const verifyRes = await axiosInstance.post("/api/v1/payments/verify", {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            if (verifyRes.status === 200) {
              toast({ description: "Payment successful! Booking your appointment..." });
              await handleBookAppointment(); // Step 4: Book the slot
            }
          } catch (err) {
            toast({ variant: "destructive", description: "Payment verification failed." });
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#78355b" },
      };

      const razor = new (window as any).Razorpay(options);
      razor.open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
      toast({ variant: "destructive", description: "Could not initiate payment." });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // APPOINTMENT BOOKING
  // Called after payment is verified. Sends slot + doctor + user IDs.
  // ─────────────────────────────────────────────────────────────────────────

  const handleBookAppointment = async () => {
    if (!selectedSlotId || !activeDoctor) return;

    try {
      const res = await axios.post(
        "http://localhost:8089/api/v1/appointments/book",
        null, // No request body — params sent as query strings
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            userId: currentUser?.id,
            doctorId: activeDoctor.id,
            slotId: selectedSlotId,
          },
        }
      );

      if (res.data.success) {
        toast({ title: res.data.message });
      } else {
        toast({ variant: "destructive", title: res.data.message });
      }
      setIsSlotModalOpen(false);
    } catch (err) {
      console.error("Appointment booking failed:", err);
      toast({ variant: "destructive", title: "Booking failed. Please contact support." });
    }
  };

  // ── FAQ accordion toggle ──
  const toggleFaq = (idx: number) => {
    setFaq(prev =>
      prev.map((item, i) => (i === idx ? { ...item, show: !item.show } : item))
    );
  };

  // Prevent SSR hydration mismatch — antd DatePicker is client-only
  if (!hydrated) return null;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="min-h-screen bg-gray-50">

        {/* ── HERO BANNER ── */}
        <WidthWrapper>
          <div className="w-full h-[420px] bg-[#78355b] relative overflow-hidden rounded-b-2xl">
            <Image
              src={homeImg}
              layout="fill"
              objectFit="cover"
              objectPosition="center"
              alt="Delma Health"
            />
            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#78355b]/60 to-[#78355b]/80" />

            <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
              <h1 className="text-white text-2xl md:text-4xl font-bold text-center mb-2">
                Dedicated to Your Wellbeing
              </h1>
              <p className="text-white/70 text-sm mb-8">
                Find the right specialist, book instantly, consult securely
              </p>

              {/* Debounced doctor search with autocomplete dropdown */}
              <div className="w-full max-w-lg relative search-container">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3">
                  <Search size={18} className="text-white/60 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search doctors by name or specialization..."
                    className="bg-transparent outline-none w-full text-sm text-white placeholder:text-white/50"
                    value={searchQuery}
                    onClick={() => setShowSearchDropdown(true)}
                    onChange={e => {
                      setSearchQuery(e.target.value.trim());
                      setShowSearchDropdown(true);
                    }}
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(""); setShowSearchDropdown(false); }}>
                      <X size={16} className="text-white/60 hover:text-white" />
                    </button>
                  )}
                </div>

                {/* Search results dropdown */}
                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto">
                    {searchResults.map((doctor, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </p>
                            <p className="text-xs text-[#78355b]">{doctor.specialization}</p>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <DatePicker
                              defaultValue={dayjs(getTodaysDate(), DATE_FORMAT)}
                              minDate={dayjs(getTodaysDate(), DATE_FORMAT)}
                              onChange={(date: any) => setStartDate(date)}
                              format={DATE_FORMAT}
                              size="small"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 border-[#78355b] text-[#78355b] hover:bg-[#78355b] hover:text-white"
                              onClick={() => handleAvailabilityCheck(doctor.userId, doctor.firstName, doctor)}
                            >
                              Check slots
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </WidthWrapper>

        {/* ── MAIN CONTENT ── */}
        <WidthWrapper>
          <div className="flex gap-6 py-8">

            {/* ── LEFT COLUMN: AI Checker + Filters + Doctor Cards ── */}
            <div className="flex-grow min-w-0">

              {/* AI Symptom Checker */}
              <div className="bg-white rounded-2xl border border-[#78355b]/15 shadow-sm p-5 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#78355b]/10 flex items-center justify-center">
                    <Brain size={16} className="text-[#78355b]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800">AI Symptom Checker</h2>
                    <p className="text-xs text-gray-400">Powered by Groq AI (Llama 3.1)</p>
                  </div>
                  <span className="ml-auto text-xs bg-[#78355b]/10 text-[#78355b] px-2 py-0.5 rounded-full font-medium">
                    Beta
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-3">
                  Describe your symptoms in plain English — our AI recommends the right specialist
                  and filters the list for you.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={symptoms}
                    onChange={e => setSymptoms(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSymptomCheck()}
                    placeholder="e.g. chest pain and shortness of breath..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#78355b] transition-colors"
                  />
                  <Button
                    onClick={handleSymptomCheck}
                    disabled={aiLoading}
                    className="bg-[#78355b] hover:bg-[#5e2947] text-white text-sm px-5 rounded-lg"
                  >
                    {aiLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Analyze"}
                  </Button>
                </div>

                {/* AI result — shown after successful analysis */}
                {aiResult && (
                  <div className="mt-4 p-4 bg-[#78355b]/5 rounded-xl border border-[#78355b]/15">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#78355b] flex items-center gap-1">
                          <Stethoscope size={14} />
                          Recommended: {aiResult.specialization}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">{aiResult.message}</p>
                        <p className="text-xs text-gray-400 mt-1 italic">{aiResult.disclaimer}</p>
                      </div>
                      <button
                        onClick={handleClearAiFilter}
                        className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0 flex items-center gap-1"
                      >
                        <X size={12} /> Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter bar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Filter size={14} />
                    <span className="text-xs font-semibold uppercase tracking-wide">Filter</span>
                  </div>

                  {/*
                    Controlled selects — value prop ensures they visually reset
                    when handleClearFilters is called
                  */}
                  <select
                    value={selectedSpecialization}
                    onChange={e => setSelectedSpecialization(e.target.value)}
                    className="text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#78355b]"
                  >
                    <option value="">Specialization</option>
                    {SPECIALIZATIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  <select
                    value={selectedGender}
                    onChange={e => setSelectedGender(e.target.value)}
                    className="text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#78355b]"
                  >
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>

                  <select
                    value={selectedSortBy}
                    onChange={e => setSelectedSortBy(e.target.value)}
                    className="text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#78355b]"
                  >
                    <option value="">Sort by</option>
                    <option value="experience-low-high">Experience: Low → High</option>
                    <option value="experience-high-low">Experience: High → Low</option>
                  </select>

                  <Button
                    onClick={handleFilter}
                    size="sm"
                    className="bg-[#78355b] hover:bg-[#5e2947] text-white rounded-lg text-sm"
                  >
                    Apply
                  </Button>

                  {/* Clear button — only shows when at least one filter is active */}
                  {(selectedSpecialization || selectedGender || selectedSortBy) && (
                    <Button
                      onClick={handleClearFilters}
                      size="sm"
                      variant="outline"
                      className="rounded-lg text-sm border-gray-300 text-gray-500 hover:text-red-500 hover:border-red-300 flex items-center gap-1"
                    >
                      <X size={12} /> Clear
                    </Button>
                  )}

                  {/* Shows filtered count vs total */}
                  <span className="ml-auto text-xs text-gray-400">
                    {memoizedDocs.length} of {originalDocs.length} doctor{originalDocs.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Doctor cards */}
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-[#78355b]" size={32} />
                </div>
              ) : currentPosts.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Stethoscope size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No doctors found. Try adjusting your filters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentPosts.map((doctor, idx) => (
                    <DoctorCard
                      key={idx}
                      doctor={doctor}
                      startDate={startDate}
                      onDateChange={setStartDate}
                      onCheckAvailability={handleAvailabilityCheck}
                    />
                  ))}
                </div>
              )}

              {/* Pagination — only shown when there are more doctors than one page */}
              {memoizedDocs.length > POSTS_PER_PAGE && (
                <PaginationBar
                  total={memoizedDocs.length}
                  perPage={POSTS_PER_PAGE}
                  current={currentPage}
                  onChange={setCurrentPage}
                />
              )}
            </div>

            {/* ── RIGHT SIDEBAR: About + FAQ ── */}
            <div className="w-72 flex-shrink-0 hidden lg:block">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">
                <Image
                  src={helpImg}
                  alt="Help"
                  width={288}
                  height={180}
                  className="w-full object-cover"
                />

                <div className="p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">About Delma Health</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Connecting patients with verified specialists for secure video consultations,
                    document sharing, and seamless appointment management.
                  </p>
                </div>

                <div className="border-t border-gray-100 p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-3">
                    {faq.map((item, idx) => (
                      <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="w-full text-left px-3 py-2.5 flex items-start justify-between gap-2 hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-xs text-gray-700 font-medium leading-snug">
                            {item.title}
                          </span>
                          <span className="text-gray-400 flex-shrink-0 mt-0.5 text-sm">
                            {item.show ? "−" : "+"}
                          </span>
                        </button>
                        {item.show && (
                          <div className="px-3 pb-3">
                            <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </WidthWrapper>
      </div>

      {/* ── SLOT SELECTION MODAL ── */}
      <Dialog open={isSlotModalOpen} onOpenChange={setIsSlotModalOpen}>
        <DialogContent className="fixed left-1/2 top-1/2 z-[100] w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-800">
              Available Slots
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              Booking with{" "}
              <span className="font-medium text-[#78355b]">Dr. {activeDoctor?.name}</span>
              {" "}for {startDate ? dayjs(startDate).format("DD MMM YYYY") : "Today"}
            </p>
            {activeDoctor && (
              <p className="text-xs text-gray-400 mt-0.5">
                Consultation fee:{" "}
                <span className="font-medium text-gray-600">₹{activeDoctor.fees}</span>
              </p>
            )}
          </DialogHeader>

          {/* Slot grid */}
          <div className="grid grid-cols-3 gap-2 my-5 max-h-56 overflow-y-auto">
            {availableSlots.length > 0 ? (
              availableSlots.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id.toString())}
                  className={`py-2.5 px-2 text-xs font-semibold rounded-xl border-2 transition-all ${
                    selectedSlotId === slot.id.toString()
                      ? "bg-[#78355b] text-white border-[#78355b] shadow-md scale-105"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:border-[#78355b] hover:text-[#78355b]"
                  }`}
                >
                  <Clock size={12} className="mx-auto mb-1" />
                  {slot.startTime?.substring(0, 5)}
                </button>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-400">
                <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No slots available for this date</p>
                <p className="text-xs mt-1">Try selecting a different date</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setIsSlotModalOpen(false)}
              className="flex-1 rounded-xl border-gray-200 text-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={makePayment}
              disabled={!selectedSlotId}
              className="flex-1 bg-[#78355b] hover:bg-[#5e2947] text-white rounded-xl disabled:opacity-40"
            >
              {selectedSlotId ? `Pay ₹${activeDoctor?.fees}` : "Select a slot"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCTOR CARD COMPONENT
// Renders a single doctor's info with date picker and availability button.
// Extracted as a separate component to keep the main page readable.
// ─────────────────────────────────────────────────────────────────────────────

interface DoctorCardProps {
  doctor: DoctorInputProps;
  startDate: Date | null;
  onDateChange: (date: Date | null) => void;
  onCheckAvailability: (id: number, name: string, doctor: DoctorInputProps) => void;
}

function DoctorCard({ doctor, startDate, onDateChange, onCheckAvailability }: DoctorCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex gap-4">

      {/* Doctor avatar — hidden on mobile */}
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#78355b]/10 flex-shrink-0 hidden md:block">
        <Image
          src={img3}
          alt={doctor.firstName}
          width={80}
          height={80}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Doctor info */}
      <div className="flex-grow min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-semibold text-gray-800">
              Dr. {doctor.firstName} {doctor.lastName}
            </h3>
            <span className="inline-block text-xs bg-[#78355b]/10 text-[#78355b] px-2 py-0.5 rounded-full mt-0.5">
              {doctor.specialization}
            </span>
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">{doctor.gender}</span>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          {doctor.address && (
            <span className="flex items-center gap-1">
              <MapPin size={11} className="text-gray-400" /> {doctor.address}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={11} className="text-gray-400" /> {doctor.experience} yrs experience
          </span>
          <span className="flex items-center gap-1 font-medium text-gray-700">
            <IndianRupee size={11} className="text-gray-400" /> {doctor.feesPerConsultation} per consultation
          </span>
        </div>
      </div>

      {/* Action column — date picker + availability button */}
      <div className="flex-shrink-0 flex flex-col gap-2 items-end justify-center">
        <div>
          <p className="text-[10px] text-gray-400 font-medium mb-1 text-right">SELECT DATE</p>
          <DatePicker
            defaultValue={dayjs(getTodaysDate(), DATE_FORMAT)}
            minDate={dayjs(getTodaysDate(), DATE_FORMAT)}
            onChange={(date: any) => onDateChange(date)}
            format={DATE_FORMAT}
            size="small"
          />
        </div>
        <Button
          size="sm"
          className="bg-[#78355b] hover:bg-[#5e2947] text-white rounded-lg text-xs w-full"
          onClick={() => onCheckAvailability(doctor.userId, doctor.firstName, doctor)}
        >
          Check Availability
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION COMPONENT
// Simple numbered pagination with prev/next arrows.
// ─────────────────────────────────────────────────────────────────────────────

interface PaginationBarProps {
  total: number;
  perPage: number;
  current: number;
  onChange: (page: number) => void;
}

function PaginationBar({ total, perPage, current, onChange }: PaginationBarProps) {
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="flex items-center justify-center gap-1 mt-8 pb-4">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[#78355b] hover:text-[#78355b] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={14} />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onChange(page)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
            current === page
              ? "bg-[#78355b] text-white"
              : "border border-gray-200 text-gray-600 hover:border-[#78355b] hover:text-[#78355b]"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onChange(Math.min(totalPages, current + 1))}
        disabled={current === totalPages}
        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[#78355b] hover:text-[#78355b] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
