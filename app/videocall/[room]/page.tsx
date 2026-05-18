"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { selectUser, selectToken } from "@/redux/userSlice";
import axiosInstance from "@/app/login/axiosInstance";
import { Loader2, VideoOff } from "lucide-react";
import ConsultationNotesPanel from "@/components/ConsultationNotesPanel";

const ZegoMeeting = dynamic(() => import("../ZegoMeeting"), { ssr: false });

export default function RoomPage() {
  const params = useParams();
  const roomID = params.room as string;
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);

  const [zegoToken, setZegoToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = useCallback(async () => {
    try {
      const res = await axiosInstance.get(
        `http://localhost:8089/api/v1/appointments/video-token/${roomID}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setZegoToken(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to get video token");
    }
  }, [roomID, token]);

  useEffect(() => {
    if (user && token && roomID) fetchToken();
  }, [user, token, roomID, fetchToken]);

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

  if (!zegoToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center
                      justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-[#78355b]" />
        <p className="text-sm text-gray-500">Joining meeting…</p>
      </div>
    );
  }

  return (
    <>
      {/* Video call — full screen */}
      <ZegoMeeting zegoToken={zegoToken} />

      {/* Consultation notes panel — only visible to doctor, floats over call */}
      {user?.isDoctor && (
        <ConsultationNotesPanel
          appointmentId={Number(roomID)}
          onSaveFinal={() => {
            // Notes saved — doctor can end the call
            // Panel shows success state automatically
          }}
        />
      )}
    </>
  );
}