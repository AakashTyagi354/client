"use client";
import WidthWrapper from "@/components/WidthWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import Link from "next/link";
import React, { useState } from "react";
import axiosInstance from "../login/axiosInstance";
import { clearUser, selectToken, selectUser } from "@/redux/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { clearDoctor } from "@/redux/doctorSlice";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function ApplyDoc() {
  const user = useSelector(selectUser);
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [languages, setLanguages] = useState("");
  const [address, setAddress] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [feesPerCunsaltation, setFeesPerCunsaltation] = useState("");
const router = useRouter();
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const handleLogout = async () => {
    try {
      const res = await axios.post("http://localhost:8089/auth/logout", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true
      });
      console.log("LOGOUT done!!", res?.data)
      dispatch(clearUser());
      dispatch(clearDoctor());

    } catch (err) {
      console.log("ERROR IN LOGOUT", err);
    }

  };
  const handleRegister = async () => {
    try {
      const languagesArray = languages.split(",").map((lang) => lang.trim());
      const experienceNumber = parseInt(experience);
      const feesPerConsultationNumber = parseFloat(feesPerCunsaltation);
      const phonenumber = parseFloat(phone);

      const res = await axiosInstance.post(
        "http://localhost:8089/api/v1/doctor/apply",
        {
          firstName: firstname,
          lastName: lastname,
          phone: phonenumber,
          experience: experienceNumber,
          feesPerConsultation: feesPerConsultationNumber,
          // languages: languagesArray,
          email,
          password,
          address,
          specialization,
        },
        {
          params: {
            userId: user?.id
          }
        }
      );

      toast({
        description: res.data,
      });

      await handleLogout();

      router.push("/login");



      console.log(res.data);
    } catch (err) {
      console.log("Error IN DOC REGISTER", err);
    }
  };
  return (
    <div>
      <WidthWrapper>
        <div className="border border-gray-100 w-[400px] min-h-[400px] mx-auto mt-16">
          <p className="text-lg mt-4 text-center font-semibold text-gray-600">
            Apply as a doctore on delma here
          </p>
          <div className="p-4 flex flex-col gap-2">
            <p>First Name</p>
            <Input
              placeholder="abc"
              value={firstname}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <p>Last Name</p>
            <Input
              placeholder="abc"
              value={lastname}
              onChange={(e) => setLastName(e.target.value)}
            />
            <p>Email</p>
            <Input
              placeholder="abc@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p>Password</p>
            <Input
              placeholder="*********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <p>Phone</p>
            <Input
              placeholder="+91-000000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p>Address</p>
            <Input
              placeholder="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <p>languages</p>
            <Input
              placeholder="English,Hindi,..etc"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
            />

            <p>specialization</p>
            <Input
              placeholder="specialization"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            />

            <p>Experience</p>
            <Input
              placeholder="specialization"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />

            <p>FeesPerCunsaltation</p>
            <Input
              placeholder="feesPerCunsaltation"
              value={feesPerCunsaltation}
              onChange={(e) => setFeesPerCunsaltation(e.target.value)}
            />

            <p className="text-gray-500 text-sm mt-2">
              Already register as a doctor? pls{" "}
              <Link href={"/login"} className="text-blue-600">
                login
              </Link>{" "}
              here
            </p>
            <Button
              className="w-full mt-2 bg-[#78355B] hover:bg-[#78355B] hover:opacity-95"
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
