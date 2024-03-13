"use client";

import WidthWrapper from "@/components/WidthWrapper";
import homeImg from "../../public/images/img2.svg";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, FlaskConical, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect, useState } from "react";
import axios from "axios";
import img3 from "../../public/images/img3.jpeg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import { useSelector } from "react-redux";
import { selectToken, selectUser } from "@/redux/userSlice";
import { CiLocationOn } from "react-icons/ci";
import { IoLanguageOutline } from "react-icons/io5";
import { PiFlaskThin } from "react-icons/pi";
import { PiMoneyThin } from "react-icons/pi";
import helpImg from "../../public/images/helpimg.png";
import "react-toastify/dist/ReactToastify.css";

interface DoctorsProps {
  _id: string;
  firstName: string;
  address: string;
  specialization: string;
  languages: Array<string>;
  feesPerCunsaltation: number;
  experience: number;
}
const question = [
  {
    title:
      "Who is an orthopedist? What is the difference between an orthopedist and an orthopedic surgeon?",
    desc: "An orthopedist is a doctor who specializes in the treatment of functional or congenital abnormalities of the musculoskeletal system. Treatment methods include surgery, medicines, physical therapy, bracing, and exercise. Originally, orthopedists focused on treating children with polio and other developmental defects, but now they address a wide range of musculoskeletal conditions in individuals of all ages An orthopedist is a doctor who specializes in the treatment of functional or congenital abnormalities of the musculoskeletal system. Treatment methods include surgery, medicines, physical therapy, bracing, and exercise. Originally, orthopedists focused on treating children with polio and other developmental defects, but now they address a wide range of musculoskeletal conditions in individuals of all ages.",
    show: false,
  },
  {
    title:
      "Who is an orthopedist? What is the difference between an orthopedist and an orthopedic surgeon?",
    desc: "An orthopedist is a doctor who specializes in the treatment of functional or congenital abnormalities of the musculoskeletal system. Treatment methods include surgery, medicines, physical therapy, bracing, and exercise. Originally, orthopedists focused on treating children with polio and other developmental defects, but now they address a wide range of musculoskeletal conditions in individuals of all ages An orthopedist is a doctor who specializes in the treatment of functional or congenital abnormalities of the musculoskeletal system. Treatment methods include surgery, medicines, physical therapy, bracing, and exercise. Originally, orthopedists focused on treating children with polio and other developmental defects, but now they address a wide range of musculoskeletal conditions in individuals of all ages.",
    show: false,
  },
  {
    title:
      "Who is an orthopedist? What is the difference between an orthopedist and an orthopedic surgeon?",
    desc: "An orthopedist is a doctor who specializes in the treatment of functional or congenital abnormalities of the musculoskeletal system. Treatment methods include surgery, medicines, physical therapy, bracing, and exercise. Originally, orthopedists focused on treating children with polio and other developmental defects, but now they address a wide range of musculoskeletal conditions in individuals of all ages An orthopedist is a doctor who specializes in the treatment of functional or congenital abnormalities of the musculoskeletal system. Treatment methods include surgery, medicines, physical therapy, bracing, and exercise. Originally, orthopedists focused on treating children with polio and other developmental defects, but now they address a wide range of musculoskeletal conditions in individuals of all ages.",
    show: false,
  },
];

export default function Page() {
  const [fnq, setFnq] = useState(question);

  const handleFNQ = (idx: number) => {
    const updatedFnqs = [...fnq];
    // Toggle the 'show' property of the question at the specified index
    updatedFnqs[idx].show = !updatedFnqs[idx].show;
    // Update the state with the modified array
    setFnq(updatedFnqs);
  };

  const token = useSelector(selectToken);
  const currentUser = useSelector(selectUser);

  const [docs, setDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(new Date()); // State for date
  const [selectedTime, setSelectedTime] = useState("12:00");
  const onChange = (time: any) => {
    setSelectedTime(time);
  };
  console.log(docs);

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:7003/api/v1/user/get-doctors"
        );

        setDocs(response.data.doctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors(); // Call the fetchDoctors function
  }, []);
  const handleAvailabilityCheck = async (
    date: Date | null,
    time: string,
    doctorId: string,
    doctorInfo: string
  ) => {
    try {
      // Convert date to ISO string format
      const isoDate = date ? date.toISOString() : null;

      const res = await axios.post(
        "http://localhost:7003/api/v1/user/booking-availbility",
        {
          userId: currentUser?.id,
          doctorId: doctorId,
          doctorInfo,
          userInfo: currentUser?.name,
          date: isoDate,
          time,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const str = res.data.message;
      console.log(str);
      // toast({
      //   title: "Uh oh! Something went wrong.",
      //   description: str,
      //   action: <ToastAction altText="Try again">Book Now</ToastAction>,
      // });
      alert(str);

      console.log("RESPONSE OF CHECK FUNCTION", res);
    } catch (err) {
      console.log("ERROR IN availability CHECK", err);
    }
  };

  const handleBookAppointment = async (
    date: Date | null,
    time: string,
    doctorId: string,
    doctorInfo: string
  ) => {
    const temp = {
      date: date,
      time: time,
      doctorId,
      doctorInfo,
      userInfo: currentUser?.name,
      userId: currentUser?.id,
      token,
    };
    console.log(temp);

    try {
      // Convert date to ISO string format
      const isoDate = date ? date.toISOString() : null;

      const res = await axios.post(
        "http://localhost:7003/api/v1/user/book-appointment",
        {
          userId: currentUser?.id,
          doctorId: doctorId,
          doctorInfo,
          userInfo: currentUser?.name,
          date: isoDate,
          time,
          status: "pending",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(res.data.message);
      console.log("RESPONSE OF booking appoitment FUNCTION", res);
    } catch (err) {
      console.log("ERROR IN booking appointment CHECK", err);
    }
  };

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(6);
  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  const currentPosts = docs.slice(firstPostIndex, lastPostIndex);

  return (
    <div>
      <WidthWrapper>
        <div className="w-full h-[400px] bg-[#387693] relative">
          <Image
            src={homeImg}
            layout="fill"
            objectFit="cover"
            objectPosition="center"
            alt=""
          />
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
            {/* Place your items here */}
            <h1 className="text-white text-4xl font-bold">
              Dedicated to Your Wellbeing, Every Step of the Way.
            </h1>
            <div className="flex w-full items-center justify-center mt-4">
              <Input
                placeholder="Search by: Doctors, Specialist, Symptoms, Diseases, Treatment"
                className="w-[40%] outline-none focus:outline-none mt-4"
              />
              <Button variant={"default"} className=" h-10 mt-4 w-[100px]">
                Search
              </Button>
            </div>
          </div>
        </div>
      </WidthWrapper>
      <WidthWrapper className="">
        <div className="bg-gray-50 w-full flex">
          <div className="flex-grow">
            <div className="flex justify-center items-center mt-12">
              <Filter />
              <p className="text-xs font-semibold text-gray-600 ml-2">FILTER</p>
              <div className="flex w-[60%] ml-4 gap-2">
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="specializations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">female</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              {isLoading ? (
                <Loader2 className="animate-spin mx-auto " size={24} />
              ) : (
                <>
                  <div className="flex mt-10 ml-12 mb-6">
                    <p className="font-semibold">
                      Search Results ({docs.length > 0 ? docs.length : 0}){" "}
                    </p>
                  </div>
                  <div className=" flex flex-col items-center  ">
                    {currentPosts.map((ele: DoctorsProps, idx) => (
                      <div
                        key={idx}
                        className="w-[500px] h-[260px]  shadow-sm mt-4 flex "
                      >
                        <div className="bg-[#F1F6F7] h-full w-[25%] flex justify-center items-center">
                          <Image
                            src={img3}
                            alt=""
                            height={100}
                            width={100}
                            className="rounded-full shadow-sm"
                          />
                        </div>
                        <div className="w-[40%] flex flex-col ">
                          <p className="font-semibold ml-4  mt-4">
                            {" "}
                            Dr.{ele.firstName}
                          </p>
                          <div className="flex gap-4  border-b border-gray-200 w-[85%] mx-auto">
                            <p className="text-[#007291] text-sm  mb-4">
                              {ele.specialization}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mt-4 ml-2 ">
                              <CiLocationOn />
                              <p className="text-gray-600 text-sm">
                                {ele.address}
                              </p>
                            </div>
                            <p className="flex items-center gap-2 mt-4 ml-2">
                              <IoLanguageOutline />
                              {ele.languages.map((e, i) => (
                                <p className="text-gray-600 text-sm" key={i}>
                                  {e}
                                </p>
                              ))}
                            </p>
                            <div className="flex items-center gap-2 mt-4 ml-2">
                              <PiFlaskThin />
                              <p className="text-gray-600 text-sm">
                                {ele.experience} years experience
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-4 ml-2">
                              <PiMoneyThin />
                              <p className="text-gray-600 text-sm">
                                ₹ {ele.feesPerCunsaltation} per session
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="w-[35%]  ">
                          <div className="flex flex-col items-center justify-center h-[50%]">
                            <DatePicker
                              className="w-[70%] ml-6"
                              selected={startDate}
                              onChange={(date) => setStartDate(date)}
                            />

                            <TimePicker
                              className="mt-4"
                              onChange={onChange}
                              value={selectedTime}
                              clearIcon={null} // Hide clear icon
                              disableClock={true} // Disable clock
                            />
                          </div>
                          <Button
                            className="w-[80%] mx-auto ml-2 text-[12px] "
                            variant={"outline"}
                            onClick={() =>
                              handleAvailabilityCheck(
                                startDate,
                                selectedTime,
                                ele._id,
                                ele.firstName
                              )
                            }
                          >
                            check availability
                          </Button>
                          <Button
                            className="w-[80%] mt-2 text-[12px] ml-2 bg-[#185B71]"
                            onClick={() =>
                              handleBookAppointment(
                                startDate,
                                selectedTime,
                                ele._id,
                                ele.firstName
                              )
                            }
                            variant={"default"}
                          >
                            Book Appointment
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-12 mb-12">
                    <PaginationSection
                      totalPosts={docs.length}
                      postsPerPage={postsPerPage}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="w-[500px]">
            <div className="w-[300px]  border border-gray-300 mt-12  ">
              <div className="mt-12">
                <Image
                  src={helpImg}
                  alt=""
                  width={230}
                  height={300}
                  className="mx-auto"
                />

                <div className="bg-[#F1F6F7] w-[90%] mx-auto rounded-sm max-h-[400px] overflow-scroll mt-6">
                  <p className=" font-semibold text-gray-600 text-center mt-6">
                    About Delma Application
                  </p>
                  <p className="text-sm tracking-wider text-gray-500 p-6 ">
                    The renowned team are recognized stalwarts of their fields
                    and have many years of experience amongst them. The team
                    specializes in a multitude of disciplines dealing with
                    injuries, congenital or acquired disorders, overuse
                    conditions of the bones and joints, and conditions
                    associated with soft tissues, which include the ligaments,
                    nerves, and muscles. The surgical team at Apollo Hospitals
                    delivers the best treatments made possible with the team of
                    physical therapists, sports medicine therapists, pediatric
                    orthopedic surgeons, arthroscopy surgeons, spine surgeons,
                    knee specialists, hip-replacement specialists, patient
                    counselors, and nurses. When you visit Apollo Hospitals for
                    any orthopedic concern, you will be greeted by a
                    professional team backed by the latest in modern medical
                    techniques and technology. The team will work with you every
                    step of your treatment and recovery journey.
                  </p>
                </div>
              </div>
              <div>
                <p className="font-bold mt-6 text-gray-500 text-center">
                  Frequently Asked Questions
                </p>
                <div className="w-[80%] mx-auto mt-6 flex flex-col gap-4 mb-12">
                  {question.map((ele, idx) => (
                    <div className="flex flex-col " key={idx}>
                      <div className="flex">
                        <p className="text-[#007291] text-[14px] mt-2">
                          {ele.title}
                        </p>
                        <div
                          onClick={() => handleFNQ(idx)}
                          className="cursor-pointer"
                        >
                          -
                        </div>
                      </div>
                      {ele.show && (
                        <p className="text-gray-400 text-[12px]">{ele.desc}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </WidthWrapper>
    </div>
  );
}

function PaginationSection({
  totalPosts,
  postsPerPage,
  currentPage,
  setCurrentPage,
}: {
  totalPosts: any;
  postsPerPage: any;
  currentPage: any;
  setCurrentPage: any;
}) {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  const maxPageNum = 5; // Maximum page numbers to display at once
  const pageNumLimit = Math.floor(maxPageNum / 2); // Current page should be in the middle if possible

  let activePages = pageNumbers.slice(
    Math.max(0, currentPage - 1 - pageNumLimit),
    Math.min(currentPage - 1 + pageNumLimit + 1, pageNumbers.length)
  );

  const handleNextPage = () => {
    if (currentPage < pageNumbers.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Function to render page numbers with ellipsis
  const renderPages = () => {
    const renderedPages = activePages.map((page, idx) => (
      <PaginationItem
        key={idx}
        className={currentPage === page ? "bg-neutral-100 rounded-md" : ""}
      >
        <PaginationLink onClick={() => setCurrentPage(page)}>
          {page}
        </PaginationLink>
      </PaginationItem>
    ));

    // Add ellipsis at the start if necessary
    if (activePages[0] > 1) {
      renderedPages.unshift(
        <PaginationEllipsis
          key="ellipsis-start"
          onClick={() => setCurrentPage(activePages[0] - 1)}
        />
      );
    }

    // Add ellipsis at the end if necessary
    if (activePages[activePages.length - 1] < pageNumbers.length) {
      renderedPages.push(
        <PaginationEllipsis
          key="ellipsis-end"
          onClick={() =>
            setCurrentPage(activePages[activePages.length - 1] + 1)
          }
        />
      );
    }

    return renderedPages;
  };

  return (
    <div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={handlePrevPage} />
          </PaginationItem>

          {renderPages()}

          <PaginationItem>
            <PaginationNext onClick={handleNextPage} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
