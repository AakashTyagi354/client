"use client";

import WidthWrapper from "@/components/WidthWrapper";
import axios from "axios";
import Image from "next/image";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function SigleProduct() {
  const [product, setProduct] = useState({});
  const params = useParams();

  const getSingleProduct = async () => {
    try {
      const res = await axios.get(
        `https://doc-app-7im8.onrender.com/api/v1/product/get-product/${params.singleproduct}`
      );

      setProduct(res.data.data);
    } catch (err) {
      console.log("Error in getSingleProduct", err);
    }
  };
  const getSimilarProducts = async () => {
    try {

        const res = await axios.get(
          // `https://doc-app-7im8.onrender.com/api/v1/product/related-product/${params.singleproduct}/${product.category._id}`
          "https://doc-app-7im8.onrender.com/api/v1/product/related-product/65f275e83fd29bd4b8375200/65f26270649b6829b35f439f"
        );
        console.log(res.data.data);
    
    } catch (err) {
      console.log("Error in getSimilarProducts", err);
    }
  };

  useEffect(() => {
    getSingleProduct();
    getSimilarProducts();
  }, []);
  // useEffect(() => {
  //   getSimilarProducts();
  // }, [product]);
  return (
    <div>
      <WidthWrapper>
        <div className=" flex">
          <div className="flex-1">
            <div className="w-full mt-12 flex flex-col ">
              <div className="w-full flex items-center justify-center">
                <Image
                  src={`https://doc-app-7im8.onrender.com/api/v1/product/product-photo/${product._id}`}
                  alt=""
                  height={100}
                  width={100}
                  className="w-[60%] h-[40%]"
                />
              </div>

              <div className="flex mt-6  w-[70%] mx-auto justify-between">
                <div>
                  <p className="text-sm font-semibold  text-gray-600">
                    Pack Size
                  </p>
                  <div className="mt-2">
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="50mg" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">100mg</SelectItem>
                        <SelectItem value="dark">500mg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold  text-gray-600">
                    Unit Count
                  </p>
                  <div className="mt-2">
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="500G powder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">100mg</SelectItem>
                        <SelectItem value="dark">500mg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <div className=" w-[70%] mx-auto">
              <p className="font-semibold text-xl mt-4"> ₹{product.price}</p>
            </div>
            <div className="w-[70%] mx-auto mt-4">
              <Button className="w-full">Add to Cart</Button>
            </div>
          </div>
          <div className="flex-1 ">
            <div className="mt-12">
              <p className="text-xl tracking-wide font-semibold text-gray-600">
                {product.name}
              </p>
              <div className="mt-12">
                <p className="font-semibold text-gray-700">
                  Product Description
                </p>
                <p className="text-sm text-gray-500 tracking-wide">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12">
          <p className="text-xl font-semibold tracking-wide text-gray-600">
            Similar Products
          </p>
          <div></div>
        </div>
      </WidthWrapper>
    </div>
  );
}
