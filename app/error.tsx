"use client";
// ─────────────────────────────────────────────────────────────────
// Global Error Boundary — app/error.tsx
//
// Next.js 14 App Router automatically wraps every route segment
// with this component when an unhandled error is thrown.
//
// "use client" is REQUIRED — error boundaries must be client components
// reset() — retries rendering the segment that failed
// ─────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your error monitoring service here
    // e.g. Sentry.captureException(error)
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                      p-10 max-w-md w-full text-center">

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center
                        justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-red-400" />
        </div>

        {/* Message */}
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed mb-8">
          An unexpected error occurred. Your data is safe.
          Please try again or return home.
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#78355b]
                       text-white text-sm font-medium rounded-xl
                       hover:bg-[#6a2d50] transition-colors"
          >
            <RefreshCw size={14} />
            Try Again
          </button>

          <Link href="/">
            <button className="flex items-center gap-2 px-5 py-2.5
                               border border-gray-200 text-gray-600
                               text-sm font-medium rounded-xl
                               hover:border-gray-300 transition-colors">
              <Home size={14} />
              Go Home
            </button>
          </Link>
        </div>

        {/* Error digest for debugging */}
        {error.digest && (
          <p className="text-xs text-gray-300 mt-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}