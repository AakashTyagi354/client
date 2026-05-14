"use client";

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — Doctors Page
//
// Displays all doctors (approved + pending + rejected) in one unified table.
// Admin can approve pending doctors from this page.
//
// API calls:
//   GET  /api/v1/doctor/pending-doctors       → pending applications
//   GET  /api/users/doctors                   → approved doctors
//   PUT  /api/v1/admin/approve-doctors/{id}   → approve a doctor
//
// Strategy: fetch both lists, merge into one, filter client-side by status.
// Auth: requires admin JWT from Redux store
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/userSlice";
import axiosInstance from "@/app/login/axiosInstance";
import { Search, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

// Filter options for the tab bar
type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const getInitials = (firstName: string, lastName: string): string =>
  `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE — isolated component, one responsibility
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({
  status,
  doctorId,
  onApprove,
  isApproving,
}: {
  status: DoctorInputProps["status"];
  doctorId: number;
  onApprove: (id: number) => void;
  isApproving: boolean;
}) {
  if (status === "APPROVED")
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-green-50
                       text-green-600 px-2 py-1 rounded-full font-medium">
        <CheckCircle size={10} /> Approved
      </span>
    );

  if (status === "REJECTED")
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-red-50
                       text-red-500 px-2 py-1 rounded-full font-medium">
        <XCircle size={10} /> Rejected
      </span>
    );

  // PENDING — show approve button
  return (
    <button
      onClick={() => onApprove(doctorId)}
      disabled={isApproving}
      className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700
                 border border-amber-200 px-3 py-1 rounded-lg font-medium
                 hover:bg-amber-100 transition-colors disabled:opacity-50"
    >
      {isApproving ? (
        <RefreshCw size={10} className="animate-spin" />
      ) : (
        <Clock size={10} />
      )}
      {isApproving ? "Approving…" : "Pending"}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function DoctorsPage() {
  const token = useSelector(selectToken);

  const [doctors, setDoctors] = useState<DoctorInputProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH — merge approved + pending into one list
  // Single source of truth, filter client-side
  // ─────────────────────────────────────────────────────────────────────────

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [approvedRes, pendingRes] = await Promise.all([
        axiosInstance.get("http://localhost:8089/api/users/doctors", { headers }),
        axiosInstance.get("http://localhost:8089/api/v1/doctor/pending-doctors", { headers }),
      ]);

      const approved: DoctorInputProps[] = Array.isArray(approvedRes.data.data)
        ? approvedRes.data.data
        : [];

      const pending: DoctorInputProps[] = Array.isArray(pendingRes.data.data)
        ? pendingRes.data.data
        : [];

      // Merge — pending first so admins see them at the top
      setDoctors([...pending, ...approved]);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      toast({ variant: "destructive", description: "Could not load doctors" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // APPROVE DOCTOR
  // Fix: headers go in 3rd arg of axios.put, not 2nd (was being sent as body)
  // Fix: refetch full list after approval instead of setting from response
  // ─────────────────────────────────────────────────────────────────────────

  const handleApprove = async (doctorId: number) => {
    setApprovingId(doctorId);
    try {
      const res = await axiosInstance.put(
        `http://localhost:8089/api/v1/admin/approve-doctors/${doctorId}`,
        {}, // empty body — this is a status change, no body needed
        { headers: { Authorization: `Bearer ${token}` } } // ← fix: 3rd arg
      );
      toast({ description: res.data.message || "Doctor approved successfully" });
      // Refetch full list — approve response returns one doctor, not the list
      await fetchDoctors();
    } catch (err) {
      console.error("Failed to approve doctor:", err);
      toast({ variant: "destructive", description: "Could not approve doctor" });
    } finally {
      setApprovingId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FILTERED LIST — status tab + search applied together
  // ─────────────────────────────────────────────────────────────────────────

  const filteredDoctors = doctors.filter((d) => {
    const matchesStatus =
      statusFilter === "ALL" || d.status === statusFilter;

    const term = search.toLowerCase();
    const matchesSearch =
      d.firstName?.toLowerCase().includes(term) ||
      d.lastName?.toLowerCase().includes(term) ||
      d.email?.toLowerCase().includes(term) ||
      d.specialization?.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  // Status counts for filter tabs
  const counts = {
    ALL: doctors.length,
    PENDING: doctors.filter((d) => d.status === "PENDING").length,
    APPROVED: doctors.filter((d) => d.status === "APPROVED").length,
    REJECTED: doctors.filter((d) => d.status === "REJECTED").length,
  };

  const filterTabs: { label: string; value: StatusFilter }[] = [
    { label: `All (${counts.ALL})`, value: "ALL" },
    { label: `Pending (${counts.PENDING})`, value: "PENDING" },
    { label: `Approved (${counts.APPROVED})`, value: "APPROVED" },
    { label: `Rejected (${counts.REJECTED})`, value: "REJECTED" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Doctors</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Manage doctor applications and approvals
        </p>
      </div>

      {/* Search + status filter bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">

        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, email, specialization…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl
                       focus:outline-none focus:border-[#78355b] bg-white
                       transition-colors w-72"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex bg-white rounded-xl border border-gray-100 p-1 gap-0.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === tab.value
                  ? "bg-[#78355b] text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={fetchDoctors}
          disabled={loading}
          className="ml-auto flex items-center gap-1.5 text-xs text-gray-400
                     hover:text-[#78355b] transition-colors"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["#", "Doctor", "Email", "Specialization", "Exp.", "Fees", "Status"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-gray-400
                               uppercase tracking-wide px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">

              {loading && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm text-gray-400">
                    Loading doctors…
                  </td>
                </tr>
              )}

              {!loading && filteredDoctors.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm text-gray-400">
                    No doctors found
                  </td>
                </tr>
              )}

              {!loading &&
                filteredDoctors.map((doctor, idx) => (
                  <tr
                    key={doctor.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>

                    {/* Avatar + full name + gender */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#78355b]/10 flex items-center
                                        justify-center text-xs font-semibold text-[#78355b] flex-shrink-0">
                          {getInitials(doctor.firstName, doctor.lastName)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{doctor.gender}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-500">{doctor.email}</td>

                    <td className="px-4 py-3">
                      <span className="text-xs bg-[#78355b]/10 text-[#78355b]
                                       px-2 py-0.5 rounded-full font-medium">
                        {doctor.specialization}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {doctor.experience} yrs
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      ₹{doctor.feesPerConsultation}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        status={doctor.status}
                        doctorId={doctor.id}
                        onApprove={handleApprove}
                        isApproving={approvingId === doctor.id}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}