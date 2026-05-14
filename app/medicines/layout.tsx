// ─────────────────────────────────────────────────────────────────────────────
// Medicines Layout — /medicines/**
//
// Wraps all pages under /medicines/ with the MedicineNavbar.
// MedicineNavbar renders sticky below the main Navbar (top-14).
//
// Fixes applied:
//   - Removed unused Button and Link imports
//   - Removed unnecessary Readonly wrapper on props
//   - Removed redundant Fragment wrapper
// ─────────────────────────────────────────────────────────────────────────────

import MedicineNavbar from "@/components/MedicineNavbar";

export default function MedicinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <MedicineNavbar />
      <div className="flex-grow">{children}</div>
    </main>
  );
}