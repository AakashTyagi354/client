"use client";

import { textFormater } from "@/app/medicines/page";
import { selectToken, selectUser } from "@/redux/userSlice";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CiFileOn } from "react-icons/ci";
import { CiImageOn } from "react-icons/ci";
import { LuMoveUpRight } from "react-icons/lu";
import { FaRegTrashAlt } from "react-icons/fa";
export default function Files() {
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const [documents, setDocuments] = useState([]);

  const getAllDocuments = async () => {
    try {
      const res = await axios.post(
        "http://localhost:7003/api/v1/documents/getall-document",
        {
          userId: user?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res.data.documents);
      setDocuments(res.data.documents);
    } catch (err) {
      console.log("ERROR IN UPLOADING Documents", err);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const res = await axios.post(
        "http://localhost:7003/api/v1/documents/delete-document",
        {
          documentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res.data);
    } catch (err) {
      console.log("ERROR IN UPLOADING Documents", err);
    }
  };

  useEffect(() => {
    getAllDocuments();
  }, [handleDeleteDocument]);
  return (
    <div className="w-full">
      <p className="text-2xl text-center font-bold mt-6 text-gray-600">
        All Document
      </p>
      <div className="flex flex-wrap gap-4 mt-12 w-[80%] mx-auto ">
        {documents.map((item, idx) => (
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
                <FaRegTrashAlt
                  className="text-red-600 cursor-pointer"
                  onClick={() => handleDeleteDocument(item._id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const getDate = (createdAt: string) => {
  const dateObject = new Date(createdAt);

  // Get date
  const date = dateObject.toLocaleDateString();
  const time = dateObject.toLocaleTimeString();
  return date;
};
