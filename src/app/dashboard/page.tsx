"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

import { Calendar, Clock, MapPin, TrendingUp, DollarSign, User } from "lucide-react";
import Sidebar from "@/components/Sidebar";

interface Stats {
  totalBins: number;
  availableBins: number;
  activeBookings: number;
  totalRevenue: number;
  pendingInvoices: number;
  totalCustomers: number;
}

interface BookingActivity {
  id: string;
  company: string;
  location: string;
  date: string;
  binSize: string;
  wasteType: string;
  status: "delivered" | "pending";
  initials: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalBins: 0,
    availableBins: 0,
    activeBookings: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    totalCustomers: 0,
  });

  const [recentActivity, setRecentActivity] = useState<BookingActivity[]>([]);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch skip bins data
        const { data: binsData } = await supabase.from("skip_bins").select("*");
        const totalBins = binsData?.length || 0;
        const availableBins = binsData?.filter((bin) => bin.status === "available").length || 0;

        // Fetch bookings data
        const { data: bookingsData } = await supabase.from("bookings").select("*");
        const activeBookings = bookingsData?.filter((booking) => booking.status === "confirmed" || booking.status === "delivered").length || 0;

        // Fetch recent bookings for activity
        const { data: recentBookingsData } = await supabase.from("bookings").select("*").order("start_date", { ascending: false }).limit(3);

        // Fetch invoices data
        const { data: invoicesData } = await supabase.from("invoices").select("*");
        const totalRevenue = invoicesData?.reduce((sum, invoice) => sum + (invoice.amount || 0), 0) || 0;
        const pendingInvoices = invoicesData?.filter((invoice) => invoice.status === "draft" || invoice.status === "sent").length || 0;

        // Fetch customers data
        const { data: customersData } = await supabase.from("customers").select("*");
        const totalCustomers = customersData?.length || 0;

        // Update stats
        setStats({
          totalBins,
          availableBins,
          activeBookings,
          totalRevenue,
          pendingInvoices,
          totalCustomers,
        });

        // Update recent activity
        if (recentBookingsData) {
          const activities: BookingActivity[] = recentBookingsData.map((booking) => ({
            id: booking.id,
            company: booking.customer_name,
            location: booking.location,
            date: new Date(booking.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            binSize: booking.bin_size,
            wasteType: "general", // Default since this field might not be in your booking table
            status: booking.status === "delivered" ? "delivered" : "pending",
            initials: booking.customer_name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
          }));
          setRecentActivity(activities);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}

      <div className="flex-1 bg-gray-50">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black">Operations Dashboard</h1>
              <p className="text-black mt-1">Welcome back! Here's what's happening with your skip bin operations.</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">📅 New Booking</Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-6 gap-4 mb-8">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-black">Total Skip Bins</p>
                  <p className="text-2xl font-bold text-black">{stats.totalBins}</p>
                  <p className="text-xs text-black">↗ 12% from last month</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-black">Available Bins</p>
                  <p className="text-2xl font-bold text-black">{stats.availableBins}</p>
                  <p className="text-xs text-black">↗ 40% capacity</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-black">Active Bookings</p>
                  <p className="text-2xl font-bold text-black">{stats.activeBookings}</p>
                  <p className="text-xs text-black">↗ 8 this week</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-black">Total Revenue</p>
                  <p className="text-2xl font-bold text-black">${stats.totalRevenue}</p>
                  <p className="text-xs text-black">↗ 15% increase</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Badge className="w-5 h-5 bg-orange-600 text-white flex items-center justify-center rounded-full">!</Badge>
                </div>
                <div>
                  <p className="text-sm text-black">Pending Invoices</p>
                  <p className="text-2xl font-bold text-black">{stats.pendingInvoices}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-black">Total Customers</p>
                  <p className="text-2xl font-bold text-black">{stats.totalCustomers}</p>
                  <p className="text-xs text-black">↗ 3 new this month</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-2 gap-8">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">📋 Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                          {activity.initials}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{activity.company}</h4>
                            <Badge className={activity.status === "delivered" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                              {activity.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {activity.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {activity.date}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{activity.binSize}</div>
                          <div className="text-sm text-gray-500">{activity.wasteType}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-40 text-gray-500">
                      <div className="text-center">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No recent activity</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🕒 Upcoming Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-40 text-gray-500">
                  <div className="text-center">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No upcoming deliveries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bin Status Chart */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">📊 Bin Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* Simple donut chart representation */}
                  <svg
                    className="w-64 h-64 transform -rotate-90"
                    viewBox="0 0 100 100">
                    {/* Available (green) - 60% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#10B981"
                      strokeWidth="20"
                      fill="transparent"
                      strokeDasharray="150 251"
                      strokeLinecap="round"
                    />
                    {/* In Use (orange) - 40% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#F59E0B"
                      strokeWidth="20"
                      fill="transparent"
                      strokeDasharray="100 251"
                      strokeDashoffset="-150"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalBins}</div>
                      <div className="text-sm text-gray-500">Total Bins</div>
                    </div>
                  </div>
                </div>
                <div className="ml-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-700">Available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span className="text-gray-700">In Use</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
