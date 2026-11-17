"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addBundleComponent,
  updateBundleComponent,
  sellBundleComponent,
} from "@/lib/actions/bundles";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import LabeledInput from "@/components/ui/LabeledInput";
import SelectMenu from "@/components/ui/SelectMenu";
import ComponentPicker from "@/components/features/bundles/ComponentPicker";
import { formatCurrency } from "@/lib/utils/formatters";
import { getComponentLabel, getRemaining } from "@/lib/utils/bundles";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/constants";
import { Bundle, BundleComponent, BundleFormOptions } from "@/lib/types";

interface ComponentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundle: Bundle;
  options: BundleFormOptions;
  /** Pass a component to edit it; omit to add a new one. */
  component?: BundleComponent | null;
}

/** Add a part to a bundle, or correct an existing part's name, count or cost. */
export function ComponentFormModal({
  isOpen,
  onClose,
  bundle,
  options,
  component,
}: ComponentFormModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [productId, setProductId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [unitCost, setUnitCost] = useState("");

  const [lastOpen, setLastOpen] = useState(false);
  if (isOpen !== lastOpen) {
    setLastOpen(isOpen);
    if (isOpen) {
      setName(component?.name ?? "");
      setModel(component?.model ?? "");
      setProductId(component?.product_id ?? null);
      setQuantity(String(component?.quantity ?? 1));
      setUnitCost(component ? String(component.unit_cost) : "");
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Choose or type a component.");
      return;
    }
    const input = {
      name,
      model: productId ? "" : model,
      product_id: productId,
      quantity: parseInt(quantity, 10),
      unit_cost: parseFloat(unitCost) || 0,
    };

    startTransition(async () => {
      const result = component
        ? await updateBundleComponent(bundle.id, component.id, input)
        : await addBundleComponent(bundle.id, input);

      if (result.success) {
        onClose();
        router.refresh();
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={component ? "Edit component" : "Add component"}
      description={`Part of ${bundle.product.product_name}.`}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Discard
          </Button>
          <Button type="submit" form="component-form" disabled={isPending}>
            {isPending
              ? "Saving…"
              : component
                ? "Save changes"
                : "Add component"}
          </Button>
        </>
      }
    >
      <form
        id="component-form"
        onSubmit={handleSubmit}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <label htmlFor="component_name" className="field-label">
            Component
          </label>
          <ComponentPicker
            id="component_name"
            name={name}
            productId={productId}
            options={options}
            onChange={(picked) => {
              setName(picked.name);
              setProductId(picked.product_id);
              // Prefill the cost from inventory, unless one was typed
              if (picked.buy_price !== undefined && !unitCost) {
                setUnitCost(String(picked.buy_price));
              }
            }}
            placeholder="Choose from inventory or type a new one"
            autoFocus
          />
        </div>
        {/* An inventory item already is a specific part */}
        {name.trim() && !productId && (
          <div className="sm:col-span-2">
            <LabeledInput
              id="component_model"
              label={`Which ${name.trim()}?`}
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Brand and model, e.g. Core i7-10700"
              maxLength={120}
            />
          </div>
        )}
        <LabeledInput
          id="component_quantity"
          label="Quantity"
          type="number"
          min={Math.max(component?.removed_quantity ?? 0, 1)}
          step={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <LabeledInput
          id="component_unit_cost"
          label="Cost each (Rs)"
          type="number"
          min={0}
          step="any"
          value={unitCost}
          onChange={(e) => setUnitCost(e.target.value)}
          placeholder="e.g., 12000"
        />
      </form>
    </Modal>
  );
}

interface SellComponentModalProps {
  onClose: () => void;
  bundle: Bundle;
  options: BundleFormOptions;
  /** The component being sold; null keeps the popup closed. */
  component: BundleComponent | null;
}

/**
 * "Take out": sells units of a part straight out of the bundle. One step
 * records the sale and lowers the bundle's worth.
 */
export function SellComponentModal({
  onClose,
  bundle,
  options,
  component,
}: SellComponentModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState("1");
  const [sellPrice, setSellPrice] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].value);
  const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUSES[0].value);

  const [lastComponent, setLastComponent] = useState<BundleComponent | null>(
    null,
  );
  if (component !== lastComponent) {
    setLastComponent(component);
    if (component) {
      setQuantity("1");
      setSellPrice("");
      setCustomerId("");
      setPaymentMethod(PAYMENT_METHODS[0].value);
      setPaymentStatus(PAYMENT_STATUSES[0].value);
    }
  }

  // Keep showing the last component while the popup animates closed
  const shown = component ?? lastComponent;
  if (!shown) return null;

  const label = getComponentLabel(shown);
  const remaining = getRemaining(shown);
  const qty = parseInt(quantity, 10) || 0;
  const price = parseFloat(sellPrice);
  const cost = qty * Number(shown.unit_cost);
  const hasPrice = Number.isFinite(price);
  const profit = hasPrice ? qty * price - cost : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await sellBundleComponent(bundle.id, shown.id, {
        quantity: qty,
        sell_price: price,
        customer_id: customerId ? Number(customerId) : null,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
      });

      if (result.success) {
        onClose();
        router.refresh();
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <Modal
      isOpen={Boolean(component)}
      onClose={onClose}
      title={`Take out and sell ${label}`}
      description={`Sold on its own, out of ${bundle.product.product_name}.`}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="sell-component-form" disabled={isPending}>
            {isPending ? "Selling…" : "Sell"}
          </Button>
        </>
      }
    >
      <form
        id="sell-component-form"
        onSubmit={handleSubmit}
        className="grid gap-4 sm:grid-cols-2"
      >
        <LabeledInput
          id="sell_component_price"
          label={remaining > 1 ? "Sold for, each (Rs)" : "Sold for (Rs)"}
          type="number"
          min={0}
          step="any"
          value={sellPrice}
          onChange={(e) => setSellPrice(e.target.value)}
          placeholder="e.g., 18000"
          autoFocus
          required
        />
        <LabeledInput
          id="sell_component_quantity"
          label={`Quantity (${remaining} in the bundle)`}
          type="number"
          min={1}
          max={remaining}
          step={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={remaining === 1}
          required
        />
        <div className="sm:col-span-2">
          <SelectMenu
            id="sell_component_customer"
            label="Customer"
            value={customerId}
            onChange={setCustomerId}
            options={[
              { value: "", label: "Walk-in customer" },
              ...options.customers.map((c) => ({
                value: String(c.id),
                label: c.name,
              })),
            ]}
            searchable={options.customers.length > 6}
            searchPlaceholder="Search customers…"
          />
        </div>
        <SelectMenu
          id="sell_component_method"
          label="Payment method"
          value={paymentMethod}
          onChange={setPaymentMethod}
          options={PAYMENT_METHODS}
        />
        <SelectMenu
          id="sell_component_status"
          label="Payment status"
          value={paymentStatus}
          onChange={setPaymentStatus}
          options={PAYMENT_STATUSES}
        />

        <div className="flex flex-wrap justify-between gap-2 rounded-xl bg-canvas px-3.5 py-2.5 text-xs text-muted sm:col-span-2">
          <span>
            Cost{" "}
            <span className="font-semibold text-ink">
              {formatCurrency(cost)}
            </span>
          </span>
          {hasPrice && (
            <span>
              {profit >= 0 ? "Profit" : "Loss"}{" "}
              <span
                className={`font-semibold ${
                  profit >= 0 ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {formatCurrency(Math.abs(profit))}
              </span>
            </span>
          )}
          <span>
            Bundle worth drops by{" "}
            <span className="font-semibold text-ink">
              {formatCurrency(cost)}
            </span>
          </span>
        </div>
      </form>
    </Modal>
  );
}
