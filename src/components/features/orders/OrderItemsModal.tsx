"use client";

import { motion } from "motion/react";
import { Package } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/formatters";
import { Order } from "@/lib/types";
import { OrderStatusBadge } from "@/components/features/orders/OrderRow";
import BundleContentsToggle from "@/components/features/bundles/BundleContents";

interface OrderItemsModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderItemsModal({
  order,
  onClose,
}: OrderItemsModalProps) {
  if (!order) return null;

  return (
    <Modal
      isOpen={!!order}
      onClose={onClose}
      title={order.po_code ?? `Order #${order.id}`}
      description={order.supplier?.supplier_name ?? undefined}
      footer={
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="flex items-center justify-between">
        <OrderStatusBadge status={order.status} />
        <span className="text-xs text-muted">
          {order.items.length} {order.items.length === 1 ? "item" : "items"}
        </span>
      </div>

      <ul className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
        {order.items.map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="flex shrink-0 items-start gap-3 rounded-xl border border-line p-3"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy-600">
              <Package className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">
                {item.product?.product_name ?? "Product not found"}
              </p>
              <p className="truncate text-xs text-muted">
                {[item.product?.product_type, item.product?.product_category]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <BundleContentsToggle
                productId={item.product?.id}
                className="mt-1"
              />
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold tabular-nums text-ink">
                {formatCurrency(item.quantity * item.cost_per_item)}
              </p>
              <p className="text-xs tabular-nums text-muted">
                {item.quantity} × {formatCurrency(item.cost_per_item)}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>

      <div className="flex items-center justify-between rounded-xl bg-navy-50 px-4 py-3">
        <span className="text-sm font-medium text-navy-700">Total cost</span>
        <span className="text-base font-semibold tabular-nums text-navy-800">
          {formatCurrency(order.total_cost)}
        </span>
      </div>
    </Modal>
  );
}
