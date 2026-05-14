"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Medicines — E-Store Landing Page
//
// Shows category grid + infinite scroll product grid.
//
// Infinite scroll strategy:
//   - Sentinel div at bottom observed via IntersectionObserver
//   - loadingRef guards against multiple simultaneous fetches
//   - pageRef tracks page number — avoids stale closure bug with useState
//
// API:
//   GET /api/v1/product?page=0&size=10
//   Response: ApiResponse<Page<ProductResponse>>
//
// Fixes applied:
//   - res.data.data.content — was res.data.content
//   - loadingRef guard — prevents infinite fetch loop
//   - pageRef instead of pageState — avoids stale closure
//   - Math.random() discount moved to fetch time
//   - handleCart: productId/category cast to string, quantity fixed to 1
//   - Removed artificial delay(1000)
//   - Removed unused imports
//   - Fix: setProducts always called before noMore check
//     (was skipping products when totalPages === 1)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { selectToken } from "@/redux/userSlice";
import { addToCart } from "@/redux/cartSlice";
import axiosInstance from "@/app/login/axiosInstance";
import WidthWrapper from "@/components/WidthWrapper";
import { useInView } from "react-intersection-observer";
import { Loader2, ShoppingCart } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { title: "Diabetes", img: "/images/cat1.webp" },
  { title: "Heart Care", img: "/images/cat2.webp" },
  { title: "Stomach Care", img: "/images/cat3.webp" },
  { title: "Liver Care", img: "/images/cat4.webp" },
  { title: "Kidney Care", img: "/images/cat5.webp" },
  { title: "Derma Care", img: "/images/cat6.webp" },
  { title: "Eye Care", img: "/images/cat7.webp" },
];

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ProductWithDiscount extends ProductInputProps {
  discount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const truncate = (str: string, len: number): string =>
  str?.length > len ? str.substring(0, len) + "…" : str ?? "";

const randomDiscount = (): number =>
  Math.floor(Math.random() * (50 - 10 + 1)) + 10;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function MedicinesPage() {
  const token = useSelector(selectToken);
  const dispatch = useDispatch();

  const [products, setProducts] = useState<ProductWithDiscount[]>([]);
  const [loading, setLoading] = useState(false);
  const [noMore, setNoMore] = useState(false);

  const pageRef = useRef(0);
  const loadingRef = useRef(false);
  const PAGE_SIZE = 10;

  const { ref: sentinelRef, inView } = useInView({ threshold: 0.1 });

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH PRODUCTS
  // Fix: setProducts always called before noMore check
  // Previous bug — when totalPages === 1, products were never added to state
  // ─────────────────────────────────────────────────────────────────────────

  const fetchProducts = async () => {
    if (loadingRef.current || noMore) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await axiosInstance.get(
        `http://localhost:8089/api/v1/product?page=${pageRef.current}&size=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const pageData = res.data.data;
      const newProducts: ProductWithDiscount[] = (pageData.content || []).map(
        (p: ProductInputProps) => ({ ...p, discount: randomDiscount() })
      );

      // Fix: always add fetched products to state first
      setProducts((prev) => [...prev, ...newProducts]);

      // Then determine if there are more pages to load
      if (
        newProducts.length === 0 ||
        pageRef.current >= pageData.totalPages - 1
      ) {
        setNoMore(true);
      } else {
        pageRef.current += 1;
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Trigger next page when sentinel comes into view
  useEffect(() => {
    if (inView && !loadingRef.current && !noMore) {
      fetchProducts();
    }
  }, [inView]);

  // ─────────────────────────────────────────────────────────────────────────
  // ADD TO CART
  // e.preventDefault() stops Link navigation when cart icon is clicked
  // ─────────────────────────────────────────────────────────────────────────

  const handleCart = (e: React.MouseEvent, item: ProductWithDiscount) => {
    e.preventDefault();
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
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Medicines & Health
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Order medicines online and get them delivered fast
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-[#78355b]/5
                          px-4 py-2 rounded-2xl border border-[#78355b]/10">
            <div className="w-2 h-2 rounded-full bg-[#78355b]" />
            <span className="text-sm text-[#78355b] font-medium">
              Free delivery on orders above ₹499
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Categories */}
        <div className="mb-10">
          <p className="text-base font-semibold text-gray-700 mb-4">
            Popular Categories
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.title}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="w-full aspect-square rounded-2xl overflow-hidden
                                border border-gray-100 bg-white shadow-sm
                                group-hover:border-[#78355b] group-hover:shadow-md
                                transition-all duration-200">
                  <Image
                    src={cat.img}
                    height={80}
                    width={80}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105
                               transition-transform duration-200"
                  />
                </div>
                <p className="text-xs text-gray-500 text-center leading-tight
                               font-medium">
                  {cat.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mb-8" />

        {/* Trending Products */}
        <div>
          <p className="text-base font-semibold text-gray-700 mb-5">
            Trending Products
          </p>

          {/* Empty state — only show when not loading and truly empty */}
          {products.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20
                            bg-white rounded-2xl border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center
                              justify-center mb-3">
                <ShoppingCart size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                No products available
              </p>
              <p className="text-xs text-gray-400 mt-1">Check back soon</p>
            </div>
          )}

          {/* Product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                          lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <Link href={`/medicines/${product.id}`} key={product.id}>
                <div className="bg-white rounded-2xl border border-gray-100
                                shadow-sm hover:shadow-md hover:-translate-y-0.5
                                transition-all duration-200 overflow-hidden">

                  {/* Image */}
                  <div className="relative h-36 bg-gray-50">
                    {product.imageURL ? (
                      <Image
                        src={product.imageURL}
                        alt={product.name}
                        fill
                        className="object-contain p-3"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center
                                      justify-center">
                        <ShoppingCart size={18} className="text-gray-300" />
                      </div>
                    )}
                    {/* Discount badge */}
                    <span className="absolute top-2 right-2 text-[10px]
                                     font-semibold bg-green-50 text-green-600
                                     px-2 py-0.5 rounded-full border
                                     border-green-100">
                      {product.discount}% off
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-800
                                   leading-tight">
                      {truncate(product.name, 30)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {truncate(product.description, 50)}
                    </p>

                    {/* MRP strikethrough */}
                    <p className="text-xs text-gray-400 line-through mt-2">
                      ₹{Math.round(
                        product.price * (100 / (100 - product.discount))
                      )}
                    </p>

                    {/* Price + cart */}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-bold text-gray-800">
                        ₹{product.price}
                      </p>
                      <button
                        onClick={(e) => handleCart(e, product)}
                        className="p-1.5 rounded-xl hover:bg-[#78355b]/10
                                   text-gray-500 hover:text-[#78355b]
                                   transition-colors"
                      >
                        <ShoppingCart size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Sentinel — triggers next page fetch when scrolled into view */}
          <div ref={sentinelRef} className="w-full py-8 flex justify-center">
            {loading && (
              <Loader2 size={28} className="animate-spin text-[#78355b]" />
            )}
            {noMore && products.length > 0 && (
              <p className="text-sm text-gray-400">
                You've seen all products
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}