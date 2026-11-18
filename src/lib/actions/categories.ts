"use server";

import { createClientServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Category, CategoryWithCount, FormState } from "@/lib/types";
import { getAuthUser } from "@/lib/supabase/auth";

const UNIQUE_VIOLATION = "23505";

function revalidateCategoryPaths() {
  revalidatePath("/categories");
  revalidatePath("/inventory");
  revalidatePath("/reports");
}

/** All categories, alphabetically. Used by the product forms' dropdown. */
export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error.message);
    return [];
  }

  return data;
}

/** All categories with the number of products filed under each. */
export async function getCategoriesWithCounts(
  searchQuery?: string
): Promise<CategoryWithCount[]> {
  const supabase = await createClientServer();

  let query = supabase.from("categories").select("id, name").order("name");
  if (searchQuery) {
    query = query.ilike("name", `%${searchQuery}%`);
  }

  const [categoriesResult, productsResult] = await Promise.all([
    query,
    supabase
      .from("products")
      .select("product_category")
      .is("archived_at", null),
  ]);

  if (categoriesResult.error) throw categoriesResult.error;
  if (productsResult.error) throw productsResult.error;

  const counts = new Map<string, number>();
  for (const product of productsResult.data) {
    const key = product.product_category;
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return categoriesResult.data.map((category) => ({
    ...category,
    product_count: counts.get(category.name) ?? 0,
  }));
}

export async function insertCategory(
  previousState: FormState<Category>,
  formData: FormData
): Promise<FormState<Category>> {
  const supabase = await createClientServer();

  const user = await getAuthUser(supabase);

  if (!user) {
    return { success: false, message: "User not authenticated." };
  }

  const name = ((formData.get("name") as string) ?? "").trim();
  if (!name) {
    return { success: false, message: "Category name is required." };
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ name, user_id: user.id })
    .select("id, name")
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { success: false, message: `Category "${name}" already exists.` };
    }
    console.error("Failed to insert category:", error.message);
    return {
      success: false,
      message: `Failed to add category: ${error.message}`,
    };
  }

  revalidateCategoryPaths();
  return { success: true, message: "Category added successfully!", data };
}

/**
 * Renames a category and moves its products along, since products store the
 * category by name.
 */
export async function updateCategory(
  id: number,
  newName: string
): Promise<FormState> {
  const supabase = await createClientServer();

  const name = newName.trim();
  if (!name) {
    return { success: false, message: "Category name is required." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("categories")
    .select("name")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return { success: false, message: "Category not found." };
  }

  if (existing.name === name) {
    return { success: true, message: "No changes." };
  }

  const { error } = await supabase
    .from("categories")
    .update({ name })
    .eq("id", id);

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { success: false, message: `Category "${name}" already exists.` };
    }
    console.error("Update Category Error:", error.message);
    return { success: false, message: error.message };
  }

  const { error: productsError } = await supabase
    .from("products")
    .update({ product_category: name })
    .eq("product_category", existing.name);

  if (productsError) {
    console.error("Rename products' category failed:", productsError.message);
    // Put the old name back so products and category stay in sync
    await supabase
      .from("categories")
      .update({ name: existing.name })
      .eq("id", id);
    return {
      success: false,
      message: `Rename failed: ${productsError.message}`,
    };
  }

  revalidateCategoryPaths();
  return { success: true, message: "Category renamed successfully." };
}

/** Deletes a category, unless products are still filed under it. */
export async function deleteCategory(id: number): Promise<FormState> {
  const supabase = await createClientServer();

  const { data: existing, error: fetchError } = await supabase
    .from("categories")
    .select("name")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return { success: false, message: "Category not found." };
  }

  const { count, error: countError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("product_category", existing.name)
    .is("archived_at", null);

  if (countError) {
    return { success: false, message: countError.message };
  }

  if (count && count > 0) {
    return {
      success: false,
      message: `"${existing.name}" is used by ${count} product${
        count === 1 ? "" : "s"
      }. Move them to another category first.`,
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    console.error("Delete Category Error:", error.message);
    return { success: false, message: error.message };
  }

  revalidateCategoryPaths();
  return { success: true, message: "Category deleted successfully." };
}
