import SaleClientWrapper from "@/components/features/sales/SaleClientWrapper";
import { getAllProductsForSelect } from "@/lib/actions/products";
import { getAllCustomers } from "@/lib/actions/customers";
import { getAllSuppliers } from "@/lib/actions/suppliers";
import { getOverallSalesStats } from "@/lib/actions/sales";

export default async function SalesPage() {
  const [products, customers, suppliers, stats] = await Promise.all([
    getAllProductsForSelect(),
    getAllCustomers(),
    getAllSuppliers(),
    getOverallSalesStats(),
  ]);

  const salesStats = stats || {
    total_revenue: 0,
    total_profit: 0,
    total_transactions: 0,
    today_revenue: 0,
  };

  return (
    <SaleClientWrapper
      products={products}
      customers={customers}
      suppliers={suppliers.map((s) => ({ ...s, id: String(s.id) }))}
      stats={salesStats}
    />
  );
}
