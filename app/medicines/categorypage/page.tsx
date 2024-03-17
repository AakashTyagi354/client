"use client";

import WidthWrapper from "@/components/WidthWrapper";
import axios from "axios";
import { useEffect, useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
export default function Page() {
  const [categories, setCategories] = useState([]);
  const getCategories = async () => {
    try {
      const res = await axios.get(
        "https://doc-app-7im8.onrender.com/api/v1/category/get-category"
      );

      setCategories(res.data.category);
    } catch (err) {
      console.log("Error creating category", err);
    }
  };
  useEffect(() => {
    getCategories();
  }, []);
  return (
    <div>
      <WidthWrapper>
        <div className="flex">
          <div className="h-[500px]">
            <div className="fixed left-0 top-16 w-[350px] border-r  border-gray-200 my-28 overflow-y-auto h-[600px]">
              <div className=" ml-20 mr-12">
                <p className="text-gray-600 font-semibold border-b border-gray-200 pb-4">
                  CATEGORIES
                </p>
                <div className="mt-4">
                  {categories.map((ele, idx) => (
                    <p
                      className="my-4 cursor-pointer text-gray-500 border-b border-gray-200 flex items-center pb-4 gap-4"
                      key={idx}
                    >
                      <IoIosArrowForward />
                      {ele.name}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto ml-[350px]">
            <div>
              <p className=""></p>
            </div>
          </div>
        </div>
      </WidthWrapper>
    </div>
  );
}
