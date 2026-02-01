"use client";
import WidthWrapper from "@/components/WidthWrapper";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/userSlice";
import { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "@/app/login/axiosInstance";
export default function Page() {
  const token = useSelector(selectToken);
  const [users, setUsers] = useState([]);
  const handleUsers = async () => {
    try {
      const res = await axiosInstance.get(
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
  useEffect(() => {
    handleUsers();
  }, []);
  return (
    <div>
      <WidthWrapper>
        <Table>
          <TableCaption>A list of all the users on delma.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Username</TableHead>

              <TableHead className="text-right">Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((ele: { name: string; email: string }, idx) => (
              <TableRow key={idx}>
                <TableHead className="w-[100px]">{ele.name}</TableHead>
                <TableHead className="text-right">{ele.email}</TableHead>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </WidthWrapper>
    </div>
  );
}
