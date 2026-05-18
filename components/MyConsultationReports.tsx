"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectToken, selectUser } from "@/redux/userSlice";
import axiosInstance from "@/app/login/axiosInstance";
import {
  Sparkles, FileText, ChevronDown,
  ChevronUp, Loader2, Calendar, Clock
} from "lucide-react";

interface PatientConsultationView {
  id: number;
  appointmentId: number;
  chiefComplaint: string;
  diagnosis: string;
  aiReport: string;
  status: string;
  createdAt: string;
}

export default function MyConsultationReports() {
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);
  const [reports, setReports] = useState<PatientConsultationView[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id || !token) return;
    setLoading(true);
    console.log("MyConsultationReports — fetching for userId:", user.id);
    axiosInstance
      .get(
        `http://localhost:8089/api/v1/consultation-notes/patient/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        console.log("MyConsultationReports — response:", res.data);
        setReports(res.data.data || []);
      })
      .catch((err) => {
        console.error("MyConsultationReports — error:", err);
      })
      .finally(() => setLoading(false));
  }, [user?.id, token]);

  // Report is ready if AI report text exists — regardless of status
  // Status DRAFT with aiReport present = report was generated but
  // status update failed — still show the report to patient
  const isReportReady = (report: PatientConsultationView) =>
    report.aiReport && report.aiReport.length > 0;

  if (loading) return (
    <div className="flex justify-center py-10">
      <Loader2 size={24} className="animate-spin text-[#78355b]" />
    </div>
  );

  if (reports.length === 0) return (
    <div className="flex flex-col items-center py-12 text-center">
      <FileText size={32} className="text-gray-200 mb-3" />
      <p className="text-sm font-medium text-gray-500">
        No consultation reports yet
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Reports appear here after your video consultations
      </p>
    </div>
  );

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div key={report.id}
             className="bg-white border border-gray-100 rounded-2xl
                        shadow-sm overflow-hidden">

          <div
            className="flex items-center justify-between p-4
                       cursor-pointer hover:bg-gray-50 transition"
            onClick={() =>
              setExpanded(expanded === report.id ? null : report.id)}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#78355b]/10
                              flex items-center justify-center flex-shrink-0">
                <FileText size={15} className="text-[#78355b]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {report.diagnosis || report.chiefComplaint
                   || "Consultation Report"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Calendar size={11} className="text-gray-400" />
                  <p className="text-xs text-gray-400">
                    {new Date(report.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                  {/* Show ready if aiReport exists — don't rely on status */}
                  {isReportReady(report) ? (
                    <span className="text-[10px] font-medium text-emerald-600
                                     bg-emerald-50 px-2 py-0.5 rounded-full
                                     flex items-center gap-1">
                      <Sparkles size={9} />
                      AI report ready
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-amber-600
                                     bg-amber-50 px-2 py-0.5 rounded-full
                                     flex items-center gap-1">
                      <Clock size={9} />
                      Generating...
                    </span>
                  )}
                </div>
              </div>
            </div>
            {expanded === report.id
              ? <ChevronUp size={14} className="text-gray-400" />
              : <ChevronDown size={14} className="text-gray-400" />
            }
          </div>

          {expanded === report.id && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-3">
              {isReportReady(report) ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={13} className="text-[#78355b]" />
                    <span className="text-xs font-semibold text-[#78355b]">
                      AI-generated consultation report
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed
                                  whitespace-pre-line bg-gray-50
                                  rounded-xl p-3">
                    {report.aiReport}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-3 pt-3
                                border-t border-gray-100 leading-relaxed">
                    AI-generated summary of your consultation.
                    Always follow your doctor's direct advice.
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-2 py-3">
                  <Loader2 size={14} className="animate-spin text-amber-500" />
                  <p className="text-sm text-gray-500">
                    AI is generating your report. Check back in a moment.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}