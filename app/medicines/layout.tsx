import { Button } from "@/components/ui/button";
import Link from "next/link";
import MedicineNavbar from "../../components/MedicineNavbar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="">
        <MedicineNavbar />
        <div className="flex-grow">{children}</div>
      </main>
    </>
  );
}
