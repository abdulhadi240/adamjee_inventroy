"use client";

import { notify } from "@/components/ui/Dialog";
import { useState, useActionState, useEffect, useRef } from "react";
import { AlertTriangle, Truck } from "lucide-react";
import { insertOrder } from "@/lib/actions/orders";
import { Button } from "@/components/ui/Button";
import LabeledInput from "@/components/ui/LabeledInput";
import LabeledSelect from "@/components/ui/LabeledSelect";
import { AnimatedCard, CardHeader } from "@/components/ui/motion";
import { Product, FormState } from "@/lib/types";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils/formatters";
import DatePicker from "@/components/ui/DatePicker";

const initialState: FormState = { success: false, message: "" };

interface ProductPurchaseTabProps {
  product: Product;
}

export default function ProductPurchaseTab({
  product,
}: ProductPurchaseTabProps) {
  const [state, formAction, isPending] = useActionState(
    insertOrder,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  const [quantity, setQuantity] = useState("1");
  const [cost, setCost] = useState(String(product.buy_price));
  const [expectedDate, setExpectedDate] = useState("");
  const [status, setStatus] = useState("Pending");

  useEffect(() => {
    if (!state.message) return;
    if (!state.success) {
      notify(state.message);
    } else {
      notify("Purchase order created.", "success");
      formRef.current?.reset();
      setQuantity("1");
      setCost(String(product.buy_price));
      setExpectedDate("");
      setStatus("Pending");
    }
  }, [state, product.buy_price]);

  const itemsPayload = JSON.stringify([
    {
      product_id: product.id,
      product_name: product.product_name,
      quantity: parseInt(quantity || "0", 10),
      cost_per_item: parseFloat(cost || "0"),
    },
  ]);

  const qty = parseInt(quantity || "0", 10) || 0;
  const unitCost = parseFloat(cost || "0") || 0;

  if (!product.supplier) {
    return (
      <AnimatedCard className="flex items-start gap-3 border-amber-200 bg-amber-50/60">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
          <AlertTriangle className="size-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-amber-900">
            No supplier linked
          </h3>
          <p className="mt-0.5 text-xs text-amber-800/80">
            Assign a supplier to this product before creating a purchase order.
          </p>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-4 lg:grid-cols-3"
    >
      <input type="hidden" name="supplier_id" value={product.supplier.id} />
      <input type="hidden" name="items" value={itemsPayload} />

      <AnimatedCard className="lg:col-span-2">
        <CardHeader
          title="Restock this product"
          subtitle="Creates a purchase order with the linked supplier."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledInput
            label="Quantity to order"
            id="quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          <LabeledInput
            label="Cost per item (Rs)"
            id="cost"
            type="number"
            min={0}
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
          />
          <DatePicker
            label="Expected delivery"
            name="expected_delivery_date"
            value={expectedDate}
            onChange={setExpectedDate}
            placeholder="Pick a delivery date"
            required
          />
          <LabeledSelect
            label="Order status"
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </LabeledSelect>
        </div>
      </AnimatedCard>

      <AnimatedCard className="flex flex-col">
        <CardHeader title="Order summary" />
        <div className="flex items-center gap-2.5 rounded-xl border border-line bg-canvas/60 p-3">
          <span className="grid size-8 place-items-center rounded-lg bg-navy-50 text-navy-600">
            <Truck className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              {product.supplier.supplier_name}
            </p>
            <p className="text-[11px] text-muted">Supplier</p>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-muted">
            <span>Quantity</span>
            <span className="font-medium text-ink tabular-nums">{qty}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Unit cost</span>
            <span className="font-medium text-ink tabular-nums">
              {formatCurrency(unitCost)}
            </span>
          </div>
        </div>
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-xs text-muted">Estimated total</p>
          <p className="text-2xl font-semibold tracking-tight text-navy-700 tabular-nums">
            {formatCurrency(qty * unitCost)}
          </p>
        </div>
        <Button type="submit" disabled={isPending} className="mt-5 w-full">
          {isPending ? "Creating…" : "Create purchase order"}
        </Button>
      </AnimatedCard>
    </form>
  );
}
