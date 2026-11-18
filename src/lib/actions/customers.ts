"use server";

import { createClientServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sanitizePhoneNumber } from "@/lib/utils/formatters";
import { CustomerOption, FormState } from "@/lib/types";
import { getAuthUser } from "@/lib/supabase/auth";

/**
 * Parses the optional phone field of the customer forms.
 * An empty value is valid and stored as null; a non-empty value must
 * sanitize to a valid number.
 */
function parseOptionalContact(
  raw: FormDataEntryValue | null
): { valid: true; value: number | null } | { valid: false } {
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  if (!trimmed) return { valid: true, value: null };

  const contact_number = parseInt(sanitizePhoneNumber(trimmed), 10);
  if (isNaN(contact_number)) return { valid: false };

  return { valid: true, value: contact_number };
}

export async function getAllCustomers() {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from("customers")
    .select("id, name, address, contact_number")
    .order("name");

  if (error) {
    console.error("Error fetching all customers:", error.message);
    return [];
  }

  return data;
}

export async function insertCustomer(
  previousState: FormState<CustomerOption>,
  formData: FormData
): Promise<FormState<CustomerOption>> {
  const supabase = await createClientServer();

  const user = await getAuthUser(supabase);

  if (!user) {
    return { success: false, message: "User not authenticated." };
  }

  const customer_name = ((formData.get("customer_name") as string) || "").trim();
  const address = ((formData.get("address") as string) || "").trim() || null;
  const contact = parseOptionalContact(formData.get("contact_number"));

  if (!customer_name) {
    return { success: false, message: "Customer name is required." };
  }

  if (!contact.valid) {
    return {
      success: false,
      message: "Invalid phone number. Enter digits only or leave it empty.",
    };
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: customer_name,
      address: address,
      contact_number: contact.value,
      user_id: user.id,
    })
    .select("id, name, contact_number")
    .single();

  if (error) {
    console.error("Failed to insert customer:", error.message);
    return {
      success: false,
      message: `Failed to insert customer: ${error.message}`,
    };
  }

  revalidatePath("/customers");
  return {
    success: true,
    message: "Customer added successfully!",
    data: { ...data, id: String(data.id) },
  };
}

export async function updateCustomer(
  previousState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClientServer();
  const id = formData.get("id") as string;
  const customer_name = ((formData.get("customer_name") as string) || "").trim();
  const address = ((formData.get("address") as string) || "").trim() || null;
  const contact = parseOptionalContact(formData.get("contact_number"));

  if (!id) {
    return { success: false, message: "Invalid data." };
  }

  if (!customer_name) {
    return { success: false, message: "Customer name is required." };
  }

  if (!contact.valid) {
    return {
      success: false,
      message: "Invalid phone number. Enter digits only or leave it empty.",
    };
  }

  const { error } = await supabase
    .from("customers")
    .update({
      name: customer_name,
      address,
      contact_number: contact.value,
    })
    .eq("id", id);

  if (error) {
    console.error("Update Customer Error:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath("/customers");
  return { success: true, message: "Customer updated successfully." };
}

export async function deleteCustomer(id: string): Promise<FormState> {
  const supabase = await createClientServer();

  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) {
    console.error("Delete Customer Error:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath("/customers");
  return { success: true, message: "Customer deleted successfully." };
}

export async function getPaginatedCustomersByUser(
  page: number,
  pageSize: number,
  searchQuery? : string
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const supabase = await createClientServer();

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .range(from, to)
    .order("name", { ascending: true });

  if (searchQuery) {
    query = query.ilike("name", `%${searchQuery}%`);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return { data, total: count ?? 0 };
}
