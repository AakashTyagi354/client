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
import DemoIds from "@/components/DemoIds";
import axiosInstance from "../login/axiosInstance";

export default function VideCall() {
  const userToken = useSelector(selectToken);
  const doctorToken = useSelector(selectDocToken);
  const user = useSelector(selectUser);
  console.log("userToken", userToken);

  if (userToken && userToken.length > 0 && !user?.isDoctor) {
    return (
      <div>
        <WidthWrapper>
          <UserAppointments />
        </WidthWrapper>
      </div>
    );
  } else if (user?.isDoctor) {
    return (
      <div>
        <WidthWrapper>
          <PatientAppointments />
        </WidthWrapper>
      </div>
    );
  } else {
    return (
      <>
        <p className="text-gray-500 text-center mt-56">
          {" "}
          Please login to check your upcoming appointments
          <span className="text-blue-500">
            <Link href={"/login"}> login</Link>
          </span>
        </p>
        <DemoIds />
      </>
    );
  }
}
const UserAppointments = () => {
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const [userAppointments, setUserAppointments] = useState<AppointmentUI[]>([]);

  const getUserAppointments = async () => {
    try {
      const res = await axiosInstance.get<AppointmentResponse[]>(
        "http://localhost:8089/api/v1/appointments/user",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            userId: user?.id,
          },
        }
      );

      const appointmentsUI: AppointmentUI[] = res.data.map((a) => ({
        id: a.id,
        doctorId: a.doctorId,
        date: a.createdAt.split("T")[0],
        time: a.createdAt.split("T")[1].substring(0, 5),
        status: a.status,
      }));

      setUserAppointments(appointmentsUI);
      console.log(appointmentsUI);
    } catch (err) {
      console.log("ERROR IN GETTING appointments", err);
    }
  };
  useEffect(() => {
    console.log("FETCHING APPOINTMENTS", token);
    getUserAppointments();
  }, []);
  console.log("token", token);

  if (!token || !userAppointments || userAppointments.length === 0) {
    return (
      <p className="text-gray-500 text-center my-56">
        {" "}
        Please login to check your upcoming appointments
      </p>
    );
  } else {
    return (
      <>
        <div>
          <p className="text-2xl tracking-widert text-gray-600 text-center my-6">
            Welcome {user?.name} to your appointments
          </p>
          <div>
            {userAppointments && (
              <Table>
                {userAppointments.length > 0 && (
                  <TableCaption>
                    {" "}
                    You have in total {userAppointments.length} upcoming
                    appointments{" "}
                  </TableCaption>
                )}
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Dr Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Meeting</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="mt-6">
                  {userAppointments.map((ele, idx) => (
                    <TableRow key={ele.id}>
                      <TableHead className="w-[100px]">
                        Doctor ID: {ele.doctorId}
                      </TableHead>

                      <TableHead>{formatDate(ele.date)}</TableHead>

                      <TableHead>{ele.time}</TableHead>

                      <TableHead className="text-right">
                        <Link href={`/videocall/${ele.id}`}>
                          <Button className="bg-[#78355B] hover:bg-[#78355B] hover:opacity-95">
                            Join the meet
                          </Button>
                        </Link>
                      </TableHead>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </>
    );
  }
};

const PatientAppointments = () => {
  const doctor = useSelector(selectDoctor);
  const user = useSelector(selectUser);
  const [doctorAppointments, setDoctorAppointments] = useState<
    AppointmentUI[]
  >([]);
  const token = useSelector(selectDocToken);

  const getDoctorAppointments = async () => {
    try {
      // const res = await axios.post(
      //   "https://doc-app-7im8.onrender.com/api/v1/doctor/doctor-appointments",
      //   {
      //     doctorId: doctor?.id,
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );

       const res = await axiosInstance.get<AppointmentResponse[]>(
        "http://localhost:8089/api/v1/appointments/doctor",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            doctorId: user?.id,
          },
        }
      );

        const appointmentsUI: AppointmentUI[] = res.data.map((a) => ({
        id: a.id,
        doctorId: a.userId,
        date: a.createdAt.split("T")[0],
        time: a.createdAt.split("T")[1].substring(0, 5),
        status: a.status,
      }));
      setDoctorAppointments(appointmentsUI);
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
              {doctorAppointments.map((ele: AppointmentUI, idx) => (
                <TableRow key={idx}>
                  <TableHead className="w-[100px]">{ele.doctorId}</TableHead>
                  <TableHead>{ele.date}</TableHead>
                  <TableHead>{ele.time}</TableHead>
                  <TableHead className="text-right">
                    <Link href={`/videocall/${ele.id}`}>
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

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}
