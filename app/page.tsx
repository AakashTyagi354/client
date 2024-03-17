"use client";
import Image from "next/image";
import homeImg from "../public/images/img1.png";
import WidthWrapper from "@/components/WidthWrapper";
import { Button } from "@/components/ui/button";
import h1img from "../public/images/h1.jpeg";
import h2img from "../public/images/h2.jpeg";
import h3img from "../public/images/h3.jpeg";
import h4img from "../public/images/h4.jpeg";
import h5img from "../public/images/h5.jpeg";
import h6img from "../public/images/h6.jpeg";
import h7img from "../public/images/h7.jpeg";
import h8img from "../public/images/h8.jpeg";
import { CiLocationArrow1 } from "react-icons/ci";
import { Swiper, SwiperSlide } from "swiper/react";
import { IoDocumentOutline } from "react-icons/io5";
import { CiShoppingCart } from "react-icons/ci";
import { FcDocument } from "react-icons/fc";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/free-mode";
import { FreeMode, Pagination } from "swiper/modules";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  TicketCheck,
} from "lucide-react";
import { CiChat1 } from "react-icons/ci";

const healthConcernsData = [
  {
    title: "Cold & Cough",
    price: 399,
    img: h1img,
  },

  {
    title: "Period Problems?",
    price: 599,
    img: h2img,
  },
  {
    title: "Skin Problems?",

    price: 340,
    img: h3img,
  },
  {
    title: "Deprecession or anxiety",
    price: 499,
    img: h4img,
  },
  {
    title: "Stomach Problems?",
    price: 299,
    img: h5img,
  },
  {
    title: "Want to lose weight?",
    price: 350,
    img: h6img,
  },
  {
    title: "Kids Probems",
    price: 599,
    img: h7img,
  },
];
const settings = {
  dots: false,
  // infinite: true,
  // speed: 500,
  slidesToShow: 5,
  slidesToScroll: 1, // Corrected typo here
};
export default function Home() {
  return (
    <div className="pb-24">
      <div className="bg-[#f7e8e6] h-[70%]  md:h-[50%]">
        <WidthWrapper className="flex pt-12 md:pt-0">
          <div className="flex  mt-24 justify-center items-start flex-col m-6 md:flex-1 md:flex  md:flex-col">
            <p className="text-2xl items-start font-semibold text-gray-600 md:text-3xl">
              Medical Care from Comfort of Your Home <br />
              Online Doctor Consultation
            </p>
            <p className="mt-4 text-sm  text-gray-400 tracking-wide">
              Welcome to Delma, where healthcare meets convenience and
              accessibility at your fingertips. Our platform revolutionizes the
              traditional doctor-patient interaction by offering seamless online
              consultations with expert physicians, anytime and anywhere.
            </p>
            <div className="w-full">
              <Button className="w-[50%] mt-8  bg-[#387693]">
                Check out doctors
              </Button>
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
          <p className="text-3xl text-gray-700 font-[500] text-center">
            How it works
          </p>
          <div className=" mt-12 h-[600px] md:h-[200px] w-[80%] mx-auto    ">
            <div className="flex flex-col md:flex-row justify-between items-center  h-full ">
              <div className=" w-[250px] ">
                <div className="h-[60px] mx-auto w-[60px] flex items-center justify-center bg-[#F0EFF4] rounded-full">
                  {" "}
                  <CiLocationArrow1 size={30} />
                </div>
                <p className="text-[12px] mt-4 text-gray-500 tracking-wide">
                  Select doctor according to illness and book an Appoitment
                </p>
              </div>
              <div>
                <div className="h-[60px] mx-auto w-[60px] flex items-center justify-center bg-[#F0EFF4] rounded-full">
                  {" "}
                  <FcDocument size={30} />
                </div>
                <p className="text-[12px] mt-4 text-gray-500 tracking-wide">
                  {" "}
                  Upload lab tests reports
                </p>
              </div>
              <div>
                <div className="h-[60px] mx-auto w-[60px] flex items-center justify-center bg-[#F0EFF4] rounded-full">
                  {" "}
                  <CiChat1 size={30} />
                </div>
                <p className="text-[12px] mt-4 text-gray-500 tracking-wide">
                  {" "}
                  Audio/ video call with a doctor
                </p>
              </div>
              <div>
                <div className="h-[60px] mx-auto w-[60px] flex items-center justify-center bg-[#F0EFF4] rounded-full">
                  {" "}
                  <CiShoppingCart size={30} />
                </div>
                <p className="text-[12px] mt-4 text-gray-500 tracking-wide">
                  {" "}
                  Buy Madication from our online store
                </p>
              </div>
            </div>
          </div>
        </WidthWrapper>
      </div>
      <div className="mt-24">
        <WidthWrapper>
          <div className="mt-12">
            <p className="text-3xl font-[500] text-gray-700">
              Common Health Concerns
            </p>

            <Swiper
              breakpoints={{
                340: {
                  slidesPerView: 2,
                  spaceBetween: 15,
                },
                700: {
                  slidesPerView: 5,
                  spaceBetween: 15,
                },
              }}
              freeMode={true}
              pagination={{
                clickable: true,
              }}
              modules={[FreeMode, Pagination]}
              className="w-full mt-6   "
            >
              {healthConcernsData.map((item) => (
                <SwiperSlide key={item.title}>
                  <div className="flex flex-col  group relative shadow-md mb-12  rounded-md  h-[200px] w-[180px]  md:h-[280px] md:w-[250px]  overflow-hidden cursor-pointer">
                    <div className="absolute inset-0 bg-cover bg-center" />
                    <div className="absolute inset-0  group-hover:bg-gray-50" />
                    <div className="relative flex flex-col ">
                      <Image
                        src={item.img}
                        alt=""
                        height={100}
                        width={100}
                        className=" w-full"
                      />
                      <p className="ml-2 mt-4 text-lg text-gray-500">
                        {item.title}{" "}
                      </p>
                      <p className="ml-2  text-sm font-bold text-gray-600">
                        ₹{item.price}{" "}
                      </p>
                      <button className="flex items-center gap-2 ml-2 mt-4 text-[#15bef0]">
                        Book Appoitment <ArrowRight />{" "}
                      </button>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </WidthWrapper>
      </div>
      <div className="mt-12">
        <OnlineConsulting />
      </div>
      <div className="mt-24 w-full">
        <FAQs />
      </div>
    </div>
  );
}
const onlineConsultingData = [
  {
    title: "Consult Top Doctors 24x7",
    desc: "Connect instantly with a 24x7 specialist or choose to video visit a particular doctor.",
  },
  {
    title: "Convenient and Easy",
    desc: "Start an instant consultation within 2 minutes or do video consultation at the scheduled time.",
  },
  {
    title: "100% Safe Consultations",
    desc: "Be assured that your online consultation will be fully private and secured.",
  },
  {
    title: "Similar Clinic Experience",
    desc: "Experience clinic-like consultation through a video call with the doctor. Video consultation is available only on the Practo app.",
  },
  {
    title: "Free Follow-up",
    desc: "Get a valid digital prescription and a 7-day, free follow-up for further clarifications",
  },
];

function OnlineConsulting() {
  return (
    <>
      <WidthWrapper>
        <p className="text-3xl font-[500] text-gray-700">
          Benefits of Online Consultation
        </p>
        <div className="w-[90%] mt-6 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border p-6 ">
          {onlineConsultingData.map((item, idx) => (
            <div className=" mt-4 " key={idx}>
              <p className="font-semibold text-lg text-gray-600 flex gap-2 items-center">
                <Check />

                {item.title}
              </p>
              <p className="text-sm mt-2 text-gray-400 tracking-wide">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </WidthWrapper>
    </>
  );
}

function FAQs() {
  return (
    <>
      <WidthWrapper className="w=[80%] mx-auto">
        <p className="text-3xl font-[500] text-gray-700">FAQs</p>
        <div className="flow-root mt-6">
          <div className="-my-8 divide-y divide-gray-100">
            <details
              className="group py-8 [&_summary::-webkit-details-marker]:hidden"
              open
            >
              <summary className="flex cursor-pointer items-center justify-between text-gray-900">
                <h2 className="text-lg text-gray-500  font-medium">
                  What is online doctor consultation?
                </h2>

                <span className="relative size-5 shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute inset-0 size-5 opacity-100 group-open:opacity-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute inset-0 size-5 opacity-0 group-open:opacity-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
              </summary>

              <p className="mt-4 leading-relaxed text-gray-400">
                Online doctor consultation or online medical consultation is a
                method to connect patients and doctors virtually. It is a
                convenient and easy way to get online doctor advice using doctor
                apps or telemedicine apps or platforms, and the internet.
              </p>
            </details>

            <details className="group py-8 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-gray-900">
                <h2 className="text-lg  text-gray-500 font-medium">
                  Are your online doctors qualified?
                </h2>

                <span className="relative size-5 shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute inset-0 size-5 opacity-100 group-open:opacity-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute inset-0 size-5 opacity-0 group-open:opacity-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
              </summary>

              <p className="mt-4 leading-relaxed text-gray-400">
                We follow a strict verification process for every doctor
                providing online medical services on Practo. Our team manually
                verifies necessary documents, registrations, and certifications
                for every doctor.
              </p>
            </details>

            <details className="group py-8 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-gray-900">
                <h2 className="text-lg  text-gray-500 font-medium">
                  Is online doctor consultation safe and secured on Delma?
                </h2>

                <span className="relative size-5 shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute inset-0 size-5 opacity-100 group-open:opacity-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute inset-0 size-5 opacity-0 group-open:opacity-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
              </summary>

              <p className="mt-4 leading-relaxed text-gray-400">
                The privacy of our patients is critical to us, and thus, we are
                compliant with industry standards like ISO 27001. Rest assured
                that your online consultation with a doctor is completely safe
                and secured with 256-bit encryption.
              </p>
            </details>

            <details className="group py-8 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-gray-900">
                <h2 className="text-lg  text-gray-500 font-medium">
                  What happens if I don’t get a response from a doctor?
                </h2>

                <span className="relative size-5 shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute inset-0 size-5 opacity-100 group-open:opacity-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute inset-0 size-5 opacity-0 group-open:opacity-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
              </summary>

              <p className="mt-4 text-gray-400 leading-relaxed ">
                In the unlikely event that an online doctor does not respond,
                you will be entitled to a 100% refund.
              </p>
            </details>
          </div>
        </div>
      </WidthWrapper>
    </>
  );
}
