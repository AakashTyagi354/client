"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import WidthWrapper from "@/components/WidthWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";
import { useRouter } from "next/navigation";
import { setDoctor } from "@/redux/doctorSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";
import DemoIds from "@/components/DemoIds";
// Define Zod schema for validation
const formSchema = z.object({
  email: z.string().min(2).max(50),
  password: z.string().min(6),
});

export default function Login() {
  const [isClient, setIsClient] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [check, setCheck] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogin = async (values: z.infer<typeof formSchema>) => {
    try {
      // Validate input data
      console.log(values);

      // Choose the login URL based on check state
      let URL = `https://doc-app-7im8.onrender.com/api/v1/user/login`;
      if (check) {
        URL = `https://doc-app-7im8.onrender.com/api/v1/user/admin-login`;
      }

      // Make API call
      const res = await axios.post(URL, values);
      if (res.data.success === true) {
        toast({
          description: res.data.message,
        });
      } else {
        toast({
          variant: "destructive",
          description: res.data.message,
        });
      }
      const user = {
        name: res.data.user.name,
        email: res.data.user.email,
        id: res.data.user._id,
        isAdmin: res.data.user.isAdmin,
      };
      const token = res.data.token;
      dispatch(setUser({ user, token }));
      router.push("/finddoc");
    } catch (error: any) {
      // If validation fails, set errors state

      console.log("ERROR IN LOGIN", error);
    }
  };

  const handleDoctorLogin = async (values: z.infer<typeof formSchema>) => {
    try {
      // Validate input data
      console.log(values);

      // Make API call
      const res = await axios.post(
        `https://doc-app-7im8.onrender.com/api/v1/doctor/doctor-login`,
        values
      );
      if (res.data.success === true) {
        toast({
          description: res.data.message,
        });
      } else {
        toast({
          variant: "destructive",
          description: res.data.message,
        });
      }

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
      console.log("error in doct login", error);
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
          <WidthWrapper className=" h-screen flex flex-col justify-center ">
            <Tabs defaultValue="user" className="w-[400px]   mx-auto pt-24 ">
              <TabsList className="w-full h-12 bg-gray-50">
                <TabsTrigger value="user">Patient Login</TabsTrigger>
                <TabsTrigger value="doctor">Doctor Login</TabsTrigger>
              </TabsList>
              <TabsContent value="user">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleLogin)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="abc@example.com" {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="*******"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="text-gray-500">
                      Do not have an account?
                      <span className="text-blue-500">
                        <Link href={"/register"}> register</Link>
                      </span>{" "}
                      here
                    </p>
                    <Button
                      className="w-full  bg-[#78355B] hover:bg-[#78355B] hover:opacity-95"
                      type="submit"
                    >
                      Login
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="doctor">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleDoctorLogin)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="abc@example.com" {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="*******"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage className="mb-2" />
                        </FormItem>
                      )}
                    />
                    <p className="text-gray-500">
                      Do not have an account as a doctor?
                      <span className="text-blue-500">
                        <Link href={"/applydoc"}> apply</Link>
                      </span>{" "}
                      here
                    </p>
                    <Button
                      className="w-full  bg-[#78355B] hover:bg-[#78355B] hover:opacity-95"
                      type="submit"
                    >
                      Login
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
            <DemoIds />
          </WidthWrapper>
        </div>
      </>
    );
  }
}
