"use client";

import WidthWrapper from "@/components/WidthWrapper";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/userSlice";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const token = useSelector(selectToken);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const handleUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8089/api/v1/admin/getall-users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(res.data.data);
    } catch (err) {
      console.log("error in fetching users", err);
    }
  };
  const handleDoctors = async () => {
    try {
      const res = await axios.get(
        "https://doc-app-7im8.onrender.com/api/v1/admin/getAllDoctors",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDoctors(res.data.data);
      console.log(res.data.data);
    } catch (err) {
      console.log("error in fetching users", err);
    }
  };
  const handleDecotrStatus = async (doctorId: string) => {
    try {
      const res = await axios.post(
        "https://doc-app-7im8.onrender.com/api/v1/admin/changeAccountStatus",
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
      setDoctors(res.data.data);
      console.log(res.data.data);
    } catch (err) {
      console.log("error in changing doctor status", err);
    }
  };
  useEffect(() => {
    handleUsers();
    handleDoctors();
  }, []);

  return (

    <div>Dashboard</div>
    // <div>
     
    //     <Tabs defaultValue="account" className="w-[80%] bg-red-300">
    //       <TabsList>
    //         <TabsTrigger value="users">Users</TabsTrigger>
    //         <TabsTrigger value="doctors">Doctors</TabsTrigger>
    //       </TabsList>
    //       <TabsContent value="users">
    //         <Table>
    //           <TableCaption>A list of all the users on delma.</TableCaption>
    //           <TableHeader>
    //             <TableRow>
    //               <TableHead className="w-[100px]">Username</TableHead>

    //               <TableHead className="text-right">Email</TableHead>
    //             </TableRow>
    //           </TableHeader>
    //           <TableBody>
    //             {users.map((ele: { name: string; email: string }, idx) => (
    //               <TableRow key={idx}>
    //                 <TableHead className="w-[100px]">{ele.name}</TableHead>
    //                 <TableHead className="text-right">{ele.email}</TableHead>
    //               </TableRow>
    //             ))}
    //           </TableBody>
    //         </Table>
    //       </TabsContent>
    //       <TabsContent value="doctors">
            // <Table>
            //   <TableCaption>A list of all the doctors on delma.</TableCaption>
            //   <TableHeader>
            //     <TableRow>
            //       <TableHead className="w-[100px]">Username</TableHead>
            //       <TableHead>Email</TableHead>
            //       <TableHead>specialization</TableHead>
            //       <TableHead>experience</TableHead>
            //       <TableHead>feesPerCunsaltation</TableHead>
            //       <TableHead className="text-right">Status</TableHead>
            //     </TableRow>
            //   </TableHeader>
            //   <TableBody>
            //     {doctors.map(
            //       (
            //         ele: {
            //           firstName: string;
            //           email: string;
            //           status: string;
            //           _id: string;
            //           specialization: string;
            //           feesPerCunsaltation: number;
            //           experience: number;
            //         },
            //         idx
            //       ) => (
            //         <TableRow key={idx}>
            //           <TableHead className="w-[100px]">
            //             {ele.firstName}
            //           </TableHead>
            //           <TableHead>{ele.email}</TableHead>
            //           <TableHead>{ele.specialization}</TableHead>
            //           <TableHead>{ele.experience}</TableHead>
            //           <TableHead>{ele.feesPerCunsaltation}</TableHead>
            //           <TableHead className="text-right">
            //             {ele.status === "pendling" ? (
            //               <>
            //                 <Button
            //                   variant={"destructive"}
            //                   onClick={() => handleDecotrStatus(ele._id)}
            //                 >
            //                   {ele.status}
            //                 </Button>
            //               </>
            //             ) : (
            //               <>
            //                 <p className="text-green-600">Addroved</p>
            //               </>
            //             )}
            //           </TableHead>
            //         </TableRow>
            //       )
            //     )}
            //   </TableBody>
            // </Table>
    //       </TabsContent>
    //     </Tabs>
     
    // </div>
  );
}

