"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Boxes,
  Cpu,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Tag,
  Trash2,
  Undo2,
  Unplug,
  Wallet,
} from "lucide-react";
import {
  deleteBundle,
  deleteBundleComponent,
  undoBundleComponentSale,
} from "@/lib/actions/bundles";
import { Button } from "@/components/ui/Button";
import {
  AnimatedCard,
  EmptyState,
  Stagger,
  StatTile,
} from "@/components/ui/motion";
import BundleFormModal from "@/components/features/bundles/BundleFormModal";
import { BundleStatusBadge } from "@/components/features/bundles/BundleList";
import {
  ComponentFormModal,
  SellComponentModal,
} from "@/components/features/bundles/ComponentModals";
import { formatCurrency } from "@/lib/utils/formatters";
import {
  getComponentLabel,
  getComponentsValue,
  getCurrentWorth,
  getRemaining,
  getRemovedRevenue,
  getRemovedValue,
  isBundleSold,
} from "@/lib/utils/bundles";
import { Bundle, BundleComponent, BundleFormOptions } from "@/lib/types";

const iconBtn =
  "grid size-8 cursor-pointer place-items-center rounded-full border border-line bg-white text-muted transition-colors duration-150 hover:border-navy-200 hover:bg-navy-50 hover:text-navy-700 disabled:pointer-events-none disabled:opacity-40";

/** Where a component's units are right now. */
function ComponentStatus({
  component,
  bundleSold,
}: {
  component: BundleComponent;
  bundleSold: boolean;
}) {
  const removed = component.removed_quantity;
  const remaining = getRemaining(component);
  const invoices = component.sales
    .map((item) => item.sale?.invoice_code)
    .filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {remaining > 0 &&
        (bundleSold ? (
          <span className="badge bg-slate-100 text-slate-600 ring-1 ring-slate-200">
            {removed > 0 && `${remaining} `}Sold with bundle
          </span>
        ) : (
          <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {removed > 0 && `${remaining} `}In bundle
          </span>
        ))}
      {removed > 0 && (
        <span
          className="badge bg-rose-50 text-rose-600 ring-1 ring-rose-100"
          title={invoices.length ? `Invoice ${invoices.join(", ")}` : undefined}
        >
          <span className="size-1.5 rounded-full bg-rose-500" />
          {(remaining > 0 || removed > 1) && `${removed} `}Taken out · sold
        </span>
      )}
      {invoices.length > 0 && (
        <span className="text-[11px] tabular-nums text-muted">
          {invoices.join(", ")}
        </span>
      )}
    </div>
  );
}

interface BundleDetailProps {
  bundle: Bundle;
  options: BundleFormOptions;
}

export default function BundleDetail({ bundle, options }: BundleDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);

  const [showEdit, setShowEdit] = useState(false);
  const [showComponentForm, setShowComponentForm] = useState(false);
  const [editing, setEditing] = useState<BundleComponent | null>(null);
  const [takingOut, setTakingOut] = useState<BundleComponent | null>(null);

  const sold = isBundleSold(bundle);
  const removedValue = getRemovedValue(bundle);
  const worth = getCurrentWorth(bundle);
  const componentsValue = getComponentsValue(bundle);
  const rest = Number(bundle.total_cost) - componentsValue;

  const run = (
    componentId: number | null,
    action: () => Promise<{ success: boolean; message: string }>,
    onSuccess?: () => void,
  ) => {
    setBusyId(componentId);
    startTransition(async () => {
      const result = await action();
      setBusyId(null);
      if (result.success) {
        if (onSuccess) onSuccess();
        else router.refresh();
      } else {
        alert(result.message);
      }
    });
  };

  const handleDeleteBundle = () => {
    const taken = bundle.components.some((c) => c.removed_quantity > 0);
    if (
      !confirm(
        `Delete "${bundle.product.product_name}"? It is removed from inventory too.` +
          (taken ? " Sales of parts already taken out are kept." : ""),
      )
    )
      return;
    run(
      null,
      () => deleteBundle(bundle.id),
      () => router.push("/bundles"),
    );
  };

  const handleUndoSale = (component: BundleComponent) => {
    if (
      !confirm(
        `Cancel the sale of ${getComponentLabel(component)}? Its invoice is deleted and it goes back into the bundle.`,
      )
    )
      return;
    run(component.id, () => undoBundleComponentSale(bundle.id, component.id));
  };

  const handleDeleteComponent = (component: BundleComponent) => {
    if (
      !confirm(
        `Remove "${getComponentLabel(component)}" from this bundle's list?`,
      )
    )
      return;
    run(component.id, () => deleteBundleComponent(bundle.id, component.id));
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href="/bundles"
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-navy-600"
        >
          <ArrowLeft className="size-3.5" /> All bundles
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight text-ink">
                {bundle.product.product_name}
              </h1>
              <BundleStatusBadge bundle={bundle} />
            </div>
            <p className="mt-1 text-sm text-muted">
              {bundle.bundle_type}
              {bundle.product.supplier &&
                ` · from ${bundle.product.supplier.supplier_name}`}
              {bundle.notes && ` · ${bundle.notes}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/product/${bundle.product.id}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-xs font-semibold text-ink transition-colors hover:border-navy-200 hover:bg-navy-50"
            >
              <ExternalLink className="size-3.5" /> Inventory item
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowEdit(true)}
            >
              <Pencil className="size-3.5" /> Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteBundle}
              disabled={isPending}
            >
              <Trash2 className="size-3.5" /> Delete
            </Button>
          </div>
        </div>
      </div>

      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Total cost"
          value={Number(bundle.total_cost)}
          format="currency"
          icon={Wallet}
          tone="navy"
          hint="Paid for the whole unit"
        />
        <StatTile
          label="Parts sold separately"
          value={removedValue}
          format="currency"
          icon={Unplug}
          tone="amber"
          hint={
            removedValue > 0
              ? `At cost · sold for ${formatCurrency(getRemovedRevenue(bundle))}`
              : "Cost of parts taken out and sold"
          }
        />
        <StatTile
          label="Worth now"
          value={worth}
          format="currency"
          icon={Boxes}
          tone="glow"
          hint={sold ? "At the time it was sold" : "Its cost in inventory"}
        />
        <StatTile
          label="Sell price"
          value={Number(bundle.product.sell_price)}
          format="currency"
          icon={Tag}
          tone="violet"
          hint={sold ? "Sold" : "Sell it from the Sales page"}
        />
      </Stagger>

      <AnimatedCard flush>
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4 pb-3">
          <div>
            <h2 className="card-title">Components</h2>
            <p className="card-subtitle mt-0.5">
              {sold
                ? "This bundle is sold, so its parts can no longer be taken out."
                : "Take out sells a part on its own in one step. The bundle's worth drops by that part's cost."}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditing(null);
              setShowComponentForm(true);
            }}
          >
            <Plus className="size-3.5" /> Add component
          </Button>
        </div>

        <div className="overflow-x-auto px-2">
          <table className="data-table">
            <thead>
              <tr>
                <th>Component</th>
                <th className="text-right">Qty</th>
                <th className="hidden text-right md:table-cell">Cost each</th>
                <th className="hidden text-right md:table-cell">Total</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bundle.components.map((component) => {
                const remaining = getRemaining(component);
                const busy = isPending && busyId === component.id;
                return (
                  <tr key={component.id} className={busy ? "opacity-60" : ""}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy-700">
                          <Cpu className="size-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`font-medium ${
                              remaining === 0 ? "text-muted line-through" : ""
                            }`}
                          >
                            {getComponentLabel(component)}
                          </p>
                          {component.model && (
                            <p className="text-xs text-muted">
                              {component.name}
                            </p>
                          )}
                          {component.product_id && (
                            <Link
                              href={`/product/${component.product_id}`}
                              className="text-xs text-muted transition-colors hover:text-navy-600"
                            >
                              From inventory
                            </Link>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-right tabular-nums">
                      {component.removed_quantity > 0
                        ? `${remaining} of ${component.quantity}`
                        : component.quantity}
                    </td>
                    <td className="hidden text-right tabular-nums text-muted md:table-cell">
                      {formatCurrency(component.unit_cost)}
                    </td>
                    <td className="hidden text-right tabular-nums md:table-cell">
                      {formatCurrency(
                        component.quantity * Number(component.unit_cost),
                      )}
                    </td>
                    <td>
                      <ComponentStatus
                        component={component}
                        bundleSold={sold}
                      />
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        {busy && (
                          <Loader2 className="size-3.5 animate-spin text-muted" />
                        )}
                        {!sold && remaining > 0 && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setTakingOut(component)}
                            disabled={isPending}
                          >
                            <Unplug className="size-3.5" /> Take out
                          </Button>
                        )}
                        {!sold && component.removed_quantity > 0 && (
                          <button
                            type="button"
                            onClick={() => handleUndoSale(component)}
                            disabled={isPending}
                            aria-label={`Cancel the sale of ${component.name}`}
                            title="Cancel the sale and put it back"
                            className={iconBtn}
                          >
                            <Undo2 className="size-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(component);
                            setShowComponentForm(true);
                          }}
                          disabled={isPending}
                          aria-label={`Edit ${component.name}`}
                          title="Edit"
                          className={iconBtn}
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteComponent(component)}
                          disabled={isPending || component.removed_quantity > 0}
                          aria-label={`Delete ${component.name}`}
                          title={
                            component.removed_quantity > 0
                              ? "Cancel its sale before deleting"
                              : "Delete"
                          }
                          className={`${iconBtn} hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {bundle.components.length === 0 && (
            <EmptyState
              icon={Cpu}
              title="No components listed"
              description="Add the parts inside this unit so you can track or sell them separately."
            />
          )}
        </div>

        {bundle.components.length > 0 && (
          <div className="flex flex-wrap justify-between gap-2 border-t border-line/70 px-5 py-3 text-xs text-muted">
            <span>
              Components total{" "}
              <span className="font-semibold text-ink">
                {formatCurrency(componentsValue)}
              </span>
            </span>
            {rest >= 0 ? (
              <span>
                Rest of the unit{" "}
                <span className="font-semibold text-ink">
                  {formatCurrency(rest)}
                </span>
              </span>
            ) : (
              <span className="font-semibold text-amber-700">
                Components cost {formatCurrency(-rest)} more than the total cost
              </span>
            )}
          </div>
        )}
      </AnimatedCard>

      <BundleFormModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        options={options}
        bundle={bundle}
      />
      <ComponentFormModal
        isOpen={showComponentForm}
        onClose={() => setShowComponentForm(false)}
        bundle={bundle}
        options={options}
        component={editing}
      />
      <SellComponentModal
        onClose={() => setTakingOut(null)}
        bundle={bundle}
        options={options}
        component={takingOut}
      />
    </div>
  );
}
