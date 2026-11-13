import OrderClientWrapper from "@/components/features/orders/OrderClientWrapper";
import { getAllProductsForSelect } from "@/lib/actions/products";
import { getAllSuppliers } from "@/lib/actions/suppliers";
import { getOverallOrderStats } from "@/lib/actions/orders";

export const metadata = { title: "Purchase Orders" };

export default async function OrdersPage() {
  const [products, suppliers, stats] = await Promise.all([
    getAllProductsForSelect(),
    getAllSuppliers(),
    getOverallOrderStats(),
  ]);

  const orderStats = stats || {
    pending_count: 0,
    shipped_count: 0,
    pending_value: 0,
    completed_30d_count: 0,
  };

  return (
    <OrderClientWrapper
      products={products}
      suppliers={suppliers}
      stats={orderStats}
    />
  );
}
