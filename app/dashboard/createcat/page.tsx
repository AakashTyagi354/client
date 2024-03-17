"use client";
import WidthWrapper from "@/components/WidthWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { selectToken } from "@/redux/userSlice";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HiPencilAlt } from "react-icons/hi";
import { IoTrashOutline } from "react-icons/io5";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

export default function Page() {
  const token = useSelector(selectToken);

  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [updateStr, setUpdateStr] = useState("");
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
      setCategories(res.data.allCategories);
      setCategory("");
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
  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await axios.post(
        `http://localhost:7003/api/v1/category/delete-category/${id}`
      );

      setCategories(res.data.allCategories);
    } catch (err) {
      console.log("Error creating category", err);
    }
  };
  const handleUpdateCategory = async (id: string) => {
    try {
      const res = await axios.post(
        `http://localhost:7003/api/v1/category/update-category/${id}`,
        {
          name: updateStr,
        }
      );

      setCategories(res.data.allCategories);
      toast({
        description: res.data.message,
      });
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
          <Table className="mt-6">
            <TableCaption>A list of all the users on delma.</TableCaption>
            <TableHeader>
              <TableRow >
                <TableHead className="w-[100px] text-lg font-bold">Category Name</TableHead>

                <TableHead className="text-right font-bold text-lg" >Controls</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="mt-12">
              {categories.map((ele: { name: string; _id: string }, idx) => (
                <TableRow key={idx}>
                  <TableHead className="w-[100px]">{ele.name}</TableHead>
                  <TableHead className="text-right ">
                    <Button
                      onClick={() => handleDeleteCategory(ele._id)}
                      variant={"ghost"}
                      className="mr-2"
                    >
                      <IoTrashOutline size={25} color="red"/>
                    </Button>
                    <Dialog>
                      <DialogTrigger>
                        <Button variant={"ghost"}>
                          <HiPencilAlt size={25}/>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you absolutely sure?</DialogTitle>
                          <DialogDescription className="flex items-center gap-3 ">
                            <Input
                              placeholder="enter new updated name"
                              className="mt-4"
                              onChange={(e) => setUpdateStr(e.target.value)}
                            />
                            <Button
                              className="mt-4"
                              onClick={() => handleUpdateCategory(ele._id)}
                            >
                              Update
                            </Button>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
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
