"use client";

import { CiSearch } from "react-icons/ci";
import WidthWrapper from "./WidthWrapper";
import { Button } from "./ui/button";
import { MdOutlineAddShoppingCart, MdShoppingCart } from "react-icons/md";
import { useSelector } from "react-redux";
import { selectCartItems } from "@/redux/cartSlice";
import Link from "next/link";

export default function MedicineNavbar() {
  const cart = useSelector(selectCartItems);
  console.log(cart);
  return (
    <div className=" sticky top-14 z-10 border-b border-gray-100 bg-white shadow-sm h-16">
      <WidthWrapper className="h-full">
        <div className="flex items-center h-full justify-evenly">
          <div className="border p-2 flex gap-2 w-[50%] ">
            <CiSearch size={20} className="cursor-pointer" />
            <input
              type="text"
              placeholder="Search for medicines, health products and much more"
              className="bg-inherit outline-none focus:outline-none w-full text-sm"
            />
          </div>
          <div className="">
            <Link href={"/medicines/cartpage"}>
              <Button className="bg-[#15BEF0] transition-all rounded-none flex gap-4 relative">
                <MdShoppingCart size={20} />
                <div className="rounded-full h-5 w-5 bg-white absolute top-[2px] left-[25px] text-gray-700">
                  {cart.length}
                </div>
                View Cart
              </Button>
            </Link>
          </div>
        </div>
      </WidthWrapper>
    </div>
  );
}
