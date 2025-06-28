"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabaseClient";

interface Bin {
  id: string;
  bin_number: string;
  size: string;
  bookings: any[];
}

export default function InventoryPage() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [binNumber, setBinNumber] = useState("");
  const [size, setSize] = useState("");

  const fetchBins = async () => {
    const { data } = await supabase.from("bins").select("*, bookings(*)");
    setBins(data || []);
  };

  useEffect(() => {
    fetchBins();
  }, []);

  const addBin = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("bins").insert({ bin_number: binNumber, size });
    setBinNumber("");
    setSize("");
    fetchBins();
  };

  return (
    <div className="flex w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="p-8 flex-1">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Inventory</h2>
          <form
            onSubmit={addBin}
            className="flex gap-4 mb-8">
            <input
              placeholder="Bin Number"
              value={binNumber}
              onChange={(e) => setBinNumber(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-300"
            />
            <input
              placeholder="Size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-40 px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-300"
            />
            <button
              type="submit"
              className="px-6 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition">
              Add Bin
            </button>
          </form>
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Number", "Size", "Status", "Bookings"].map((head) => (
                    <th
                      key={head}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bins.map((bin, i) => (
                  <tr
                    key={bin.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{bin.bin_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{bin.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          bin.bookings.length ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}>
                        \ n {bin.bookings.length ? "Booked" : "Available"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {bin.bookings.map((b) => (
                        <div
                          key={b.id}
                          className="mb-1">
                          {b.start_date} → {b.end_date}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
