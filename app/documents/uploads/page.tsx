"use client";
import UploadForm from "@/components/UploadForm";
import { selectUser } from "@/redux/userSlice";
import Link from "next/link";
import { useSelector } from "react-redux";

export default function Uploads() {
  const user = useSelector(selectUser);
  if (user === null) {
    return (
      <p className="text-gray-500 text-center my-24">
        Pls <span>
          <Link href={"/login"} className="text-blue-500"> login</Link>
          </span> to upload your documents
      </p>
    );
  } else {
    if (user?.isAdmin) {
      return (
        <>
          <p className="text-center mt-40 text-sm text-gray-500">
            Admin cannot access the documents of users
          </p>
        </>
      );
    } else {
      return (
        <div>
          <p>Upload your files here</p>
          <UploadForm />
        </div>
      );
    }
  }
}
