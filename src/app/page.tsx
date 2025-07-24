import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = (await cookies()).get("sb-session")?.value;
  if (session) redirect("/dashboard");
  else redirect("/dashboard");
}
