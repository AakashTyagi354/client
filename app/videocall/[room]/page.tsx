"use client";
import { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/userSlice";
import { selectDoctor } from "@/redux/doctorSlice";

export default function Room() {
  const elementRef = useRef(null);
  const params = useParams();
  const roomID = params.room as string;
  const user = useSelector(selectUser);
  const doctor = useSelector(selectDoctor);

  let name = "";
  let id = "";
  if (user !== null && user !== undefined) {
    name = user?.name ?? "";
    id = user?.id ?? "";
  } else if (doctor !== null && doctor !== undefined) {
    name = doctor?.name ?? "";
    id = doctor?.id ?? "";
  }
  useEffect(() => {
    const myMeeting = async () => {
      const appID = 235937854;
      const serverSecret = "a58ba79fee67e9e11bcae91b34dbd43e";
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        id,
        name
      );
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: elementRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
      });
    };

    myMeeting();
  }, [roomID]);

  return (
    <div>
      <div ref={elementRef} />
    </div>
  );
}
