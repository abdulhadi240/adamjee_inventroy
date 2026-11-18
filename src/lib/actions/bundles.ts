"use server";

import { createClientServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  Bundle,
  BundleContents,
  BundleComponentInput,
  BundleFormOptions,
  FormState,
} from "@/lib/types";
import {
  DEFAULT_BUNDLE_TYPES,
  DEFAULT_COMPONENT_NAMES,
} from "@/lib/constants";

// Both bundles and bundle_components point at products, so every embed names
// the foreign key it follows.
const BUNDLE_SELECT = `
  id, bundle_type, total_cost, notes, created_at,
  product:products!bundles_product_id_fkey!inner (
    id, product_name, sell_price, amount_stock,
    supplier:suppliers ( id, supplier_name )
  ),
  components:bundle_components (
    id, name, model, product_id, quantity, unit_cost, removed_quantity, removed_at,
    removed_product:products!bundle_components_removed_product_id_fkey (
      id, product_name, amount_stock
    ),
    sales:sales_items!sales_items_bundle_component_id_fkey (
      quantity, price_at_sale,
      sale:sales ( id, invoice_code, sale_date )
    )
  )
`;

function sortComponents(bundle: Bundle): Bundle {
  bundle.components.sort((a, b) => a.id - b.id);
  return bundle;
}

function revalidateBundlePaths(bundleId?: number) {
  revalidatePath("/bundles");
  if (bundleId) revalidatePath(`/bundles/${bundleId}`);
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}

function revalidateSalesPaths() {
  revalidatePath("/sales");
  revalidatePath("/reports");
  revalidatePath("/customers");
}

/** Case-insensitive de-duplication that keeps the first spelling seen. */
function uniqueNames(names: (string | null | undefined)[]): string[] {
  const seen = new Map<string, string>();
  for (const raw of names) {
    const name = raw?.trim();
    if (name && !seen.has(name.toLowerCase())) {
      seen.set(name.toLowerCase(), name);
    }
  }
  return [...seen.values()];
}

export async function getBundles(searchQuery?: string): Promise<Bundle[]> {
  const supabase = await createClientServer();

  let query = supabase
    .from("bundles")
    .select(BUNDLE_SELECT)
    // A bundle whose product was deleted after being sold is archived, not gone
    .is("product.archived_at", null)
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.ilike("product.product_name", `%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching bundles:", error.message);
    return [];
  }

  return (data as unknown as Bundle[]).map(sortComponents);
}

/**
 * Every bundle's parts, keyed by the id of the product that represents it.
 * Feeds the "parts" dropdown shown wherever a bundle's product appears.
 */
export async function getBundleContentsMap(): Promise<
  Record<number, BundleContents>
> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from("bundles")
    .select(
      `
      id, bundle_type, total_cost, product_id,
      components:bundle_components (
        id, name, model, quantity, unit_cost, removed_quantity
      )
    `
    );

  if (error) {
    console.error("Error fetching bundle contents:", error.message);
    return {};
  }

  const map: Record<number, BundleContents> = {};
  for (const bundle of data) {
    map[bundle.product_id] = {
      bundle_id: bundle.id,
      bundle_type: bundle.bundle_type,
      total_cost: Number(bundle.total_cost),
      components: [...bundle.components].sort((a, b) => a.id - b.id),
    };
  }
  return map;
}

export async function getBundleById(id: number): Promise<Bundle | null> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from("bundles")
    .select(BUNDLE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching bundle:", error.message);
    return null;
  }

  return data ? sortComponents(data as unknown as Bundle) : null;
}

/** Pick-lists for the bundle forms, built from what the user has entered so far. */
export async function getBundleFormOptions(): Promise<BundleFormOptions> {
  const supabase = await createClientServer();

  const [
    types,
    componentNames,
    categories,
    suppliers,
    products,
    bundles,
    customers,
  ] =
    await Promise.all([
      supabase.from("bundles").select("bundle_type"),
      supabase.from("bundle_components").select("name"),
      supabase.from("categories").select("id, name").order("name"),
      supabase
        .from("suppliers")
        .select("id, supplier_name")
        .order("supplier_name"),
      supabase
        .from("products")
        .select("id, product_name, amount_stock, buy_price")
        // Skips bundles and catalog entries created for parts sold out of one
        .eq("low_stock_alerts", true)
        .is("archived_at", null)
        .order("product_name"),
      supabase.from("bundles").select("product_id"),
      supabase.from("customers").select("id, name").order("name"),
    ]);

  const bundleProductIds = new Set(
    (bundles.data ?? []).map((b) => b.product_id)
  );

  return {
    types: uniqueNames([
      ...DEFAULT_BUNDLE_TYPES,
      ...(types.data ?? []).map((t) => t.bundle_type),
    ]),
    componentNames: uniqueNames([
      ...DEFAULT_COMPONENT_NAMES,
      ...(componentNames.data ?? []).map((c) => c.name),
    ]),
    categories: categories.data ?? [],
    suppliers: suppliers.data ?? [],
    customers: customers.data ?? [],
    // A bundle cannot receive loose components
    products: (products.data ?? []).filter((p) => !bundleProductIds.has(p.id)),
  };
}

export async function createBundle(input: {
  name: string;
  bundle_type: string;
  total_cost: number;
  sell_price: number;
  supplier_id: number | null;
  notes: string;
  components: BundleComponentInput[];
}): Promise<FormState<{ id: number }>> {
  const supabase = await createClientServer();

  if (!input.name.trim() || !input.bundle_type.trim()) {
    return { success: false, message: "Bundle name and type are required." };
  }
  if (!Number.isFinite(input.total_cost) || input.total_cost < 0) {
    return { success: false, message: "Enter a valid total cost." };
  }

  const { data, error } = await supabase.rpc("create_bundle", {
    p_name: input.name,
    p_bundle_type: input.bundle_type,
    p_total_cost: input.total_cost,
    p_sell_price: Number.isFinite(input.sell_price) ? input.sell_price : 0,
    p_supplier_id: input.supplier_id,
    p_notes: input.notes,
    p_components: input.components,
  });

  if (error) {
    console.error("Create Bundle Error:", error.message);
    return { success: false, message: error.message };
  }

  revalidateBundlePaths();
  revalidatePath("/categories");
  return {
    success: true,
    message: "Bundle added successfully!",
    data: { id: data as number },
  };
}

export async function updateBundle(
  id: number,
  input: {
    name: string;
    bundle_type: string;
    total_cost: number;
    sell_price: number;
    notes: string;
  }
): Promise<FormState> {
  const supabase = await createClientServer();

  const name = input.name.trim();
  const bundleType = input.bundle_type.trim();
  if (!name || !bundleType) {
    return { success: false, message: "Bundle name and type are required." };
  }
  if (
    !Number.isFinite(input.total_cost) ||
    input.total_cost < 0 ||
    !Number.isFinite(input.sell_price) ||
    input.sell_price < 0
  ) {
    return { success: false, message: "Enter valid prices." };
  }

  const { data: bundle, error: fetchError } = await supabase
    .from("bundles")
    .select("product_id, user_id")
    .eq("id", id)
    .single();

  if (fetchError || !bundle) {
    return { success: false, message: "Bundle not found." };
  }

  // The type doubles as the product category, so make sure it exists there.
  // 23505 just means it already does.
  const { error: categoryError } = await supabase
    .from("categories")
    .insert({ name: bundleType, user_id: bundle.user_id });
  if (categoryError && categoryError.code !== "23505") {
    console.error("Bundle category error:", categoryError.message);
  }

  // The trigger on bundles recalculates the product's cost from total_cost
  const { error } = await supabase
    .from("bundles")
    .update({
      bundle_type: bundleType,
      total_cost: input.total_cost,
      notes: input.notes.trim() || null,
    })
    .eq("id", id);

  if (error) {
    console.error("Update Bundle Error:", error.message);
    return { success: false, message: error.message };
  }

  const { error: productError } = await supabase
    .from("products")
    .update({
      product_name: name,
      product_category: bundleType,
      sell_price: input.sell_price,
    })
    .eq("id", bundle.product_id);

  if (productError) {
    console.error("Update Bundle Product Error:", productError.message);
    return { success: false, message: productError.message };
  }

  revalidateBundlePaths(id);
  revalidatePath("/categories");
  return { success: true, message: "Bundle updated." };
}

/** Deletes a bundle and its inventory item. Taken-out components stay in inventory. */
export async function deleteBundle(id: number): Promise<FormState> {
  const supabase = await createClientServer();

  const { data: bundle, error: fetchError } = await supabase
    .from("bundles")
    .select("product_id")
    .eq("id", id)
    .single();

  if (fetchError || !bundle) {
    return { success: false, message: "Bundle not found." };
  }

  // Deleting the product cascades to the bundle and its components
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", bundle.product_id);

  if (error) {
    console.error("Delete Bundle Error:", error.message);
    // 23503: the product appears on a sale or purchase order
    return {
      success: false,
      message:
        error.code === "23503"
          ? "This bundle is part of a sale or purchase order, so it can't be deleted."
          : error.message,
    };
  }

  revalidateBundlePaths();
  return { success: true, message: "Bundle deleted." };
}

function validateComponent(input: BundleComponentInput): string | null {
  if (!input.name.trim()) return "Component name is required.";
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    return "Quantity must be a whole number above zero.";
  }
  if (!Number.isFinite(input.unit_cost) || input.unit_cost < 0) {
    return "Enter a valid cost.";
  }
  return null;
}

export async function addBundleComponent(
  bundleId: number,
  input: BundleComponentInput
): Promise<FormState> {
  const invalid = validateComponent(input);
  if (invalid) return { success: false, message: invalid };

  const supabase = await createClientServer();

  const { data: bundle, error: fetchError } = await supabase
    .from("bundles")
    .select("user_id")
    .eq("id", bundleId)
    .single();

  if (fetchError || !bundle) {
    return { success: false, message: "Bundle not found." };
  }

  const { error } = await supabase.from("bundle_components").insert({
    bundle_id: bundleId,
    name: input.name.trim(),
    model: input.model.trim() || null,
    product_id: input.product_id,
    quantity: input.quantity,
    unit_cost: input.unit_cost,
    user_id: bundle.user_id,
  });

  if (error) {
    console.error("Add Component Error:", error.message);
    return { success: false, message: error.message };
  }

  revalidateBundlePaths(bundleId);
  return { success: true, message: "Component added." };
}

export async function updateBundleComponent(
  bundleId: number,
  componentId: number,
  input: BundleComponentInput
): Promise<FormState> {
  const invalid = validateComponent(input);
  if (invalid) return { success: false, message: invalid };

  const supabase = await createClientServer();

  const { error } = await supabase
    .from("bundle_components")
    .update({
      name: input.name.trim(),
      model: input.model.trim() || null,
      product_id: input.product_id,
      quantity: input.quantity,
      unit_cost: input.unit_cost,
    })
    .eq("id", componentId)
    .eq("bundle_id", bundleId);

  if (error) {
    console.error("Update Component Error:", error.message);
    // 23514: quantity dropped below the number already taken out
    return {
      success: false,
      message:
        error.code === "23514"
          ? "Quantity can't be lower than the number already taken out."
          : error.message,
    };
  }

  revalidateBundlePaths(bundleId);
  return { success: true, message: "Component updated." };
}

export async function deleteBundleComponent(
  bundleId: number,
  componentId: number
): Promise<FormState> {
  const supabase = await createClientServer();

  // Only untouched components can be removed; taken-out ones are history
  const { data, error } = await supabase
    .from("bundle_components")
    .delete()
    .eq("id", componentId)
    .eq("bundle_id", bundleId)
    .eq("removed_quantity", 0)
    .select("id");

  if (error) {
    console.error("Delete Component Error:", error.message);
    return { success: false, message: error.message };
  }
  if (!data.length) {
    return {
      success: false,
      message: "Undo this component's sale before deleting it.",
    };
  }

  revalidateBundlePaths(bundleId);
  return { success: true, message: "Component deleted." };
}

/**
 * Takes units of a component out of the bundle and sells them in one step:
 * records the sale and lowers the bundle's worth by their cost.
 */
export async function sellBundleComponent(
  bundleId: number,
  componentId: number,
  input: {
    quantity: number;
    sell_price: number;
    customer_id: number | null;
    payment_method: string;
    payment_status: string;
  },
): Promise<FormState<{ sale_id: number }>> {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    return { success: false, message: "Enter a valid quantity." };
  }
  if (!Number.isFinite(input.sell_price) || input.sell_price < 0) {
    return { success: false, message: "Enter the price it sold for." };
  }

  const supabase = await createClientServer();

  const { data, error } = await supabase.rpc("sell_bundle_component", {
    p_component_id: componentId,
    p_quantity: input.quantity,
    p_sell_price: input.sell_price,
    p_customer_id: input.customer_id,
    p_payment_method: input.payment_method,
    p_payment_status: input.payment_status,
  });

  if (error) {
    console.error("Sell Component Error:", error.message);
    return { success: false, message: error.message };
  }

  revalidateBundlePaths(bundleId);
  revalidateSalesPaths();
  return {
    success: true,
    message: "Component sold.",
    data: { sale_id: data as number },
  };
}

/** Cancels a component's separate sales and puts the units back in the bundle. */
export async function undoBundleComponentSale(
  bundleId: number,
  componentId: number,
): Promise<FormState> {
  const supabase = await createClientServer();

  const { error } = await supabase.rpc("undo_bundle_component_sale", {
    p_component_id: componentId,
  });

  if (error) {
    console.error("Undo Component Sale Error:", error.message);
    return { success: false, message: error.message };
  }

  revalidateBundlePaths(bundleId);
  revalidateSalesPaths();
  return { success: true, message: "Sale cancelled; component is back." };
}
