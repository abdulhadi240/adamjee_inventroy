"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { formatCurrency } from "@/lib/utils/formatters";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { Product } from "@/lib/types";
import ProductThumb from "@/components/features/inventory/ProductThumb";

export function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="badge bg-rose-50 text-rose-600 ring-1 ring-rose-100">
        <span className="size-1.5 rounded-full bg-rose-500" />
        Out of stock
      </span>
    );
  if (stock < LOW_STOCK_THRESHOLD)
    return (
      <span className="badge bg-amber-50 text-amber-700 ring-1 ring-amber-100">
        <span className="size-1.5 rounded-full bg-amber-500" />
        Low stock
      </span>
    );
  return (
    <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
      <span className="size-1.5 rounded-full bg-emerald-500" />
      In stock
    </span>
  );
}

interface ProductRowProps {
  product: Product;
  index?: number;
}

export default function ProductRow({ product, index = 0 }: ProductRowProps) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.min(index, 10) * 0.02, duration: 0.25 }}
      className="group"
    >
      <td>
        <Link
          href={`/product/${product.id}`}
          className="flex items-center gap-3"
        >
          <ProductThumb
            src={product.product_image}
            alt={product.product_name}
          />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink transition-colors group-hover:text-navy-600">
              {product.product_name}
            </p>
            <p className="truncate text-xs capitalize text-muted">
              {product.product_category}
            </p>
          </div>
        </Link>
      </td>
      <td className="hidden lg:table-cell text-muted">{product.product_type}</td>
      <td className="hidden md:table-cell text-muted">
        {product.supplier?.supplier_name ?? "—"}
      </td>
      <td className="hidden lg:table-cell text-right tabular-nums text-muted">
        {formatCurrency(product.buy_price)}
      </td>
      <td className="hidden md:table-cell text-right font-medium tabular-nums">
        {formatCurrency(product.sell_price)}
      </td>
      <td className="text-right font-semibold tabular-nums">
        {product.amount_stock}
      </td>
      <td>
        <StockBadge stock={product.amount_stock} />
      </td>
    </motion.tr>
  );
}
