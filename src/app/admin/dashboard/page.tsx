"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Star,
  LogOut,
  RotateCw,
  AlertTriangle,
  MapPin,
  Menu,
  FileText,
  User as UserIcon,
  Phone,
  Mail,
  ExternalLink,
  Shield,
  History,
  ShieldCheck,
  ShoppingBag,
  Image as ImageIcon,
} from "lucide-react";
import { ProductHistoryModal } from "@/components/admin/ProductHistoryModal";
import { DealsTable } from "@/components/admin/DealsTable";
import { ChatTranscriptModal } from "@/components/admin/ChatTranscriptModal";
import { BannerManagement } from "@/components/admin/BannerManagement";

interface AdminStats {
  totalAds: number;
  pendingAds: number;
  approvedAds: number;
  rejectedAds: number;
  totalUsers: number;
}

interface AdvertisementItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  condition: string;
  images: { url: string; publicId?: string }[];
  location: { state?: string; city: string; area?: string; pincode?: string };
  seller?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    avatar?: string;
    isVerified?: boolean;
    createdAt?: string;
  };
  sellerContact?: { name: string; phone: string; email: string };
  attributes?: Record<string, any>;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  approvedBy?: { name: string; email: string };
  approvedAt?: string;
  isFeatured?: boolean;
  viewsCount?: number;
  createdAt: string;
}

interface AdminUserItem {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  avatar?: string;
  role: string;
  status: "active" | "suspended";
  isSuspended: boolean;
  isVerified: boolean;
  adCount: number;
  createdAt: string;
}

interface AuditLogItem {
  _id: string;
  admin: { name: string; email: string; avatar?: string };
  action: string;
  targetType: string;
  metadata?: any;
  createdAt: string;
}

export default function SuperadminDashboardPage() {
  const router = useRouter();

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "pending"
    | "approved"
    | "rejected"
    | "all"
    | "deals"
    | "users"
    | "audit"
    | "banners"
  >("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionSuccessMessage, setActionSuccessMessage] = useState<
    string | null
  >(null);

  // Product Provenance & Chat Transcript Modals
  const [selectedHistoryAdId, setSelectedHistoryAdId] = useState<string | null>(
    null,
  );
  const [selectedTranscriptConvId, setSelectedTranscriptConvId] = useState<
    string | null
  >(null);

  // Stats State
  const [stats, setStats] = useState<AdminStats>({
    totalAds: 0,
    pendingAds: 0,
    approvedAds: 0,
    rejectedAds: 0,
    totalUsers: 0,
  });

  // Data Collections
  const [advertisements, setAdvertisements] = useState<AdvertisementItem[]>([]);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Detailed Review Modal State
  const [reviewAd, setReviewAd] = useState<AdvertisementItem | null>(null);
  const [activeReviewImg, setActiveReviewImg] = useState<number>(0);

  // Reject with Reason Modal State
  const [rejectionModalAd, setRejectionModalAd] =
    useState<AdvertisementItem | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  const showToast = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/admin/stats");
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push("/admin");
      }
    }
  }, [router]);

  // Fetch Advertisements
  const fetchAdvertisements = useCallback(async () => {
    setIsLoading(true);
    try {
      let statusQuery = "";
      if (activeTab === "pending") statusQuery = "pending";
      else if (activeTab === "approved") statusQuery = "approved";
      else if (activeTab === "rejected") statusQuery = "rejected";
      else if (activeTab === "all" || activeTab === "dashboard")
        statusQuery = "all";

      const res = await api.get("/admin/advertisements", {
        params: {
          status: statusQuery,
          search: searchTerm || undefined,
        },
      });

      if (res.data.success) {
        setAdvertisements(res.data.advertisements);
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push("/admin");
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchTerm, router]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/users", {
        params: { search: searchTerm || undefined },
      });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  // Fetch Audit Logs
  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/audit-logs");
      if (res.data.success) {
        setAuditLogs(res.data.logs);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial authentication check & data load
  useEffect(() => {
    const token = localStorage.getItem("khojobangla_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    fetchStats();

    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "audit") {
      fetchAuditLogs();
    } else {
      fetchAdvertisements();
    }
  }, [
    activeTab,
    fetchStats,
    fetchAdvertisements,
    fetchUsers,
    fetchAuditLogs,
    router,
  ]);

  // Approve Advertisement handler
  const handleApproveAd = async (adId: string) => {
    setIsActionLoading(true);
    try {
      const res = await api.put(`/admin/advertisements/${adId}/approve`);
      if (res.data.success) {
        showToast(
          "Advertisement approved! It is now live on KhojoBangla marketplace.",
        );
        setReviewAd(null);
        fetchStats();
        fetchAdvertisements();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to approve advertisement.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Open Rejection Dialog
  const openRejectDialog = (ad: AdvertisementItem) => {
    setRejectionModalAd(ad);
    setRejectionReasonInput("");
  };

  // Confirm Rejection handler
  const handleConfirmReject = async () => {
    if (!rejectionModalAd) return;
    if (!rejectionReasonInput.trim()) {
      alert(
        "Please provide a rejection reason so the seller knows how to fix their advertisement.",
      );
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await api.put(
        `/admin/advertisements/${rejectionModalAd._id}/reject`,
        {
          reason: rejectionReasonInput.trim(),
        },
      );

      if (res.data.success) {
        showToast("Advertisement rejected and seller notified with reason.");
        setRejectionModalAd(null);
        setReviewAd(null);
        fetchStats();
        fetchAdvertisements();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to reject advertisement.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Toggle Featured Status
  const handleToggleFeatured = async (adId: string) => {
    try {
      const res = await api.put(`/admin/advertisements/${adId}/featured`);
      if (res.data.success) {
        showToast(
          res.data.isFeatured
            ? "Advertisement promoted to Featured Homepage tier!"
            : "Featured status removed.",
        );
        fetchAdvertisements();
      }
    } catch {
      alert("Failed to toggle featured status.");
    }
  };

  // Toggle User Suspension
  const handleToggleUserStatus = async (userId: string) => {
    try {
      const res = await api.put(`/admin/users/${userId}/status`);
      if (res.data.success) {
        showToast(res.data.message);
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update user status.");
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("khojobangla_token");
    localStorage.removeItem("khojobangla_admin_user");
    router.push("/admin");
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 flex flex-col font-sans select-none">
      {/* Top Admin Header Bar (White Brand Theme) */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <Logo size="sm" />
          </div>

          <span className="h-5 w-px bg-slate-200 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-[#014923] text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#014923]" />
            <span>Superadmin Console</span>
          </div>
        </div>

        {/* Right Admin Profile & Status */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={handleLogout}
            title="Sign out of Superadmin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-xs font-bold text-slate-700 border border-slate-200 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar (Clean White Theme) */}
        <aside
          className={`${
            isSidebarOpen ? "w-64" : "w-16"
          } transition-all duration-200 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between py-4 select-none shadow-xs`}
        >
          {/* Navigation Items */}
          <nav className="space-y-1 px-2">
            {[
              {
                id: "dashboard",
                label: "Dashboard Overview",
                icon: LayoutDashboard,
              },
              {
                id: "pending",
                label: "Pending Approvals",
                icon: Clock,
                badge: stats.pendingAds,
                badgeColor: "bg-[#E30613] text-white",
              },
              {
                id: "approved",
                label: "Approved Live Ads",
                icon: CheckCircle2,
                badge: stats.approvedAds,
                badgeColor: "bg-emerald-100 text-emerald-800",
              },
              { id: "rejected", label: "Rejected Ads", icon: XCircle },
              { id: "all", label: "All Advertisements", icon: FileText },
              {
                id: "deals",
                label: "Deals & Inquiries",
                icon: ShoppingBag,
              },
              {
                id: "banners",
                label: "Hero Banners",
                icon: ImageIcon,
              },
              {
                id: "users",
                label: "User Management",
                icon: Users,
                badge: stats.totalUsers,
                badgeColor: "bg-blue-100 text-[#014923]",
              },
              { id: "audit", label: "Audit Logs", icon: History },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSearchTerm("");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#014923] text-white shadow-md shadow-[#014923]/20"
                      : "text-slate-600 hover:text-[#014923] hover:bg-emerald-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    {isSidebarOpen && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {isSidebarOpen && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                        item.badgeColor || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer info */}
          {isSidebarOpen && (
            <div className="px-4 py-3 border-t border-slate-100 text-[11px] text-slate-400">
              <p className="font-bold text-slate-700 flex items-center gap-1">
                <span>KhojoBangla</span>
                <span className="text-[#E30613]">Marketplace</span>
              </p>
              <p>2026 Admin Portal v1.0</p>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 bg-[#F8FAFC]">
          {/* Notification Toast */}
          {actionSuccessMessage && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold px-4 py-3 rounded-2xl flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccessMessage}</span>
              </div>
              <button
                onClick={() => setActionSuccessMessage(null)}
                className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Section A: Statistics Cards (White Brand Theme) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Total Ads */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-xs hover:border-blue-300 transition-colors">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Total Ads
              </span>
              <p className="text-2xl font-black text-slate-900">
                {stats.totalAds}
              </p>
              <span className="text-[10px] text-slate-500">
                All submissions
              </span>
            </div>

            {/* Pending Approvals (Mandatory Stage - Doko Orange Highlight) */}
            <div
              onClick={() => setActiveTab("pending")}
              className="bg-red-50/70 border-2 border-[#E30613]/40 hover:border-[#E30613] rounded-2xl p-4 space-y-1 cursor-pointer transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#E30613] uppercase tracking-wider">
                  Pending Review
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#E30613] animate-ping" />
              </div>
              <p className="text-2xl font-black text-[#E30613]">
                {stats.pendingAds}
              </p>
              <span className="text-[10px] text-orange-700 font-bold">
                Requires approval →
              </span>
            </div>

            {/* Approved Live */}
            <div
              onClick={() => setActiveTab("approved")}
              className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 space-y-1 cursor-pointer transition-colors shadow-xs"
            >
              <span className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider">
                Approved Live
              </span>
              <p className="text-2xl font-black text-emerald-700">
                {stats.approvedAds}
              </p>
              <span className="text-[10px] text-slate-500">
                Visible on marketplace
              </span>
            </div>

            {/* Rejected */}
            <div
              onClick={() => setActiveTab("rejected")}
              className="bg-white border border-slate-200 hover:border-rose-300 rounded-2xl p-4 space-y-1 cursor-pointer transition-colors shadow-xs"
            >
              <span className="text-[11px] font-extrabold text-rose-600 uppercase tracking-wider">
                Rejected
              </span>
              <p className="text-2xl font-black text-rose-600">
                {stats.rejectedAds}
              </p>
              <span className="text-[10px] text-slate-500">
                Awaiting edit &amp; resubmit
              </span>
            </div>

            {/* Registered Users */}
            <div
              onClick={() => setActiveTab("users")}
              className="bg-white border border-slate-200 hover:border-[#014923] rounded-2xl p-4 space-y-1 cursor-pointer transition-colors shadow-xs"
            >
              <span className="text-[11px] font-extrabold text-[#014923] uppercase tracking-wider">
                Total Users
              </span>
              <p className="text-2xl font-black text-[#014923]">
                {stats.totalUsers}
              </p>
              <span className="text-[10px] text-slate-500">
                Sellers &amp; buyers
              </span>
            </div>
          </div>

          {/* Section B: Search & Refresh Control Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div>
              <h2 className="text-lg font-black text-slate-900 capitalize flex items-center gap-2">
                <span>
                  {activeTab === "pending"
                    ? "Pending Advertisements (Awaiting Superadmin Approval)"
                    : activeTab === "approved"
                      ? "Approved Live Advertisements"
                      : activeTab === "rejected"
                        ? "Rejected Advertisements"
                        : activeTab === "deals"
                          ? "Marketplace Transactions, Deals & Buyer Inquiries"
                          : activeTab === "banners"
                            ? "Homepage Hero Banners (2-Second Carousel)"
                            : activeTab === "users"
                              ? "Registered Users Directory"
                              : activeTab === "audit"
                                ? "Superadmin Action Audit Trail"
                                : "Marketplace Advertisements Registry"}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {activeTab === "pending"
                  ? "Carefully review product photos and description before approving for public display."
                  : activeTab === "deals"
                    ? "Full buyer-seller transparency: see who is buying what from whose seller, final sale prices, and all negotiation logs."
                    : activeTab === "banners"
                      ? "Upload unlimited promotional banners. Active banners smoothly loop every 2 seconds on the marketplace."
                      : "Live data directly synchronized with database."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search title, seller, city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#014923] focus:ring-1 focus:ring-[#014923] transition-colors shadow-xs"
                />
              </div>

              <button
                onClick={() => {
                  fetchStats();
                  if (activeTab === "users") fetchUsers();
                  else if (activeTab === "audit") fetchAuditLogs();
                  else fetchAdvertisements();
                }}
                title="Refresh data"
                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-xs"
              >
                <RotateCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin text-[#00A896]" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Section C: Tab Contents */}
          {activeTab === "users" ? (
            /* Users Table */
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">City</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Total Ads</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {users.map((u) => (
                      <tr
                        key={u._id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              <Image
                                src={
                                  u.avatar ||
                                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
                                }
                                alt={u.name}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {u.name}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Joined{" "}
                                {new Date(u.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <div className="text-slate-900">{u.email}</div>
                          <div className="text-slate-500">{u.phone}</div>
                        </td>
                        <td className="py-3 px-4">{u.city || "Dhaka"}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                              u.role === "superadmin"
                                ? "bg-emerald-50 text-[#014923] border border-emerald-200"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {u.adCount} ads
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              u.isSuspended || u.status === "suspended"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {u.isSuspended || u.status === "suspended"
                              ? "Suspended"
                              : "Active"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {u.role !== "superadmin" && (
                            <button
                              onClick={() => handleToggleUserStatus(u._id)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                                u.isSuspended
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {u.isSuspended ? "Re-activate" : "Suspend"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === "audit" ? (
            /* Audit Logs Table */
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Administrator</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Target Type</th>
                      <th className="py-3 px-4">Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {auditLogs.map((log) => (
                      <tr
                        key={log._id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {log.admin?.name || "Superadmin"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                              log.action === "ad_approved"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : log.action === "ad_rejected"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-emerald-50 text-[#014923] border border-emerald-200"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-500">
                          {log.targetType}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-700">
                          {log.metadata?.title ||
                            JSON.stringify(log.metadata || {})}
                        </td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-slate-400"
                        >
                          No audit log entries recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === "banners" ? (
            /* Homepage Hero Banners Carousel Manager */
            <BannerManagement />
          ) : activeTab === "deals" ? (
            /* Marketplace Deals & Buyer Inquiries Table */
            <DealsTable
              onViewProductHistory={(adId) => setSelectedHistoryAdId(adId)}
              onInspectTranscript={(convId) =>
                setSelectedTranscriptConvId(convId)
              }
            />
          ) : (
            /* Advertisements Table */
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Thumbnail</th>
                      <th className="py-3 px-4">Title &amp; Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Seller</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Submitted</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">
                        Moderation Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {advertisements.map((ad) => {
                      const coverImg =
                        ad.images[0]?.url ||
                        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80";

                      return (
                        <tr
                          key={ad._id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          {/* Thumbnail */}
                          <td className="py-3 px-4">
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              <Image
                                src={coverImg}
                                alt={ad.title}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </div>
                          </td>

                          {/* Title & Category */}
                          <td className="py-3 px-4 max-w-xs">
                            <p className="font-bold text-slate-900 line-clamp-1">
                              {ad.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-bold bg-emerald-50 text-[#014923] px-1.5 py-0.5 rounded uppercase">
                                {ad.category}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {ad.condition}
                              </span>
                              {ad.isFeatured && (
                                <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />{" "}
                                  Featured
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4 font-black text-[#014923] text-sm">
                            {formatPrice(ad.price)}
                          </td>

                          {/* Seller */}
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">
                              {ad.seller?.name ||
                                ad.sellerContact?.name ||
                                "Seller"}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {ad.seller?.phone || ad.sellerContact?.phone}
                            </p>
                          </td>

                          {/* Location */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-slate-700">
                              <MapPin className="w-3.5 h-3.5 text-[#E30613] shrink-0" />
                              <span>{ad.location?.city || "Dhaka"}</span>
                            </div>
                            {ad.location?.area && (
                              <p className="text-[10px] text-slate-400 pl-4.5">
                                {ad.location.area}
                              </p>
                            )}
                          </td>

                          {/* Submitted */}
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                            {new Date(ad.createdAt).toLocaleDateString()}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                ad.status === "approved"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                                  : ad.status === "rejected"
                                    ? "bg-rose-50 text-rose-800 border border-rose-300"
                                    : "bg-amber-50 text-amber-800 border border-amber-300"
                              }`}
                            >
                              {ad.status === "pending"
                                ? "Pending Review"
                                : ad.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Review Details Button */}
                              <button
                                onClick={() => {
                                  setReviewAd(ad);
                                  setActiveReviewImg(0);
                                }}
                                title="Review Details"
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors border border-slate-200"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline">Review</span>
                              </button>

                              {/* View Product Provenance & Inquiries History Button */}
                              <button
                                onClick={() => setSelectedHistoryAdId(ad._id)}
                                title="View Complete History, Buyer & Inquiries"
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-blue-100 text-[#014923] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors border border-emerald-200"
                              >
                                <History className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline">
                                  History
                                </span>
                              </button>

                              {/* Quick Approve Button */}
                              {ad.status !== "approved" && (
                                <button
                                  onClick={() => handleApproveAd(ad._id)}
                                  disabled={isActionLoading}
                                  title="Approve & Publish Live"
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span className="hidden lg:inline">
                                    Approve
                                  </span>
                                </button>
                              )}

                              {/* Quick Reject Button */}
                              {ad.status === "pending" && (
                                <button
                                  onClick={() => openRejectDialog(ad)}
                                  disabled={isActionLoading}
                                  title="Reject with Reason"
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span className="hidden lg:inline">
                                    Reject
                                  </span>
                                </button>
                              )}

                              {/* Featured Toggle */}
                              {ad.status === "approved" && (
                                <button
                                  onClick={() => handleToggleFeatured(ad._id)}
                                  title="Toggle Featured"
                                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                    ad.isFeatured
                                      ? "bg-amber-50 text-amber-600 border-amber-300"
                                      : "bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700"
                                  }`}
                                >
                                  <Star
                                    className={`w-3.5 h-3.5 ${ad.isFeatured ? "fill-amber-500 text-amber-500" : ""}`}
                                  />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {advertisements.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-12 text-center text-slate-400"
                        >
                          <p className="font-bold text-sm text-slate-700">
                            No advertisements found in this view.
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            New user submissions will automatically arrive under
                            Pending Approvals.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Review Modal (White & Logo Theme) */}
      {reviewAd && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    reviewAd.status === "approved"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                      : reviewAd.status === "rejected"
                        ? "bg-rose-50 text-rose-800 border border-rose-300"
                        : "bg-amber-50 text-amber-800 border border-amber-300"
                  }`}
                >
                  {reviewAd.status === "pending"
                    ? "Pending Review"
                    : reviewAd.status}
                </span>
                <h3 className="text-base font-black text-slate-900 line-clamp-1">
                  {reviewAd.title}
                </h3>
              </div>
              <button
                onClick={() => setReviewAd(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Photo Gallery Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Uploaded Product Photos ({reviewAd.images?.length || 0})
                </h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Main Selected Image */}
                  <div className="relative flex-1 h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <Image
                      src={
                        reviewAd.images[activeReviewImg]?.url ||
                        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={reviewAd.title}
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* Thumbnails list */}
                  {reviewAd.images?.length > 1 && (
                    <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-80 shrink-0">
                      {reviewAd.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveReviewImg(idx)}
                          className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                            activeReviewImg === idx
                              ? "border-[#014923] shadow-md"
                              : "border-slate-200 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <Image
                            src={img.url}
                            alt={`Preview ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Advertisement Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Product Info */}
                <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold text-[#014923] uppercase tracking-wider">
                    Product Specification
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Price</span>
                      <span className="font-black text-[#014923] text-sm">
                        {formatPrice(reviewAd.price)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Category</span>
                      <span className="font-bold text-slate-800 uppercase">
                        {reviewAd.category}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Condition</span>
                      <span className="font-bold text-slate-800">
                        {reviewAd.condition}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Location</span>
                      <span className="font-bold text-slate-800">
                        {reviewAd.location?.area
                          ? `${reviewAd.location.area}, ${reviewAd.location.city}`
                          : reviewAd.location?.city}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Submitted Date</span>
                      <span className="font-mono text-slate-700">
                        {new Date(reviewAd.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">
                      Description:
                    </span>
                    <p className="text-xs text-slate-700 bg-white p-3 rounded-xl leading-relaxed whitespace-pre-wrap border border-slate-200">
                      {reviewAd.description}
                    </p>
                  </div>
                </div>

                {/* Seller Info */}
                <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold text-[#014923] uppercase tracking-wider">
                    Seller Profile &amp; Contact Details
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-slate-300 shrink-0">
                      <Image
                        src={
                          reviewAd.seller?.avatar ||
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
                        }
                        alt="Seller"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900">
                        {reviewAd.seller?.name ||
                          reviewAd.sellerContact?.name ||
                          "Verified Seller"}
                      </h5>
                      <p className="text-xs text-slate-500">
                        {reviewAd.seller?.city || reviewAd.location?.city}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-2">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-4 h-4 text-[#014923]" />
                      <span className="font-mono font-bold">
                        {reviewAd.seller?.phone ||
                          reviewAd.sellerContact?.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="w-4 h-4 text-[#E30613]" />
                      <span className="font-mono">
                        {reviewAd.seller?.email ||
                          reviewAd.sellerContact?.email}
                      </span>
                    </div>
                  </div>

                  {reviewAd.rejectionReason && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                      <span className="text-[11px] font-bold text-rose-800 block">
                        Existing Rejection Reason:
                      </span>
                      <p className="text-xs text-rose-700">
                        {reviewAd.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReviewAd(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 cursor-pointer"
                >
                  Close Preview
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const id = reviewAd._id;
                    setReviewAd(null);
                    setSelectedHistoryAdId(id);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-blue-100 text-[#014923] border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <History className="w-4 h-4" />
                  <span>View Product Provenance &amp; Inquiries</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => openRejectDialog(reviewAd)}
                  disabled={isActionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                >
                  Reject Advertisement
                </button>

                <button
                  type="button"
                  onClick={() => handleApproveAd(reviewAd._id)}
                  disabled={isActionLoading}
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Approve &amp; Publish Live</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal (White Theme) */}
      {rejectionModalAd && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Reject Advertisement
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Please state why this advertisement cannot be approved. This
              reason will be sent in a notification to{" "}
              <strong className="text-slate-900">
                {rejectionModalAd.seller?.name || "the seller"}
              </strong>
              , allowing them to fix and resubmit.
            </p>

            <textarea
              rows={4}
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="e.g. Price is unrealistically low, or photos violate community guidelines..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectionModalAd(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isActionLoading || !rejectionReasonInput.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
              >
                Confirm Rejection &amp; Notify Seller
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Provenance & Buyer-Seller Lifecycle Modal */}
      <ProductHistoryModal
        isOpen={Boolean(selectedHistoryAdId)}
        onClose={() => setSelectedHistoryAdId(null)}
        advertisementId={selectedHistoryAdId}
        onRecordSaleSuccess={() => {
          fetchAdvertisements();
          fetchStats();
        }}
      />

      {/* Standalone Conversation Audit Transcript Modal */}
      <ChatTranscriptModal
        isOpen={Boolean(selectedTranscriptConvId)}
        onClose={() => setSelectedTranscriptConvId(null)}
        conversationId={selectedTranscriptConvId}
      />
    </div>
  );
}


