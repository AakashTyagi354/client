import { File, X } from "lucide-react";

export default function FilePrevies({
  file,
  removeFile,
}: {
  file: File;
  removeFile: () => void;
}) {
  return (
    <div className="flex items-center gap-2 justify-between mt-5 border rounded-md p-2 border-b-gray-400 ">
      <div className="flex items-center p-2">
        <File size={30} />
        <div>
          <p>{file.name}</p>
          <p className="text-[12px] text-gray-400">
            {file?.type}/{(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>
      <X className="text-red-500 cursor-pointer" onClick={() => removeFile()} />
    </div>
  );
}
