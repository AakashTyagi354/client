"use client";

// ─────────────────────────────────────────────────────────────────────────────
// HOME PAGE — Delma Health Platform
//
// Sections:
//   1. Hero — headline + CTA + illustration
//   2. How It Works — 4-step process with icons
//   3. Common Health Concerns — horizontal swiper with category cards
//   4. Benefits of Online Consultation — feature grid
//   5. FAQs — accordion
//
// All data is defined as constants at the top for easy editing.
// No API calls on this page — it's purely static/marketing content.
// ─────────────────────────────────────────────────────────────────────────────

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";
import {
  ArrowRight, Check, MapPin, FileText,
  Video, ShoppingBag, Shield, Clock,
  Star, ChevronDown, ChevronUp, Stethoscope,
  Heart, Brain, Pill
} from "lucide-react";
import { useState } from "react";

import WidthWrapper from "@/components/WidthWrapper";
import { Button } from "@/components/ui/button";

import homeImg from "../public/images/img1.png";
import h1img from "../public/images/h1.jpeg";
import h2img from "../public/images/h2.jpeg";
import h3img from "../public/images/h3.jpeg";
import h4img from "../public/images/h4.jpeg";
import h5img from "../public/images/h5.jpeg";
import h6img from "../public/images/h6.jpeg";
import h7img from "../public/images/h7.jpeg";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/free-mode";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS — edit all content here, no need to touch JSX
// ─────────────────────────────────────────────────────────────────────────────

const HEALTH_CONCERNS = [
  { title: "Cold & Cough", price: 399, img: h1img },
  { title: "Period Problems", price: 599, img: h2img },
  { title: "Skin Problems", price: 340, img: h3img },
  { title: "Depression & Anxiety", price: 499, img: h4img },
  { title: "Stomach Problems", price: 299, img: h5img },
  { title: "Weight Management", price: 350, img: h6img },
  { title: "Child Health", price: 599, img: h7img },
];

// 4-step process shown in "How it Works" section
const HOW_IT_WORKS = [
  {
    icon: <MapPin size={24} className="text-[#78355b]" />,
    step: "01",
    title: "Find a Doctor",
    desc: "Browse verified specialists by condition or use our AI symptom checker to find the right doctor.",
  },
  {
    icon: <FileText size={24} className="text-[#78355b]" />,
    step: "02",
    title: "Upload Reports",
    desc: "Share your lab reports and medical documents securely before the consultation.",
  },
  {
    icon: <Video size={24} className="text-[#78355b]" />,
    step: "03",
    title: "Video Consultation",
    desc: "Connect with your doctor via encrypted HD video call at your scheduled time.",
  },
  {
    icon: <ShoppingBag size={24} className="text-[#78355b]" />,
    step: "04",
    title: "Get Medicines",
    desc: "Order prescribed medications directly from our medical store with doorstep delivery.",
  },
];

const BENEFITS = [
  {
    icon: <Clock size={20} className="text-[#78355b]" />,
    title: "Consult 24x7",
    desc: "Connect instantly with specialists round the clock or schedule at your convenience.",
  },
  {
    icon: <Stethoscope size={20} className="text-[#78355b]" />,
    title: "Verified Doctors",
    desc: "Every doctor is manually verified with credentials, registrations, and certifications.",
  },
  {
    icon: <Shield size={20} className="text-[#78355b]" />,
    title: "100% Private",
    desc: "AES-256 encrypted consultations. Your medical data is never shared without consent.",
  },
  {
    icon: <Star size={20} className="text-[#78355b]" />,
    title: "Clinic Experience",
    desc: "HD video calls with prescription delivery and structured follow-up care.",
  },
  {
    icon: <Heart size={20} className="text-[#78355b]" />,
    title: "Free Follow-up",
    desc: "Get a valid digital prescription with a 7-day free follow-up for clarifications.",
  },
  {
    icon: <Brain size={20} className="text-[#78355b]" />,
    title: "AI Symptom Check",
    desc: "Describe your symptoms in plain English — our AI recommends the right specialist.",
  },
];

const FAQS = [
  {
    q: "What is online doctor consultation?",
    a: "Online doctor consultation connects patients and doctors virtually. It's a convenient way to get medical advice using Delma's platform — no travel required, same quality of care.",
  },
  {
    q: "Are the doctors on Delma qualified?",
    a: "Yes. Every doctor goes through a strict manual verification process where our team checks necessary documents, medical registrations, and certifications before they can practice on Delma.",
  },
  {
    q: "Is online consultation safe and secure?",
    a: "Absolutely. All consultations are protected with AES-256 encryption and our platform is compliant with industry privacy standards. Your health data is never shared without your consent.",
  },
  {
    q: "What if I don't get a response from a doctor?",
    a: "In the unlikely event that a doctor doesn't respond within the promised time, you are entitled to a 100% refund — no questions asked.",
  },
  {
    q: "How do I book an appointment?",
    a: "Select a doctor from our listings or use the AI symptom checker, pick an available time slot, complete payment via Razorpay, and you're confirmed. The whole process takes under 2 minutes.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HOME PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="pb-24 bg-white">

      {/* ── SECTION 1: HERO ── */}
      <HeroSection />

      {/* ── SECTION 2: HOW IT WORKS ── */}
      <HowItWorksSection />

      {/* ── SECTION 3: HEALTH CONCERNS SWIPER ── */}
      <HealthConcernsSection />

      {/* ── SECTION 4: BENEFITS ── */}
      <BenefitsSection />

      {/* ── SECTION 5: FAQs ── */}
      <FaqSection />

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO SECTION
// Split layout: left = headline + CTA, right = illustration
// ─────────────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <div className="bg-gradient-to-br from-[#fdf0ee] via-[#f9e4e8] to-[#fdf0ee] overflow-hidden">
      <WidthWrapper>
        <div className="flex flex-col md:flex-row items-center min-h-[540px] py-16 gap-8">

          {/* Left: Text content */}
          <div className="flex-1 flex flex-col items-start gap-6">
            {/* Pill badge */}
            <span className="inline-flex items-center gap-1.5 bg-[#78355b]/10 text-[#78355b] text-xs font-semibold px-3 py-1.5 rounded-full">
              <Pill size={12} />
              Trusted by 50,000+ patients
            </span>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight">
              Medical Care from the{" "}
              <span className="text-[#78355b]">Comfort</span>{" "}
              of Your Home
            </h1>

            <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-md">
              Delma connects you with verified specialists for secure video
              consultations, document sharing, and prescription delivery —
              anytime, anywhere.
            </p>

            {/* Stats row */}
            <div className="flex gap-6">
              {[
                { value: "500+", label: "Doctors" },
                { value: "50K+", label: "Patients" },
                { value: "4.8★", label: "Rating" },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-xl font-bold text-[#78355b]">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3 flex-wrap">
              <Link href="/finddoc">
                <Button className="bg-[#78355b] hover:bg-[#5e2947] text-white px-6 py-2.5 rounded-xl flex items-center gap-2">
                  Find a Doctor <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/finddoc">
                <Button
                  variant="outline"
                  className="border-[#78355b] text-[#78355b] hover:bg-[#78355b]/5 px-6 py-2.5 rounded-xl"
                >
                  Try AI Symptom Check
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Illustration — hidden on mobile */}
          <div className="flex-1 hidden md:flex justify-center items-end">
            <Image
              src={homeImg}
              alt="Doctor consultation illustration"
              height={480}
              width={520}
              className="object-contain drop-shadow-xl"
              priority
            />
          </div>

        </div>
      </WidthWrapper>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOW IT WORKS SECTION
// 4 numbered steps in a horizontal row (vertical on mobile)
// ─────────────────────────────────────────────────────────────────────────────

function HowItWorksSection() {
  return (
    <section className="py-20 bg-white">
      <WidthWrapper>
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-[#78355b] uppercase tracking-widest mb-2">
            Simple Process
          </p>
          <h2 className="text-3xl font-bold text-gray-800">How It Works</h2>
          <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
            From finding a doctor to getting your prescription — everything in 4 easy steps.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connector line — desktop only */}
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-[#78355b]/20 to-transparent" />

          {HOW_IT_WORKS.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-[#78355b]/5 transition-colors group"
            >
              {/* Step number + icon */}
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-2xl bg-[#78355b]/10 flex items-center justify-center group-hover:bg-[#78355b]/20 transition-colors">
                  {item.icon}
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#78355b] text-white text-xs font-bold flex items-center justify-center">
                  {item.step}
                </span>
              </div>

              <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </WidthWrapper>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH CONCERNS SECTION
// Horizontal swiper showing condition cards with price and book CTA
// ─────────────────────────────────────────────────────────────────────────────

function HealthConcernsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <WidthWrapper>
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-[#78355b] uppercase tracking-widest mb-1">
              Browse by Condition
            </p>
            <h2 className="text-3xl font-bold text-gray-800">Common Health Concerns</h2>
          </div>
          <Link href="/finddoc">
            <Button
              variant="outline"
              size="sm"
              className="border-[#78355b] text-[#78355b] hover:bg-[#78355b]/5 rounded-xl hidden md:flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        {/* Swiper — 2 cards on mobile, 5 on desktop */}
        <Swiper
          breakpoints={{
            340: { slidesPerView: 2, spaceBetween: 12 },
            700: { slidesPerView: 4, spaceBetween: 16 },
            1024: { slidesPerView: 5, spaceBetween: 16 },
          }}
          freeMode={true}
          pagination={{ clickable: true }}
          modules={[FreeMode, Pagination]}
          className="w-full pb-10"
        >
          {HEALTH_CONCERNS.map((item, idx) => (
            <SwiperSlide key={idx}>
              <Link href="/finddoc">
                <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100">
                  {/* Condition image */}
                  <div className="overflow-hidden h-36 md:h-44">
                    <Image
                      src={item.img}
                      alt={item.title}
                      width={250}
                      height={176}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Card content */}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-700 leading-tight mb-1">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400 mb-2">
                      Starts at <span className="font-bold text-gray-700">₹{item.price}</span>
                    </p>
                    <span className="text-xs text-[#78355b] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Book now <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </WidthWrapper>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BENEFITS SECTION
// 6-card grid highlighting platform advantages
// ─────────────────────────────────────────────────────────────────────────────

function BenefitsSection() {
  return (
    <section className="py-20 bg-white">
      <WidthWrapper>
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-[#78355b] uppercase tracking-widest mb-2">
            Why Choose Delma
          </p>
          <h2 className="text-3xl font-bold text-gray-800">
            Benefits of Online Consultation
          </h2>
          <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
            Everything you need for quality healthcare — without leaving your home.
          </p>
        </div>

        {/* Benefits grid — 1 col mobile, 2 tablet, 3 desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:border-[#78355b]/20 hover:bg-[#78355b]/5 transition-all group"
            >
              {/* Icon box */}
              <div className="w-10 h-10 rounded-xl bg-[#78355b]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#78355b]/20 transition-colors">
                {item.icon}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Check size={14} className="text-[#78355b]" />
                  <h3 className="font-semibold text-gray-800 text-sm">{item.title}</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div className="mt-12 bg-gradient-to-r from-[#78355b] to-[#a0526e] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              Ready to consult a doctor?
            </h3>
            <p className="text-white/70 text-sm">
              Get started in under 2 minutes. No appointment needed for instant consultations.
            </p>
          </div>
          <Link href="/finddoc">
            <Button className="bg-white text-[#78355b] hover:bg-gray-100 px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 flex-shrink-0">
              Find a Doctor Now <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </WidthWrapper>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ SECTION
// Accordion — click to expand/collapse each question
// Uses React state instead of native <details> for consistent animation
// ─────────────────────────────────────────────────────────────────────────────

function FaqSection() {
  // Track which FAQ item is open — only one open at a time
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(prev => (prev === idx ? null : idx));
  };

  return (
    <section className="py-20 bg-gray-50">
      <WidthWrapper>
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-[#78355b] uppercase tracking-widest mb-2">
            Got Questions?
          </p>
          <h2 className="text-3xl font-bold text-gray-800">
            Frequently Asked Questions
          </h2>
        </div>

        {/* FAQ list — max width for readability */}
        <div className="max-w-2xl mx-auto space-y-3">
          {FAQS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              {/* Question row — clickable */}
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-800 text-sm pr-4">
                  {item.q}
                </span>
                {openIdx === idx ? (
                  <ChevronUp size={18} className="text-[#78355b] flex-shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
                )}
              </button>

              {/* Answer — shown when open */}
              {openIdx === idx && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </WidthWrapper>
    </section>
  );
}
