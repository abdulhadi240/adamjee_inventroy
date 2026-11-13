"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, History } from "lucide-react";
import { getProductHistory } from "@/lib/actions/history";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
} from "@/lib/utils/formatters";
import { AnimatedCard, EmptyState } from "@/components/ui/motion";
import { Product, HistoryItem } from "@/lib/types";

export default function ProductHistoryTab({ product }: { product: Product }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getProductHistory(product.id);
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [product.id]);

  if (loading) {
    return (
      <AnimatedCard className="space-y-2.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-10 rounded-lg bg-canvas" />
        ))}
      </AnimatedCard>
    );
  }

  if (history.length === 0) {
    return (
      <AnimatedCard>
        <EmptyState
          icon={History}
          title="No activity yet"
          description="Restocks and sales of this product will appear here."
        />
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard flush className="overflow-hidden">
      <div className="px-5 py-4">
        <h2 className="card-title">Stock movements</h2>
        <p className="card-subtitle mt-0.5">
          Purchase orders (in) and sales (out) for this product.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Activity</th>
              <th>Party</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Unit price</th>
              <th className="text-right">Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, i) => {
              const isSale = item.type === "sale";
              return (
                <motion.tr
                  key={`${item.type}-${item.id}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i, 10) * 0.02, duration: 0.25 }}
                >
                  <td className="whitespace-nowrap text-muted">
                    {formatDate(item.date, true)}
                  </td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`grid size-7 place-items-center rounded-lg ${
                          isSale
                            ? "bg-rose-50 text-rose-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {isSale ? (
                          <ArrowUpRight className="size-3.5" />
                        ) : (
                          <ArrowDownLeft className="size-3.5" />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-medium">
                          {isSale ? "Sale" : "Restock"}
                        </p>
                        <p className="text-[11px] text-muted">{item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="font-medium">{item.party_name}</td>
                  <td
                    className={`text-right font-semibold tabular-nums ${
                      isSale ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {isSale ? "−" : "+"}
                    {item.quantity}
                  </td>
                  <td className="text-right tabular-nums text-muted">
                    {formatCurrency(item.price_per_unit)}
                  </td>
                  <td className="text-right font-semibold tabular-nums">
                    {formatCurrency(item.total_price)}
                  </td>
                  <td>
                    <span className={`badge ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AnimatedCard>
  );
}
