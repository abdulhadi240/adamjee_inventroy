import { createClientServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/auth";

export default async function Page() {
  const supabase = await createClientServer();

  const user = await getAuthUser(supabase);
  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
