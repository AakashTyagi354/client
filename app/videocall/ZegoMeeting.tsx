"use client";

// ─────────────────────────────────────────────────────────────────────────────
// ZegoMeeting — Video call UI component
//
// Initializes ZEGO UIKit with the token from backend.
// Runs client-side only — loaded via dynamic import with ssr: false.
//
// Fixes applied:
//   - Removed unused antd import (useSelection from antd/es/table)
//   - zpRef cleanup prevents "joinRoom repeat" error on remount
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/userSlice";

export default function ZegoMeeting({ zegoToken }: { zegoToken: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const zpRef = useRef<any>(null);
  const user = useSelector(selectUser);

  useEffect(() => {
    const initMeeting = async () => {
      if (!zegoToken || !containerRef.current || zpRef.current) return;

      try {
        const decodedString = atob(zegoToken);
        const { appID, roomID, token } = JSON.parse(decodedString);

        console.log("Decoded token:", { appID, roomID, token: token?.substring(0, 10) });
console.log("Token starts with 04:", token?.startsWith("04"));
console.log("Token length:", token?.length);
  

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          Number(appID),
          token,
          roomID,
          String(user?.id),
          user?.name ?? `User_${Math.floor(Math.random() * 1000)}`
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference,
            config: {
              role: ZegoUIKitPrebuilt.Host,
            },
          },
          showPreJoinView: true,
          turnOnCameraWhenJoining: true,
          turnOnMicrophoneWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
        });
      } catch (err) {
        console.error("Zego initialization error:", err);
      }
    };

    initMeeting();

    // Cleanup — prevents "joinRoom repeat" error on React remount
    return () => {
      if (zpRef.current) {
        zpRef.current.destroy();
        zpRef.current = null;
      }
    };
  }, [zegoToken]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}