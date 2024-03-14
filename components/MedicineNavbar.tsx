"use client";

import { CiSearch } from "react-icons/ci";
import WidthWrapper from "./WidthWrapper";
import { Button } from "./ui/button";
import { MdOutlineAddShoppingCart, MdShoppingCart } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, selectCartItems } from "@/redux/cartSlice";
import Link from "next/link";
import { MouseEventHandler, useState, useEffect, useRef } from "react";
import axios from "axios";
import { textFormater } from "@/app/medicines/page";

export default function MedicineNavbar() {
  const dispatch = useDispatch();
  const cart = useSelector(selectCartItems);
  const [view, setView] = useState(false); // State to control the visibility of suggestions
  const [searchTerm, setSearchTerm] = useState(""); // State to hold the search term
  const [searchResults, setSearchResults] = useState([]); // State to hold the search results

  const searchTimeoutRef = useRef(null); // Ref to store the timeout for debouncing

  // Function to handle input box click
  const handleInputClick = () => {
    setView(true); // Show suggestions when input box is clicked
  };

  // Function to handle input change with debouncing
  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    setSearchTerm(inputValue.trim());
  };

  // Function to fetch search results
  useEffect(() => {
    // Clear the previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout to debounce the search term
    searchTimeoutRef.current = setTimeout(() => {
      if (searchTerm.trim() !== "") {
        try {
          const fetchSearchResults = async () => {
            const response = await axios.get(
              `http://localhost:7003/api/v1/product/search/${searchTerm}`
            );
            setSearchResults(response.data);
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
  }, [searchTerm]);

  // Function to handle clicking outside the search box to close the suggestions
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

  const handleCart: MouseEventHandler<HTMLButtonElement> = (item: any) => {
    dispatch(
      addToCart({
        productId: item._id,
        quantity: item.quantity,
        description: item.description,
        price: item.price,
        name: item.name,
        category: item.category,
        photo: item.photo,
      })
    );
  };

  return (
    <div className="sticky top-14 z-10 border-b border-gray-100 bg-white shadow-sm h-16">
      <WidthWrapper className="h-full">
        <div className="flex items-center h-full justify-evenly ">
          <div className="border p-2 flex gap-2 w-[50%] relative search-container">
            <CiSearch size={20} className="cursor-pointer" />
            <input
              type="text"
              placeholder="Search for medicines, health products and much more"
              className="bg-inherit outline-none focus:outline-none w-full text-sm"
              onClick={handleInputClick} // Toggle suggestions on input click
              onChange={handleInputChange} // Debounced input change handler
            />
            {view && (
              <div className="w-full flex flex-col gap-4 max-h-[300px] py-4  overflow-y-scroll bg-gray-50 absolute top-[37px] left-0">
                {searchResults.map((ele, idx) => (
                  <div
                    key={idx}
                    className="w-[90%] h-[50px] mx-auto  flex items-center justify-between border-b border-gray-200 py-4 cursor-pointer  hover:bg-gray-100 "
                  >
                    <p className="text-sm text-gray-500 tracking-wide">
                      {" "}
                      {textFormater(ele.name, 30)}
                    </p>
                    <button
                      onClick={() => handleCart(ele)}
                      className="px-4 py-1 text-sm text-gray-500 border border-[#15BEF0] transition-all hover:bg-[#15BEF0] hover:text-white"
                    >
                      Add
                    </button>
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

          <div className="">
            <Link href={"/medicines/cartpage"}>
              <Button className="bg-[#15BEF0] transition-all rounded-none flex gap-4 relative">
                <MdShoppingCart size={20} />
                <div className="rounded-full h-5 w-5 bg-white absolute top-[2px] left-[25px] text-gray-700">
                  {cart.length}
                </div>
                View Cart
              </Button>
            </Link>
          </div>
        </div>
      </WidthWrapper>
    </div>
  );
}