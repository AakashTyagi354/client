"use client";

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — Create Product Page
//
// Form to create a new product in the e-store.
//
// API calls:
//   GET  /api/v1/category/all      → fetch categories for dropdown
//   POST /api/v1/product/create    → create product (multipart/form-data)
//
// Form fields: name, description, price, quantity, category, photo
// Auth: requires admin JWT from Redux store
//
// Fixes applied:
//   - setCategories(res.data.data) instead of res.data
//   - Check data.success instead of just data
//   - fileInputRef resets file input DOM element after submit
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/userSlice";
import axiosInstance from "@/app/login/axiosInstance";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import {
  Upload,
  X,
  ChevronDown,
  Package,
  Loader2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Category = {
  id: number | string;
  name: string;
  slug?: string;
  description?: string | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function CreateProductPage() {
  const token = useSelector(selectToken);

  // ── Form state ──
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  // ── UI state ──
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  // ── Ref to reset file input DOM element after submit ──
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH CATEGORIES
  // ─────────────────────────────────────────────────────────────────────────

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get(
        "http://localhost:8089/api/v1/category/all",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Fix: was res.data — ApiResponse wraps data inside .data
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // RESET FORM
  // ─────────────────────────────────────────────────────────────────────────

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setQuantity("");
    setCategoryId("");
    setPhoto(null);
    // Fix: reset actual DOM file input — state alone doesn't clear the filename
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE PRODUCT
  // ─────────────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    // Basic validation
    if (!name || !price || !quantity || !categoryId) {
      toast({
        variant: "destructive",
        description: "Please fill in all required fields",
      });
      return;
    }

    setLoading(true);
    try {
      const selectedCategory = categories.find(
        (cat) => String(cat.id) === categoryId
      );

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("quantity", quantity);
      formData.append("category", categoryId);
      formData.append("categorySlug", selectedCategory?.slug || "");
      if (photo) formData.append("photo", photo);

      const { data } = await axiosInstance.post(
        "http://localhost:8089/api/v1/product/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Fix: check data.success instead of just data — axios always returns truthy data
      if (data.success) {
        toast({ description: "Product created successfully" });
        resetForm();
      } else {
        toast({ variant: "destructive", description: data.message });
      }
    } catch (err) {
      console.error("Failed to create product:", err);
      toast({ variant: "destructive", description: "Failed to create product" });
    } finally {
      setLoading(false);
    }
  };

  // ── Selected category label for dropdown display ──
  const selectedCategory = categories.find(
    (cat) => String(cat.id) === categoryId
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Create Product</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Add a new product to the e-store
        </p>
      </div>

      {/* Form card */}
      <div className="flex justify-center">

   
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                  w-full max-w-2xl p-6 space-y-5">

        {/* Category dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Category <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoryOpen((o) => !o)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm
                         border border-gray-200 rounded-xl bg-white hover:border-[#78355b]
                         focus:outline-none focus:border-[#78355b] transition-colors"
            >
              <span className={selectedCategory ? "text-gray-800" : "text-gray-400"}>
                {selectedCategory ? selectedCategory.name : "Select a category"}
              </span>
              <ChevronDown
                size={15}
                className={`text-gray-400 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown list */}
            {categoryOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100
                              rounded-xl shadow-lg overflow-hidden">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-400 px-3 py-3">
                    No categories found
                  </p>
                ) : (
                  categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategoryId(String(cat.id));
                        setCategoryOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50
                                  transition-colors ${
                                    String(cat.id) === categoryId
                                      ? "text-[#78355b] font-medium bg-[#78355b]/5"
                                      : "text-gray-700"
                                  }`}
                    >
                      {cat.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Product name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Product Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            placeholder="e.g. Paracetamol 500mg"
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl
                       focus:outline-none focus:border-[#78355b] transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            placeholder="Brief description of the product…"
            rows={3}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl
                       focus:outline-none focus:border-[#78355b] transition-colors
                       resize-none"
          />
        </div>

        {/* Price + Quantity side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Price (₹) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={price}
              placeholder="0.00"
              min="0"
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl
                         focus:outline-none focus:border-[#78355b] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Quantity <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={quantity}
              placeholder="0"
              min="0"
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl
                         focus:outline-none focus:border-[#78355b] transition-colors"
            />
          </div>
        </div>

        {/* Photo upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Product Photo
          </label>

          {/* Upload area */}
          <label
            htmlFor="photo-upload"
            className="flex flex-col items-center justify-center w-full h-28
                       border-2 border-dashed border-gray-200 rounded-xl
                       cursor-pointer hover:border-[#78355b] hover:bg-[#78355b]/5
                       transition-colors"
          >
            <Upload size={18} className="text-gray-400 mb-1.5" />
            <span className="text-sm text-gray-400">
              {photo ? photo.name : "Click to upload image"}
            </span>
            <span className="text-xs text-gray-300 mt-0.5">
              PNG, JPG up to 5MB
            </span>
          </label>

          {/* Hidden file input — ref used to reset DOM value after submit */}
          <input
            id="photo-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />

          {/* Image preview */}
          {photo && (
            <div className="relative mt-3 w-fit">
              <Image
                src={URL.createObjectURL(photo)}
                alt="product preview"
                width={120}
                height={120}
                className="rounded-xl object-cover border border-gray-100"
              />
              {/* Remove photo button */}
              <button
                type="button"
                onClick={() => {
                  setPhoto(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full
                           flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X size={10} className="text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Submit */}
        <button
          type="button"
          onClick={handleCreate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm
                     font-medium bg-[#78355b] text-white rounded-xl
                     hover:bg-[#6a2d50] transition-colors disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Package size={15} />
          )}
          {loading ? "Creating…" : "Create Product"}
        </button>
      </div>
         </div>
    </div>
  );
}