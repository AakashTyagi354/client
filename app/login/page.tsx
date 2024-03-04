import WidthWrapper from "@/components/WidthWrapper";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function page() {
  return (
    <div className="w-full h-screen ">
      <WidthWrapper className=" h-screen flex justify-center ">
        <Tabs defaultValue="account" className="w-[400px]  mx-auto pt-24 ">
          <TabsList className="w-full h-12 bg-gray-50">
            <TabsTrigger value="account">Paitent Login</TabsTrigger>
            <TabsTrigger value="password">Doctor Login</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <p>Email</p>
            <Input
              className="mt-2 focus:outline-none"
              placeholder="abc@gmail.com"
              type="email"
            />
            <p className="mt-2">Password</p>
            <Input className="mt-2" placeholder="********" type="password" />
            <p className="mt-4 text-sm text-gray-500">
              Did not register yet?{" "}
              <Link href={"/register"} className="underline text-blue-700">
                register
              </Link>{" "}
              here.
            </p>
            <Button className="w-full mt-4">Login</Button>
          </TabsContent>
          <TabsContent value="password">
            <p>Email</p>
            <Input
              className="mt-2 focus:outline-none"
              placeholder="abc@gmail.com"
              type="email"
            />
            <p className="mt-2">Password</p>
            <Input className="mt-2" placeholder="********" type="password" />
            <p className="mt-4 text-sm text-gray-500">
              Apply as a doctor?{" "}
              <Link href={"/register"} className="underline text-blue-700">
                apply
              </Link>{" "}
              here.
            </p>
            <Button className="w-full mt-4">Login</Button>
          </TabsContent>
        </Tabs>
      </WidthWrapper>
    </div>
  );
}
