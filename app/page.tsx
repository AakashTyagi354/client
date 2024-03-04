import Image from "next/image";
import homeImg from "../public/images/img1.png";
import WidthWrapper from "@/components/WidthWrapper";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="h-screen">
      <div className="bg-[#f7e8e6] h-[50%]">
        <WidthWrapper className="flex">
          <div className="flex  mt-24 justify-center items-center flex-col m-6 md:flex-1 md:flex  md:flex-col">
            <p className="text-2xl font-semibold text-gray-600 md:text-3xl">
              Medical Care from Comfort of Your Home <br />
              Online Doctor Consultation
            </p>
            <p className="mt-4 text-sm text-gray-400 tracking-wide">
              Welcome to Delma, where healthcare meets convenience and
              accessibility at your fingertips. Our platform revolutionizes the
              traditional doctor-patient interaction by offering seamless online
              consultations with expert physicians, anytime and anywhere.
            </p>
            <div className="w-full">
              <Button className="w-[50%] mt-8 ">Check out doctors</Button>
            </div>
          </div>
          <div className=" hidden md:block md:flex-1">
            <Image
              src={homeImg}
              alt=""
              height={600}
              width={700}
              className="mt-28"
            />
          </div>
        </WidthWrapper>
      </div>
      <div>
        <WidthWrapper className="mt-12 ">
          <p className="text-3xl text-gray-700">25+ Specialities</p>
          <p className="mt-2 text-sm text-gray-400">Consult with top doctors across specialities</p>
        </WidthWrapper>
      </div>
    </div>
  );
}
