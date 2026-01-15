"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  selectDoctor,
  selectToken as selectDocToken,
} from "@/redux/doctorSlice";
import { useParams } from "next/navigation";
import { LuMoveUpRight } from "react-icons/lu";
import { FaRegTrashAlt } from "react-icons/fa";

import { CiFileOn, CiImageOn } from "react-icons/ci";
import axiosInstance from "@/app/login/axiosInstance";

export default function UserDoc() {
  const doctor = useSelector(selectDoctor);
  const token = useSelector(selectDocToken);
  const params = useParams();

  const [documents, setDocuments] = useState([]);

  const getAllDocuments = async () => {
    try {
      const res = await axiosInstance.get(
        `http://localhost:8089/api/v1/documents/getall-documents/${params.userdoc}`,
        
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res.data);
      setDocuments(res.data);
    } catch (err) {
      console.log("ERROR IN Getting all Documents", err);
    }
  };
  useEffect(() => {
    getAllDocuments();
  }, []);

  return (
    <div className="w-full">
      <p className="text-2xl text-center font-bold mt-6 text-gray-600">
        All Document
      </p>
      <div className="flex flex-wrap gap-4 mt-12 w-[80%] mx-auto ">
        {documents.map((item: DocumentInputProps, idx) => (
          <div
            key={idx}
            className="border border-gray-50 h-[200px] rounded-md w-[230px] cursor-pointer transition-all hover:bg-gray-50 "
          >
            <div className="flex items-center justify-center">
              {item.type === "image/webp" ? (
                <>
                  <CiImageOn size={90} />
                </>
              ) : (
                <CiFileOn size={90} />
              )}
            </div>
            <div className="mt-4  w-[80%] mx-auto">
              <p className="text-gray-500 text-sm">
                {textFormater(item.name, 12)}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Uploaded on {getDate(item.createdAt)}
              </p>
              <div className="mt-2 flex justify-between items-center">
                <a
                  href={item.url}
                  target="_blank"
                  className="text-sm to-gray-400 underline flex gap-1 items-center"
                >
                  view document
                  <LuMoveUpRight />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getDate(createdAt: string) {
  const dateObject = new Date(createdAt);

  // Get date
  const date = dateObject.toLocaleDateString();
  const time = dateObject.toLocaleTimeString();
  return date;
}

function textFormater(str: string, len: number) {
  if (str.length < len) return str;
  return str.substring(0, len) + "...";
}
