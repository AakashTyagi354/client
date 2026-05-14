"use client";

// ─────────────────────────────────────────────────────────────────────────────
// MedicineNavbar — E-Store search bar + cart button
//
// Renders a sticky sub-navbar below the main Navbar with:
//   - Debounced product search (500ms) with dropdown results
//   - Add to cart from search results
//   - View cart button with item count
//
// API:
//   GET /api/v1/product/search?keyword=X&page=0&size=8
//   Response: ApiResponse<Page<ProductResponse>>
//
// Fixes applied:
//   - Search was hitting dead render.com URL — fixed to new microservice endpoint
//   - res.data.data.content instead of res.data
//   - handleCart: productId/category cast to string, quantity fixed to 1
//   - event: any → event: MouseEvent
//   - Removed unused axios import — switched to axiosInstance
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectToken } from "@/redux/userSlice";
import { addToCart, selectCartItems } from "@/redux/cartSlice";
import axiosInstance from "@/app/login/axiosInstance";
import WidthWrapper from "./WidthWrapper";
import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const truncate = (str: string, len: number): string =>
  str?.length > len ? str.substring(0, len) + "…" : str ?? "";

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function MedicineNavbar() {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const cart = useSelector(selectCartItems);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ProductInputProps[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // SEARCH — debounced 500ms
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await axiosInstance.get(
          `http://localhost:8089/api/v1/product/search?keyword=${searchTerm}&page=0&size=8`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSearchResults(res.data.data.content || []);
        setShowResults(true);
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);

  // ─────────────────────────────────────────────────────────────────────────
  // CLICK OUTSIDE
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // ADD TO CART
  // ─────────────────────────────────────────────────────────────────────────

  const handleCart = (item: ProductInputProps) => {
    dispatch(
      addToCart({
        productId: String(item.id),
        quantity: 1,
        description: item.description,
        price: item.price,
        name: item.name,
        category: String(item.categoryId),
        photo: item.imageURL,
      })
    );
  };

  return (
    <div className="sticky top-14 z-10 border-b border-gray-100 bg-white shadow-sm h-14">
      <WidthWrapper className="h-full">
        <div className="flex items-center h-full gap-4 justify-center">

          {/* Search bar */}
          <div ref={containerRef} className="relative w-[500px]">
            <div className="flex items-center gap-2 border border-gray-200
                            rounded-xl px-3 py-2 focus-within:border-[#78355b]
                            transition-colors bg-gray-50 focus-within:bg-white">
              <Search
                size={15}
                className={`flex-shrink-0 transition-colors ${
                  searching ? "text-[#78355b] animate-pulse" : "text-gray-400"
                }`}
              />
              <input
                type="text"
                value={searchTerm}
                placeholder="Search medicines, health products…"
                className="bg-transparent outline-none text-sm w-full
                           placeholder:text-gray-400 text-gray-800"
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors
                             flex-shrink-0 text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>

            {/* Search dropdown */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white
                              border border-gray-100 rounded-2xl shadow-lg
                              max-h-72 overflow-y-auto z-20">
                {searchResults.length === 0 && !searching && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-400">No results found</p>
                  </div>
                )}
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-3
                               border-b border-gray-50 hover:bg-gray-50
                               transition-colors last:border-b-0"
                  >
                    <Link
                      href={`/medicines/${item.id}`}
                      onClick={() => setShowResults(false)}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {truncate(item.name, 35)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          ₹{item.price}
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleCart(item)}
                      className="ml-3 flex-shrink-0 text-xs px-3 py-1.5
                                 border border-[#78355b] text-[#78355b]
                                 rounded-lg hover:bg-[#78355b] hover:text-white
                                 transition-colors font-medium"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart button */}
          <Link href="/medicines/cartpage">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#78355b]
                               text-white text-sm font-medium rounded-xl
                               hover:bg-[#6a2d50] transition-colors relative">
              <ShoppingCart size={16} />
              View Cart
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5
                                 bg-white text-[#78355b] rounded-full text-[10px]
                                 font-bold flex items-center justify-center
                                 border border-[#78355b]">
                  {cart.length > 9 ? "9+" : cart.length}
                </span>
              )}
            </button>
          </Link>

        </div>
      </WidthWrapper>
    </div>
  );
}