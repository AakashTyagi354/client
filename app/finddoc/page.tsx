"use client";
import { MdDateRange } from "react-icons/md";
import { TimePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import WidthWrapper from "@/components/WidthWrapper";
import { DatePicker } from "antd";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import img3 from "../../public/images/img3.jpeg";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import TimePicker from "react-time-picker";
// import "react-time-picker/dist/TimePicker.css";
import { useSelector } from "react-redux";
import { selectToken, selectUser } from "@/redux/userSlice";
import { CiLocationOn, CiSearch } from "react-icons/ci";
import { IoLanguageOutline } from "react-icons/io5";
import { PiFlaskThin } from "react-icons/pi";
import { PiMoneyThin } from "react-icons/pi";
import helpImg from "../../public/images/helpimg.png";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

const specializationData = [
  "Orthopedics",
  "Internal Medicine",
  "Obstetrics and Gynecology",
  "Dermatology",
  "Pediatrics",
  "Radiology",
  "General Surgery",
  "Ophthalmology",
];
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
  const { toast } = useToast();

  const [docs, setDocs] = useState<DoctorInputProps[]>([]);
  // const docs = useMemo(() => docs, [docs]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(new Date()); // State for date
  const [selectedTime, setSelectedTime] = useState("12:00");
  const onChange = (time: any) => {
    setSelectedTime(time);
  };

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
      const isDate = date ? date.toISOString() : null;
      console.log("date", isDate);
      console.log("time", time);
      const res = await axios.post(
        "http://localhost:7003/api/v1/user/booking-availbility",
        {
          userId: currentUser?.id,
          doctorId: doctorId,
          doctorInfo,
          userInfo: currentUser?.name,
          date: isDate,
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
      if (res.data.success === false) {
        toast({
          variant: "destructive",
          title: "Status of your availability check",
          description: str,
        });
      } else {
        toast({
          title: "Status of your availability check",
          description: str,
        });
      }

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
    try {
      // Convert date to ISO string format
      const isDate = date ? date.toISOString() : null;

      const res = await axios.post(
        "http://localhost:7003/api/v1/user/book-appointment",
        {
          userId: currentUser?.id,
          doctorId: doctorId,
          doctorInfo,
          userInfo: currentUser?.name,
          date: isDate,
          time,
          status: "pending",
          roomId: generateUniqueString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const str = res.data.message;

      if (res.data.success === false) {
        toast({
          variant: "destructive",
          title: str,
        });
      } else {
        toast({
          title: str,
        });
      }

      // alert(res.data.message);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]); // State to hold the search results

  // for search and debouncing queries
  const [view, setView] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Function to handle input box click
  const handleInputClick = () => {
    setView(true); // Show suggestions when input box is clicked
  };

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = event.target.value;
    setSearchQuery(inputValue.trim());
  };

  // Function to fetch search results
  useEffect(() => {
    // Clear the previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout to debounce the search term
    searchTimeoutRef.current = setTimeout(() => {
      console.log(searchQuery);
      if (searchQuery.trim() !== "") {
        try {
          const fetchSearchResults = async () => {
            const response = await axios.get(
              `http://localhost:7003/api/v1/doctor/search-doctors/${searchQuery}`
            );
            setSearchResults(response.data.data);
            console.log("first", response.data.data);
          };
          fetchSearchResults();
        } catch (error) {
          console.error("Error fetching search results:", error);
        }
      } else {
        setSearchResults([]); // Clear search results when search term is empty
      }
    }, 500); // Adjust the debounce delay as needed

    // Cleanup function to clear timeout when search term changes
    return () => {
      clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (view && !event.target.closest(".search-container")) {
        setView(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [view]);
  const dateFormat = "DD-MM-YYYY";
  const timeFormat = "HH:mm";

  // State variables to hold the selected filter options
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedSortBy, setSelectedSortBy] = useState("");

  // Function to handle filtering based on selected options
  const handleFilter = () => {
    setIsLoading(true);
    // Implement your filtering logic here based on the selected options
    let filteredDocs = docs;

    // Filter by specialization
    if (selectedSpecialization !== "") {
      filteredDocs = filteredDocs.filter(
        (doc) => doc.specialization === selectedSpecialization
      );
    }

    // Filter by gender
    if (selectedGender !== "") {
      filteredDocs = filteredDocs.filter(
        (doc) => doc.gender === selectedGender
      );
    }

    // Sort by experience
    if (selectedSortBy === "experience-low-high") {
      filteredDocs.sort((a, b) => a.experience - b.experience);
    } else if (selectedSortBy === "experience-high-low") {
      filteredDocs.sort((a, b) => b.experience - a.experience);
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    setDocs(filteredDocs);
  };

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
            <h1 className="text-white text-xl md:text-4xl font-bold text-center ">
              Dedicated to Your Wellbeing, Every Step of the Way.
            </h1>
            <div className="flex w-full items-center justify-center mt-4">
              <div className="border p-2 flex gap-2 w-[50%] relative search-container">
                <CiSearch size={20} className="cursor-pointer text-white" />
                <input
                  type="text"
                  placeholder="Search for medicines, health products and much more"
                  className="bg-inherit outline-none focus:outline-none w-full text-sm text-white"
                  onClick={handleInputClick} // Toggle suggestions on input click
                  onChange={handleSearchInputChange} // Debounced input change handler
                />
                {view && (
                  <div className="w-full z-40 flex flex-col  max-h-[300px] py-4  overflow-y-scroll bg-white opacity-95 absolute top-[37px] left-0">
                    {searchResults.map((ele: DoctorInputProps, idx) => (
                      <div
                        key={idx}
                        className="hover:bg-gray-100 py-3  cursor-pointer flex items-center gap-8"
                      >
                        <p className="text-gray-600 text-sm font-semibold ml-4">
                          Dr.{ele.firstName} {ele.lastName}
                        </p>

                        <div>
                          <DatePicker
                            defaultValue={dayjs(getTodaysDate(), dateFormat)}
                            minDate={dayjs(getTodaysDate(), dateFormat)}
                            maxDate={dayjs("2030-10-31", dateFormat)}
                            onChange={(date) => setStartDate(date)}
                            className="w-full"
                            format={dateFormat}
                          />

                          <TimePicker
                            defaultValue={dayjs(getCurrentTime(), timeFormat)}
                            format={timeFormat}
                            className="w-full"
                            onChange={onChange}
                            value={dayjs(selectedTime, timeFormat)}
                          />
                        </div>
                        <div>
                          <Button
                            className="w-full mx-auto  text-[12px] "
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
                            onClick={() =>
                              handleBookAppointment(
                                startDate,
                                selectedTime,
                                ele._id,
                                ele.firstName
                              )
                            }
                            className="w-full"
                          >
                            {" "}
                            Book{" "}
                          </Button>
                        </div>
                      </div>
                    ))}

                    {searchResults.length === 0 && (
                      <p className="w-full text-center text-sm text-gray-500">
                        No results found
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </WidthWrapper>
      <WidthWrapper className="">
        <div className="bg-gray-50 w-full flex">
          <div className="flex-grow">
            <div className="flex w-[300px] gap-4 overflow-hidden md:w-full  justify-center items-center mt-12">
              <Filter />
              <p className="text-xs font-semibold text-gray-600 ml-2">FILTER</p>
              <div className="flex flex-col md:flex-row md:w-[60%] md:ml-4 gap-2">
                <select
                  className="w-[130px]  focus:outline-none outline-none text-sm text-gray-600 rounded-md"
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                >
                  <option value="" disabled selected hidden>
                    Specializations
                  </option>
                  {specializationData.map((item, idx) => (
                    <option key={idx} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                {/* Gender Select */}
                <select
                  className="w-[100px] rounded-md  focus:outline-none outline-none  text-sm text-gray-600"
                  onChange={(e) => setSelectedGender(e.target.value)}
                >
                  <option value="" disabled selected hidden>
                    Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>

                {/* Sort By Select */}
                <select
                  className="w-[160px] focus:outline-none outline-none  text-sm text-gray-600"
                  onChange={(e) => setSelectedSortBy(e.target.value)}
                >
                  <option value="" disabled selected hidden>
                    Sort by
                  </option>
                  <option value="experience-low-high">
                    Experience low - high
                  </option>
                  <option value="experience-high-low">
                    Experience high - low
                  </option>
                </select>
                <Button onClick={handleFilter}>Apply Filter</Button>
              </div>
            </div>
            <div className="">
              {isLoading ? (
                <Loader2 className="animate-spin mx-auto " size={24} />
              ) : (
                <>
                  <div className="flex mt-10 md:ml-12 mb-6">
                    <p className="font-semibold">
                      Search Results ({docs.length > 0 ? docs.length : 0}){" "}
                    </p>
                  </div>
                  <div className="flex flex-col  items-center  ">
                    {currentPosts.length == 0 && (
                      <p className="text-sm my-12 text-gray-500">
                        No Results Found
                      </p>
                    )}
                    {currentPosts.map((ele: DoctorInputProps, idx) => (
                      <div
                        key={idx}
                        className=" w-[380px]  h-[260] md:w-[500px] mx-auto  md:h-[260px]  shadow-sm mt-4 flex "
                      >
                        <div className="bg-[#F1F6F7] h-full hidden md:w-[25%] md:flex justify-center items-center">
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
                            <p className="text-[#007291] text-sm  mb-4">
                              {ele.gender}
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
                          <div className="flex flex-col items-center  justify-center h-[50%]">
                            <DatePicker
                              defaultValue={dayjs(getTodaysDate(), dateFormat)}
                              minDate={dayjs(getTodaysDate(), dateFormat)}
                              maxDate={dayjs("2030-10-31", dateFormat)}
                              onChange={(date) => setStartDate(date)}
                              className="w-full"
                              format={dateFormat}
                            />

                            <TimePicker
                              defaultValue={dayjs(getCurrentTime(), timeFormat)}
                              format={timeFormat}
                              className="w-full"
                              onChange={onChange}
                              value={dayjs(selectedTime, timeFormat)}
                            />
                          </div>
                          <Button
                            className="w-full mx-auto  text-[12px] "
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

                          <AlertDialog>
                            <AlertDialogTrigger className="w-full">
                              <Button className="w-full mx-auto    text-[12px]  bg-[#185B71]">
                                Book Appoitment
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure you want to book the appoitment?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete your account and remove
                                  your data from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction>
                                  <Button
                                    onClick={() =>
                                      handleBookAppointment(
                                        startDate,
                                        selectedTime,
                                        ele._id,
                                        ele.firstName
                                      )
                                    }
                                    className="w-full"
                                  >
                                    {" "}
                                    Book{" "}
                                  </Button>
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
          <div className="w-[500px]  hidden lg:block">
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

function generateUniqueString() {
  const timestamp = Date.now().toString(36); // Convert current timestamp to base 36 string
  const randomString = Math.random().toString(36).substring(2, 8); // Generate random string and take a substring
  return `${timestamp}-${randomString}`;
}

function getTodaysDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

function getCurrentTime() {
  const currentDate = new Date();
  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const formattedTime = `${hours}:${minutes}`;
  return formattedTime;
}
