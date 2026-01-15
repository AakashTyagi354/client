"use client";
import React, { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import useSelection from "antd/es/table/hooks/useSelection";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/userSlice";

const ZegoMeeting = ({ zegoToken }: { zegoToken: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const zpRef = useRef<any>(null); // To store the Zego instance
  const user = useSelector(selectUser);

  useEffect(() => {
    const initMeeting = async () => {
      if (!zegoToken || !containerRef.current || zpRef.current) return;

      try {
        const decodedString = atob(zegoToken);
        const { appID, roomID, token } = JSON.parse(decodedString);

        // Use the ID from your token logic
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          Number(appID),
          token,
          roomID,
          String(user?.id), // Or pass the actual logged-in user ID here
          "User_" + Math.floor(Math.random() * 100)
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp; // Save instance to ref

      zp.joinRoom({
  container: containerRef.current,
  scenario: {
    mode: ZegoUIKitPrebuilt.VideoConference,
    config: {
      role: ZegoUIKitPrebuilt.Host, // Ensures the user has permissions to publish
    },
  },
  showPreJoinView: true,           // Keeps the "Check Camera" screen
  turnOnCameraWhenJoining: true,    // Explicitly try to turn on
  turnOnMicrophoneWhenJoining: true, 
  showMyCameraToggleButton: true,   // Show the button in the UI
  showMyMicrophoneToggleButton: true,
  showAudioVideoSettingsButton: true,
});
      } catch (error) {
        console.error("Zego Initialization Error:", error);
      }
    };

    initMeeting();

    // CLEANUP: This stops the "joinRoom repeat" error
    return () => {
      if (zpRef.current) {
        zpRef.current.destroy();
        zpRef.current = null;
      }
    };
  }, [zegoToken]);

  return <div ref={containerRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default ZegoMeeting;