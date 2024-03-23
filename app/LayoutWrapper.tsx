
"use client"
import { Provider } from "react-redux";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { store } from "@/redux/store";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";

export default function LayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider store={store}>
      <Navbar />
      {children}
      <Toaster />
      <Footer />
    </Provider>
  );
}
