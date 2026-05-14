"use client";

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — Users Page
//
// Displays all registered users fetched from:
//   GET /api/v1/admin/getall-users
//
// API response shape per user:
//   { id: number | null, username: string | null, email: string, roles: string[] }
//
// Known backend issues (tracked):
//   - id returns null for some users
//   - username returns null for some users
//
// Roles are plain strings: "USER" | "DOCTOR" | "ADMIN"
// Auth: requires admin JWT from Redux store
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/userSlice";
import axiosInstance from "@/app/login/axiosInstance";
import { Search, Shield, Stethoscope } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface UserData {
  id: number | null;
  username: string | null;
  email: string;
  roles: string[]; // e.g. ["USER"] or ["USER", "DOCTOR"]
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Derive initials from username, fallback to email prefix
const getInitials = (username: string | null, email: string): string => {
  const source = username || email;
  return source
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Display name — fallback to email prefix until backend null fix is deployed
const getDisplayName = (username: string | null, email: string): string =>
  username || email.split("@")[0];

// Highest role to show — ADMIN > DOCTOR > USER
const getPrimaryRole = (roles: string[]): "ADMIN" | "DOCTOR" | "USER" => {
  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("DOCTOR")) return "DOCTOR";
  return "USER";
};

// ─────────────────────────────────────────────────────────────────────────────
// ROLE BADGE
// ─────────────────────────────────────────────────────────────────────────────

function RoleBadge({ roles }: { roles: string[] }) {
  const role = getPrimaryRole(roles);

  if (role === "ADMIN")
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-purple-50
                       text-purple-600 px-2 py-0.5 rounded-full font-medium">
        <Shield size={10} /> Admin
      </span>
    );

  if (role === "DOCTOR")
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-[#78355b]/10
                       text-[#78355b] px-2 py-0.5 rounded-full font-medium">
        <Stethoscope size={10} /> Doctor
      </span>
    );

  return (
    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
      User
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const token = useSelector(selectToken);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        "http://localhost:8089/api/v1/admin/getall-users",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Client-side filter — searches display name and email
  const filteredUsers = users.filter((u) => {
    const name = getDisplayName(u.username, u.email).toLowerCase();
    const email = u.email.toLowerCase();
    const term = search.toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Users</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          All registered users on the Delma platform
        </p>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Search + count */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl
                         focus:outline-none focus:border-[#78355b] bg-gray-50
                         focus:bg-white transition-colors w-56"
            />
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            {filteredUsers.length} users
          </span>
        </div>

        {/* Table — 3 columns only: #, Username, Email, Role */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["#", "Username", "Email", "Role"].map((h) => (
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
                    Loading users…
                  </td>
                </tr>
              )}

              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-sm text-gray-400">
                    No users found
                  </td>
                </tr>
              )}

              {!loading &&
                filteredUsers.map((user, idx) => (
                  // TODO: switch key to user.id once backend null fix is deployed
                  <tr
                    key={user.email}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>

                    {/* Avatar + display name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#78355b]/10 flex items-center
                                        justify-center text-xs font-semibold text-[#78355b] flex-shrink-0">
                          {getInitials(user.username, user.email)}
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {getDisplayName(user.username, user.email)}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>

                    <td className="px-4 py-3">
                      <RoleBadge roles={user.roles} />
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