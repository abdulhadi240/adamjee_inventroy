"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Trophy } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AnimatedCard, CardHeader, EmptyState } from "@/components/ui/motion";
import { formatCurrency } from "@/lib/utils/formatters";
import { TopProduct } from "@/lib/types";
import BundleContentsToggle from "@/components/features/bundles/BundleContents";

function SalesBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 4) : 0;
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-navy-50">
        <motion.div
          className="h-full rounded-full bg-navy-600"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </div>
      <span className="tabular-nums font-medium">{value}</span>
    </div>
  );
}

function ProductTable({ products }: { products: TopProduct[] }) {
  const max = Math.max(...products.map((p) => p.soldQuantity), 0);
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Product</th>
          <th>Sold</th>
          <th>In stock</th>
          <th className="text-right">Price</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product, i) => (
          <motion.tr
            key={product.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <td className="w-10">
              <span
                className={`grid size-6 place-items-center rounded-full text-[11px] font-bold ${
                  i === 0
                    ? "bg-navy-700 text-white"
                    : "bg-canvas text-muted"
                }`}
              >
                {i + 1}
              </span>
            </td>
            <td>
              <Link href={`/product/${product.id}`} className="link">
                {product.name}
              </Link>
              <BundleContentsToggle productId={product.id} className="mt-1" />
            </td>
            <td>
              <SalesBar value={product.soldQuantity} max={max} />
            </td>
            <td className="tabular-nums text-muted">{product.remainingStock}</td>
            <td className="text-right font-semibold tabular-nums">
              {formatCurrency(product.price)}
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  );
}

export default function BestSellingTable({
  products,
}: {
  products: TopProduct[];
}) {
  const [showModal, setShowModal] = useState(false);
  const widgetProducts = products.slice(0, 5);

  return (
    <>
      <AnimatedCard flush className="overflow-hidden lg:col-span-2">
        <div className="p-5 pb-0">
          <CardHeader
            title="Best sellers"
            subtitle="Top products by units sold"
            icon={Trophy}
            action={
              products.length > 0 && (
                <button
                  onClick={() => setShowModal(true)}
                  className="group inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-navy-600 hover:text-navy-800"
                >
                  See all
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              )
            }
          />
        </div>

        {widgetProducts.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No sales yet"
            description="Your top-selling products will appear here once you record sales."
          />
        ) : (
          <div className="overflow-x-auto">
            <ProductTable products={widgetProducts} />
          </div>
        )}
      </AnimatedCard>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="All best sellers"
        size="lg"
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
        <div className="-mx-6 max-h-[60vh] overflow-auto">
          <ProductTable products={products} />
        </div>
      </Modal>
    </>
  );
}
