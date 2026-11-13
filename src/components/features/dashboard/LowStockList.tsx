"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, PackageCheck, PackageOpen, TriangleAlert } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AnimatedCard, CardHeader, EmptyState } from "@/components/ui/motion";
import { LowStockProduct } from "@/lib/types";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

function hasImage(url: string | null | undefined) {
  return !!url && !url.endsWith("/product.svg");
}

function StockRow({ product, index }: { product: LowStockProduct; index: number }) {
  const out = product.remainingStock === 0;
  const pct = Math.min((product.remainingStock / LOW_STOCK_THRESHOLD) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
    >
      <Link
        href={`/product/${product.id}`}
        className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-canvas"
      >
        <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-line bg-canvas">
          {hasImage(product.image) ? (
            <Image
              src={product.image}
              fill
              sizes="40px"
              className="object-cover"
              alt={product.name}
            />
          ) : (
            <PackageOpen className="absolute inset-0 m-auto size-4 text-muted" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink transition-colors group-hover:text-navy-600">
            {product.name}
          </p>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-line">
            <motion.div
              className={`h-full rounded-full ${out ? "bg-rose-500" : "bg-amber-400"}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(pct, 3)}%` }}
              transition={{ duration: 0.8, delay: 0.25 + index * 0.05 }}
            />
          </div>
        </div>
        <span
          className={`badge shrink-0 ${
            out ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-700"
          }`}
        >
          {out ? "Out" : `${product.remainingStock} left`}
        </span>
      </Link>
    </motion.div>
  );
}

export default function LowStockList({
  products,
}: {
  products: LowStockProduct[];
}) {
  const [showModal, setShowModal] = useState(false);
  const widgetProducts = products.slice(0, 5);

  return (
    <>
      <AnimatedCard>
        <CardHeader
          title="Low stock"
          subtitle={`Below ${LOW_STOCK_THRESHOLD} units`}
          icon={TriangleAlert}
          action={
            products.length > widgetProducts.length && (
              <button
                onClick={() => setShowModal(true)}
                className="group inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-navy-600 hover:text-navy-800"
              >
                All {products.length}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            )
          }
        />

        {widgetProducts.length === 0 ? (
          <EmptyState
            icon={PackageCheck}
            title="Stock levels are healthy"
            description="Nothing is running low right now."
          />
        ) : (
          <div className="-mx-2 space-y-0.5">
            {widgetProducts.map((product, i) => (
              <StockRow key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </AnimatedCard>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Low stock items"
        description={`Products with fewer than ${LOW_STOCK_THRESHOLD} units`}
        footer={
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
            Close
          </Button>
        }
      >
        <div className="-mx-2 max-h-[60vh] space-y-0.5 overflow-y-auto">
          {products.map((product, i) => (
            <StockRow key={product.id} product={product} index={i} />
          ))}
        </div>
      </Modal>
    </>
  );
}
