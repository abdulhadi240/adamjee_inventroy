"use client";

import { motion } from "motion/react";
import { Package } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Sale } from "@/lib/types";
import { PaymentBadge } from "./SaleRow";
import BundleContentsToggle from "@/components/features/bundles/BundleContents";

interface SaleItemsModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export default function SaleItemsModal({ sale, onClose }: SaleItemsModalProps) {
  return (
    <Modal
      isOpen={!!sale}
      onClose={onClose}
      title={sale ? `Invoice ${sale.invoice_code}` : "Invoice"}
      description={
        sale
          ? `${sale.customer?.name ?? "Walk-in"} · ${formatDate(
              sale.sale_date
            )} · ${sale.payment_method}`
          : undefined
      }
      footer={
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {sale && (
        <>
          <ul className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
            {sale.items.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
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
                  <p className="text-xs text-muted">
                    {item.quantity} × {formatCurrency(item.price_at_sale)}
                    {item.product?.product_category
                      ? ` · ${item.product.product_category}`
                      : ""}
                  </p>
                  <BundleContentsToggle
                    productId={item.product?.id}
                    className="mt-1"
                  />
                </div>
                <span className="text-sm font-semibold tabular-nums text-ink">
                  {formatCurrency(item.price_at_sale * item.quantity)}
                </span>
              </motion.li>
            ))}
          </ul>
          <div className="flex items-center justify-between rounded-xl bg-navy-50 px-4 py-3">
            <PaymentBadge status={sale.payment_status || "Paid"} />
            <div className="text-right">
              <p className="text-[11px] text-muted">Total</p>
              <p className="text-lg font-semibold tabular-nums text-navy-800">
                {formatCurrency(sale.total_amount)}
              </p>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
