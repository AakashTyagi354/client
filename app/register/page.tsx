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
  const [loading, setLoading] = useState(false);

  // OTP state
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const route = useRouter();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      toast({ variant: "destructive", description: "All fields are required" });
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8089/auth/signup", {
        name: username,
        email,
        password,
      });

      if (res.data.success === true) {
        toast({ description: "OTP sent to your email. Please verify." });
        setShowOtpScreen(true); // Switch to OTP screen
      } else {
        toast({ variant: "destructive", description: res.data.message });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        description: err.response?.data?.message || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast({ variant: "destructive", description: "Please enter a valid 6-digit OTP" });
      return;
    }
    setOtpLoading(true);
    try {
      const res = await axios.post("http://localhost:8089/auth/verify-otp", {
        email,
        otp,
      });

      if (res.data.success === true) {
        toast({ description: "Email verified successfully! Please login." });
        route.push("/login");
      } else {
        toast({ variant: "destructive", description: res.data.message });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        description: err.response?.data?.message || "Invalid or expired OTP",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      const res = await axios.post("http://localhost:8089/auth/resend-otp", {
        email,
      });
      if (res.data.success === true) {
        toast({ description: "OTP resent successfully. Check your email." });
        setOtp("");
      } else {
        toast({ variant: "destructive", description: res.data.message });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        description: err.response?.data?.message || "Failed to resend OTP",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div>
      <WidthWrapper>
        {!showOtpScreen ? (
          // ── SIGNUP FORM ──
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
                className="w-full mt-2 bg-[#78355B] hover:bg-[#78355B] hover:opacity-95"
                disabled={loading}
                onClick={handleRegister}
              >
                {loading ? "Registering..." : "Register"}
              </Button>
            </div>
          </div>
        ) : (
          // ── OTP VERIFICATION SCREEN ──
          <div className="border border-gray-100 w-[400px] min-h-[300px] mx-auto mt-16">
            <p className="text-lg mt-4 text-center font-semibold text-gray-600">
              Verify your email
            </p>
            <div className="p-4 flex flex-col gap-3">
              <p className="text-sm text-gray-500 text-center">
                We sent a 6-digit OTP to{" "}
                <span className="font-semibold text-gray-700">{email}</span>
              </p>

              <p>Enter OTP</p>
              <Input
                placeholder="123456"
                value={otp}
                maxLength={6}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              />

              <Button
                className="w-full mt-2 bg-[#78355B] hover:bg-[#78355B] hover:opacity-95"
                disabled={otpLoading}
                onClick={handleVerifyOtp}
              >
                {otpLoading ? "Verifying..." : "Verify Email"}
              </Button>

              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-gray-500">Didn't receive OTP?</p>
                <button
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                >
                  {resendLoading ? "Sending..." : "Resend OTP"}
                </button>
              </div>

              <button
                onClick={() => setShowOtpScreen(false)}
                className="text-sm text-gray-400 hover:underline text-center mt-1"
              >
                ← Back to signup
              </button>
            </div>
          </div>
        )}
      </WidthWrapper>
    </div>
  );
}