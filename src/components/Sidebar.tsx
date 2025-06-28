"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const path = usePathname();
  const links = [
    { href: "/inventory", label: "Inventory" },
    { href: "/booking", label: "Bookings" },
  ];

  return (
    <aside className="w-60 bg-white border-r shadow-lg">
      <div className="p-6 text-2xl font-semibold text-blue-600">SkipBin</div>
      <nav className="flex flex-col">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-6 py-3 my-1 text-lg rounded-lg transition-colors hover:bg-blue-100 ${
              path === href ? "bg-blue-500 text-white" : "text-gray-700"
            }`}>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
