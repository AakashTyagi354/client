"use client";
import { Provider } from "react-redux";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { store } from "@/redux/store";

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Delma",
//   description: "Doctor appointment management application",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>

        <Provider store={store}>
          <Navbar />
          {children}
        </Provider>
      </body>
    </html>
  );
}
