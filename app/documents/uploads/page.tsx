"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Documents — Upload Page
//
// Allows logged-in non-admin users to upload medical documents.
// ─────────────────────────────────────────────────────────────────────────────

import { useSelector } from "react-redux";
import { selectUser } from "@/redux/userSlice";
import Link from "next/link";
import UploadForm from "@/components/UploadForm";
import { FileIcon, ShieldOff } from "lucide-react";

export default function UploadsPage() {
  const user = useSelector(selectUser);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]
                      text-center px-6">
        <FileIcon size={36} className="text-gray-300 mb-3" />
        <p className="text-sm text-gray-500 mb-1">
          Please login to upload documents
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
      <div className="flex flex-col items-center justify-center min-h-[400px]
                      text-center px-6">
        <ShieldOff size={32} className="text-gray-300 mb-3" />
        <p className="text-sm text-gray-400">
          Admin accounts cannot upload patient documents
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">
          Upload Documents
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Upload your medical reports, prescriptions, or health records
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-[#78355b]/5 border
                      border-[#78355b]/10 rounded-2xl px-4 py-3 mb-6
                      max-w-xl">
        <div className="w-1.5 h-1.5 rounded-full bg-[#78355b] mt-1.5
                        flex-shrink-0" />
        <p className="text-xs text-[#78355b] leading-relaxed">
          Your documents are stored securely on AWS S3 and only accessible
          by you and your assigned doctor. Files are encrypted and access
          links expire after 10 minutes.
        </p>
      </div>

      {/* Upload form */}
      <UploadForm />
    </div>
  );
}