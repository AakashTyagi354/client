"use client";
import WidthWrapper from "@/components/WidthWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
export default function Page() {
  const token = useSelector(selectToken);

  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const handleCreateCat = async () => {
    try {
      const res = await axios.post(
        "http://localhost:7003/api/v1/category/create-category",
        {
          name: category,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.log("Error creating category", err);
    }
  };
  const getCategories = async () => {
    try {
      const res = await axios.get(
        "http://localhost:7003/api/v1/category/get-category"
      );

      setCategories(res.data.category);
    } catch (err) {
      console.log("Error creating category", err);
    }
  };
  useEffect(() => {
    getCategories();
  }, []);
  return (
    <div>
      <WidthWrapper className="">
        <p className="text-xl text-gray-600 tracking-wider text-center mt-12">
          Manage all the categories here
        </p>

        <div className="flex w-[70%] gap-1 mx-auto mt-6">
          <Input
            placeholder="create new categories"
            className="focus:outline-none outline-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Button className="" onClick={handleCreateCat}>
            Create
          </Button>
        </div>
        <div>
          <Table>
            <TableCaption>A list of all the users on delma.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Category Name</TableHead>

                <TableHead className="text-right">Controls</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="mt-6">
              {categories.map((ele: { name: string }, idx) => (
                <TableRow key={idx}>
                  <TableHead className="w-[100px]">{ele.name}</TableHead>
                  <TableHead className="text-right ">
                    <Button variant={"destructive"} className="mr-2">Delete</Button>
                    <Button>Update</Button>
                  </TableHead>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </WidthWrapper>
    </div>
  );
}
