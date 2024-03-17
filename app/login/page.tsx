"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import WidthWrapper from "@/components/WidthWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";
import { useRouter } from "next/navigation";
import { setDoctor } from "@/redux/doctorSlice";

// Define Zod schema for validation
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const [isClient, setIsClient] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [check, setCheck] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    try {
      // Validate input data
      loginSchema.parse(formData);

      // Choose the login URL based on check state
      let URL = "http://localhost:7003/api/v1/user/login";
      if (check) {
        URL = "http://localhost:7003/api/v1/user/admin-login";
      }

      // Make API call
      const res = await axios.post(URL, formData);
      const user = {
        name: res.data.user.name,
        email: res.data.user.email,
        id: res.data.user._id,
        isAdmin: res.data.user.isAdmin,
      };
      const token = res.data.token;
      dispatch(setUser({ user, token }));
      router.push("/finddoc");
    } catch (error) {
      // If validation fails, set errors state
      if (error.errors) {
        setErrors(
          error.errors.reduce(
            (acc, curr) => ({ ...acc, [curr.path[0]]: curr.message }),
            {}
          )
        );
      } else {
        setErrors({ general: error.message || "An error occurred" });
      }
      console.log("ERROR IN LOGIN", error);
    }
  };

  const handleDoctorLogin = async () => {
    try {
      // Validate input data
      loginSchema.parse(formData);

      // Make API call
      const res = await axios.post(
        "http://localhost:7003/api/v1/doctor/doctor-login",
        formData
      );
      const doctor = {
        name: res.data.doctor.firstName,
        email: res.data.doctor.email,
        id: res.data.doctor._id,
      };
      const token = res.data.token;
      dispatch(setDoctor({ doctor, token }));
      router.push("/finddoc");
    } catch (error) {
      // If validation fails, set errors state
      if (error.errors) {
        setErrors(
          error.errors.reduce(
            (acc, curr) => ({ ...acc, [curr.path[0]]: curr.message }),
            {}
          )
        );
      } else {
        setErrors({ general: error.message || "An error occurred" });
      }
      console.log("ERROR IN DOCTOR LOGIN", error);
    }
  };

  // Effect to set isClient state
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
                <TabsTrigger value="account">Patient Login</TabsTrigger>
                <TabsTrigger value="password">Doctor Login</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                {/* Your patient login form */}
                <Input
                  className="mt-2 focus:outline-none"
                  placeholder="abc@gmail.com"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && (
                  <span className="text-red-500">{errors.email}</span>
                )}
                <Input
                  className="mt-2"
                  placeholder="********"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                {errors.password && (
                  <span className="text-red-500">{errors.password}</span>
                )}
                {errors.general && (
                  <span className="text-red-500">{errors.general}</span>
                )}
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
                {/* Your doctor login form */}
                <Input
                  className="mt-2 focus:outline-none"
                  placeholder="abc@gmail.com"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && (
                  <span className="text-red-500">{errors.email}</span>
                )}
                <Input
                  className="mt-2"
                  placeholder="********"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                {errors.password && (
                  <span className="text-red-500">{errors.password}</span>
                )}
                {errors.general && (
                  <span className="text-red-500">{errors.general}</span>
                )}
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
