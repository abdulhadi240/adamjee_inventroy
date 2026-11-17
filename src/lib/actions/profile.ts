"use server";

import { createClientServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { FormState, User } from "@/lib/types";
import { getLowStockNotifications } from "@/lib/actions/notifications";
import { getAuthUser } from "@/lib/supabase/auth";

export async function getProfile(): Promise<User | null> {
  const supabase = await createClientServer();

  try {
    const authUser = await getAuthUser(supabase);

    if (!authUser) return null;

    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (error) {
      console.error("Error fetching profile DB:", error);
      return {
        id: authUser.id,
        email: authUser.email!,
        name: "User",
        profile_picture: null,
      };
    }

    return {
      id: authUser.id,
      email: authUser.email!,
      name: profile.name || "User",
      profile_picture: profile.profile_picture,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  } catch (error) {
    console.error("Unexpected error in getProfile:", error);
    return null;
  }
}

/**
 * Everything the top bar needs, in one request. Server actions called from
 * the browser run one at a time, so separate calls would queue up.
 */
export async function getTopbarData() {
  const [user, alerts] = await Promise.all([
    getProfile(),
    getLowStockNotifications(),
  ]);
  return { user, alerts };
}

export async function updateProfile(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClientServer();

  const user = await getAuthUser(supabase);

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  const fullName = formData.get("full_name") as string;
  const imageFile = formData.get("profile_picture") as File;

  let publicUrl = null;

  if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
    if (!imageFile.type.startsWith("image/")) {
      return { success: false, message: "File must be an image." };
    }

    if (imageFile.size > 2 * 1024 * 1024) {
      return { success: false, message: "File size must be less than 2MB." };
    }

    const fileName = `${Date.now()}-${imageFile.name}`;
    const filePath = `avatars/${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, imageFile, {
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { success: false, message: "Failed to upload image." };
    }

    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);

    publicUrl = urlData.publicUrl;
  }

  const updateData: Partial<User> = {
    name: fullName,
    updated_at: new Date().toISOString(),
  };

  if (publicUrl) {
    updateData.profile_picture = publicUrl;
  }

  const { error: dbError } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", user.id);

  if (dbError) {
    return { success: false, message: "Failed to update profile." };
  }

  revalidatePath("/settings");
  return { success: true, message: "Profile updated successfully!" };
}
