"use client";

import { useState } from "react";
import FilePrevies from "./FilePrevies";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import { Progress } from "./ui/progress";
import { app } from "@/firebaseConfig";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectToken, selectUser } from "@/redux/userSlice";
import { toast } from "./ui/use-toast";

export default function UploadForm() {
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);

  const [file, setFile] = useState();
  const storage = getStorage(app);
  const [progress, setProgress] = useState(0);

  const onFileSelect = (file) => {
    if (file && file.size > 2000000) {
      alert("size is to greater than 2000000");
      return;
    }
    setFile(file);
  };
  const handleFileUpload = (file) => {
    const storageRef = ref(storage, "file-upload/" + file?.name);
    const uploadTask = uploadBytesResumable(storageRef, file, file?.type);

    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log("Upload is " + progress + "% done");
      setProgress(progress);

      if (progress === 100) {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            console.log("File available at", downloadURL);
            console.log(downloadURL);
            handleUploadDocuments(downloadURL); // Call handleUploadDocuments after setting the url
            toast({
              variant: "default",
              description: "Document Uploaded successfully",
            });
            setFile(null);
          })
          .catch((error) => {
            console.error("Error getting download URL:", error);
          });
      }
    });
  };

  const handleUploadDocuments = async (url: string) => {
    try {
      const res = await axios.post(
        "https://doc-app-7im8.onrender.com/api/v1/documents/create-document",
        {
          userId: user?.id,
          name: file.name,
          url: url,
          type: file.type,
          size: file.size,
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

  return (
    <div className="m-12 text-center">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50  hover:bg-gray-100"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              SVG, PNG, JPG or GIF (MAX. sixe 2MB)
            </p>
          </div>
          <input
            onChange={(e) => onFileSelect(e.target.files[0])}
            id="dropzone-file"
            type="file"
            className="hidden"
          />
        </label>
      </div>
      {file && <FilePrevies file={file} removeFile={() => setFile(null)} />}
      <button
        disabled={!file}
        onClick={() => handleFileUpload(file)}
        className="p-2 w-[30%] disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full mt-5 bg-gray-200"
      >
        Upload
      </button>
      {progress > 0 && progress < 100 && (
        <Progress value={30} className="h-2 w-[80%] mx-auto  mt-12" />
      )}
    </div>
  );
}
