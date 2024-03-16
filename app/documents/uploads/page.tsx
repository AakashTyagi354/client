"use client"
import UploadForm from "@/components/UploadForm";
import { selectUser } from "@/redux/userSlice";
import { useSelector } from "react-redux";

export default function Uploads() {
  const user = useSelector(selectUser);
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
