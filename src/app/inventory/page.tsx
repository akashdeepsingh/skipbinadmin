"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar, TrendingUp, Search, ChevronDown, Eye, MapPin, DollarSign } from "lucide-react";

interface SkipBin {
  id: string;
  bin_number: string;
  size: string;
  status: "available" | "delivered" | "in_use" | "maintenance";
  condition: "excellent" | "good" | "fair" | "needs_repair";
  location: string;
  lastService?: string;
  notes?: string;
}

export default function InventoryPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedBin, setSelectedBin] = useState<SkipBin | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sizeFilter, setSizeFilter] = useState("All Sizes");

  // Fetch bins from Supabase
  const [bins, setBins] = useState<SkipBin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBins = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("skip_bins").select("*");
      if (!error && data) {
        setBins(data as SkipBin[]);
      }
      setLoading(false);
    };
    fetchBins();
  }, []);

  const [newBin, setNewBin] = useState({
    bin_number: "",
    size: "",
    condition: "excellent",
    location: "",
    notes: "",
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      available: "bg-green-100 text-green-800",
      delivered: "bg-purple-100 text-purple-800",
      in_use: "bg-orange-100 text-orange-800",
      maintenance: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStats = () => {
    const total = bins.length;
    const available = bins.filter((b) => b.status === "available").length;
    const delivered = bins.filter((b) => b.status === "delivered").length;
    const inUse = bins.filter((b) => b.status === "in_use").length;
    const maintenance = bins.filter((b) => b.status === "maintenance").length;
    return { total, available, delivered, inUse, maintenance };
  };

  const stats = getStats();

  const handleAddBin = async () => {
    if (!newBin.bin_number || !newBin.size) {
      alert("Please fill in all required fields: Bin Number and Size.");
      return;
    }
    const bin = {
      bin_number: newBin.bin_number,
      size: newBin.size,
      status: "available",
      condition: newBin.condition as "excellent" | "good" | "fair" | "needs_repair",
      location: newBin.location,
      notes: newBin.notes,
    };
    const { data, error } = await supabase.from("skip_bins").insert([bin]).select();
    if (error) {
      alert("Failed to add bin: " + error.message);
      return;
    }
    if (data && data.length > 0) {
      setBins([data[0], ...bins]);
    }
    setNewBin({
      bin_number: "",
      size: "",
      condition: "excellent",
      location: "",
      notes: "",
    });
    setShowAddDialog(false);
  };

  const filteredBins = bins.filter((bin) => {
    const matchesSearch =
      bin.bin_number.toLowerCase().includes(searchTerm.toLowerCase()) || bin.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || bin.status === statusFilter.toLowerCase();
    const matchesSize = sizeFilter === "All Sizes" || bin.size === sizeFilter;
    return matchesSearch && matchesStatus && matchesSize;
  });

  return (
    <div className="flex">
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 bg-white text-black">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black">Skip Bin Inventory</h1>
              <p className="text-black mt-1">Manage and track all your skip bins</p>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              + Add New Bin
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            <Card className="p-4 ">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Bins</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{stats.available}</p>
                <p className="text-sm text-gray-600">available</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{stats.delivered}</p>
                <p className="text-sm text-gray-600">delivered</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{stats.inUse}</p>
                <p className="text-sm text-gray-600">in use</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{stats.maintenance}</p>
                <p className="text-sm text-gray-600">maintenance</p>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div
              className="relative"
              style={{ minWidth: 400, flex: 3 }}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by bin number or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              className="min-w-[140px]">
              <option value="All Status">All Status</option>
              <option value="available">Available</option>
              <option value="delivered">Delivered</option>
              <option value="in_use">In Use</option>
              <option value="maintenance">Maintenance</option>
            </Select>
            <Select
              value={sizeFilter}
              onValueChange={setSizeFilter}
              className="min-w-[120px]">
              <option value="All Sizes">All Sizes</option>
              <option value="3 meter cube">3 meter cube</option>
              <option value="4 meter cube">4 meter cube</option>
              <option value="6 meter cube">6 meter cube</option>
              <option value="8 meter cube">8 meter cube</option>
            </Select>
          </div>

          {/* Bins Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBins.map((bin) => (
              <Card
                key={bin.id}
                className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{bin.bin_number}</h3>
                    <p className="text-2xl font-bold text-blue-600">{bin.size}</p>
                  </div>
                  <Badge className={getStatusBadge(bin.status)}>{bin.status}</Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{bin.location}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Condition: </span>
                    <span className="font-medium">{bin.condition}</span>
                  </div>
                  {bin.lastService && <div className="text-sm text-gray-600">Last service: {bin.lastService}</div>}
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedBin(bin);
                    setShowDetailDialog(true);
                  }}
                  className="w-full flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  View Details
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Add New Bin Dialog */}
      <Dialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-black">Add New Skip Bin</DialogTitle>
            <button
              onClick={() => setShowAddDialog(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black">
              ×
            </button>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bin Number *</label>
              <Input
                placeholder="BIN-001"
                value={newBin.bin_number}
                onChange={(e) => setNewBin({ ...newBin, bin_number: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
              <Select
                value={newBin.size}
                onValueChange={(value) => setNewBin({ ...newBin, size: value })}>
                <option value="">Select size</option>
                <option value="6 yard">6 yard</option>
                <option value="8 yard">8 yard</option>
                <option value="10 yard">10 yard</option>
                <option value="15 yard">15 yard</option>
                <option value="20 yard">20 yard</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <Select
                value={newBin.condition}
                onValueChange={(value) => setNewBin({ ...newBin, condition: value })}>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="needs_repair">Needs Repair</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
              <Input
                placeholder="Depot address or current location"
                value={newBin.location}
                onChange={(e) => setNewBin({ ...newBin, location: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <Textarea
                placeholder="Additional notes about this bin..."
                value={newBin.notes}
                onChange={(e) => setNewBin({ ...newBin, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddBin}
              className="bg-blue-600 hover:bg-blue-700 text-white">
              Add Bin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bin Details Dialog */}
      <Dialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg bg-white text-black">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-black">
                Skip Bin Details
                {selectedBin && <Badge className={getStatusBadge(selectedBin.status)}>{selectedBin.status}</Badge>}
              </DialogTitle>
              <button
                onClick={() => setShowDetailDialog(false)}
                className="text-gray-400 hover:text-black">
                ×
              </button>
            </div>
          </DialogHeader>

          {selectedBin && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="font-medium text-black mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-black">Bin Number</span>
                    <p className="font-medium text-black">{selectedBin.bin_number}</p>
                  </div>
                  <div>
                    <span className="text-black">Size</span>
                    <p className="font-medium text-blue-600">{selectedBin.size}</p>
                  </div>
                  <div>
                    <span className="text-black">Condition</span>
                    <p className="font-medium text-black">{selectedBin.condition}</p>
                  </div>
                </div>
              </div>

              {/* Current Location */}
              <div>
                <h3 className="font-medium text-black mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Current Location
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-black">depot</p>
                  <p className="font-medium text-black">{selectedBin.location}</p>
                </div>
              </div>

              {/* Service Information */}
              <div>
                <h3 className="font-medium text-black mb-2 flex items-center gap-2">🔧 Service Information</h3>
                <div className="text-sm">
                  <span className="text-black">Last Service Date</span>
                  <p className="font-medium text-black">{selectedBin.lastService || "No service recorded"}</p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="font-medium text-black mb-2 flex items-center gap-2">📝 Notes</h3>
                <p className="text-sm text-black">{selectedBin.notes || "No notes available"}</p>
              </div>

              {/* Quick Status Updates */}
              <div>
                <h3 className="font-medium text-black mb-3">Quick Status Updates</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant={selectedBin.status === "available" ? "default" : "outline"}
                    className={selectedBin.status === "available" ? "bg-green-600 text-white" : ""}
                    onClick={async () => {
                      if (!selectedBin) return;
                      const { data, error } = await supabase.from("skip_bins").update({ status: "available" }).eq("id", selectedBin.id).select();
                      if (!error && data && data.length > 0) {
                        setBins((prev) => prev.map((b) => (b.id === selectedBin.id ? { ...b, status: "available" } : b)));
                        setSelectedBin({ ...selectedBin, status: "available" });
                      }
                    }}>
                    Mark as available
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedBin.status === "maintenance" ? "default" : "outline"}
                    className={selectedBin.status === "maintenance" ? "bg-red-600 text-white" : ""}
                    onClick={async () => {
                      if (!selectedBin) return;
                      const { data, error } = await supabase.from("skip_bins").update({ status: "maintenance" }).eq("id", selectedBin.id).select();
                      if (!error && data && data.length > 0) {
                        setBins((prev) => prev.map((b) => (b.id === selectedBin.id ? { ...b, status: "maintenance" } : b)));
                        setSelectedBin({ ...selectedBin, status: "maintenance" });
                      }
                    }}>
                    Mark as maintenance
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedBin.status === "in_use" ? "default" : "outline"}
                    className={selectedBin.status === "in_use" ? "bg-orange-600 text-white" : ""}
                    onClick={async () => {
                      if (!selectedBin) return;
                      const { data, error } = await supabase.from("skip_bins").update({ status: "in_use" }).eq("id", selectedBin.id).select();
                      if (!error && data && data.length > 0) {
                        setBins((prev) => prev.map((b) => (b.id === selectedBin.id ? { ...b, status: "in_use" } : b)));
                        setSelectedBin({ ...selectedBin, status: "in_use" });
                      }
                    }}>
                    Mark as in use
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
