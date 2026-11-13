"use client";

import { AnimatePresence, motion } from "motion/react";
import { Product, StockStats } from "@/lib/types";
import ProductOverviewTab from "@/components/features/product/ProductOverviewTab";
import ProductPurchaseTab from "@/components/features/product/ProductPurchaseTab";
import ProductHistoryTab from "@/components/features/product/ProductHistoryTab";

interface TabsProps {
  product: Product;
  stockStats: StockStats | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "purchases", label: "Restock" },
  { id: "history", label: "History" },
];

export default function Tabs({
  product,
  stockStats,
  activeTab,
  onTabChange,
}: TabsProps) {
  return (
    <div>
      <div className="inline-flex gap-1 rounded-full border border-line bg-white p-1 shadow-card">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative cursor-pointer rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors duration-200 ${
                active ? "text-white" : "text-muted hover:text-ink"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="product-tab-pill"
                  className="absolute inset-0 rounded-full bg-navy-700 shadow-[0_6px_16px_-6px_rgba(22,58,110,0.6)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="mt-5"
        >
          {activeTab === "overview" && (
            <ProductOverviewTab product={product} stockStats={stockStats} />
          )}
          {activeTab === "purchases" && <ProductPurchaseTab product={product} />}
          {activeTab === "history" && <ProductHistoryTab product={product} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
