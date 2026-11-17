import { Bundle, BundleComponent } from "@/lib/types";

/** Cost of every unit that has been taken out of the bundle and sold. */
export function getRemovedValue(bundle: Bundle): number {
  return bundle.components.reduce(
    (sum, c) => sum + c.removed_quantity * Number(c.unit_cost),
    0
  );
}

/** What the bundle is worth now: original cost minus what was taken out. */
export function getCurrentWorth(bundle: Bundle): number {
  return Math.max(Number(bundle.total_cost) - getRemovedValue(bundle), 0);
}

/** Cost of all components the bundle came with. */
export function getComponentsValue(bundle: Bundle): number {
  return bundle.components.reduce(
    (sum, c) => sum + c.quantity * Number(c.unit_cost),
    0
  );
}

/** What the separately sold units were sold for. */
export function getRemovedRevenue(bundle: Bundle): number {
  return bundle.components.reduce(
    (sum, c) =>
      sum +
      c.sales.reduce((s, i) => s + i.quantity * Number(i.price_at_sale), 0),
    0,
  );
}

export function getRemovedCount(bundle: Bundle): number {
  return bundle.components.reduce((sum, c) => sum + c.removed_quantity, 0);
}

/** The bundle's inventory item has been sold through Sales. */
export function isBundleSold(bundle: Bundle): boolean {
  return bundle.product.amount_stock <= 0;
}

/** How a component reads in a sentence: the specific part if known. */
export function getComponentLabel(component: BundleComponent): string {
  return component.model || component.name;
}

export function getRemaining(component: BundleComponent): number {
  return component.quantity - component.removed_quantity;
}
