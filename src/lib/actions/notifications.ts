"use server";

import { createClientServer } from "@/lib/supabase/server";
import { StockAlert } from "@/lib/types";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

export async function getLowStockNotifications() {
  const supabase = await createClientServer();

  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, product_name, amount_stock, product_image")
      .lt("amount_stock", LOW_STOCK_THRESHOLD)
      // Bundles (always 1) and parts sold out of a bundle (always 0) opt out
      .eq("low_stock_alerts", true)
      .order("amount_stock", { ascending: true })
      .limit(20);

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    return data as StockAlert[];
  } catch (error) {
    console.error("Unexpected error in getLowStockNotifications:", error);
    return [];
  }
}
