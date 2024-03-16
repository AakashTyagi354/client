"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  selectDoctor,
  selectToken as selectDocToken,
} from "@/redux/doctorSlice";
import Link from "next/link";

export default function Users() {
  const doctor = useSelector(selectDoctor);
  const token = useSelector(selectDocToken);
  const [users, setUsers] = useState([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState(-1);

  const getDoctorAppointments = async () => {
    try {
      const res = await axios.post(
        "http://localhost:7003/api/v1/doctor/doctor-appointments",
        {
          doctorId: doctor?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (Array.isArray(res.data.data)) {
        setUsers(res.data.data);
      } else {
        console.error("Data fetched is not an array:", res.data);
      }
    } catch (err) {
      console.log("ERROR IN GETTING appointments", err);
    }
  };

  useEffect(() => {
    getDoctorAppointments();
  }, []);

  const handleUserClick = (index) => {
    setSelectedUserIndex(index);
  };

  return (
    <div>
      <p className="text-center">Users</p>
      <div className="mt-8 flex flex-col ">
        {users.map((item, idx) => (
          <Link
            href={`/docdoc/${item.userId}`}
            key={idx}
            className={` py-3 border-b hover:bg-gray-100 ${
              idx === selectedUserIndex ? "bg-gray-100" : ""
            }`}
            onClick={() => handleUserClick(idx)}
          >
            <p className="cursor-pointer   w-[70%] mx-auto   text-gray-500 text-sm">
              {item.userInfo}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
