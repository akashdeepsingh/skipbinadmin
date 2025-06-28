import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
  const { bin_number, customer_name, start_date, end_date } = await request.json();
  const { data: bin } = await supabase.from("bins").select("id").eq("bin_number", bin_number).single();
  if (!bin) return NextResponse.json({ error: "Invalid bin_number" }, { status: 400 });

  const { data, error } = await supabase.from("bookings").insert({ bin_id: bin.id, customer_name, start_date, end_date });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ booking: data![0] }, { status: 200 });
}
