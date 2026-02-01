"use client";

import WidthWrapper from "@/components/WidthWrapper";
import { selectToken } from "@/redux/userSlice";
import axios from "axios";
import { useEffect, useState } from "react";
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
import { toast } from "@/components/ui/use-toast";
import axiosInstance from "@/app/login/axiosInstance";

export default function Page() {
  const token = useSelector(selectToken);

  const [doctors, setDoctors] = useState<DoctorInputProps[]>([]);
  const [pendingDoctors, setPendingDoctors] = useState<DoctorInputProps[]>([]);
  const handleDoctors = async () => {
    try {
      const res = await axiosInstance.get(
        "http://localhost:8089/api/users/doctors",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const pendingDocResponse = await axiosInstance.get(
        "http://localhost:8089/api/v1/doctor/pending-doctors",{
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      )

      setPendingDoctors(pendingDocResponse.data);

      if (Array.isArray(res.data)) {
        setDoctors(res.data);
      } else {
        console.error("Data received from API is not an array:", res.data.data);
      }
    } catch (err) {
      console.log("error in fetching users", err);
    }
  };
  const handleDecotrStatus = async (doctorId: number) => {
    try {
      const res = await axiosInstance.put(
        `http://localhost:8089/api/v1/admin/approve-doctors/${doctorId}`,
      
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (Array.isArray(res.data.data)) {
        setDoctors(res.data.data);
        toast({
          description: res.data.message,
        });
      } else {
        console.error("Data received from API is not an array:", res.data.data);
        toast({
          variant: "destructive",
          description: res.data.message,
        });
      }
    } catch (err) {
      console.log("error in changing doctor status", err);
    }
  };
  useEffect(() => {
    handleDoctors();
  }, []);
  return (
    <div>
      <WidthWrapper>
        <Table>
          <TableCaption>A list of all the doctors on delma.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>specialization</TableHead>
              <TableHead>experience</TableHead>
              <TableHead>feesPerCunsaltation</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map(
              (ele:DoctorInputProps,idx) => (
                <TableRow key={idx}>
                  <TableHead className="w-[100px]">{ele.firstName}</TableHead>
                  <TableHead>{ele.email}</TableHead>
                  <TableHead>{ele.specialization}</TableHead>
                  <TableHead>{ele.experience}</TableHead>
                  <TableHead>{ele.feesPerConsultation}</TableHead>
                  <TableHead className="text-right">
                    {ele.status === "PENDING" ? (
                      <>
                        <Button
                          variant={"destructive"}
                          onClick={() => handleDecotrStatus(ele.id)}
                        >
                          {ele.status}
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-green-600">Addroved</p>
                      </>
                    )}
                  </TableHead>
                </TableRow>
              )
            )}
            {pendingDoctors.map(
              (ele:DoctorInputProps,idx) => (
                <TableRow key={idx}>
                  <TableHead className="w-[100px]">{ele.firstName}</TableHead>
                  <TableHead>{ele.email}</TableHead>
                  <TableHead>{ele.specialization}</TableHead>
                  <TableHead>{ele.experience}</TableHead>
                  <TableHead>{ele.feesPerConsultation}</TableHead>
                  <TableHead className="text-right">
                    
                      
                        <Button
                          variant={"destructive"}
                          onClick={() => handleDecotrStatus(ele.id)}
                        >
                          {ele.status}
                        </Button>
                   
                  </TableHead>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </WidthWrapper>
    </div>
  );
}
