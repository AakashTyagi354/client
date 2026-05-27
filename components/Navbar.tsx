"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Navbar — Delma Health Platform
//
// Renders top navigation with:
//   - Role-based nav links (user / doctor / admin)
//   - Notification bell with dropdown (fetch, delete, clear all)
//   - Logout
//   - Mobile sheet menu
//
// Notification API:
//   GET    /api/v1/notifications/user/{userId}   → fetch all
//   DELETE /api/v1/notifications/delete/{id}     → delete single by UUID
//
// Auth: JWT from Redux store
//
// Changes:
//   FE-008: Added 5-minute client-side notification cache.
//           Module-level cache (not useState) so it survives Navbar re-mounts
//           on navigation. Cache is invalidated on delete/clear so UI stays
//           consistent after user actions.
//   FE-004: Removed all hardcoded localhost:8089 URLs — using axiosInstance
//           baseURL which reads from NEXT_PUBLIC_API_URL env var.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, selectToken, selectUser } from "@/redux/userSlice";
import { clearDoctor } from "@/redux/doctorSlice";
import axiosInstance from "@/app/login/axiosInstance";
import logoImg from "../public/logoImg.png";
import WidthWrapper from "@/components/WidthWrapper";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Menu,
  LogOut,
  LogIn,
  X,
  Trash2,
  CheckCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// NAV LINK CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const USER_LINKS = [
  { label: "Find Doctors", href: "/finddoc" },
  { label: "Video Consult", href: "/videocall" },
  { label: "Documents", href: "/documents/files" },
  { label: "Medicines", href: "/medicines" },
  { label: "Apply as Doctor", href: "/applydoc" },
];

const DOCTOR_LINKS = [
  { label: "Create Slots", href: "/doctor/slots" },
  { label: "User Documents", href: "/docdoc" },
  { label: "Video Consult", href: "/videocall" },
  { label: "Medicines", href: "/medicines" },
];

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/dashboard/users" },
];

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;        // UUID
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FE-008: MODULE-LEVEL NOTIFICATION CACHE
//
// Why module-level and not useState?
// useState resets every time the component unmounts and remounts.
// In Next.js, navigating between pages can remount the Navbar depending on
// the layout. A module-level variable lives for the entire browser session —
// it survives component re-mounts, so the cache actually works across pages.
//
// Structure:
//   data      — the last fetched notification list
//   fetchedAt — timestamp of last successful fetch (0 = never fetched / stale)
//
// TTL: 5 minutes (CACHE_TTL_MS)
// Invalidation: fetchedAt is reset to 0 after any delete or clear-all action,
// forcing the next open to fetch fresh data. This keeps the UI consistent —
// a deleted notification won't re-appear from a stale cache.
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

const notificationCache: { data: Notification[]; fetchedAt: number } = {
  data: [],
  fetchedAt: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Navbar() {
  const token = useSelector(selectToken);
  const currentUser = useSelector(selectUser);
  const dispatch = useDispatch();

  const isDoctor = currentUser?.isDoctor;
  const isAdmin = currentUser?.isAdmin;
  const isLoggedIn = !!token;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH NOTIFICATIONS — with 5-minute cache
  //
  // Flow:
  //   1. Check if cache is fresh (age < CACHE_TTL_MS)
  //   2. If fresh → use cached data, skip API call
  //   3. If stale → fetch from API, update cache + state
  //
  // Dep array [token]: re-runs on login/logout.
  // On login: fetchedAt is 0 → always fetches fresh.
  // On logout: token is null → returns early, notifications cleared via
  //            cache invalidation in handleLogout.
  // ─────────────────────────────────────────────────────────────────────────

  const fetchNotifications = async () => {
    if (!token || !currentUser?.id) return;

    const cacheAge = Date.now() - notificationCache.fetchedAt;
    const isCacheFresh = cacheAge < CACHE_TTL_MS;

    if (isCacheFresh && notificationCache.data.length > 0) {
      // Cache hit — serve from memory, no API call
      setNotifications(notificationCache.data);
      return;
    }

    // Cache miss or stale — fetch from API
    try {
      // FE-004 fix: removed hardcoded localhost:8089
      // axiosInstance.baseURL reads from NEXT_PUBLIC_API_URL in .env.local
      const res = await axiosInstance.get(
        `/api/v1/notifications/user/${currentUser.id}`
      );
      const fresh = res.data.data || [];

      // Update cache
      notificationCache.data = fresh;
      notificationCache.fetchedAt = Date.now();

      setNotifications(fresh);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE SINGLE NOTIFICATION
  //
  // After delete:
  //   1. Remove from local state immediately (optimistic UI — no loading flash)
  //   2. Invalidate cache — next bell open fetches fresh from API
  //      This prevents the deleted item reappearing from a stale cache.
  // ─────────────────────────────────────────────────────────────────────────

  const handleDeleteNotification = async (id: string) => {
    setDeletingId(id);
    try {
      // FE-004 fix: removed hardcoded localhost:8089
      await axiosInstance.delete(`/api/v1/notifications/delete/${id}`);

      // Optimistic update — remove from UI immediately
      setNotifications((prev) => prev.filter((n) => n.id !== id));

      // Invalidate cache so next fetch gets fresh server state
      notificationCache.fetchedAt = 0;
    } catch (err) {
      console.error("Failed to delete notification:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CLEAR ALL NOTIFICATIONS
  // Deletes all in parallel — no bulk delete endpoint exists yet.
  // Invalidates cache after clearing.
  // ─────────────────────────────────────────────────────────────────────────

  const handleClearAll = async () => {
    try {
      // FE-004 fix: removed hardcoded localhost:8089
      await Promise.all(
        notifications.map((n) =>
          axiosInstance.delete(`/api/v1/notifications/delete/${n.id}`)
        )
      );
      setNotifications([]);

      // Invalidate cache — list is now empty on server
      notificationCache.data = [];
      notificationCache.fetchedAt = 0;
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // LOGOUT
  // FE-004 fix: removed hardcoded localhost:8089
  // Also clears notification cache on logout so next user starts fresh
  // ─────────────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    try {
      await axiosInstance.post(
        "/auth/logout",
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear notification cache on logout
      // Next user who logs in gets their own fresh notifications
      notificationCache.data = [];
      notificationCache.fetchedAt = 0;

      dispatch(clearUser());
      dispatch(clearDoctor());
    }
  };

  // ── Active nav links based on role ──
  const activeLinks = isDoctor
    ? DOCTOR_LINKS
    : [...USER_LINKS, ...(isAdmin ? ADMIN_LINKS : [])];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <WidthWrapper className="h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/">
          <Image src={logoImg} alt="Delma" height={50} width={100} />
        </Link>

        {/* ── Desktop nav ── */}
        <div className="hidden md:flex flex-1 items-center ml-6">

          <nav className="flex items-center flex-1 justify-center">
            {activeLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button variant="ghost" className="text-sm text-gray-600
                                                   hover:text-[#78355b] hover:bg-[#78355b]/5">
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Right side: bell + auth */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Notification bell — only show when logged in */}
            {isLoggedIn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 rounded-xl hover:bg-gray-100
                                     transition-colors focus:outline-none">
                    <Bell size={20} className="text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500
                                       rounded-full flex items-center justify-center
                                       text-[10px] text-white font-medium">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-80 max-h-[420px] overflow-y-auto p-0 rounded-2xl
                             border border-gray-100 shadow-lg"
                >
                  {/* Notification header */}
                  <div className="flex items-center justify-between px-4 py-3
                                  border-b border-gray-100 sticky top-0 bg-white">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Notifications
                      </p>
                      <p className="text-xs text-gray-400">
                        {unreadCount > 0
                          ? `${unreadCount} unread`
                          : "All caught up"}
                      </p>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="flex items-center gap-1 text-xs text-red-500
                                   hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={12} />
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Empty state */}
                  {notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center
                                    py-10 text-center px-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex
                                      items-center justify-center mb-3">
                        <Bell size={18} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">No notifications yet</p>
                      <p className="text-xs text-gray-400 mt-1">
                        We'll notify you when something happens
                      </p>
                    </div>
                  )}

                  {/* Notification list */}
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b
                                  border-gray-50 hover:bg-gray-50 transition-colors
                                  ${!n.read ? "bg-[#78355b]/5" : ""}`}
                    >
                      {/* Read indicator */}
                      <div className="mt-1 flex-shrink-0">
                        {n.read ? (
                          <CheckCircle size={14} className="text-gray-300" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-[#78355b] mt-1" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700">
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteNotification(n.id)}
                        disabled={deletingId === n.id}
                        className="flex-shrink-0 p-1 rounded-lg hover:bg-red-50
                                   text-gray-400 hover:text-red-500 transition-colors
                                   disabled:opacity-50"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Auth button */}
            {isLoggedIn ? (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-gray-600
                           hover:text-red-500 hover:bg-red-50"
              >
                <LogOut size={16} />
                Logout
              </Button>
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <LogIn size={16} />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <div className="block md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Menu size={22} className="text-gray-600" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetDescription asChild>
                  <div className="flex flex-col mt-8 gap-1">

                    {activeLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center px-3 py-2.5 text-sm
                                   text-gray-700 hover:bg-[#78355b]/5
                                   hover:text-[#78355b] rounded-xl transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}

                    <div className="border-t border-gray-100 mt-4 pt-4">
                      {isLoggedIn ? (
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm
                                     text-red-500 hover:bg-red-50 rounded-xl
                                     transition-colors w-full"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      ) : (
                        <Link href="/login">
                          <button
                            className="flex items-center gap-2 px-3 py-2.5 text-sm
                                       text-gray-600 hover:bg-gray-100 rounded-xl
                                       transition-colors w-full"
                          >
                            <LogIn size={16} />
                            Login
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>

      </WidthWrapper>
    </div>
  );
}