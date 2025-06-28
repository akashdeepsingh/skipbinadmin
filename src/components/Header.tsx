"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setEmail(data.user.email ?? null);
    });
  }, []);

  return (
    <header className="w-full bg-indigo-600 text-white shadow p-4 flex justify-end">
      {email && (
        <span className="text-lg">
          Welcome, <strong>{email}</strong>
        </span>
      )}
    </header>
  );
}
