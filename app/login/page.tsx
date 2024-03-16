"use client";
import WidthWrapper from "@/components/WidthWrapper";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";
import { useRouter } from "next/navigation";
import { selectDoctor, setDoctor } from "@/redux/doctorSlice";

export default function Login() {
  const [isClient, setIsClient] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [check, setCheck] = useState(false);
  console.log(check);
  const handleLogin = async () => {
    try {
      let URL = "http://localhost:7003/api/v1/user/login";
      if (check) {
        URL = "http://localhost:7003/api/v1/user/admin-login";
      }
      const res = await axios.post(URL, {
        email,
        password,
      });
      console.log(res.data);
      const user = {
        name: res.data.user.name,
        email: res.data.user.email,
        id: res.data.user._id,
        isAdmin: res.data.user.isAdmin,
      };
      const token = res.data.token;
      dispatch(setUser({ user, token }));
      router.push("/finddoc");
    } catch (err) {
      console.log("ERROR IN LOGIN", err);
    }
  };

  const handleDoctorLogin = async () => {
    try {
      let URL = "http://localhost:7003/api/v1/doctor/doctor-login";

      const res = await axios.post(URL, {
        email,
        password,
      });
      console.log(res.data);
      const doctor = {
        name: res.data.doctor.firstName,
        email: res.data.doctor.email,
        id: res.data.doctor._id,
      };
      console.log(doctor);
      const token = res.data.token;
      dispatch(setDoctor({ doctor, token }));
      router.push("/finddoc");
    } catch (err) {
      console.log("ERROR IN LOGIN", err);
    }
  };
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (isClient) {
    return (
      <>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="mt-2">Password</p>
                <Input
                  className="mt-2"
                  placeholder="********"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="mt-4 text-sm text-gray-500">
                  Did not register yet?{" "}
                  <Link href={"/register"} className="underline text-blue-700">
                    register
                  </Link>{" "}
                  here.
                </p>
                <p className="flex items-center gap-6 mt-2">
                  Are you admin?{" "}
                  <Switch onCheckedChange={() => setCheck(!check)} />
                </p>
                <Button className="w-full mt-4" onClick={handleLogin}>
                  Login
                </Button>
              </TabsContent>
              <TabsContent value="password">
                <p>Email</p>
                <Input
                  className="mt-2 focus:outline-none"
                  placeholder="abc@gmail.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="mt-2">Password</p>
                <Input
                  className="mt-2"
                  placeholder="********"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="mt-4 text-sm text-gray-500">
                  Apply as a doctor?{" "}
                  <Link href={"/applydoc"} className="underline text-blue-700">
                    apply
                  </Link>{" "}
                  here.
                </p>
                <Button className="w-full mt-4" onClick={handleDoctorLogin}>
                  Login
                </Button>
              </TabsContent>
            </Tabs>
          </WidthWrapper>
        </div>
      </>
    );
  }
}
