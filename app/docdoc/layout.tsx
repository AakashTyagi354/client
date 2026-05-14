// ─────────────────────────────────────────────────────────────────────────────
// Doctor Documents Layout — /docdoc/**
//
// Sidebar shows list of patients who have appointments with this doctor.
// Clicking a patient loads their documents in the main content area.
// ─────────────────────────────────────────────────────────────────────────────

import DoctorPatientSidebar from "@/components/DoctorPatientSidebar";

export default function DocDocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen bg-gray-50">

      {/* Sidebar — patient list */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 bg-white
                        border-r border-gray-100 shadow-sm">
        <DoctorPatientSidebar />
      </aside>

      {/* Main content — patient documents */}
      <div className="flex-1 min-w-0 overflow-auto">
        {children}
      </div>

    </main>
  );
}