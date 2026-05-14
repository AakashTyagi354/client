"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Medicines — Product Listing Page
//
// Displays all products in a paginated grid with add-to-cart functionality.
//
// API:
//   GET /api/v1/product?page=0&size=10  → Page<ProductResponse> wrapped in ApiResponse
//   Response shape: { success, data: { content: [...], totalPages, totalElements } }
//
// Fixes applied:
//   - res.data.data.content — was res.data.content (missing ApiResponse wrapper)
//   - Removed Content-Type: multipart/form-data from GET request header
//   - Math.random() discount moved to fetch time — was recalculating on every render
//   - Removed unused textFormater function
//   - Removed unused axios import (was importing both axios and axiosInstance)
//   - key={ele.id} instead of key={idx}
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { selectToken } from "@/redux/userSlice";
import { addToCart } from "@/redux/cartSlice";
import axiosInstance from "@/app/login/axiosInstance";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

// Extended locally to include stable discount — calculated once at fetch time
// so it doesn't change on every re-render
interface ProductWithDiscount extends ProductInputProps {
  discount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Truncate description to keep cards uniform height
const truncate = (str: string, len: number): string =>
  str?.length > len ? str.substring(0, len) + "…" : str ?? "";

// Calculate stable random discount — called once per product at fetch time
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
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 10;

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH PRODUCTS
  // Fix: res.data.data.content — ApiResponse wraps Page, Page has .content
  // Fix: removed Content-Type: multipart/form-data from GET request
  // Fix: discount calculated here once — not inside JSX on every render
  // ─────────────────────────────────────────────────────────────────────────

  const fetchProducts = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `http://localhost:8089/api/v1/product?page=${pageNum}&size=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const pageData = res.data.data;

      // Attach stable discount to each product at fetch time
      const withDiscounts: ProductWithDiscount[] = (pageData.content || []).map(
        (p: ProductInputProps) => ({ ...p, discount: randomDiscount() })
      );

      setProducts(withDiscounts);
      setTotalPages(pageData.totalPages ?? 0);
      setTotalElements(pageData.totalElements ?? 0);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  // ─────────────────────────────────────────────────────────────────────────
  // ADD TO CART
  // Stops link navigation when cart button is clicked
  // ─────────────────────────────────────────────────────────────────────────

  const handleCart = (e: React.MouseEvent, product: ProductWithDiscount) => {
    e.preventDefault(); // prevent Link navigation when clicking cart icon
    dispatch(
      addToCart({
        productId: String(product.id),
        quantity: 1,
        description: product.description,
        price: product.price,
        name: product.name,
        category: String(product.categoryId),
        photo: product.imageURL,
      })
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Page header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Medicines</h1>
          <p className="text-sm text-gray-400 mt-1">
            {totalElements > 0
              ? `${totalElements} products available`
              : "Browse our medical store"}
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#78355b] border-t-transparent
                            rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">No products found</p>
          </div>
        )}

        {/* Product grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
                          lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {products.map((product) => (
              <Link
                href={`/medicines/${product.id}`}
                key={product.id}  // Fix: key uses product.id not array index
              >
                <div className="bg-white rounded-2xl border border-gray-100
                                shadow-sm hover:shadow-md hover:-translate-y-0.5
                                transition-all duration-200 overflow-hidden">

                  {/* Product image */}
                  <div className="relative h-44 bg-gray-50 flex items-center
                                  justify-center p-4">
                    {product.imageURL ? (
                      <Image
                        src={product.imageURL}
                        alt={product.name}
                        fill
                        className="object-contain p-4"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100
                                      flex items-center justify-center">
                        <ShoppingCart size={24} className="text-gray-300" />
                      </div>
                    )}

                    {/* Discount badge */}
                    <span className="absolute top-2 right-2 text-[10px] font-semibold
                                     bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                      {product.discount}% off
                    </span>
                  </div>

                  {/* Product info */}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {truncate(product.description, 55)}
                    </p>

                    {/* Pricing row */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <p className="text-xs text-gray-400 line-through">
                        ₹{Math.round(product.price * (100 / (100 - product.discount)))}
                      </p>
                    </div>

                    {/* Price + cart button */}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-bold text-gray-800">
                        ₹{product.price}
                      </p>
                      <button
                        onClick={(e) => handleCart(e, product)}
                        className="p-2 rounded-xl hover:bg-[#78355b]/10
                                   text-gray-500 hover:text-[#78355b]
                                   transition-colors"
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-4 py-2 text-sm border
                         border-gray-200 rounded-xl bg-white text-gray-600
                         hover:border-[#78355b] hover:text-[#78355b]
                         transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} /> Prev
            </button>

            <span className="text-sm text-gray-500">
              Page {page + 1} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="flex items-center gap-1 px-4 py-2 text-sm border
                         border-gray-200 rounded-xl bg-white text-gray-600
                         hover:border-[#78355b] hover:text-[#78355b]
                         transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}