// app/videocall/[room]/page.tsx
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { selectUser, selectToken } from "@/redux/userSlice";
import axios from "axios";

const ZegoMeeting = dynamic(() => import('../ZegoMeeting'), { ssr: false });

export default function RoomPage() {
  const params = useParams();
  const roomID = params.room as string;
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const [zegoToken, setZegoToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use useCallback to ensure the function is stable
  const fetchToken = useCallback(async () => {
    console.log("🚀 STEP 2: startMeeting function is now RUNNING");
    try {
      const response = await axios.get(
        `http://localhost:8089/api/v1/appointments/video-token/${roomID}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ STEP 3: Token received from Backend:", response.data.token);
      setZegoToken(response.data.token);
    } catch (err: any) {
      console.error("❌ STEP 3 ERROR: API Call Failed", err);
      setError(err.response?.data?.message || "Failed to get video token");
    }
  }, [roomID, token]);

  useEffect(() => {
    console.log("🔍 STEP 1: useEffect checking variables...", { userExists: !!user, roomID, tokenExists: !!token });
    
    // Use the values directly from Redux/Params
    if (user && token && roomID) {
      fetchToken();
    } else {
      console.log("⚠️ STEP 1 WAIT: One of these is missing:", { user: !!user, token: !!token, roomID: !!roomID });
    }
  }, [user, token, roomID, fetchToken]);

  if (error) return <div className="p-20 text-red-500">Error: {error}</div>;
  if (!zegoToken) return <div className="p-20">Authenticating... Check console for Step 1/2/3</div>;

  return <ZegoMeeting zegoToken={zegoToken} />;
}