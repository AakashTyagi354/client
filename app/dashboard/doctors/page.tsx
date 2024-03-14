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





export default function Page() {
  const token = useSelector(selectToken);

  const [doctors, setDoctors] = useState([]);
  const handleDoctors = async () => {
    try {
      const res = await axios.get(
        "http://localhost:7003/api/v1/admin/getAllDoctors",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDoctors(res.data.data || []);
      console.log(res.data.data);
    } catch (err) {
      console.log("error in fetching users", err);
    }
  };
  const handleDecotrStatus = async (doctorId: string) => {
    try {
      const res = await axios.post(
        "http://localhost:7003/api/v1/admin/changeAccountStatus",
        {
          doctorId,
          status: "approved",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDoctors(res.data.data || []);
      console.log(res.data.data);
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
              (
                ele: {
                  firstName: string;
                  email: string;
                  status: string;
                  _id: string;
                  specialization: string;
                  feesPerCunsaltation: number;
                  experience: number;
                },
                idx
              ) => (
                <TableRow key={idx}>
                  <TableHead className="w-[100px]">{ele.firstName}</TableHead>
                  <TableHead>{ele.email}</TableHead>
                  <TableHead>{ele.specialization}</TableHead>
                  <TableHead>{ele.experience}</TableHead>
                  <TableHead>{ele.feesPerCunsaltation}</TableHead>
                  <TableHead className="text-right">
                    {ele.status === "pending" ? (
                      <>
                        <Button
                          variant={"destructive"}
                          onClick={() => handleDecotrStatus(ele._id)}
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
          </TableBody>
        </Table>
      </WidthWrapper>
    </div>
  );
}
