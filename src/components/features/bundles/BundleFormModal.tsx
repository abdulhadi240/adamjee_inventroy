"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createBundle, updateBundle } from "@/lib/actions/bundles";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import LabeledInput from "@/components/ui/LabeledInput";
import SelectMenu from "@/components/ui/SelectMenu";
import ComponentPicker from "@/components/features/bundles/ComponentPicker";
import { formatCurrency } from "@/lib/utils/formatters";
import { Bundle, BundleFormOptions } from "@/lib/types";

type ComponentRow = {
  key: number;
  name: string;
  model: string;
  product_id: number | null;
  quantity: string;
  unit_cost: string;
};

let nextKey = 0;
const emptyRow = (): ComponentRow => ({
  key: nextKey++,
  name: "",
  model: "",
  product_id: null,
  quantity: "1",
  unit_cost: "",
});

interface BundleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: BundleFormOptions;
  /** Pass a bundle to edit its details; omit to create a new one. */
  bundle?: Bundle;
}

/**
 * The "New bundle" / "Edit bundle" popup. Creating also captures the
 * components; afterwards they are managed on the bundle's own page.
 */
export default function BundleFormModal({
  isOpen,
  onClose,
  options,
  bundle,
}: BundleFormModalProps) {
  const router = useRouter();
  const isEdit = Boolean(bundle);
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<ComponentRow[]>([]);

  // Reset the form each time the popup is (re)opened
  const [lastOpen, setLastOpen] = useState(false);
  if (isOpen !== lastOpen) {
    setLastOpen(isOpen);
    if (isOpen) {
      setType(bundle?.bundle_type ?? "");
      setName(bundle?.product.product_name ?? "");
      setTotalCost(bundle ? String(bundle.total_cost) : "");
      setSellPrice(bundle ? String(bundle.product.sell_price) : "");
      setSupplierId("");
      setNotes(bundle?.notes ?? "");
      setRows([emptyRow()]);
    }
  }

  const updateRow = (key: number, patch: Partial<ComponentRow>) =>
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );

  const filledRows = rows.filter((r) => r.name.trim());
  const componentsTotal = filledRows.reduce(
    (sum, r) =>
      sum + (parseInt(r.quantity, 10) || 0) * (parseFloat(r.unit_cost) || 0),
    0,
  );
  const total = parseFloat(totalCost) || 0;
  const unallocated = total - componentsTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const details = {
      name,
      bundle_type: type,
      total_cost: parseFloat(totalCost),
      sell_price: parseFloat(sellPrice) || 0,
      notes,
    };

    if (!type.trim()) {
      alert("Choose or type a bundle type.");
      return;
    }

    startTransition(async () => {
      const result = bundle
        ? await updateBundle(bundle.id, details)
        : await createBundle({
            ...details,
            supplier_id: supplierId ? Number(supplierId) : null,
            components: filledRows.map((r) => ({
              name: r.name.trim(),
              model: r.product_id ? "" : r.model.trim(),
              product_id: r.product_id,
              quantity: parseInt(r.quantity, 10),
              unit_cost: parseFloat(r.unit_cost) || 0,
            })),
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
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit bundle" : "New bundle"}
      description={
        isEdit
          ? "Components are managed on the bundle page."
          : "A complete unit bought as one item, with the parts inside it."
      }
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Discard
          </Button>
          <Button type="submit" form="bundle-form" disabled={isPending}>
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Add bundle"}
          </Button>
        </>
      }
    >
      <form id="bundle-form" onSubmit={handleSubmit} className="grid gap-5">
        <div>
          <span className="field-label">What is it?</span>
          <div className="flex flex-wrap items-center gap-2">
            {options.types.map((t) => {
              const active = t.toLowerCase() === type.trim().toLowerCase();
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  aria-pressed={active}
                  className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-navy-700 bg-navy-700 text-white"
                      : "border-line bg-white text-ink hover:border-navy-200 hover:bg-navy-50"
                  }`}
                >
                  {t}
                </button>
              );
            })}
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="or type your own…"
              aria-label="Bundle type"
              maxLength={60}
              className="field w-44 py-1.5"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <LabeledInput
              id="bundle_name"
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Dell OptiPlex 7090 Core i7"
              required
            />
          </div>
          <LabeledInput
            id="bundle_total_cost"
            label="Total cost (Rs)"
            type="number"
            min={0}
            step="any"
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            placeholder="e.g., 50000"
            required
          />
          <LabeledInput
            id="bundle_sell_price"
            label="Sell price (Rs)"
            type="number"
            min={0}
            step="any"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            placeholder="e.g., 65000"
          />
          {!isEdit && (
            <SelectMenu
              id="bundle_supplier"
              label="Supplier (optional)"
              value={supplierId}
              onChange={setSupplierId}
              options={[
                { value: "", label: "No supplier" },
                ...options.suppliers.map((s) => ({
                  value: String(s.id),
                  label: s.supplier_name,
                })),
              ]}
              searchable={options.suppliers.length > 6}
              searchPlaceholder="Search suppliers…"
            />
          )}
          <div className={isEdit ? "sm:col-span-2" : ""}>
            <LabeledInput
              id="bundle_notes"
              label="Notes (optional)"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Minor scratch on casing"
            />
          </div>
        </div>

        {!isEdit && (
          <div>
            <div className="mb-2 flex items-end justify-between gap-3">
              <div>
                <span className="field-label mb-0">Components</span>
                <p className="text-xs text-muted">
                  Choose from your inventory or type a new one. Leave unused
                  rows blank.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setRows((prev) => [...prev, emptyRow()])}
              >
                <Plus className="size-3.5" /> Add row
              </Button>
            </div>

            <div className="grid gap-2">
              {rows.map((row, i) => (
                <div
                  key={row.key}
                  className="grid grid-cols-[1fr_64px_110px_32px] items-start gap-2"
                >
                  <div className="grid gap-1.5">
                    <ComponentPicker
                      name={row.name}
                      productId={row.product_id}
                      options={options}
                      onChange={(picked) =>
                        updateRow(row.key, {
                          name: picked.name,
                          product_id: picked.product_id,
                          // Prefill the cost from inventory, unless one was typed
                          ...(picked.buy_price !== undefined && !row.unit_cost
                            ? { unit_cost: String(picked.buy_price) }
                            : {}),
                        })
                      }
                      ariaLabel={`Component ${i + 1}`}
                    />
                    {/* An inventory item already is a specific part */}
                    {row.name.trim() && !row.product_id && (
                      <input
                        type="text"
                        value={row.model}
                        onChange={(e) =>
                          updateRow(row.key, { model: e.target.value })
                        }
                        placeholder={`Which ${row.name.trim()}? e.g. brand and model`}
                        aria-label={`Component ${i + 1} name or model`}
                        maxLength={120}
                        className="field py-2"
                      />
                    )}
                  </div>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={row.quantity}
                    onChange={(e) =>
                      updateRow(row.key, { quantity: e.target.value })
                    }
                    aria-label={`Component ${i + 1} quantity`}
                    title="Quantity"
                    className="field no-spinner py-2 text-center"
                  />
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={row.unit_cost}
                    onChange={(e) =>
                      updateRow(row.key, { unit_cost: e.target.value })
                    }
                    placeholder="Cost each"
                    aria-label={`Component ${i + 1} cost each`}
                    className="field no-spinner py-2"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setRows((prev) => prev.filter((r) => r.key !== row.key))
                    }
                    aria-label={`Remove component ${i + 1}`}
                    className="mt-1 grid size-8 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap justify-between gap-2 rounded-xl bg-canvas px-3.5 py-2.5 text-xs">
              <span className="text-muted">
                Components total{" "}
                <span className="font-semibold text-ink">
                  {formatCurrency(componentsTotal)}
                </span>
              </span>
              {unallocated >= 0 ? (
                <span className="text-muted">
                  Rest of the unit{" "}
                  <span className="font-semibold text-ink">
                    {formatCurrency(unallocated)}
                  </span>
                </span>
              ) : (
                <span className="font-semibold text-amber-700">
                  Components cost {formatCurrency(-unallocated)} more than the
                  total
                </span>
              )}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
