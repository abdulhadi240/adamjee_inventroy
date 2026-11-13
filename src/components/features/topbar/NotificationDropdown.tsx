"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Bell, PackageCheck, PackageOpen } from "lucide-react";
import { StockAlert } from "@/lib/types";

export default function NotificationDropdown({
  alerts,
}: {
  alerts: StockAlert[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifCount = alerts.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Stock alerts"
        className={`relative grid size-9 cursor-pointer place-items-center rounded-full border transition-colors ${
          isOpen
            ? "border-navy-200 bg-white text-navy-700"
            : "border-line bg-white text-ink hover:border-navy-200"
        }`}
      >
        <Bell className="size-[17px]" />
        {notifCount > 0 && (
          // Pill grows with the label so "9+" never spills out of the circle
          <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-none text-white tabular-nums ring-2 ring-white">
            {notifCount > 9 ? "9+" : notifCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full z-50 mt-2.5 w-80 origin-top-right overflow-hidden rounded-2xl border border-line bg-white shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h3 className="text-sm font-semibold text-ink">Stock alerts</h3>
              {notifCount > 0 && (
                <span className="badge bg-amber-50 text-amber-700">
                  {notifCount} low
                </span>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto p-1.5">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-8 text-center">
                  <span className="mb-2 grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <PackageCheck className="size-5" />
                  </span>
                  <p className="text-sm font-medium text-ink">All stocked up</p>
                  <p className="text-xs text-muted">No products are running low.</p>
                </div>
              ) : (
                <ul>
                  {alerts.map((item, i) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link
                        href={`/product/${item.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-canvas"
                      >
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-line bg-canvas">
                          {item.product_image ? (
                            <Image
                              src={item.product_image}
                              alt={item.product_name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <PackageOpen className="absolute inset-0 m-auto size-4 text-muted" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">
                            {item.product_name}
                          </p>
                          <p
                            className={`text-xs font-medium ${
                              item.amount_stock === 0
                                ? "text-rose-600"
                                : "text-amber-600"
                            }`}
                          >
                            {item.amount_stock === 0
                              ? "Out of stock"
                              : `Only ${item.amount_stock} left`}
                          </p>
                        </div>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {notifCount > 0 && (
              <Link
                href="/inventory"
                onClick={() => setIsOpen(false)}
                className="group flex items-center justify-center gap-1.5 border-t border-line py-2.5 text-xs font-semibold text-navy-600 transition-colors hover:bg-navy-50"
              >
                View inventory
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
