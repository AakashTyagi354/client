"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Single Product Page — /medicines/[singleproduct]
//
// Shows product details + similar products by category.
//
// API:
//   GET /api/v1/product/get-single-product/{id}  → single product
//   GET /api/v1/product/search?keyword={cat}&page=0&size=4 → similar products
//
// Fixes applied:
//   - res.data.data instead of res.data
//   - Removed Content-Type: multipart/form-data from GET request
//   - price: 0 (number) instead of price: "" (string)
//   - getSimilarProducts runs in separate useEffect after product loads
//   - Dead render.com URL removed
//   - Added auth headers to all requests
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { selectToken } from "@/redux/userSlice";
import { addToCart } from "@/redux/cartSlice";
import axiosInstance from "@/app/login/axiosInstance";
import Link from "next/link";
import {
  ShoppingCart,
  ArrowLeft,
  Tag,
  Package,
  ChevronRight,
  Truck,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const truncate = (str: string, len: number): string =>
  str?.length > len ? str.substring(0, len) + "…" : str ?? "";

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function SingleProductPage() {
  const token = useSelector(selectToken);
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();

  const [product, setProduct] = useState<ProductInputProps>({
    id: 0,
    name: "",
    description: "",
    price: 0,
    categoryId: 0,
    imageURL: "",
  });

  const [similarProducts, setSimilarProducts] = useState<ProductInputProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const headers = { Authorization: `Bearer ${token}` };

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH SINGLE PRODUCT
  // ─────────────────────────────────────────────────────────────────────────

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `http://localhost:8089/api/v1/product/get-single-product/${params.singleproduct}`,
        { headers }
      );
      setProduct(res.data.data);
    } catch (err) {
      console.error("Failed to fetch product:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH SIMILAR PRODUCTS
  // Runs only after product.categoryId is populated
  // ─────────────────────────────────────────────────────────────────────────

  const fetchSimilarProducts = async (categoryId: number | string) => {
    if (!categoryId) return;
    setSimilarLoading(true);
    try {
      const res = await axiosInstance.get(
        `http://localhost:8089/api/v1/product/search?keyword=${categoryId}&page=0&size=4`,
        { headers }
      );
      const filtered = (res.data.data.content || []).filter(
        (p: ProductInputProps) => String(p.id) !== String(params.singleproduct)
      );
      setSimilarProducts(filtered);
    } catch (err) {
      console.error("Failed to fetch similar products:", err);
    } finally {
      setSimilarLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [params.singleproduct]);

  useEffect(() => {
    if (product.categoryId) {
      fetchSimilarProducts(product.categoryId);
    }
  }, [product.categoryId]);

  // ─────────────────────────────────────────────────────────────────────────
  // ADD TO CART
  // ─────────────────────────────────────────────────────────────────────────

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        productId: String(product.id),
        quantity,
        description: product.description,
        price: product.price,
        name: product.name,
        category: String(product.categoryId),
        photo: product.imageURL,
      })
    );
    toast({ description: `${product.name} added to cart` });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#78355b]" />
      </div>
    );
  }

  const mrp = Math.round(product.price * 1.2);
  const discount = Math.round(((mrp - product.price) / mrp) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500
                     hover:text-[#78355b] transition-colors mb-5"
        >
          <ArrowLeft size={15} />
          Back to medicines
        </button>

        {/* ── Main product card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                        overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">

            {/* Image panel */}
            <div className="md:w-[380px] flex-shrink-0 relative bg-gray-50
                            flex items-center justify-center min-h-[300px]
                            border-b md:border-b-0 md:border-r border-gray-100
                            p-8">
              {product.imageURL ? (
                <Image
                  src={product.imageURL}
                  alt={product.name}
                  fill
                  className="object-contain p-8"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 flex
                                items-center justify-center">
                  <Package size={36} className="text-gray-300" />
                </div>
              )}
              {discount > 0 && (
                <span className="absolute top-3 right-3 text-xs font-semibold
                                 bg-green-50 text-green-700 px-2.5 py-1
                                 rounded-full border border-green-100">
                  {discount}% off
                </span>
              )}
            </div>

            {/* Info panel */}
            <div className="flex-1 p-6 md:p-8 flex flex-col">

              {/* Category */}
              <span className="inline-flex items-center gap-1.5 text-xs
                               font-medium text-[#78355b] bg-[#78355b]/8
                               px-3 py-1 rounded-full w-fit mb-3">
                <Tag size={11} />
                Category #{product.categoryId}
              </span>

              {/* Name */}
              <h1 className="text-xl font-semibold text-gray-800 leading-snug">
                {product.name}
              </h1>

              {/* Description */}
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                {product.description || "No description available."}
              </p>

              <div className="border-t border-gray-100 my-5" />

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-2xl font-semibold text-gray-800">
                  ₹{product.price}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ₹{mrp}
                </span>
                <span className="text-xs font-medium text-green-700
                                 bg-green-50 px-2 py-0.5 rounded-full">
                  Save ₹{mrp - product.price}
                </span>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-4 mt-3 mb-5">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <ShieldCheck size={13} className="text-green-500" />
                  Genuine product
                </div>
                {product.quantity && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    In stock · {product.quantity} units
                  </div>
                )}
              </div>

              {/* Quantity selector */}
              <div className="flex items-center gap-4 mb-5">
                <p className="text-sm font-medium text-gray-700">Quantity</p>
                <div className="flex items-center border border-gray-200
                                rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center
                               text-gray-500 hover:bg-gray-50
                               hover:text-[#78355b] transition-colors text-lg"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-semibold
                                   text-gray-800 border-x border-gray-200 h-9
                                   flex items-center justify-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 flex items-center justify-center
                               text-gray-500 hover:bg-gray-50
                               hover:text-[#78355b] transition-colors text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 px-6 py-3
                           bg-[#78355b] text-white text-sm font-medium
                           rounded-xl hover:bg-[#6a2d50] transition-colors
                           w-full sm:w-auto"
              >
                <ShoppingCart size={16} />
                Add to Cart · ₹{product.price * quantity}
              </button>

              {/* Delivery note */}
              <div className="flex items-center gap-1.5 text-xs text-gray-400
                              mt-3">
                <Truck size={13} className="text-green-500" />
                Free delivery on orders above ₹499
              </div>

            </div>
          </div>
        </div>

        {/* ── Similar Products ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-semibold text-gray-700">
              Similar Products
            </p>
            <Link
              href="/medicines"
              className="flex items-center gap-1 text-xs text-[#78355b]
                         hover:underline"
            >
              View all <ChevronRight size={13} />
            </Link>
          </div>

          {similarLoading && (
            <div className="flex justify-center py-8">
              <Loader2 size={22} className="animate-spin text-[#78355b]" />
            </div>
          )}

          {!similarLoading && similarProducts.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100
                            py-10 text-center">
              <p className="text-sm text-gray-400">No similar products found</p>
            </div>
          )}

          {!similarLoading && similarProducts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {similarProducts.map((p) => (
                <Link href={`/medicines/${p.id}`} key={p.id}>
                  <div className="bg-white rounded-2xl border border-gray-100
                                  shadow-sm hover:shadow-md hover:-translate-y-0.5
                                  transition-all duration-200 overflow-hidden">
                    <div className="relative h-32 bg-gray-50">
                      {p.imageURL ? (
                        <Image
                          src={p.imageURL}
                          alt={p.name}
                          fill
                          className="object-contain p-3"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center
                                        justify-center">
                          <Package size={20} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-800
                                   leading-tight">
                        {truncate(p.name, 28)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-semibold text-gray-800">
                          ₹{p.price}
                        </p>
                        <span className="text-xs text-[#78355b] font-medium">
                          View →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}