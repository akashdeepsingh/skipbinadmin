/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabaseClient";

interface Booking {
  id: string;
  customer_name: string;
  start_date: string;
  end_date: string;
  bins: { bin_number: string };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [binId, setBinId] = useState("");
  const [customer, setCustomer] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const fetchBookings = async () => {
    const { data } = await supabase.from("bookings").select("*, bins(bin_number)");
    setBookings(data || []);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const addBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("bookings").insert({ bin_id: binId, customer_name: customer, start_date: start, end_date: end });
    setBinId("");
    setCustomer("");
    setStart("");
    setEnd("");
    fetchBookings();
  };

  return (
    <div className="flex w-full">
      <Sidebar />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Bookings</h2>
        <form
          onSubmit={addBooking}
          className="grid grid-cols-4 gap-4 mb-8">
          <input
            placeholder="Bin ID"
            value={binId}
            onChange={(e) => setBinId(e.target.value)}
            className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300"
          />
          <input
            placeholder="Customer"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300"
          />
          <button
            type="submit"
            className="col-span-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition">
            Add Booking
          </button>
        </form>

        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Bin", "Customer", "From", "To"].map((head) => (
                  <th
                    key={head}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b, idx) => (
                <tr
                  key={b.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{b.bins.bin_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{b.customer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{b.start_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{b.end_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
