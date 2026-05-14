"use client";

// ─────────────────────────────────────────────────────────────────────────────
// DoctorPatientSidebar — Patient list for doctor's document view
//
// Fetches all appointments for the logged-in doctor.
// Each patient links to /docdoc/{userId} to view their documents.
//
// API:
//   GET /api/v1/appointments/doctor?doctorId={id}
//   Response: ApiResponse<AppointmentResponse[]>
//
// Fixes applied:
//   - Dead render.com URL replaced with correct local endpoint
//   - selectToken from userSlice — doctor JWT lives there not doctorSlice
//   - key={appt.userId} instead of key={idx}
//   - axiosInstance instead of axios
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectToken, selectUser } from "@/redux/userSlice";
import axiosInstance from "@/app/login/axiosInstance";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Loader2, FileText } from "lucide-react";

export default function DoctorPatientSidebar() {
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);
  const pathname = usePathname();

  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH DOCTOR APPOINTMENTS
  // Fix: correct endpoint — was hitting dead render.com URL
  // Fix: selectToken from userSlice — doctor JWT lives there
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id || !token) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get<ApiResponse<AppointmentResponse[]>>(
          "http://localhost:8089/api/v1/appointments/doctor",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { doctorId: user.id },
          }
        );
        // Deduplicate by userId — same patient may have multiple appointments
        const seen = new Set<number>();
        const unique = (res.data.data || []).filter((a) => {
          if (seen.has(a.userId)) return false;
          seen.add(a.userId);
          return true;
        });
        setAppointments(unique);
      } catch (err) {
        console.error("Failed to fetch doctor appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, token]);

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-100">
        <div className="w-7 h-7 rounded-lg bg-[#78355b] flex items-center
                        justify-center flex-shrink-0">
          <FileText size={13} className="text-white" />
        </div>
        <p className="text-sm font-semibold text-gray-800">Patient Documents</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="animate-spin text-[#78355b]" />
        </div>
      )}

      {/* Empty state */}
      {!loading && appointments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10
                        text-center px-4">
          <User size={24} className="text-gray-300 mb-2" />
          <p className="text-xs text-gray-400">No patients yet</p>
        </div>
      )}

      {/* Patient list */}
      {!loading && appointments.length > 0 && (
        <nav className="flex flex-col py-2 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase
                        tracking-widest px-4 mb-2">
            Patients
          </p>
          {appointments.map((appt) => {
            const active = pathname === `/docdoc/${appt.userId}`;
            return (
              <Link
                key={appt.userId}
                href={`/docdoc/${appt.userId}`}
              >
                <div className={`flex items-center gap-3 px-4 py-3
                                 transition-colors cursor-pointer
                                 ${active
                                   ? "bg-[#78355b]/10 border-r-2 border-[#78355b]"
                                   : "hover:bg-gray-50"
                                 }`}>
                  <div className="w-8 h-8 rounded-full bg-[#78355b]/10 flex
                                  items-center justify-center flex-shrink-0">
                    <User size={14} className="text-[#78355b]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Patient #{appt.userId}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {appt.status}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}