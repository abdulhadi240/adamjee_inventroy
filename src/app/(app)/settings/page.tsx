import { createClientServer } from "@/lib/supabase/server";
import SettingsClientWrapper from "@/components/features/settings/SettingsClientWrapper";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/auth";

export default async function SettingsPage() {
  const supabase = await createClientServer();

  const authUser = await getAuthUser(supabase);

  if (!authUser) {
    redirect("/login");
  }

  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id) 
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
  }

  const userData = {
    id: authUser.id,
    email: authUser.email,
    ...userProfile,
  };

  return (
    <div>
      <SettingsClientWrapper user={userData} />
    </div>
  );
}