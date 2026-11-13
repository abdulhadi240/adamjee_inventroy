"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Clock, PackageCheck, Tags, Truck, Workflow } from "lucide-react";
import { AnimatedCard, AnimatedNumber, CardHeader } from "@/components/ui/motion";
import { ProductStats, PurchaseStats } from "@/lib/types";

/** Where restock orders currently sit, plus catalogue size. */
export default function PurchasePipeline({
  purchase,
  products,
}: {
  purchase: PurchaseStats;
  products: ProductStats;
}) {
  const completed = Math.max(purchase.purchase - purchase.pending - purchase.shipped, 0);
  const total = Math.max(purchase.purchase, 1);

  const stages = [
    { label: "Pending", value: purchase.pending, icon: Clock, color: "bg-amber-400", text: "text-amber-600" },
    { label: "In transit", value: purchase.shipped, icon: Truck, color: "bg-navy-500", text: "text-navy-600" },
    { label: "Received", value: completed, icon: PackageCheck, color: "bg-emerald-500", text: "text-emerald-600" },
  ];

  return (
    <AnimatedCard>
      <CardHeader
        title="Purchase pipeline"
        subtitle={`${purchase.purchase} orders in total`}
        icon={Workflow}
        action={
          <Link
            href="/orders"
            className="group inline-flex items-center gap-1 text-xs font-semibold text-navy-600 hover:text-navy-800"
          >
            Orders
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        }
      />

      {/* Segmented progress bar */}
      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-line">
        {stages.map((s, i) => (
          <motion.div
            key={s.label}
            className={`h-full ${s.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${(s.value / total) * 100}%` }}
            transition={{ duration: 0.9, delay: 0.2 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {stages.map(({ label, value, icon: Icon, text }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted">
              <Icon className={`size-4 ${text}`} />
              {label}
            </span>
            <span className="font-semibold tabular-nums text-ink">
              <AnimatedNumber value={value} />
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-line pt-4">
        <div className="rounded-xl bg-canvas p-3">
          <Truck className="size-4 text-navy-500" />
          <p className="mt-1.5 text-lg font-semibold tabular-nums">
            <AnimatedNumber value={products.suppliers} />
          </p>
          <p className="text-[11px] text-muted">Suppliers</p>
        </div>
        <div className="rounded-xl bg-canvas p-3">
          <Tags className="size-4 text-navy-500" />
          <p className="mt-1.5 text-lg font-semibold tabular-nums">
            <AnimatedNumber value={products.categories} />
          </p>
          <p className="text-[11px] text-muted">Categories</p>
        </div>
      </div>
    </AnimatedCard>
  );
}
