"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Documents — Files Page
//
// Shows all uploaded documents for the logged-in user.
//
// API:
//   GET    /api/v1/documents/getall-documents/{userId}  → list documents
//   DELETE /api/v1/documents/delete-document/{id}       → delete document
//
// Fixes applied:
//   - res.data.data instead of res.data (ApiResponse wrapper)
//   - After delete, filter from local state — delete returns ApiResponse<Void>
//   - key={doc.id} instead of key={idx}
//   - Removed unused axios import — using axiosInstance
//   - Removed dead Firebase imports
//   - Added loading state
//
// Backend fix pending:
//   - id and createdAt missing from DocumentResponse — tracked
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectToken, selectUser } from "@/redux/userSlice";
import axiosInstance from "@/app/login/axiosInstance";
import Link from "next/link";
import {
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  Loader2,
  Upload,
  FileIcon,
  FilePlus,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

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

// Returns icon based on MIME type
const getFileIcon = (type: string) => {
  if (type?.startsWith("image/"))
    return <ImageIcon size={28} className="text-blue-400" />;
  return <FileText size={28} className="text-[#78355b]" />;
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function FilesPage() {
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);

  const [documents, setDocuments] = useState<DocumentInputProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const headers = { Authorization: `Bearer ${token}` };

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH DOCUMENTS
  // ─────────────────────────────────────────────────────────────────────────

  const fetchDocuments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `http://localhost:8089/api/v1/documents/getall-documents/${user.id}`,
        { headers }
      );
      setDocuments(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      toast({ variant: "destructive", description: "Could not load documents" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user, token]);

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE DOCUMENT
  // Fix: filter from local state — delete returns ApiResponse<Void> no data
  // ─────────────────────────────────────────────────────────────────────────

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await axiosInstance.delete(
        `http://localhost:8089/api/v1/documents/delete-document/${id}`,
        { headers }
      );
      if (res.data.success) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        toast({ description: "Document deleted successfully" });
      }
    } catch (err) {
      console.error("Failed to delete document:", err);
      toast({ variant: "destructive", description: "Could not delete document" });
    } finally {
      setDeletingId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // GUARD STATES
  // ─────────────────────────────────────────────────────────────────────────

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]
                      text-center px-6">
        <FileIcon size={36} className="text-gray-300 mb-3" />
        <p className="text-sm text-gray-500 mb-1">
          Please login to view your documents
        </p>
        <Link
          href="/login"
          className="text-sm text-[#78355b] hover:underline font-medium"
        >
          Login
        </Link>
      </div>
    );
  }

  if (user.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-gray-400">
          Admin cannot access user documents
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">My Documents</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading
              ? "Loading…"
              : `${documents.length} document${documents.length !== 1 ? "s" : ""} uploaded`}
          </p>
        </div>
        <Link
          href="/documents/uploads"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#78355b] text-white
                     text-sm font-medium rounded-xl hover:bg-[#6a2d50]
                     transition-colors"
        >
          <Upload size={14} />
          Upload New
        </Link>
      </div>

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
          <div className="w-14 h-14 rounded-2xl bg-[#78355b]/8 flex items-center
                          justify-center mb-4">
            <FilePlus size={24} className="text-[#78355b]" />
          </div>
          <p className="text-sm font-medium text-gray-700">No documents yet</p>
          <p className="text-xs text-gray-400 mt-1 mb-5">
            Upload your medical reports, prescriptions, or health records
          </p>
          <Link
            href="/documents/uploads"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#78355b]
                       text-white text-xs font-medium rounded-xl
                       hover:bg-[#6a2d50] transition-colors"
          >
            <Upload size={12} />
            Upload Document
          </Link>
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
              {/* File type icon */}
              <div className="w-full h-20 bg-gray-50 rounded-xl flex items-center
                              justify-center mb-3 flex-shrink-0">
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

              {/* Actions */}
              <div className="flex items-center justify-between mt-3 pt-3
                              border-t border-gray-100">
                <a
                
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[#78355b]
                             hover:underline font-medium"
                >
                  <ExternalLink size={11} />
                  View
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                  className="flex items-center gap-1 text-xs text-red-500
                             hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  {deletingId === doc.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                  {deletingId === doc.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}