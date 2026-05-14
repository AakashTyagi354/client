"use client";

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD — Delma Health Platform
//
// This page is the main overview for admins.
// It shows summary stats + two tabs:
//   1. Users tab   — list of all registered users
//   2. Doctors tab — list of all doctor applications with approve action
//
// API calls:
//   GET /api/v1/admin/getall-users    → fetch all users
//   GET /api/v1/admin/getall-doctors  → fetch all doctors (update URL when ready)
//   POST /api/v1/admin/approve-doctor → approve a pending doctor
//
// Auth: all requests require admin JWT in Authorization header
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/userSlice";
import {
  Users, Stethoscope, Clock, CheckCircle,
  XCircle, Search, RefreshCw, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

// ─────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

interface UserData {
  id: number;
  name: string;
  email: string;
  isAdmin: string;
  isVerified: boolean;
}

interface DoctorData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  specialization: string;
  experience: number;
  feesPerConsultation: number;
  status: string;
  userId: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const token = useSelector(selectToken);

  // ── Data state ──
  const [users, setUsers] = useState<UserData[]>([]);
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<"users" | "doctors">("users");

  // ── Search state ──
  const [userSearch, setUserSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");

  // ─────────────────────────────────────────────────────────────────────────
  // DATA FETCHING
  // ─────────────────────────────────────────────────────────────────────────

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8089/api/v1/admin/getall-users",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast({ variant: "destructive", description: "Could not load users" });
    }
  };

  const fetchDoctors = async () => {
    try {
      // TODO: update to new microservice endpoint when ready
      const res = await axios.get(
        "http://localhost:8089/api/v1/admin/getall-doctors",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDoctors(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      toast({ variant: "destructive", description: "Could not load doctors" });
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchDoctors()]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // APPROVE DOCTOR
  // Changes doctor status from PENDING → APPROVED
  // ─────────────────────────────────────────────────────────────────────────

  const handleApproveDoctor = async (doctorId: number) => {
    setApprovingId(doctorId);
    try {
      await axios.post(
        "http://localhost:8089/api/v1/admin/approve-doctor",
        { doctorId, status: "APPROVED" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ description: "Doctor approved successfully." });
      // Refresh doctor list after approval
      await fetchDoctors();
    } catch (err) {
      console.error("Failed to approve doctor:", err);
      toast({ variant: "destructive", description: "Could not approve doctor" });
    } finally {
      setApprovingId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FILTERED DATA — applied client-side based on search input
  // ─────────────────────────────────────────────────────────────────────────

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredDoctors = doctors.filter(d =>
    d.firstName?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    d.email?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  // ── Summary stats ──
  const pendingDoctors = doctors.filter(d => d.status === "PENDING").length;
  const approvedDoctors = doctors.filter(d => d.status === "APPROVED").length;
  const verifiedUsers = users.filter(u => u.isVerified).length;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage users, doctors, and platform settings
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#78355b] transition-colors"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users size={18} className="text-blue-500" />}
          label="Total Users"
          value={users.length}
          bg="bg-blue-50"
        />
        <StatCard
          icon={<CheckCircle size={18} className="text-green-500" />}
          label="Verified Users"
          value={verifiedUsers}
          bg="bg-green-50"
        />
        <StatCard
          icon={<Stethoscope size={18} className="text-[#78355b]" />}
          label="Active Doctors"
          value={approvedDoctors}
          bg="bg-[#78355b]/10"
        />
        <StatCard
          icon={<Clock size={18} className="text-amber-500" />}
          label="Pending Approvals"
          value={pendingDoctors}
          bg="bg-amber-50"
          highlight={pendingDoctors > 0}
        />
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex bg-white rounded-2xl border border-gray-100 p-1 w-fit mb-6 shadow-sm">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === "users"
              ? "bg-[#78355b] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users size={15} />
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("doctors")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === "doctors"
              ? "bg-[#78355b] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Stethoscope size={15} />
          Doctors ({doctors.length})
          {pendingDoctors > 0 && (
            <span className="bg-amber-400 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {pendingDoctors}
            </span>
          )}
        </button>
      </div>

      {/* ── USERS TAB ── */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Search bar */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#78355b]"
              />
            </div>
          </div>

          {/* Users table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">#</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-sm text-gray-400">
                      {loading ? "Loading users..." : "No users found"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <tr key={user.id || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#78355b]/10 flex items-center justify-center text-xs font-semibold text-[#78355b]">
                            {user.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                      <td className="px-4 py-3">
                        {user.isAdmin === "true" ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                            <Shield size={10} /> Admin
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckCircle size={10} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Clock size={10} /> Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── DOCTORS TAB ── */}
      {activeTab === "doctors" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Search bar */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={doctorSearch}
                onChange={e => setDoctorSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#78355b]"
              />
            </div>
          </div>

          {/* Doctors table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">#</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Doctor</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Specialization</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Exp.</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Fees</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-sm text-gray-400">
                      {loading ? "Loading doctors..." : "No doctors found"}
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doctor, idx) => (
                    <tr key={doctor.id || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#78355b]/10 flex items-center justify-center text-xs font-semibold text-[#78355b]">
                            {doctor.firstName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="text-sm font-medium text-gray-800">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{doctor.email}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-[#78355b]/10 text-[#78355b] px-2 py-0.5 rounded-full font-medium">
                          {doctor.specialization}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{doctor.experience} yrs</td>
                      <td className="px-4 py-3 text-sm text-gray-600">₹{doctor.feesPerConsultation}</td>
                      <td className="px-4 py-3">
                        {doctor.status === "APPROVED" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                            <CheckCircle size={10} /> Approved
                          </span>
                        ) : doctor.status === "REJECTED" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full font-medium">
                            <XCircle size={10} /> Rejected
                          </span>
                        ) : (
                          // PENDING — show approve button
                          <Button
                            size="sm"
                            onClick={() => handleApproveDoctor(doctor.id)}
                            disabled={approvingId === doctor.id}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1 h-7 rounded-lg"
                          >
                            {approvingId === doctor.id ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : (
                              "Approve"
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD COMPONENT
// Reusable summary card for the stats row at the top
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  bg: string;
  highlight?: boolean; // adds amber ring if true (for pending approvals)
}

function StatCard({ icon, label, value, bg, highlight }: StatCardProps) {
  return (
    <div className={`bg-white rounded-2xl border ${highlight ? "border-amber-200" : "border-gray-100"} shadow-sm p-5`}>
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
