"use client"

import React, { useEffect, useState } from "react";
import WidthWrapper from "./WidthWrapper";
import Link from "next/link";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, selectToken, selectUser } from "@/redux/userSlice";
import { IoMdNotificationsOutline } from "react-icons/io";
import { HiOutlineMenu } from "react-icons/hi";
import { RxCross2 } from "react-icons/rx";
import logoImg from "../public/logoImg.png"
import { FaRegShareSquare } from "react-icons/fa";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BiTrash } from "react-icons/bi";
import axios from "axios";
import {
  clearDoctor,
  selectToken as selectDocToken,
} from "@/redux/doctorSlice";
import { Trash2 } from "lucide-react";
import Image from "next/image";

const navlinks = [
  {
    link: "Find Doctors",
    href: "/finddoc",
  },
  {
    link: "Video Consult",
    href: "/videocall",
  },
  {
    link: "Documents",
    href: "/documents/files",
  },
  {
    link: "Medicines",
    href: "/medicines",
  },
  
];
const doctorLinks = [
  {
    link: "User Documents",
    href: "/docdoc",
  },
  {
    link: "Video Consult",
    href: "/videocall",
  },
  {
    link: "Medicines",
    href: "/medicines",
  },
];
const adminLinks = [
  {
    link: "Dashboard",
    href: "/dashboard/users",
  },
];

export default function Navbar() {
  const token = useSelector(selectToken);
  const docToken = useSelector(selectDocToken);

  const currentUser = useSelector(selectUser);
  const [notifications, setNotifications] = useState([]);
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(clearUser());
    dispatch(clearDoctor());
  };
  const handleNotificationDelete = async (idx: number) => {
    try {
      const res = await axios.post(
        "https://doc-app-7im8.onrender.com/api/v1/user/delete-all-notification",
        {
          userId: currentUser?.id,
          idx,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications(res.data.data);
    } catch (err) {
      console.log("ERROR IN NOTIFICAIONS", err);
    }
  };
  const handleClearNotificatio = async () => {
    try {
      console.log("reached");
      const res = await axios.post(
        "https://doc-app-7im8.onrender.com/api/v1/user/clear-all-notifications",
        {
          userId: currentUser?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res.data);
      setNotifications(res.data.data);
    } catch (err) {
      console.log("ERROR IN NOTIFICAIONS", err);
    }
  };
  const handleNotifications = async () => {
    try {
      const res = await axios.post(
        "https://doc-app-7im8.onrender.com/api/v1/user/get-all-notification",
        {
          userId: currentUser?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications(res.data.notification);
    } catch (err) {
      console.log("ERROR IN NOTIFICAIONS", err);
    }
  };
  useEffect(() => {
    handleNotifications();
  }, [token]);
  return (
    <div className="sticky top-0 z-50 bg-inherit border-b border-gray-100 ">
      <WidthWrapper className=" h-16 flex items-center justify-between">
        <div className=" w-[200px] md:w-[600px]">
          <Link className="font-bold text-xl" href={"/"}>
            <Image src={logoImg} alt="" height={50} width={100}/>
          </Link>
        </div>
        <div className="hidden  md:flex flex-grow w-full justify-between ">
          <div className="flex">
            {!docToken ? (
              <>
                {navlinks.map((ele, idx) => (
                  <Link href={ele.href} key={idx}>
                    <Button variant={"link"}>{ele.link}</Button>
                  </Link>
                ))}
                {currentUser?.isAdmin ? (
                  <>
                    {adminLinks.map((ele, idx) => (
                      <Link href={ele.href} key={idx}>
                        <Button variant={"link"}>{ele.link}</Button>
                      </Link>
                    ))}
                  </>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <>
                {doctorLinks.map((ele, idx) => (
                  <Link href={ele.href} key={idx}>
                    <Button variant={"link"}>{ele.link}</Button>
                  </Link>
                ))}
              </>
            )}
          </div>
          <div className="flex justify-center items-center ">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className=" relative mr-2 cursor-pointer">
                  <IoMdNotificationsOutline size={25} />
                  {notifications && notifications.length > 0 && (
                    <div className="h-[20px] w-[20px] bg-red-600 rounded-full absolute top-[-6px] right-[-7px] flex items-center justify-center text-sm p-[6px] text-white ">
                      {notifications && <p>{notifications.length}</p>}
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[480px] mr-14  max-h-[500px] overflow-y-scroll">
                {notifications &&
                  notifications.length > 0 &&
                  notifications.map((ele: { message: string }, idx) => (
                    <DropdownMenuItem
                      className="rounded-sm flex justify-between border-b py-4 px-2 "
                      key={idx}
                    >
                      <p className="text-sm text-gray-500">{ele.message}</p>

                      <RxCross2
                        size={22}
                        className="cursor-pointer  text-red-500  ml-6 "
                        onClick={() => handleNotificationDelete(idx)}
                      />
                      <DropdownMenuSeparator />
                    </DropdownMenuItem>
                  ))}
                {notifications && notifications.length > 0 && (
                  <div className="flex items-center justify-between px-3 py-3">
                    <p className="text-sm underline font-[400]">
                      Clear all notifications
                    </p>
                    <Trash2
                      onClick={handleClearNotificatio}
                      className="text-red-500 cursor-pointer hover:text-red-600"
                    />
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href={"/login"} className="ml-4">
              {token || docToken ? (
                <Button variant={"ghost"} onClick={handleLogout} className="flex gap-2">
                  <FaRegShareSquare size={20}/>
                  Logout
                </Button>
              ) : (
                <Button variant={"ghost"} className="flex gap-2">
                     <FaRegShareSquare size={20}/>
                  Login</Button>
              )}
            </Link>
          </div>
        </div>
        <div className="block md:hidden cursor-pointer ">
          <Sheet>
            <SheetTrigger>
              <HiOutlineMenu size={25} className="text-gray-600" />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetDescription className=" min-h-[400px] mt-12">
                  <div className="flex flex-col items-start gap-4">
                    {!docToken ? (
                      <>
                        {navlinks.map((ele, idx) => (
                          <Link
                            href={ele.href}
                            key={idx}
                            className="hover:bg-gray-100 w-full text-start"
                          >
                            <Button variant={"link"}>{ele.link}</Button>
                          </Link>
                        ))}
                        {currentUser?.isAdmin ? (
                          <>
                            {adminLinks.map((ele, idx) => (
                              <Link
                                href={ele.href}
                                key={idx}
                                className="hover:bg-gray-100 w-full text-start"
                              >
                                <Button variant={"link"}>{ele.link}</Button>
                              </Link>
                            ))}
                          </>
                        ) : (
                          <></>
                        )}
                      </>
                    ) : (
                      <>
                        {doctorLinks.map((ele, idx) => (
                          <Link
                            href={ele.href}
                            key={idx}
                            className="hover:bg-gray-100 w-full text-start"
                          >
                            <Button variant={"link"}>{ele.link}</Button>
                          </Link>
                        ))}
                      </>
                    )}
                  </div>

                  <div className="mt-12">
                    <Link href={"/login"} className="text-red-600">
                      {token || docToken ? (
                        <Button variant={"ghost"} onClick={handleLogout}>
                          Logout
                        </Button>
                      ) : (
                        <Button variant={"ghost"}>Login</Button>
                      )}
                    </Link>
                  </div>
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </WidthWrapper>
    </div>
  );
}
