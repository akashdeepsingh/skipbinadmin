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
    <aside className="w-60 h-screen bg-indigo-600 text-white flex flex-col">
      <div className="p-6 text-2xl font-semibold">SkipBin</div>
      <nav className="flex-1 px-2">
        {links.map(({ href, label }) => {
          const isActive = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={`
                block px-4 py-3 my-1 rounded-lg transition
                ${isActive ? "bg-white text-indigo-600" : "text-white hover:bg-indigo-500"}
              `}>
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
