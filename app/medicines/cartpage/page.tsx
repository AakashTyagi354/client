"use client";

import WidthWrapper from "@/components/WidthWrapper";
import {
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
  selectCartItems,
} from "@/redux/cartSlice";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { textFormater } from "../page";
import { Button } from "@/components/ui/button";
import { MdHouse, MdOutlineAddShoppingCart } from "react-icons/md";
import { BiQuestionMark, BiSolidCoupon } from "react-icons/bi";
import { CiTrash } from "react-icons/ci";
import { ArrowRight, FileQuestionIcon } from "lucide-react";
import { IoHomeOutline } from "react-icons/io5";
import axios from "axios";

export default function CartPage() {
  const cart = useSelector(selectCartItems);
  const dispatch = useDispatch();

  const handleIncrement = (productId: string) => {
    dispatch(incrementQuantity(productId));
  };

  const handleDecrement = (productId: string) => {
    dispatch(decrementQuantity(productId));
  };
  const handleRemove = (productId: string) => {
    dispatch(removeFromCart(productId));
  };
  const loadRazorpayScript = async () => {
    try {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    } catch (err) {
      console.log("Failed to load razorpay script: ", err);
    }
  };

  const checkoutHandler = async (amount: number) => {
    const {
      data: { order },
    } = await axios.post("http://localhost:7003/api/v1/payment/checkout", {
      amount,
    });
    await loadRazorpayScript();
    const options = {
      key: "rzp_test_fb6ALoOgdu9yem",
      amount: order.amount,
      currency: "INR",
      name: "Delma",
      description: "Doctor appointment",
      image: "https://avatars.githubusercontent.com/u/78840211?v=4",
      order_id: order.id,
      callback_url: "http://localhost:7003/api/v1/payment/paymentverificaion",
      prefill: {
        name: "Gaurav Kumar",
        email: "gaurav.kumar@example.com",
        contact: "9000090000",
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#121212",
      },
    };
    const razor = new window.Razorpay(options);
    razor.open();
  };
  console.log(cart);
  return (
    <div>
      <WidthWrapper>
        <div className="flex">
          <div className="flex-grow mt-12">
            <p className="text-xl font-semibold text-gray-600">
              {cart.length} items added to cart
            </p>
            {cart.map((ele, idx) => (
              <div
                key={idx}
                className="h-[280px] flex items-center w-[85%] border-b border-dotted border-gray-300   "
              >
                <Image
                  src={`http://localhost:7003/api/v1/product/product-photo/${ele.productId}`}
                  alt=""
                  height={100}
                  width={100}
                  className="h-[160px] w-[75%] mx-auto object-contain"
                />
                <div className="flex flex-col">
                  <p className="mt-4 font-semibold text-sm text-gray-500 text-center">
                    {textFormater(ele.name, 100)}
                  </p>
                  <p className="text-[11px] m-4 text-gray-400">
                    {textFormater(ele.description, 150)}
                  </p>
                  <div className="flex items-center gap-2 ml-4">
                    <p className="text-[12px] text-gray-500 ">
                      MRP{" "}
                      <span className="line-through">₹{ele.price + 123}</span>
                    </p>
                    <p className="text-[14px] text-green-600">
                      {Math.floor(Math.random() * (50 - 10 + 1)) + 10}% off
                    </p>
                  </div>
                  <p
                    onClick={() => handleRemove(ele.productId)}
                    className="  flex items-center gap-1 ml-2 mt-1 underline text-sm text-red-500 transition-all hover:text-red-700 cursor-pointer"
                  >
                    <CiTrash size={18} />
                    remove
                  </p>
                </div>
                <div className="flex flex-col  items-center ml-4  w-full">
                  <p className=" mt-4 items-start text-gray-600 font-semibold text-[20px]">
                    ₹{ele.price}
                  </p>
                  <div className="flex mt-2 border items-center border-red-500 gap-6 px-3 ">
                    <p
                      className="text-red-500 text-2xl cursor-pointer"
                      onClick={() => handleDecrement(ele.productId)}
                    >
                      -
                    </p>
                    <p>{ele.quantity}</p>
                    <p
                      className="text-red-500 text-2xl cursor-pointer"
                      onClick={() => handleIncrement(ele.productId)}
                    >
                      +
                    </p>
                  </div>
                  <p className="mt-3 text-sm text-gray-500">
                    SubTotal amount ₹{ele.price * ele.quantity} only
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="min-w-[450px] border-l min-h-screen border-gray-200 my-6">
            <div className="w-[90%] mx-auto  ">
              <div className="flex mt-8 b cursor-not-allowed justify-between items-center border-b-[5px] border-gray-200 pb-4">
                <p className="flex gap-4 items-center  text-gray-600">
                  <BiSolidCoupon size={24} />
                  Apply Coupon
                </p>
                <ArrowRight size={24} className="text-gray-600" />
              </div>
            </div>
            <div className="w-[90%] mx-auto mt-12 text-[18px] ">
              <p className="font-semibold text-gray-600">Bill Summary</p>
              <div className="flex flex-col gap-2 mt-2 border-b border-gray-200 pb-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">Item total (MRP)</p>
                  <p className="text-sm text-gray-400"> ₹{totalMRP(cart)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#64A39A] flex items-center gap-2">
                    Total discount <FileQuestionIcon size={18} />
                  </p>
                  <p className="text-sm text-[#64A39A]"> - ₹327</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#64A39A] flex items-center gap-2">
                    Shipping fees
                  </p>
                  <p className="text-sm text-[#64A39A]">
                    As per delivery address
                  </p>
                </div>
              </div>
              <div className="flex mt-2 items-center justify-between border-b-[5px] border-gray-200 pb-6">
                <p className="font-semibold text-sm text-gray-600">
                  To be paid{" "}
                </p>
                <p className="font-semibold text-sm text-gray-600">
                  ₹{totalMRP(cart)}
                </p>
              </div>
              <div className="flex items-center justify-between mt-6 border-b-[5px] border-gray-200 pb-6">
                <div className="flex items-center justify-between gap-2">
                  <IoHomeOutline size={20} />
                  <p className="font-semibold  text-gray-600">Delivering to</p>
                </div>
                <div>
                  <p className="text-red-500 text-sm cursor-pointer transition-all hover:underline">
                    Add Address{" "}
                  </p>
                </div>
              </div>
              <Button
                className="w-full bg-red-500 mt-6 "
                onClick={() => checkoutHandler(3000)}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </WidthWrapper>
    </div>
  );
}

const totalMRP = (items: any) => {
  return items.reduce((acc: number, ele: number) => {
    return acc + ele.price * ele.quantity;
  }, 0);
};
