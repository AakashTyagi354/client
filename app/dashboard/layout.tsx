import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="flex">
        <div className="min-w-[260px] h-screen bg-gray-50">
          <div className="flex flex-col mt-12 gap-4">
            <p className="text-gray-600 underline text-lg tracking-wider text-center">
              Appointments Controls
            </p>

            <Link
              href={"/dashboard/users"}
              className="w-[80%] rounded-md mx-auto"
            >
              <Button className="w-full">Users</Button>
            </Link>

            <Link
              href={"/dashboard/doctors"}
              className="w-[80%] rounded-md mx-auto"
            >
              <Button className="w-full">Doctors</Button>
            </Link>
          </div>
          <div className="flex flex-col mt-12 gap-4">
            <p className="text-gray-600 underline text-lg tracking-wider text-center">
              E-Store Controls
            </p>
            <Link
              href={"/dashboard/createcat"}
              className="w-[80%] rounded-md mx-auto"
            >
              <Button variant={"outline"} className="w-full">Create Categories</Button>
            </Link>
            <Link
              href={"/dashboard/createproduct"}
              className="w-[80%] rounded-md mx-auto"
            >
              <Button variant={"outline"} className="w-full">Create Product</Button>
            </Link>
          </div>
        </div>
        <div className="flex-grow">{children}</div>
      </main>
    </>
  );
}
