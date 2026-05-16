
"use client"
import { Provider, useSelector } from "react-redux";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { store } from "@/redux/store";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import AIBookingChat from "./ai/AIBookingChat";
import { selectUser } from "@/redux/userSlice";

function AppContent({ children }: { children: React.ReactNode }) {
  const user = useSelector(selectUser);

  // Only show AI chat for logged-in patients
  // Not for doctors, admins, or unauthenticated users
  const showAiChat = user && !user.isAdmin && !user.isDoctor;

  return (
    <>
      <Navbar />
      {children}
      <Toaster />
      <Footer />
      {showAiChat && <AIBookingChat />}
    </>
  );
}

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <AppContent>{children}</AppContent>
    </Provider>
  );
}
