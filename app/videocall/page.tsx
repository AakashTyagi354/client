"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectToken, selectUser } from "@/redux/userSlice";
import {
  selectDoctor,
} from "@/redux/doctorSlice";
import axiosInstance from "@/app/login/axiosInstance";
import Link from "next/link";
import {
  Video,
  Calendar,
  Clock,
  User,
  Loader2,
  LogIn,
  Lock,
  History,
  Sparkles,
} from "lucide-react";
import MyConsultationReports from "@/components/MyConsultationReports";
import axios from "axios";

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateStr: string | null): string => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const isJoinable = (
  slotStartTime: string | null,
  slotEndTime: string | null
): boolean => {
  if (!slotStartTime) return false;
  const now = new Date();
  const start = new Date(slotStartTime);
  const end = slotEndTime ? new Date(slotEndTime) : null;
  const fiveMinBefore = new Date(start.getTime() - 5 * 60 * 1000);
  if (end) return now >= fiveMinBefore && now <= end;
  return now >= fiveMinBefore;
};

const getCountdown = (slotStartTime: string | null): string => {
  if (!slotStartTime) return "";
  const now = new Date();
  const start = new Date(slotStartTime);
  const fiveMinBefore = new Date(start.getTime() - 5 * 60 * 1000);
  const diff = fiveMinBefore.getTime() - now.getTime();
  if (diff <= 0) return "";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `in ${hours}h ${mins}m`;
  return `in ${mins}m`;
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    BOOKED: "bg-blue-50 text-blue-600",
    COMPLETED: "bg-green-50 text-green-600",
    CANCELLED: "bg-red-50 text-red-500",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                      ${styles[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

function JoinButton({
  appointmentId,
  slotStartTime,
  slotEndTime,
}: {
  appointmentId: number;
  slotStartTime: string | null;
  slotEndTime: string | null;
}) {
  const joinable = isJoinable(slotStartTime, slotEndTime);
  const countdown = getCountdown(slotStartTime);

  if (joinable) {
    return (
      <Link href={`/videocall/${appointmentId}`}>
        <button className="flex items-center gap-1.5 px-3 py-1.5
                           bg-[#78355b] text-white text-xs font-medium
                           rounded-lg hover:bg-[#6a2d50] transition-colors">
          <Video size={12} />
          Join
        </button>
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button
        disabled
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100
                   text-gray-400 text-xs font-medium rounded-lg
                   cursor-not-allowed"
      >
        <Lock size={11} />
        Locked
      </button>
      {countdown && (
        <span className="text-[10px] text-gray-400 text-center">
          {countdown}
        </span>
      )}
    </div>
  );
}

function AppointmentTable({
  appointments,
  idLabel,
  idField,
  showJoin,
}: {
  appointments: AppointmentResponse[];
  idLabel: string;
  idField: "doctorId" | "userId";
  showJoin: boolean;
}) {
  const columns = [
    "#", idLabel, "Date", "Time", "Status",
    ...(showJoin ? ["Action"] : []),
  ];

  return (
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          {columns.map((h) => (
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
        {appointments.map((appt, idx) => (
          <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#78355b]/10
                                flex items-center justify-center flex-shrink-0">
                  <User size={12} className="text-[#78355b]" />
                </div>
                <span className="text-sm text-gray-700">
                  {idLabel} #{appt[idField]}
                </span>
              </div>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Calendar size={13} className="text-gray-400" />
                {formatDate(appt.slotStartTime)}
              </div>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Clock size={13} className="text-gray.400" />
                {formatTime(appt.slotStartTime)}
                {appt.slotEndTime && (
                  <span className="text-xs text-gray-400">
                    → {formatTime(appt.slotEndTime)}
                  </span>
                )}
              </div>
            </td>
            <td className="px-4 py-3">
              <StatusBadge status={appt.status} />
            </td>
            {showJoin && (
              <td className="px-4 py-3">
                <JoinButton
                  appointmentId={appt.id}
                  slotStartTime={appt.slotStartTime}
                  slotEndTime={appt.slotEndTime}
                />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AppointmentList({
  appointments,
  loading,
  title,
  subtitle,
  idLabel,
  idField,
  middleSection,
}: {
  appointments: AppointmentResponse[];
  loading: boolean;
  title: string;
  subtitle: string;
  idLabel: string;
  idField: "doctorId" | "userId";
  middleSection?: React.ReactNode;
}) {
  const active = appointments.filter((a) => a.status === "BOOKED");
  const history = appointments.filter(
    (a) => a.status === "COMPLETED" || a.status === "CANCELLED"
  );

  return (
    <div className="p-6 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#78355b]" />
        </div>
      )}

      {/* No appointments */}
      {!loading && appointments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20
                        bg-white rounded-2xl border border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-[#78355b]/8 flex items-center
                          justify-center mb-4">
            <Calendar size={24} className="text-[#78355b]" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            No appointments yet
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Booked appointments will appear here
          </p>
        </div>
      )}

      {/* ── Upcoming appointments ── */}
      {!loading && active.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100
                        shadow-sm overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center
                          justify-between">
            <div className="flex items-center gap-2">
              <Video size={14} className="text-[#78355b]" />
              <span className="text-sm font-medium text-gray-700">
                Upcoming
              </span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1
                             rounded-full">
              {active.length} appointment{active.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="overflow-x-auto">
            <AppointmentTable
              appointments={active}
              idLabel={idLabel}
              idField={idField}
              showJoin={true}
            />
          </div>
        </div>
      )}

      {/* ── Middle section — consultation reports ── */}
      {middleSection}

      {/* ── History ── */}
      {!loading && history.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100
                        shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center
                          justify-between">
            <div className="flex items-center gap-2">
              <History size={14} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                History
              </span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1
                             rounded-full">
              {history.length} past
            </span>
          </div>
          <div className="overflow-x-auto">
            <AppointmentTable
              appointments={history}
              idLabel={idLabel}
              idField={idField}
              showJoin={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function UserAppointments() {
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id || !token) return;
     const controller = new AbortController();

    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get<ApiResponse<AppointmentResponse[]>>(
  "/api/v1/appointments/user",  // ← relative path
  {
    params: { userId: user.id },
    signal: controller.signal   // ← add this
  }
);
        setAppointments(res.data.data || []);
      } catch (err) {
         if (axios.isCancel(err)) return;
        console.error("Failed to fetch appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => controller.abort();
  }, [user, token]);

  return (
    <AppointmentList
      appointments={appointments}
      loading={loading}
      title={`Welcome, ${user?.name}`}
      subtitle="Your upcoming and past appointments"
      idLabel="Doctor ID"
      idField="doctorId"
      middleSection={
        <div className="bg-white rounded-2xl border border-gray-100
                        shadow-sm overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center
                          justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#78355b]" />
              <span className="text-sm font-medium text-gray-700">
                My Consultation Reports
              </span>
            </div>
          </div>
          <div className="p-4">
            <MyConsultationReports />
          </div>
        </div>
      }
    />
  );
}

function DoctorAppointments() {
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const doctor = useSelector(selectDoctor);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id || !token) return;
     const controller = new AbortController();
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get<ApiResponse<AppointmentResponse[]>>(
          "/api/v1/appointments/doctor",
          {
            params: { doctorId: user.id },
             signal: controller.signal 
          }
        );
        setAppointments(res.data.data || []);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Failed to fetch doctor appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => controller.abort();
  }, [user, token]);

  return (
    <AppointmentList
      appointments={appointments}
      loading={loading}
      title={`Welcome, Dr. ${doctor?.name ?? user?.name}`}
      subtitle="Your patient appointments"
      idLabel="Patient ID"
      idField="userId"
    />
  );
}

export default function VideoCallPage() {
  const userToken = useSelector(selectToken);
  const user = useSelector(selectUser);

  if (user?.isDoctor) return <DoctorAppointments />;
  if (userToken) return <UserAppointments />;

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px]
                    text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center
                      justify-center mb-4">
        <Video size={24} className="text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-700 mb-1">
        Please login to view your appointments
      </p>
      <Link
        href="/login"
        className="flex items-center gap-1.5 text-sm text-[#78355b]
                   hover:underline font-medium mt-2"
      >
        <LogIn size={14} />
        Login
      </Link>
    </div>
  );
}