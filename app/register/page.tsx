"use client";
import WidthWrapper from "@/components/WidthWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const route = useRouter();
  const handleRegister = async () => {
    try {
      const res = await axios.post(
        "http://localhost:7003/api/v1/user/register",
        {
          name: username,
          email,
          password,
        }
      );
      setEmail("");
      setPassword("");
      setUsername("");
      if (res.data.success === true) {
        toast({
          description: res.data.message,
        });
        route.push("/login")
      } else {
        toast({
          variant: "destructive",
          description: res.data.message,
        });
      }
      console.log(res.data);
    } catch (err) {
      console.log("ERROR IN REGISTER", err);
    }
  };
  return (
    <div>
      <WidthWrapper>
        <div className="border border-gray-100 w-[400px] min-h-[400px] mx-auto mt-16">
          <p className="text-lg mt-4 text-center font-semibold text-gray-600">
            New to Delma? Register here
          </p>
          <div className="p-4 flex flex-col gap-2">
            <p>Username</p>
            <Input
              placeholder="abc"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <p>Email</p>
            <Input
              placeholder="abc@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p>Password</p>
            <Input
            type="password"
              placeholder="*********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-gray-500 text-sm mt-2">
              Already register? pls{" "}
              <Link href={"/login"} className="text-blue-600">
                login
              </Link>{" "}
              here
            </p>
            <Button
              className="w-full mt-2"
              variant={"default"}
              onClick={handleRegister}
            >
              Register
            </Button>
          </div>
        </div>
      </WidthWrapper>
    </div>
  );
}
