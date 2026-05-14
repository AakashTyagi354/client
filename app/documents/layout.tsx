// ─────────────────────────────────────────────────────────────────────────────
// Documents Layout — /documents/**
//
// Sidebar with two nav links:
//   - View Documents  → /documents/files
//   - Upload Documents → /documents/uploads
//
// Active link highlighted using usePathname()
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Upload } from "lucide-react";

const DOC_NAV = [
  { label: "View Documents", href: "/documents/files", icon: FileText },
  { label: "Upload Documents", href: "/documents/uploads", icon: Upload },
];

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main className="flex min-h-screen bg-gray-50">

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-white
                        border-r border-gray-100 shadow-sm py-6 px-3">

        {/* Brand */}
        <div className="flex items-center gap-2 px-3 mb-5">
          <div className="w-7 h-7 rounded-lg bg-[#78355b] flex items-center
                          justify-center flex-shrink-0">
            <FileText size={13} className="text-white" />
          </div>
          <p className="text-sm font-semibold text-gray-800">Documents</p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5">
          {DOC_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-2.5 px-3 py-2.5
                                rounded-xl text-sm font-medium transition-colors
                                ${active
                                  ? "bg-[#78355b]/10 text-[#78355b]"
                                  : "text-gray-600 hover:bg-[#78355b]/5 hover:text-[#78355b]"
                                }`}>
                  <item.icon size={15} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 overflow-auto">
        {children}
      </div>

    </main>
  );
}