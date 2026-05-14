"use client";

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — Create Category Page
//
// Allows admin to create and delete product categories.
//
// API calls:
//   GET    /api/v1/category/all          → fetch all categories
//   POST   /api/v1/category/create       → create new category
//   DELETE /api/v1/category/delete/{id}  → delete a category
//
// Note: Update endpoint not yet available on backend.
//       Edit button removed until backend implements PUT /api/v1/category/update/{id}
//
// Fixes applied:
//   - After create/delete, refetch full list instead of setting from response
//   - Removed stray `import { headers } from "next/headers"` (server-only API)
//   - Removed duplicate useEffect
//   - Removed dead handleUpdateCategory hitting old render.com monolith
//   - Switched getCategories to axiosInstance for consistency
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/userSlice";
import axiosInstance from "@/app/login/axiosInstance";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Plus, Trash2, Tag } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Category = {
  id: number | string;
  name: string;
  slug: string;
  description: string | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function CreateCategoryPage() {
  const token = useSelector(selectToken);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH ALL CATEGORIES
  // ─────────────────────────────────────────────────────────────────────────

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        "http://localhost:8089/api/v1/category/all",
        { headers }
      );
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      toast({ variant: "destructive", description: "Could not load categories" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE CATEGORY
  // ─────────────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!categoryName.trim()) {
      toast({ variant: "destructive", description: "Category name cannot be empty" });
      return;
    }
    setCreating(true);
    try {
      const res = await axiosInstance.post(
        "http://localhost:8089/api/v1/category/create",
        { name: categoryName },
        { headers }
      );
      if (res.data.success) {
        toast({ description: res.data.message });
        setCategoryName("");
        await fetchCategories();
      } else {
        toast({ variant: "destructive", description: res.data.message });
      }
    } catch (err) {
      console.error("Failed to create category:", err);
      toast({ variant: "destructive", description: "Failed to create category" });
    } finally {
      setCreating(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE CATEGORY
  // ─────────────────────────────────────────────────────────────────────────

  const handleDelete = async (id: number | string) => {
    setDeletingId(id);
    try {
      const res = await axiosInstance.delete(
        `http://localhost:8089/api/v1/category/delete/${id}`,
        { headers }
      );
      if (res.data.success) {
        toast({ description: res.data.message });
        await fetchCategories();
      } else {
        toast({ variant: "destructive", description: res.data.message });
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
      toast({ variant: "destructive", description: "Failed to delete category" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleCreate();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // Layout: page header full width, then all cards centered with max-w-2xl
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Page header — full width */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Categories</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Manage product categories for the e-store
        </p>
      </div>

      {/* ── Centered content column ── */}
      <div className="flex flex-col items-center gap-6">

        {/* Create input card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                        p-5 w-full max-w-2xl">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Category
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={categoryName}
              placeholder="e.g. Pain Killers"
              onChange={(e) => setCategoryName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl
                         focus:outline-none focus:border-[#78355b] transition-colors"
            />
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium
                         bg-[#78355b] text-white rounded-xl hover:bg-[#6a2d50]
                         transition-colors disabled:opacity-60"
            >
              {creating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </div>

        {/* Categories table card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                        overflow-hidden w-full max-w-2xl">

          {/* Card header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-[#78355b]" />
              <span className="text-sm font-medium text-gray-700">
                All Categories
              </span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {categories.length} total
            </span>
          </div>

          {/* Table */}
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["#", "Name", "Slug", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-gray-400
                               uppercase tracking-wide px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">

              {loading && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-sm text-gray-400">
                    Loading categories…
                  </td>
                </tr>
              )}

              {!loading && categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-sm text-gray-400">
                    No categories yet. Create one above.
                  </td>
                </tr>
              )}

              {!loading &&
                categories.map((cat, idx) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {cat.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-500
                                       px-2 py-0.5 rounded-full font-mono">
                        {cat.slug}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(cat.id)}
                        disabled={deletingId === cat.id}
                        className="flex items-center gap-1 text-xs text-red-500
                                   hover:text-red-600 hover:bg-red-50 px-2 py-1.5
                                   rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deletingId === cat.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                        {deletingId === cat.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}