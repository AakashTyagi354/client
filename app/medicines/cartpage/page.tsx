"use client";
// Add this at the top of your file to fix TypeScript "window.Razorpay" errors
// declare global {
//   interface Window {
//     Razorpay: any;
//   }
// }
import WidthWrapper from "@/components/WidthWrapper";
import {
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
  selectCartItems,
} from "@/redux/cartSlice";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { MdHouse, MdOutlineAddShoppingCart } from "react-icons/md";
import { BiQuestionMark, BiSolidCoupon } from "react-icons/bi";
import { CiTrash } from "react-icons/ci";
import { ArrowRight, FileQuestionIcon } from "lucide-react";
import { IoHomeOutline } from "react-icons/io5";
import axios from "axios";
import { selectUser } from "@/redux/userSlice";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import axiosInstance from "@/app/login/axiosInstance";
declare global {
  interface Window {
    Razorpay: any; // or specify the type of Razorpay object if known
  }
}

export default function CartPage() {
  const user = useSelector(selectUser);
  const cart = useSelector(selectCartItems);
  const dispatch = useDispatch();
  const router = useRouter();

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
    if (!user) {
      toast({ variant: "destructive", description: "Please login to book." });
      router.push("/login");
      return;
    }

    try {

      // 1. Call your new Payment Microservice (via Gateway)
      // Replace URL with your actual API Gateway or Payment MS URL
      const { data } = await axiosInstance.post(
        "http://localhost:8089/api/v1/payments/create",
        {
          amount: amount,
          refId: "APP_102", // This would ideally be a dynamic Appointment ID
          sourceType: "APPOINTMENT"
        }


      );

      // 2. Ensure script is loaded before opening modal
      await loadRazorpayScript();

      const options = {
        key: "rzp_test_S9jVkGSiveLNXR", // Move this to .env.local
        amount: amount * 100, // Razorpay expects subunits (paise)
        currency: "INR",
        name: "Delma Health",
        description: "Doctor Appointment Booking",
        order_id: data.rzpOrderId, // The ID returned by your Java service
        handler: async function (response: any) {
          // 3. SUCCESS CALLBACK: Send to your MS for verification
          try {
            const verifyRes = await axiosInstance.post(
              "http://localhost:8089/api/v1/payments/verify",
              {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }
            );

            if (verifyRes.status === 200) {
              toast({ description: "Payment Successful! Appointment Booked." });
              router.push("/bookings/success");
            }
          } catch (err) {
            toast({ variant: "destructive", description: "Verification Failed!" });
          }
        },
        prefill: {
          name: user.name,
          email: user.email,

        },
        theme: { color: "#121212" },
      };

      const razor = new window.Razorpay(options);
      razor.open();

    } catch (error) {
      console.error("Payment Initiation Error:", error);
      toast({ variant: "destructive", description: "Could not initiate payment." });
    }
  };

  // const checkoutHandler = async (amount: number) => {
  //   if (user === null) {
  //     toast({
  //       variant: "destructive",
  //       description: "pls login to buy from delma",
  //     });
  //     router.push("/login");
  //   } else {
  //     const {
  //       data: { order },
  //     } = await axiosInstance.post(
  //       "https://doc-app-7im8.onrender.com/api/v1/payment/checkout",{},{
  //         params:{
  //           amount: amount,
  //           refId: "APP_102"
  //         }
  //       }

  //     );
  //     await loadRazorpayScript();
  //     const options = {
  //       key: "rzp_test_S9jVkGSiveLNXR",
  //       amount: order.amount,
  //       currency: "INR",
  //       name: "Delma",
  //       description: "Doctor appointment",
  //       image: "https://avatars.githubusercontent.com/u/78840211?v=4",
  //       order_id: order.id,
  //       callback_url:
  //         "https://doc-app-7im8.onrender.com/api/v1/payment/paymentverificaion",
  //       prefill: {
  //         name: "Gaurav Kumar",
  //         email: "gaurav.kumar@example.com",
  //         contact: "9000090000",
  //       },
  //       notes: {
  //         address: "Razorpay Corporate Office",
  //       },
  //       theme: {
  //         color: "#121212",
  //       },
  //     };
  //     const razor = new window.Razorpay(options);
  //     razor.open();
  //   }
  // };

  return (
    <div>
      <WidthWrapper>
        <div className="flex flex-col lg:flex-row ">
          <div className="flex-grow mt-12">
            <p className="text-xl font-semibold text-gray-600">
              {cart.length} items added to cart
            </p>
            {cart.map((ele, idx) => (
              <div
                key={idx}
                className="h-[380]  lg:h-[280px] flex flex-col lg:flex-row items-center w-[85%] border-b border-dotted border-gray-300   "
              >
                {/* <Image
                  src={ele.photo}
                  alt=""
                  height={100}
                  width={100}
                  className="h-[160px] w-[75%] mx-auto object-contain"
                /> */}
                <div className="flex flex-col">
                  <p className="mt-4 font-semibold text-sm text-gray-500 text-center">
                    {/* {textFormater(ele.name, 100)} */}
                    {ele.name}
                  </p>
                  <p className="text-[11px] m-4 text-gray-400">
                    {/* {textFormater(ele.description, 150)} */}
                    {ele.description}
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
                className="w-full bg-[#78355B] hover:bg-[#78355B] hover:opacity-95 mt-6 "
                onClick={() => checkoutHandler(totalMRP(cart))}
              >
                proceed to payment
              </Button>
            </div>
          </div>
        </div>
      </WidthWrapper>
    </div>
  );
}

const totalMRP = (items: any) => {
  return items.reduce((acc: number, ele: MRPInputProps) => {
    return acc + ele.price * ele.quantity;
  }, 0);
};

function textFormater(str: string, len: number) {
  if (str.length < len) return str;
  return str.substring(0, len) + "...";
}
