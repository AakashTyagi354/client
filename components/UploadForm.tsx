"use client";

// ─────────────────────────────────────────────────────────────────────────────
// UploadForm — Medical document upload component
//
// Uploads file directly to backend S3 via multipart/form-data.
//
// API:
//   POST /api/v1/documents/upload
//   Body: multipart — file + userId
//
// Fixes applied:
//   - Replaced axios with axiosInstance
//   - progress bar uses {progress} not hardcoded 30
//   - Removed entire dead Firebase upload flow + imports
//   - File input ref added to reset DOM after upload
//   - res.data.success check instead of just res.data
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectToken, selectUser } from "@/redux/userSlice";
import axiosInstance from "@/app/login/axiosInstance";
import { toast } from "./ui/use-toast";
import { Progress } from "./ui/progress";
import { Upload, File, X, Loader2 } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function UploadForm() {
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Ref to reset file input DOM element after upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // FILE SELECTION — max 2MB
  // ─────────────────────────────────────────────────────────────────────────

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 2000000) {
      toast({
        variant: "destructive",
        description: "File size must be under 2MB",
      });
      return;
    }
    setFile(selected);
  };

  const removeFile = () => {
    setFile(null);
    setProgress(0);
    // Fix: reset actual DOM file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─────────────────────────────────────────────────────────────────────────
  // UPLOAD
  // Fix: axiosInstance instead of axios
  // Fix: res.data.success check
  // Fix: progress uses onUploadProgress — not hardcoded 30
  // ─────────────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!file || !user) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", String(user.id));

    setUploading(true);
    setProgress(0);

    try {
      const res = await axiosInstance.post(
        "http://localhost:8089/api/v1/documents/upload",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
          // Fix: track real upload progress
          onUploadProgress: (e) => {
            const pct = Math.round((e.loaded * 100) / (e.total ?? 1));
            setProgress(pct);
          },
        }
      );

      if (res.data.success) {
        toast({ description: "Document uploaded successfully" });
        removeFile();
      } else {
        toast({ variant: "destructive", description: res.data.message });
      }
    } catch (err) {
      console.error("Upload failed:", err);
      toast({ variant: "destructive", description: "Upload failed" });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-xl">

      {/* Drop zone */}
      <label
        htmlFor="doc-upload"
        className={`flex flex-col items-center justify-center w-full h-48
                    border-2 border-dashed rounded-2xl cursor-pointer
                    transition-colors ${
                      file
                        ? "border-[#78355b] bg-[#78355b]/5"
                        : "border-gray-200 bg-gray-50 hover:border-[#78355b] hover:bg-[#78355b]/5"
                    }`}
      >
        <Upload
          size={28}
          className={file ? "text-[#78355b]" : "text-gray-400"}
        />
        <p className="mt-2 text-sm font-medium text-gray-600">
          {file ? "File selected" : "Click to upload"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          PDF, PNG, JPG — max 2MB
        </p>
        <input
          id="doc-upload"
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={onFileSelect}
        />
      </label>

      {/* File preview */}
      {file && (
        <div className="flex items-center justify-between mt-3 p-3 bg-white
                        border border-gray-100 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#78355b]/10 flex items-center
                            justify-center">
              <File size={16} className="text-[#78355b]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-400">
                {file.type} · {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400
                       hover:text-red-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Progress bar */}
      {uploading && progress > 0 && (
        <div className="mt-3">
          {/* Fix: uses actual {progress} not hardcoded 30 */}
          <Progress value={progress} className="h-1.5 rounded-full" />
          <p className="text-xs text-gray-400 mt-1 text-right">{progress}%</p>
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full flex items-center justify-center gap-2 mt-4 py-2.5
                   bg-[#78355b] text-white text-sm font-medium rounded-xl
                   hover:bg-[#6a2d50] transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Upload size={15} />
        )}
        {uploading ? `Uploading ${progress}%…` : "Upload Document"}
      </button>
    </div>
  );
}