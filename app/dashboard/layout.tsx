// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD LAYOUT — Delma Health Platform
//
// This layout wraps all pages under /dashboard/
// It renders a fixed left sidebar with navigation links
// and a scrollable main content area on the right.
//
// Sidebar sections:
//   1. Appointments Controls — Users, Doctors management
//   2. E-Store Controls      — Categories, Products management
//
// The sidebar is hidden on mobile (use a hamburger menu if needed later).
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import {
  Users, Stethoscope, Tag, Package,
  List, LayoutDashboard, Heart
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// NAV ITEM CONFIG
// Each item has a label, icon, href, and optional variant
// ─────────────────────────────────────────────────────────────────────────────

const APPOINTMENTS_NAV = [
  { label: "Users", href: "/dashboard/users", icon: <Users size={15} /> },
  { label: "Doctors", href: "/dashboard/doctors", icon: <Stethoscope size={15} /> },
];

const ESTORE_NAV = [
  { label: "Create Category", href: "/dashboard/createcat", icon: <Tag size={15} /> },
  { label: "Create Product", href: "/dashboard/createproduct", icon: <Package size={15} /> },
  { label: "Listed Products", href: "/dashboard/products", icon: <List size={15} /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen bg-gray-50">

      {/* ── LEFT SIDEBAR — hidden on mobile ── */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 shadow-sm flex-shrink-0">

        {/* Sidebar brand header */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-[#78355b] flex items-center justify-center flex-shrink-0">
            <Heart size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Delma Admin</p>
            <p className="text-xs text-gray-400">Control Panel</p>
          </div>
        </div>

        {/* Dashboard home link */}
        <div className="px-3 pt-4">
          <Link href="/dashboard">
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-[#78355b]/5 hover:text-[#78355b] transition-colors">
              <LayoutDashboard size={15} />
              Overview
            </div>
          </Link>
        </div>

        {/* ── APPOINTMENTS SECTION ── */}
        <div className="px-3 mt-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">
            Appointments
          </p>
          <nav className="flex flex-col gap-0.5">
            {APPOINTMENTS_NAV.map(item => (
              <Link key={item.href} href={item.href}>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-[#78355b]/5 hover:text-[#78355b] transition-colors">
                  {item.icon}
                  {item.label}
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* ── E-STORE SECTION ── */}
        <div className="px-3 mt-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">
            E-Store
          </p>
          <nav className="flex flex-col gap-0.5">
            {ESTORE_NAV.map(item => (
              <Link key={item.href} href={item.href}>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-[#78355b]/5 hover:text-[#78355b] transition-colors">
                  {item.icon}
                  {item.label}
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom spacer */}
        <div className="flex-1" />

        {/* Sidebar footer */}
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">Delma Health Platform</p>
          <p className="text-xs text-gray-300">Admin v1.0</p>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 min-w-0 overflow-auto">
        {children}
      </div>

    </main>
  );
}
