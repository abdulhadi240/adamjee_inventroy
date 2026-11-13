"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Coins, PackageMinus, ShoppingBag, TrendingUp } from "lucide-react";

import DashboardHero from "@/components/features/dashboard/DashboardHero";
import BestSellingTable from "@/components/features/dashboard/BestSellingTable";
import LowStockList from "@/components/features/dashboard/LowStockList";
import PurchasePipeline from "@/components/features/dashboard/PurchasePipeline";
import SalesPurchaseChart from "@/components/features/dashboard/SalesPurchaseChart";
import OrderSummaryChart from "@/components/features/dashboard/OrderSummaryChart";
import { Stagger, StatTile } from "@/components/ui/motion";
import { DashboardData } from "@/lib/types";

export default function DashboardClientWrapper({
  data,
}: {
  data: DashboardData;
}) {
  const router = useRouter();

  // Refresh server data whenever stock, sales or orders change
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase.channel("dashboard-realtime");
    for (const table of ["sales", "sales_items", "orders", "products"]) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => router.refresh()
      );
    }
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const margin =
    data.sales.revenue > 0 ? (data.sales.profit / data.sales.revenue) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      <DashboardHero
        inventory={data.inventory}
        lowStockCount={data.lowStock.length}
      />

      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          featured
          label="Revenue"
          value={data.sales.revenue}
          format="currency"
          icon={TrendingUp}
          hint="All-time sales"
        />
        <StatTile
          label="Gross profit"
          value={data.sales.profit}
          format="currency"
          icon={Coins}
          tone="green"
          hint={`${margin.toFixed(1)}% margin`}
        />
        <StatTile
          label="Units sold"
          value={data.sales.quantitySold}
          icon={ShoppingBag}
          tone="glow"
          hint={`Cost of goods ${new Intl.NumberFormat("en-PK", {
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(data.sales.cost)}`}
        />
        <StatTile
          label="Purchase spend"
          value={data.purchase.cost}
          format="currency"
          icon={PackageMinus}
          tone="amber"
          hint={`${data.purchase.purchase} purchase orders`}
        />
      </Stagger>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SalesPurchaseChart data={data.charts} />
        <OrderSummaryChart data={data.charts} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <BestSellingTable products={data.bestSelling} />
        <div className="flex flex-col gap-4">
          <LowStockList products={data.lowStock} />
          <PurchasePipeline purchase={data.purchase} products={data.products} />
        </div>
      </div>
    </div>
  );
}
