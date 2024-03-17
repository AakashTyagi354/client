"use client";

import img1 from "../../public/images/cimg1.jpeg";
import img2 from "../../public/images/cimg2.png";
import img3 from "../../public/images/cimg4.png";
import Image from "next/image";
import WidthWrapper from "@/components/WidthWrapper";
import { MouseEventHandler, useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { MdOutlineAddShoppingCart } from "react-icons/md";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { RiLoader2Line } from "react-icons/ri";
import { useInView } from "react-intersection-observer";
import debounce from "lodash/debounce";
import { Loader2 } from "lucide-react";
import Link from "next/link";
const categories = [
  {
    title: "Diabetes",
    img: "/images/cat1.webp",
  },
  {
    title: "Heart care",
    img: "/images/cat2.webp",
  },
  {
    title: "DiaStomach Carebetes",
    img: "/images/cat3.webp",
  },
  {
    title: "Liver Care",
    img: "/images/cat4.webp",
  },
  {
    title: "Kideny Care",
    img: "/images/cat5.webp",
  },
  {
    title: "Derma Care",
    img: "/images/cat6.webp",
  },
  {
    title: "Eye Care",
    img: "/images/cat7.webp",
  },
];

export default function Medicines() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const { ref, inView } = useInView();
  const [noMoreProducts, setNoMoreProducts] = useState(false); // New state variable
  const dispatch = useDispatch();

  const handleCart: MouseEventHandler<HTMLButtonElement> = (item: any) => {
    dispatch(
      addToCart({
        productId: item._id,
        quantity: item.quantity,
        description: item.description,
        price: item.price,
        name: item.name,
        category: item.category,
        photo: item.photo,
      })
    );
  };

  const getProducts = async () => {
    // Delay loading state to show the loader
    setLoading(true); // Show loader immediately

    try {
      await delay(2000);
      const res = await axios.get(
        `https://doc-app-7im8.onrender.com/api/v1/product/product-list/${pageNumber}`
      );
      const newProducts = res.data.products;
      console.log(newProducts, pageNumber, "new producs");
      if (newProducts.length > 0) {
        setProducts((prevProducts) => [...prevProducts, ...newProducts]);
        setPageNumber((prev) => prev + 1);
        console.log("PAGE", pageNumber);
      } else {
        setNoMoreProducts(true);
        setLoading(false);
      }
    } catch (err) {
      console.log("ERROR IN FETCHING PRODUCTS", err);
    } finally {
      setLoading(false);
    }
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  useEffect(() => {
    if (inView) {
      console.log("in views");
      getProducts();
    }
  }, [inView]);

  return (
    <div className="min-h-screen">
      <div className="h-[300px] bg-[#E4F2EA] flex items-center justify-center">
        <Image src={img3} alt="" className="w-[80%] h-full" />
      </div>
      <WidthWrapper className=" h-full">
        <p className="font-semibold mt-12 text-2xl text-gray-700 tracking-wider">
          Browse medicines & health products
        </p>
        <div className="mt-6 ">
          <p className="text-gray-500">Popular Categories</p>
          <div className="w-full h-[200px]  flex gap-3 mt-4">
            {categories.map((ele, idx) => (
              <div key={idx} className="w-[200px] flex flex-col cursor-pointer">
                <Image
                  src={ele.img}
                  height={160}
                  width={160}
                  alt=""
                  className="transition-all hover:scale-110"
                />
                <p className="mt-2 text-sm text-gray-500">{ele.title}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="my-12">
          <p className="text-gray-500">Trending Products</p>
          <div className="w-full flex flex-wrap gap-12 mt-6">
            {products.map(
              (
                ele: {
                  _id: string;
                  name: string;
                  description: string;
                  price: number;
                },
                idx
              ) => (
                <Link href={`/medicines/${ele._id}`} key={idx}>
                  <div className="h-[390px] w-[220px] shadow-sm cursor-pointer transition-all hover:scale-105 border border-dotted">
                    <Image
                      src={`https://doc-app-7im8.onrender.com/api/v1/product/product-photo/${ele._id}`}
                      alt=""
                      height={100}
                      width={100}
                      className="h-[200px] w-[75%] mx-auto object-contain"
                    />
                    <p className="mt-4 font-semibold text-sm text-gray-500 text-center">
                      {textFormater(ele.name, 40)}
                    </p>
                    <p className="text-[11px] m-4 text-gray-400">
                      {textFormater(ele.description, 60)}
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
              )
            )}
          </div>
        </div>
        <div
          className="w-full flex items-center justify-center mx-auto"
          ref={ref}
        >
          {loading && <Loader2 size={34} className="animate-spin" />}
        </div>
      </WidthWrapper>
    </div>
  );
}
function textFormater(str: string, len: number) {
  if (str.length < len) return str;
  return str.substring(0, len) + "...";
}
