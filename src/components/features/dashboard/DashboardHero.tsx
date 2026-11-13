"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Boxes,
  ClipboardList,
  PackagePlus,
  ShoppingCart,
  TriangleAlert,
  Truck,
} from "lucide-react";
import { AnimatedNumber } from "@/components/ui/motion";
import { InventoryStats } from "@/lib/types";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** Top-of-dashboard summary: stock position plus quick actions. */
export default function DashboardHero({
  inventory,
  lowStockCount,
}: {
  inventory: InventoryStats;
  lowStockCount: number;
}) {
  const metrics = [
    { label: "Units in stock", value: inventory.quantityInHand, icon: Boxes },
    { label: "Incoming", value: inventory.toBeReceived, icon: Truck },
    {
      label: "Low stock items",
      value: lowStockCount,
      icon: TriangleAlert,
      alert: lowStockCount > 0,
    },
  ];

  const actions = [
    { href: "/sales", label: "New sale", icon: ShoppingCart, primary: true },
    { href: "/orders", label: "Restock", icon: ClipboardList },
    { href: "/inventory", label: "Add product", icon: PackagePlus },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl bg-navy-800 p-6 text-white"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium text-navy-200">
            <span suppressHydrationWarning>{greeting()}</span>
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Adamjee Computers
          </h1>
          <p className="mt-1 text-sm text-navy-200">
            Inventory overview and quick actions.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {actions.map(({ href, label, icon: Icon, primary }) => (
              <Link
                key={href}
                href={href}
                className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-colors ${
                  primary
                    ? "bg-white text-navy-800 hover:bg-navy-50"
                    : "text-white ring-1 ring-white/25 hover:bg-white/10"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-white/10 rounded-xl bg-white/[0.06] ring-1 ring-white/10 lg:min-w-[440px]">
          {metrics.map(({ label, value, icon: Icon, alert }) => (
            <div key={label} className="px-4 py-3.5">
              <div className="flex items-center gap-1.5 text-[11px] text-navy-200">
                <Icon
                  className={`size-3.5 ${alert ? "text-amber-300" : "text-navy-200"}`}
                />
                {label}
              </div>
              <p className="font-display mt-1.5 text-xl font-semibold tracking-tight">
                <AnimatedNumber value={value} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
