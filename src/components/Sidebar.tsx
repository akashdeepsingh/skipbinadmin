"use client";
import { Calendar, TrendingUp, Home, Boxes, FileText, Users, Settings, ClipboardList } from "lucide-react";
import React from "react";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  // Map path to active key
  const getActiveKey = () => {
    if (pathname.startsWith("/dashboard")) return "dashboard";
    if (pathname.startsWith("/inventory")) return "inventory";
    if (pathname.startsWith("/booking")) return "booking";
    if (pathname.startsWith("/invoices")) return "invoices";
    if (pathname.startsWith("/operations")) return "operations";
    if (pathname.startsWith("/customers")) return "customers";
    if (pathname.startsWith("/analytics")) return "analytics";
    return "dashboard";
  };
  const active = getActiveKey();
  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900">BinMaster Pro</h1>
            <p className="text-xs text-gray-500">Skip Bin Management</p>
          </div>
        </div>

        <nav className="space-y-1">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">NAVIGATION</h3>

          <a
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg ${
              active === "dashboard" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
            }`}>
            <Home className={active === "dashboard" ? "w-4 h-4 text-blue-600" : "w-4 h-4 text-gray-400"} />
            Dashboard
          </a>

          <a
            href="/inventory"
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${
              active === "inventory" ? "font-medium bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
            }`}>
            <Boxes className={active === "inventory" ? "w-4 h-4 text-blue-600" : "w-4 h-4 text-gray-400"} />
            Inventory
          </a>

          <a
            href="/bookings"
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${
              active === "booking" ? "font-medium bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
            }`}>
            <ClipboardList className={active === "booking" ? "w-4 h-4 text-blue-600" : "w-4 h-4 text-gray-400"} />
            Bookings
          </a>

          <a
            href="/invoices"
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${
              active === "invoices" ? "font-medium bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
            }`}>
            <FileText className={active === "invoices" ? "w-4 h-4 text-blue-600" : "w-4 h-4 text-gray-400"} />
            Invoices
          </a>

          <a
            href="/operations"
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${
              active === "operations" ? "font-medium bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
            }`}>
            <Settings className={active === "operations" ? "w-4 h-4 text-blue-600" : "w-4 h-4 text-gray-400"} />
            Operations
          </a>

          <a
            href="/customers"
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${
              active === "customers" ? "font-medium bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
            }`}>
            <Users className={active === "customers" ? "w-4 h-4 text-blue-600" : "w-4 h-4 text-gray-400"} />
            Customers
          </a>

          <a
            href="/analytics"
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${
              active === "analytics" ? "font-medium bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
            }`}>
            <TrendingUp className={active === "analytics" ? "w-4 h-4 text-blue-600" : "w-4 h-4 text-gray-400"} />
            Analytics
          </a>
        </nav>
      </div>
    </div>
  );
}
