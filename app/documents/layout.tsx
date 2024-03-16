import { Button } from "@/components/ui/button";
import { File, Upload } from "lucide-react";
import Link from "next/link";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="flex">
        <div className="min-w-[260px] flex flex-col gap-6 h-[700px] border-r my-12">
          <Link href={"/documents/files"} className="flex items-center justify-start">
            <Button variant={"ghost"} className="flex w-[90%] items-start mx-auto gap-2">
              <File />
              View Documents{" "}
            </Button>
          </Link>
          <Link href={"/documents/uploads"}>
            <Button variant={"ghost"} className="flex w-[90%] mx-auto gap-2">
              <Upload />
              Uploads Documents{" "}
            </Button>
          </Link>
        </div>
        <div className="flex-grow">{children}</div>
      </main>
    </>
  );
}
