"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Clock,
  PackageOpen,
  Tag,
  TrendingUp,
  Truck,
  Warehouse,
} from "lucide-react";
import Tabs from "@/components/ui/Tabs";
import { AnimatedNumber } from "@/components/ui/motion";
import { StockBadge } from "@/components/features/inventory/ProductRow";
import { hasProductImage } from "@/components/features/inventory/ProductThumb";
import { formatCurrency } from "@/lib/utils/formatters";
import { Product, StockStats } from "@/lib/types";
import BundleContentsToggle from "@/components/features/bundles/BundleContents";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function ProductDetailView({
  product,
  stockStats,
}: {
  product: Product;
  stockStats: StockStats | null;
}) {
  const [activeTab, setActiveTab] = useState("overview");

  const pending = stockStats?.pendingStock ?? 0;
  const shipped = stockStats?.shippedStock ?? 0;
  const margin = Number(product.sell_price) - Number(product.buy_price);
  const marginPct =
    Number(product.sell_price) > 0
      ? (margin / Number(product.sell_price)) * 100
      : 0;

  const stockFacts = [
    { label: "In stock", value: product.amount_stock, icon: Warehouse, tone: "text-navy-600 bg-navy-50" },
    { label: "Pending", value: pending, icon: Clock, tone: "text-amber-600 bg-amber-50" },
    { label: "Shipped", value: shipped, icon: Truck, tone: "text-navy-600 bg-navy-50" },
    {
      label: "Projected",
      value: product.amount_stock + pending + shipped,
      icon: TrendingUp,
      tone: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <div>
      <Link
        href="/inventory"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-navy-600"
      >
        <ArrowLeft className="size-3.5" />
        Back to inventory
      </Link>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="card mb-6 grid gap-6 overflow-hidden p-4 md:grid-cols-[280px_1fr] md:p-5"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl border border-line bg-canvas">
          {hasProductImage(product.product_image) ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Image
                src={product.product_image}
                alt={product.product_name}
                fill
                sizes="280px"
                className="object-cover"
                priority
              />
            </motion.div>
          ) : (
            <PackageOpen
              className="absolute inset-0 m-auto size-14 text-muted/40"
              strokeWidth={1.4}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge bg-navy-50 capitalize text-navy-700 ring-1 ring-navy-100">
              <Tag className="size-3" />
              {product.product_category || "Uncategorized"}
            </span>
            {product.product_type && (
              <span className="badge bg-canvas text-muted ring-1 ring-line">
                {product.product_type}
              </span>
            )}
            <StockBadge stock={product.amount_stock} />
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-[28px]">
            {product.product_name}
          </h1>
          {product.supplier?.supplier_name && (
            <p className="mt-1 text-sm text-muted">
              Supplied by{" "}
              <span className="font-medium text-ink">
                {product.supplier.supplier_name}
              </span>
            </p>
          )}
          <BundleContentsToggle productId={product.id} className="mt-3" />

          <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-3">
            <div>
              <p className="text-xs text-muted">Sell price</p>
              <p className="text-2xl font-semibold tracking-tight text-navy-700">
                {formatCurrency(product.sell_price)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Cost price</p>
              <p className="text-base font-medium text-ink">
                {formatCurrency(product.buy_price)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Margin</p>
              <p
                className={`text-base font-medium ${
                  margin >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {formatCurrency(margin)}{" "}
                <span className="text-xs">({marginPct.toFixed(1)}%)</span>
              </p>
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2.5 pt-5 sm:grid-cols-4">
            {stockFacts.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.04, duration: 0.3 }}
                className="rounded-xl border border-line bg-canvas/60 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className={`grid size-6 place-items-center rounded-md ${f.tone}`}>
                    <f.icon className="size-3.5" />
                  </span>
                  <span className="text-[11px] font-medium text-muted">{f.label}</span>
                </div>
                <p className="mt-1.5 text-lg font-semibold text-ink">
                  <AnimatedNumber value={f.value} />
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <Tabs
        product={product}
        stockStats={stockStats}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
