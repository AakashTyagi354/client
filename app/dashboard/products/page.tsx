"use client";

import axiosInstance from "@/app/login/axiosInstance";
import WidthWrapper from "@/components/WidthWrapper";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/redux/cartSlice";
import { selectToken } from "@/redux/userSlice";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { MouseEventHandler, useEffect, useState } from "react";
import { MdOutlineAddShoppingCart } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

export default function Page() {
  const [products, setProducts] = useState<ProductInputProps[]>([]);
  const dispatch = useDispatch();
   const token = useSelector(selectToken);

  const getProducts = async () => {
    try {
      const res = await axiosInstance.get(
        "http://localhost:8089/api/v1/product",{
           
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProducts(res.data.content);
      console.log(res.data.content)
    } catch (err) {
      console.log("ERROR IN FETCHING PRODUCTS", err);
    }
  };
  useEffect(() => {
    getProducts();
  }, []);

  //   const handleCart: MouseEventHandler<HTMLButtonElement> = (item: any) => {
  //     dispatch(
  //       addToCart({
  //         productId: item._id,
  //         quantity: item.quantity,
  //         description: item.description,
  //         price: item.price,
  //         name: item.name,
  //         category: item.category,
  //         photo: item.photo,
  //       })
  //     );
  //   };
  // ;
  const handleCart = (product: ProductInputProps) => {
    dispatch(
      addToCart({
        productId: product.id,
        quantity: 1,
        description: product.description,
        price: product.price,
        name: product.name,
        category: product.categoryId,
        photo: product.imageURL,
      })
    );
  };

  return (
    <div>
      <WidthWrapper className=" flex justify-center flex-col items-center">
        <p className="text-center font-semibold text-gray-600 text-2xl my-12">
          List of all products{" "}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-12">
          {products.map((ele: ProductInputProps, idx) => (
            <Link href={`/medicines/${ele.id}`} key={idx}>
              <div className="h-[390px] w-[220px] shadow-sm cursor-pointer transition-all hover:scale-105 border border-dotted">
                <Image
                  src={ele.imageURL}
                  alt=""
                  height={100}
                  width={100}
                  className="h-[200px] w-[75%] mx-auto object-contain"
                />
                <p className="mt-4 font-semibold text-sm text-gray-500 text-center">
                  {ele.name}
                </p>
                <p className="text-[11px] m-4 text-gray-400">
                  {ele.description}
                </p>
                <div className="flex items-center gap-2 ml-4">
                  <p className="text-[12px] text-gray-500 ">
                    MRP <span className="line-through">₹{ele.price + 123}</span>
                  </p>
                  <p className="text-[14px] text-green-600">
                    {Math.floor(Math.random() * (50 - 10 + 1)) + 10}% off
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="ml-4 mt-1 text-gray-600 font-semibold">
                    ₹{ele.price}
                  </p>
                  <Button variant={"ghost"} onClick={() => handleCart(ele)}>
                    <MdOutlineAddShoppingCart size={24} />
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </WidthWrapper>
    </div>
  );
}

function textFormater(str: string, len: number) {
  if (str.length < len) return str;
  return str.substring(0, len) + "...";
}
