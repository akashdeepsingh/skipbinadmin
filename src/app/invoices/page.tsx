"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, FileText, Eye, Download, Send } from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  customer: string;
  date: string;
  due_date: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
}

export default function InvoicesPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch invoices from Supabase
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("invoices").select("*").order("date", { ascending: false });
      if (!error && data) {
        setInvoices(data as Invoice[]);
      }
      setLoading(false);
    };
    fetchInvoices();
  }, []);

  const [newInvoice, setNewInvoice] = useState({
    customer: "",
    date: new Date().toISOString().split("T")[0],
    due_date: "",
    amount: "",
    description: "",
    status: "draft" as "draft" | "sent" | "paid" | "overdue",
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStats = () => {
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = invoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0);
    const outstanding = totalInvoiced - totalPaid;
    return { totalInvoiced, totalPaid, outstanding };
  };

  const stats = getStats();

  const handleCreateInvoice = async () => {
    const invoice = {
      invoice_number: `INV-${(invoices.length + 1).toString().padStart(3, "0")}`,
      customer: newInvoice.customer,
      date: newInvoice.date,
      due_date: newInvoice.due_date,
      amount: parseFloat(newInvoice.amount),
      status: newInvoice.status,
      description: newInvoice.description,
    };
    const { data, error } = await supabase.from("invoices").insert([invoice]).select();
    if (!error && data && data.length > 0) {
      setInvoices([data[0], ...invoices]);
    }
    setNewInvoice({
      customer: "",
      date: new Date().toISOString().split("T")[0],
      due_date: "",
      amount: "",
      description: "",
      status: "draft",
    });
    setShowCreateDialog(false);
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) || invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-gray-50">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoicing</h1>
              <p className="text-gray-600 mt-1">Track and manage all customer invoices.</p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              + Create Invoice
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Invoiced</h3>
                <p className="text-3xl font-bold text-black">${stats.totalInvoiced.toFixed(0)}</p>
              </div>
            </Card>

            <Card className="p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Paid</h3>
                <p className="text-3xl font-bold text-green-600">${stats.totalPaid.toFixed(0)}</p>
              </div>
            </Card>

            <Card className="p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Outstanding</h3>
                <p className="text-3xl font-bold text-orange-600">${stats.outstanding.toFixed(0)}</p>
              </div>
            </Card>
          </div>

          {/* All Invoices Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-medium text-gray-900">All Invoices</h2>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-gray-500">
                        No invoices found
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoice_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.customer}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.due_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusBadge(invoice.status)}>{invoice.status}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-600 hover:text-gray-900">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-600 hover:text-gray-900">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-600 hover:text-gray-900">
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create Invoice Dialog */}
        <Dialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <button
                onClick={() => setShowCreateDialog(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                ×
              </button>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                <Select
                  value={newInvoice.customer}
                  onValueChange={(value) => setNewInvoice({ ...newInvoice, customer: value })}>
                  <option value="">Select a customer</option>
                  <option value="ABC Construction Co.">ABC Construction Co.</option>
                  <option value="Green Valley Landscaping">Green Valley Landscaping</option>
                  <option value="Home Renovation Inc.">Home Renovation Inc.</option>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                  <Input
                    type="date"
                    value={newInvoice.date}
                    onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <Input
                    type="date"
                    value={newInvoice.due_date}
                    onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <Input
                  placeholder="0.00"
                  type="number"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Textarea
                  placeholder="Invoice description or notes..."
                  value={newInvoice.description}
                  onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select
                  value={newInvoice.status}
                  onValueChange={(value) => setNewInvoice({ ...newInvoice, status: value as "draft" | "sent" | "paid" | "overdue" })}>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateInvoice}
                className="bg-blue-600 hover:bg-blue-700 text-white">
                Create Invoice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
