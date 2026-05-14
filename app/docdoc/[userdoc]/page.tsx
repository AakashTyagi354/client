"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Doctor — Patient Documents Page
//
// Shows all documents uploaded by a specific patient.
// Accessed by doctor from the sidebar.
//
// Features added:
//   - AI Summary Card using RAG pipeline
//   - Shows summary above documents
//   - Disclaimer below summary
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/userSlice";
import axiosInstance from "@/app/login/axiosInstance";
import { useParams } from "next/navigation";
import {
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  User,
  Sparkles,
  AlertCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const truncate = (str: string, len: number): string =>
  str?.length > len ? str.substring(0, len) + "…" : str ?? "";

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getFileIcon = (type: string) => {
  if (type?.startsWith("image/"))
    return <ImageIcon size={28} className="text-blue-400" />;
  return <FileText size={28} className="text-[#78355b]" />;
};

// ─────────────────────────────────────────────────────────────────────────────
// AI SUMMARY CARD
//
// Calls GET /api/v1/ai/summarize/{userId}
// Uses RAG pipeline — retrieves relevant chunks from pgvector
// then sends to Groq LLM for summarization
// ─────────────────────────────────────────────────────────────────────────────

function AiSummaryCard({ userId }: { userId: string }) {
  const token = useSelector(selectToken);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!userId || !token) return;
    setLoading(true);
    setError(false);

    axiosInstance
      .get(`http://localhost:8089/api/v1/ai/summarize/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data.data;
        // Don't show card if no documents indexed yet
        if (
          !data ||
          data === "No medical documents found for this patient."
        ) {
          setSummary(null);
        } else {
          setSummary(data);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [userId, token]);

  // Don't render card at all if nothing to show
  if (!loading && !summary && !error) return null;

  return (
    <div className="bg-[#78355b]/5 border border-[#78355b]/15
                    rounded-2xl p-4 mb-6">

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-[#78355b] flex items-center
                        justify-center flex-shrink-0">
          <Sparkles size={12} className="text-white" />
        </div>
        <p className="text-sm font-semibold text-[#78355b]">
          AI Medical Summary
        </p>
        <span className="text-xs text-[#78355b]/60 bg-[#78355b]/10
                         px-2 py-0.5 rounded-full ml-auto">
          RAG powered
        </span>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-2 py-2">
          <Loader2 size={14} className="animate-spin text-[#78355b]" />
          <p className="text-xs text-gray-500">
            Analyzing patient documents…
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 py-2">
          <AlertCircle size={14} className="text-red-400" />
          <p className="text-xs text-red-400">
            Could not generate summary at this time
          </p>
        </div>
      )}

      {/* Summary content */}
      {summary && (
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {summary}
        </p>
      )}

      {/* Disclaimer */}
      {summary && (
        <p className="text-[10px] text-gray-400 mt-3 pt-3
                      border-t border-[#78355b]/10">
          AI-generated summary for reference only. Always review original
          documents before consultation.
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function PatientDocumentsPage() {
  const token = useSelector(selectToken);
  const params = useParams();

  const [documents, setDocuments] = useState<DocumentInputProps[]>([]);
  const [loading, setLoading] = useState(false);

  const userId = params.userdoc as string;

  useEffect(() => {
    if (!userId || !token) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `http://localhost:8089/api/v1/documents/getall-documents/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDocuments(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch patient documents:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId, token]);

  return (
    <div className="p-6">

      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#78355b]/10 flex items-center
                        justify-center flex-shrink-0">
          <User size={18} className="text-[#78355b]" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Patient #{userId}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading
              ? "Loading documents…"
              : `${documents.length} document${documents.length !== 1 ? "s" : ""} uploaded`}
          </p>
        </div>
      </div>

      {/* AI Summary Card — shown before documents list */}
      <AiSummaryCard userId={userId} />

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#78355b]" />
        </div>
      )}

      {/* Empty state */}
      {!loading && documents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20
                        bg-white rounded-2xl border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center
                          justify-center mb-3">
            <FileText size={20} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">
            No documents uploaded
          </p>
          <p className="text-xs text-gray-400 mt-1">
            This patient hasn't uploaded any documents yet
          </p>
        </div>
      )}

      {/* Documents grid */}
      {!loading && documents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
                        lg:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm
                         hover:shadow-md transition-all duration-200 p-4
                         flex flex-col"
            >
              {/* File icon */}
              <div className="w-full h-20 bg-gray-50 rounded-xl flex items-center
                              justify-center mb-3">
                {getFileIcon(doc.type)}
              </div>

              {/* File info */}
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                  {truncate(doc.name, 22)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">
                  {doc.type}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDate(doc.createdAt)}
                </p>
              </div>

              {/* View action */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[#78355b]
                             hover:underline font-medium"
                >
                  <ExternalLink size={11} />
                  View Document
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}