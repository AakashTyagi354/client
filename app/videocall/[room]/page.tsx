"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Video Room Page — /videocall/[room]
//
// Fetches ZEGO token from backend then renders the meeting.
//
// API:
//   GET /api/v1/appointments/video-token/{appointmentId}
//   Headers: X-User-Id and X-Roles injected by Gateway automatically
//   Response: ApiResponse<String> — token is res.data.data
//
// Fixes applied:
//   - axiosInstance instead of axios
//   - res.data.data instead of response.data.token — ApiResponse wrapper
//   - Removed console.logs
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { selectUser, selectToken } from "@/redux/userSlice";
import axiosInstance from "@/app/login/axiosInstance";
import { Loader2, VideoOff } from "lucide-react";

// Load ZegoMeeting client-side only — no SSR
const ZegoMeeting = dynamic(() => import("../ZegoMeeting"), { ssr: false });

export default function RoomPage() {
  const params = useParams();
  const roomID = params.room as string;
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);

  const [zegoToken, setZegoToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH VIDEO TOKEN
  // Fix: axiosInstance instead of axios
  // Fix: res.data.data — ApiResponse<String> wraps token in .data
  // Fix: X-User-Id and X-Roles injected by Gateway — no need to pass manually
  // ─────────────────────────────────────────────────────────────────────────

  const fetchToken = useCallback(async () => {
    try {
      const res = await axiosInstance.get(
        `http://localhost:8089/api/v1/appointments/video-token/${roomID}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Fix: token is in res.data.data not res.data.token
      setZegoToken(res.data.data);
    } catch (err: any) {
      console.error("Failed to get video token:", err);
      setError(err.response?.data?.message || "Failed to get video token");
    }
  }, [roomID, token]);

  useEffect(() => {
    if (user && token && roomID) {
      fetchToken();
    }
  }, [user, token, roomID, fetchToken]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center
                      justify-center text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center
                        justify-center mb-4">
          <VideoOff size={24} className="text-red-400" />
        </div>
        <p className="text-sm font-medium text-gray-700 mb-1">
          Could not join meeting
        </p>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  // Loading state
  if (!zegoToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center
                      justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-[#78355b]" />
        <p className="text-sm text-gray-500">Joining meeting…</p>
      </div>
    );
  }

  return <ZegoMeeting zegoToken={zegoToken} />;
}