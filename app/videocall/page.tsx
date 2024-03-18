"use client";
import WidthWrapper from "@/components/WidthWrapper";
import { selectToken, selectUser } from "@/redux/userSlice";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  selectDoctor,
  selectToken as selectDocToken,
} from "@/redux/doctorSlice";
import Link from "next/link";

export default function VideCall() {
  const userToken = useSelector(selectToken);
  const doctorToken = useSelector(selectDocToken);

  if (userToken && userToken.length > 0) {
    return (
      <div>
        <WidthWrapper>
          <UserAppointments />
        </WidthWrapper>
      </div>
    );
  }
  return (
    <div>
      <WidthWrapper>
        <PatientAppointments />
      </WidthWrapper>
    </div>
  );
}
const UserAppointments = () => {
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const [userAppointments, setUserAppointments] = useState<
    AppointmentInputProps[]
  >([]);

  const getUserAppointments = async () => {
    try {
      const res = await axios.post(
        "https://doc-app-7im8.onrender.com/api/v1/user/user-appointments",
        {
          userId: user?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserAppointments(res.data.data);
    } catch (err) {
      console.log("ERROR IN GETTING appointments", err);
    }
  };
  useEffect(() => {
    getUserAppointments();
  }, []);

  return (
    <>
      <div>
        <p className="text-2xl tracking-widert text-gray-600 text-center my-6">
          Welcome {user?.name} to your appointments
        </p>
        <div>
          <Table>
            <TableCaption>
              {" "}
              You have in total {userAppointments.length} upcoming appointments{" "}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Dr Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Meeting</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="mt-6">
              {userAppointments.map((ele: AppointmentInputProps, idx) => (
                <TableRow key={idx}>
                  <TableHead className="w-[100px]">{ele?.doctorInfo}</TableHead>
                  <TableHead>{ele?.date}</TableHead>
                  <TableHead>{ele?.time}</TableHead>
                  <TableHead className="text-right">
                    <Link href={`/videocall/${ele.roomId}`}>
                      <Button>Join the meet</Button>
                    </Link>
                  </TableHead>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

const PatientAppointments = () => {
  const doctor = useSelector(selectDoctor);
  const [doctorAppointments, setDoctorAppointments] = useState<
    AppointmentInputProps[]
  >([]);
  const token = useSelector(selectDocToken);

  const getDoctorAppointments = async () => {
    try {
      const res = await axios.post(
        "https://doc-app-7im8.onrender.com/api/v1/doctor/doctor-appointments",
        {
          doctorId: doctor?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDoctorAppointments(res.data.data);
      console.log(res.data);
    } catch (err) {
      console.log("ERROR IN GETTING appointments", err);
    }
  };
  useEffect(() => {
    getDoctorAppointments();
  }, []);
  return (
    <>
      <div>
        <p className="text-2xl tracking-widert text-gray-600 text-center my-6">
          Welcome {doctor?.name} to your Patient appointments
        </p>
        <div>
          <Table>
            <TableCaption>
              {" "}
              You have in total {doctorAppointments.length} upcoming
              appointments{" "}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Patient Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Meeting</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="mt-6">
              {doctorAppointments.map((ele: AppointmentInputProps, idx) => (
                <TableRow key={idx}>
                  <TableHead className="w-[100px]">{ele.userInfo}</TableHead>
                  <TableHead>{ele.date}</TableHead>
                  <TableHead>{ele.time}</TableHead>
                  <TableHead className="text-right">
                    <Link href={`/videocall/${ele.roomId}`}>
                      <Button>Join the meet</Button>
                    </Link>
                  </TableHead>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};
