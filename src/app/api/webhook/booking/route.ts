import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use the public anon key so no service role key is required
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(request: Request) {
  // You may choose to verify a custom header or secret token here
  const { bin_number, customer_name, start_date, end_date } = await request.json();

  // Ensure RLS allows insert from anon key, or create a dedicated webhook policy
  const { data: bin, error: binErr } = await supabase.from("bins").select("id").eq("bin_number", bin_number).single();

  if (binErr || !bin) {
    return NextResponse.json({ error: "Invalid bin_number" }, { status: 400 });
  }

  const { data, error } = await supabase.from("bookings").insert({ bin_id: bin.id, customer_name, start_date, end_date });

  if (error) {
    console.error("Insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ booking: data![0] }, { status: 200 });
}
