"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.push("/inventory");
  };

  return (
    <main className="flex items-center justify-center w-full h-screen bg-gradient-to-br from-blue-200 to-blue-400">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg space-y-6">
        <h1 className="text-3xl font-bold text-center text-indigo-600">Admin Login</h1>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-indigo-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-indigo-400"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 font-semibold text-white bg-indigo-600 rounded-md shadow hover:bg-indigo-700 transition">
          Login
        </button>
      </form>
    </main>
  );
}
