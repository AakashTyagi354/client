import React, { useEffect, useState } from "react";
import WidthWrapper from "./WidthWrapper";
import Link from "next/link";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, selectToken, selectUser } from "@/redux/userSlice";
import { IoMdNotificationsOutline } from "react-icons/io";
import { HiOutlineMenu } from "react-icons/hi";
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
    link: "Medicines",
    href: "/medicines",
  },
  {
    link: "Documents",
    href: "/documents",
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
    href: "/dashboard",
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
        "http://localhost:7003/api/v1/user/delete-all-notification",
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
    } catch (err) {
      console.log("ERROR IN NOTIFICAIONS", err);
    }
  };
  const handleNotifications = async () => {
    try {
      const res = await axios.post(
        "http://localhost:7003/api/v1/user/get-all-notification",
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
            Logo
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
                  <IoMdNotificationsOutline size={24} />
                  <div className="h-5 w-5 bg-red-600 rounded-full absolute top-[-6px] right-[-7px] flex items-center justify-center text-sm p-1 text-white ">
                    {notifications && <p>{notifications.length}</p>}
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[350px] mr-14">
                {notifications &&
                  notifications.length > 0 &&
                  notifications.map((ele: { message: string }, idx) => (
                    <DropdownMenuItem
                      className="rounded-sm flex justify-evenly "
                      key={idx}
                    >
                      <DropdownMenuItem className="">
                        {ele.message}
                      </DropdownMenuItem>
                      <BiTrash
                        size={22}
                        className="cursor-pointer  "
                        color="red"
                        onClick={() => handleNotificationDelete(idx)}
                      />
                      <DropdownMenuSeparator />
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href={"/login"} className="ml-4">
              {token || docToken ? (
                <Button variant={"ghost"} onClick={handleLogout}>
                  Logout
                </Button>
              ) : (
                <Button variant={"ghost"}>Login</Button>
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
