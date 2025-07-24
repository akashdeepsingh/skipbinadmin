"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar, Search, Eye, MapPin } from "lucide-react";

interface Booking {
  id: string;
  customer_name: string;
  start_date: string;
  end_date: string;
  bin_number: string;
  bin_size: string;
  status: "pending" | "confirmed" | "delivered" | "collected" | "cancelled";
  location: string;
  contact: string;
  notes?: string;
}

interface SkipBinData {
  bin_number: string;
  size: string;
  status: string;
}

export default function BookingsPage() {
  // Available bins for assignment
  const [availableBins, setAvailableBins] = useState<{ bin_number: string; size: string }[]>([]);

  useEffect(() => {
    const fetchAvailableBins = async () => {
      const { data, error } = await supabase.from("skip_bins").select("bin_number, size, status").eq("status", "available");
      if (!error && data) {
        setAvailableBins(data.map((b: SkipBinData) => ({ bin_number: b.bin_number, size: b.size })));
      }
    };
    fetchAvailableBins();
  }, []);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  // Fetch bookings from Supabase
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("bookings").select("*").order("start_date", { ascending: false });
      if (!error && data) {
        setBookings(data as Booking[]);
      }
      setLoading(false);
    };
    fetchBookings();
  }, []);

  const [newBooking, setNewBooking] = useState({
    customer: "",
    booking_number: "BK-497879",
    bin_size: "",
    assigned_bin: "",
    street: "",
    city: "",
    state: "",
    zip_code: "",
    delivery_date: "07/24/2025",
    pickup_date: "07/31/2025",
    waste_type: "general",
    total_amount: "0.00",
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      collected: "bg-purple-100 text-purple-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getTabStats = () => {
    const all = bookings.length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const inUse = bookings.filter((b) => b.status === "delivered").length;
    const completed = bookings.filter((b) => b.status === "collected").length;
    return { all, pending, confirmed, inUse, completed };
  };

  const stats = getTabStats();

  const handleAddBooking = async () => {
    const booking: Omit<Booking, "id"> = {
      customer_name: newBooking.customer,
      start_date: newBooking.delivery_date,
      end_date: newBooking.pickup_date,
      bin_number: newBooking.assigned_bin,
      bin_size: newBooking.bin_size,
      status: "pending",
      location: `${newBooking.street}, ${newBooking.city}`,
      contact: "",
      notes: "",
    };
    const { data, error } = await supabase.from("bookings").insert([booking]).select();
    if (!error && data && data.length > 0) {
      setBookings([data[0] as Booking, ...bookings]);

      // Update bin status to "booked" if a specific bin was assigned
      if (newBooking.assigned_bin) {
        await supabase.from("skip_bins").update({ status: "booked" }).eq("bin_number", newBooking.assigned_bin);
      }

      // Create invoice entry for the booking (match invoices table schema)
      const invoice = {
        invoice_number: `INV-${newBooking.booking_number.replace("BK-", "")}`,
        customer: newBooking.customer,
        date: new Date().toISOString().split("T")[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
        amount: parseFloat(newBooking.total_amount) || 0,
        status: "draft", // must be one of: draft, sent, paid, overdue
        description: `Skip bin rental - ${newBooking.bin_size}. Delivery: ${newBooking.delivery_date}, Pickup: ${newBooking.pickup_date}`,
      };

      await supabase.from("invoices").insert([invoice]);
    }
    setNewBooking({
      customer: "",
      booking_number: "BK-" + Math.floor(Math.random() * 100000),
      bin_size: "",
      assigned_bin: "",
      street: "",
      city: "",
      state: "",
      zip_code: "",
      delivery_date: "07/24/2025",
      pickup_date: "07/31/2025",
      waste_type: "general",
      total_amount: "0.00",
    });
    setShowAddDialog(false);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bin_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Pending" && booking.status === "pending") ||
      (activeTab === "Confirmed" && booking.status === "confirmed") ||
      (activeTab === "In Use" && booking.status === "delivered") ||
      (activeTab === "Completed" && booking.status === "collected");
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-white">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black">Manage Bookings</h1>
              <p className="text-black mt-1">Oversee all customer skip bin bookings.</p>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              + New Booking
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by booking #, customer, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200 text-black placeholder:text-gray-400"
            />
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
            {[
              { key: "All", label: `All (${stats.all})` },
              { key: "Pending", label: `Pending (${stats.pending})` },
              { key: "Confirmed", label: `Confirmed (${stats.confirmed})` },
              { key: "In Use", label: `In Use (${stats.inUse})` },
              { key: "Completed", label: `Completed (${stats.completed})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  activeTab === tab.key ? "bg-white text-black shadow-sm" : "text-gray-700 hover:text-black"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Bookings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <Card
                key={booking.id}
                className="p-6 bg-white border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-black">{booking.customer_name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Bin #: <span className="font-semibold text-black">{booking.bin_number}</span>
                    </p>
                  </div>
                  <Badge className={getStatusBadge(booking.status)}>{booking.status}</Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-600 rounded"></div>
                    </div>
                    <span className="font-medium text-black">{booking.bin_size}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{booking.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {booking.start_date} - {booking.end_date}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowDetailDialog(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 text-black border-gray-300">
                  <Eye className="w-4 h-4" />
                  View Details
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Create New Booking Dialog */}
        <Dialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
          <DialogContent className="max-w-lg bg-white text-black z-50 relative">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-black">Create New Booking</DialogTitle>
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="text-gray-400 hover:text-black text-xl">
                  ×
                </button>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <Input
                    placeholder="Enter customer name"
                    value={newBooking.customer}
                    onChange={(e) => setNewBooking({ ...newBooking, customer: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Booking Number</label>
                  <Input
                    value={newBooking.booking_number}
                    onChange={(e) => setNewBooking({ ...newBooking, booking_number: e.target.value })}
                    className="bg-gray-50"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bin Size</label>
                  <Select
                    value={newBooking.bin_size}
                    onValueChange={(value) => setNewBooking({ ...newBooking, bin_size: value })}>
                    <option value="">Select bin size</option>
                    <option value="6 yard">6 yard</option>
                    <option value="8 yard">8 yard</option>
                    <option value="10 yard">10 yard</option>
                    <option value="15 yard">15 yard</option>
                    <option value="20 yard">20 yard</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Bin (Optional)</label>
                  <Select
                    value={newBooking.assigned_bin}
                    onValueChange={(value) => setNewBooking({ ...newBooking, assigned_bin: value })}>
                    <option value="">Select available bin</option>
                    {availableBins.map((bin) => (
                      <option
                        key={bin.bin_number}
                        value={bin.bin_number}>
                        {bin.bin_number} ({bin.size})
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                <Input
                  placeholder="Street"
                  value={newBooking.street}
                  onChange={(e) => setNewBooking({ ...newBooking, street: e.target.value })}
                  className="mb-3"
                />
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    placeholder="City"
                    value={newBooking.city}
                    onChange={(e) => setNewBooking({ ...newBooking, city: e.target.value })}
                  />
                  <Input
                    placeholder="State"
                    value={newBooking.state}
                    onChange={(e) => setNewBooking({ ...newBooking, state: e.target.value })}
                  />
                  <Input
                    placeholder="Zip Code"
                    value={newBooking.zip_code}
                    onChange={(e) => setNewBooking({ ...newBooking, zip_code: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                  <Input
                    type="date"
                    value={newBooking.delivery_date}
                    onChange={(e) => setNewBooking({ ...newBooking, delivery_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
                  <Input
                    type="date"
                    value={newBooking.pickup_date}
                    onChange={(e) => setNewBooking({ ...newBooking, pickup_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waste Type</label>
                  <Select
                    value={newBooking.waste_type}
                    onValueChange={(value) => setNewBooking({ ...newBooking, waste_type: value })}>
                    <option value="general">General</option>
                    <option value="construction">Construction</option>
                    <option value="green_waste">Green Waste</option>
                    <option value="mixed">Mixed</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                  <Input
                    placeholder="0.00"
                    value={newBooking.total_amount}
                    onChange={(e) => setNewBooking({ ...newBooking, total_amount: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddBooking}
                className="bg-blue-600 hover:bg-blue-700 text-white">
                Create Booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Booking Details Dialog */}
        <Dialog
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
          <DialogContent className="max-w-lg bg-white text-black z-50 relative">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-black">Booking Details</DialogTitle>
                <button
                  onClick={() => setShowDetailDialog(false)}
                  className="text-gray-400 hover:text-black">
                  ×
                </button>
              </div>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-black">Customer</label>
                    <p className="font-medium text-black">{selectedBooking.customer_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-black">Status</label>
                    <div>
                      <Badge className={getStatusBadge(selectedBooking.status)}>{selectedBooking.status}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-black">Booking #</label>
                    <p className="font-medium text-black">{selectedBooking.bin_number}</p>
                  </div>
                  <div>
                    <label className="text-sm text-black">Bin Size</label>
                    <p className="font-medium text-black">{selectedBooking.bin_size}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-black">Location</label>
                  <p className="font-medium text-black">{selectedBooking.location}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-black">Delivery Date</label>
                    <p className="font-medium text-black">{selectedBooking.start_date}</p>
                  </div>
                  <div>
                    <label className="text-sm text-black">Pickup Date</label>
                    <p className="font-medium text-black">{selectedBooking.end_date}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 flex-wrap">
                  <Button
                    size="sm"
                    variant={selectedBooking.status === "confirmed" ? "default" : "outline"}
                    className={selectedBooking.status === "confirmed" ? "bg-blue-600 text-white" : ""}
                    onClick={async () => {
                      if (!selectedBooking) return;
                      const { data, error } = await supabase.from("bookings").update({ status: "confirmed" }).eq("id", selectedBooking.id).select();
                      if (!error && data && data.length > 0) {
                        setBookings((prev) => prev.map((b) => (b.id === selectedBooking.id ? { ...b, status: "confirmed" } : b)));
                        setSelectedBooking({ ...selectedBooking, status: "confirmed" });
                        // Update bin status to "booked" when confirmed
                        if (selectedBooking.bin_number) {
                          console.log("Updating bin status to booked for bin:", selectedBooking.bin_number);
                          await supabase.from("skip_bins").update({ status: "booked" }).eq("bin_number", selectedBooking.bin_number);
                        }
                      }
                    }}>
                    Mark as Confirmed
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedBooking.status === "delivered" ? "default" : "outline"}
                    className={selectedBooking.status === "delivered" ? "bg-green-600 text-white" : ""}
                    onClick={async () => {
                      if (!selectedBooking) return;
                      const { data, error } = await supabase.from("bookings").update({ status: "delivered" }).eq("id", selectedBooking.id).select();
                      if (!error && data && data.length > 0) {
                        setBookings((prev) => prev.map((b) => (b.id === selectedBooking.id ? { ...b, status: "delivered" } : b)));
                        setSelectedBooking({ ...selectedBooking, status: "delivered" });
                        // Update bin status to "in_use" when delivered
                        if (selectedBooking.bin_number) {
                          console.log("Updating bin status to in_use for bin:", selectedBooking.bin_number);
                          await supabase.from("skip_bins").update({ status: "delivered" }).eq("bin_number", selectedBooking.bin_number);
                        }
                      }
                    }}>
                    Mark as Delivered
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedBooking.status === "collected" ? "default" : "outline"}
                    className={selectedBooking.status === "collected" ? "bg-purple-600 text-white" : ""}
                    onClick={async () => {
                      if (!selectedBooking) return;
                      const { data, error } = await supabase.from("bookings").update({ status: "collected" }).eq("id", selectedBooking.id).select();
                      if (!error && data && data.length > 0) {
                        setBookings((prev) => prev.map((b) => (b.id === selectedBooking.id ? { ...b, status: "collected" } : b)));
                        setSelectedBooking({ ...selectedBooking, status: "collected" });
                        // Update bin status back to "available" when collected
                        if (selectedBooking.bin_number) {
                          console.log("Updating bin status to available for bin:", selectedBooking.bin_number);
                          await supabase.from("skip_bins").update({ status: "available" }).eq("bin_number", selectedBooking.bin_number);
                        }
                      }
                    }}>
                    Mark as Collected
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="bg-red-600 text-white"
                    onClick={async () => {
                      if (!selectedBooking) return;
                      // Delete booking
                      const { error } = await supabase.from("bookings").delete().eq("id", selectedBooking.id);
                      if (!error) {
                        setBookings((prev) => prev.filter((b) => b.id !== selectedBooking.id));
                        setShowDetailDialog(false);
                        // Set bin status to available if it was assigned
                        if (selectedBooking.bin_number) {
                          await supabase.from("skip_bins").update({ status: "available" }).eq("bin_number", selectedBooking.bin_number);
                        }
                      }
                    }}>
                    Delete Booking
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
