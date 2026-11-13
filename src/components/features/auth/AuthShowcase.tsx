"use client";

import { motion } from "motion/react";
import { Boxes, ChartNoAxesCombined, ShieldCheck, Truck } from "lucide-react";
import Logo from "@/components/brand/Logo";

const FEATURES = [
  { icon: Boxes, text: "Live stock levels and low-stock alerts" },
  { icon: Truck, text: "Purchase orders that restock automatically" },
  { icon: ChartNoAxesCombined, text: "Sales, profit and reports in PKR" },
];

/** Left column of the sign-in card. On phones it collapses to a logo bar. */
export default function AuthShowcase() {
  return (
    <div className="flex flex-col justify-between gap-8 bg-navy-800 p-6 sm:p-8 md:p-10">
      <Logo tone="light" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="hidden md:block"
      >
        <h2 className="text-[26px] font-semibold leading-tight text-white">
          Inventory management
          <br />
          for Adamjee Computers
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/65">
          Track stock, restock from suppliers and record sales — all in one
          place.
        </p>

        <ul className="mt-8 space-y-3">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-white/85">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10 text-white">
                <Icon className="size-4" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </motion.div>

      <div className="hidden items-center gap-2 border-t border-white/10 pt-5 text-xs text-white/55 md:flex">
        <ShieldCheck className="size-4" />
        Staff access only. Accounts are created by the administrator.
      </div>
    </div>
  );
}
