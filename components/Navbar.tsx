import React from "react";
import WidthWrapper from "./WidthWrapper";
import Link from "next/link";
import { Button } from "./ui/button";

const navlinks = [
  {
    link: "Find Doctors",
    href: "/doctors",
  },
  {
    link: "Video Consult",
    href: "/video",
  },
  {
    link: "Blogs",
    href: "/blogs",
  },
];

export default function Navbar() {
  return (
    <div className="sticky top-0 z-50 bg-inherit">
      <WidthWrapper className=" h-12 flex items-center justify-between">
        <div>
          <Link className="font-bold text-xl" href={"/"}>
            Logo
          </Link>
        </div>
        <div className="flex">
          {navlinks.map((ele, idx) => (
            <Link href={ele.href} key={idx}>
              <Button variant={"link"}>{ele.link}</Button>
            </Link>
          ))}
        </div>
        <div>
          <Link href={"/login"}>
            <Button variant={"ghost"}>SignIn / SignUp</Button>
          </Link>
        </div>
      </WidthWrapper>
    </div>
  );
}
