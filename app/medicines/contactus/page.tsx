"use client";

import WidthWrapper from "@/components/WidthWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { selectUser } from "@/redux/userSlice";
import React from "react";
import { useSelector } from "react-redux";

export default function page() {
  const currentUser = useSelector(selectUser);
  console.log(currentUser);
  return (
    <div>
      <WidthWrapper className="flex">
        <div className="flex-1 mt-12">
          <label className="text-gray-600 text-lg mt-4">Email</label>
          <Input placeholder="xyz@gmail.com" className="" type="email" />
          <label className="text-gray-600 text-lg ">Subject</label>
          <Input placeholder="..." type="email" className="" />
          <label className="text-gray-600 text-lg ">Message</label>
          <Textarea className="" placeholder="message" />
          <Button
            className="w-full mt-4"
            onClick={() => {
              toast({
                variant: "default",
                description: "response has been added",
              });
            }}
          >
            Submit
          </Button>
        </div>
        <div className=" flex-1 w-full flex flex-col justify-start pl-[200px] mt-16">
          <p>
            {" "}
            <span className="font-bold">Name: </span> Aakash Tyagi
          </p>
          <p>
            {" "}
            <span className="font-bold">Email: </span> aakashtyagi354@gmail.com
          </p>
          <p>
            {" "}
            <span className="font-bold">Phone No: </span> +91 9008218354
          </p>
          <p>
            {" "}
            <span className="font-bold">Address: </span> 703 abhyuday building
            narpagiri station road pune 411011
          </p>
        </div>
      </WidthWrapper>
    </div>
  );
}
