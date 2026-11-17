"use client";

import { useState } from "react";
import Link from "next/link";
import { PackageOpen, Plus, Unplug, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  AnimatedCard,
  EmptyState,
  PageHeader,
  Stagger,
  StatTile,
} from "@/components/ui/motion";
import BundleFormModal from "@/components/features/bundles/BundleFormModal";
import { formatCurrency } from "@/lib/utils/formatters";
import {
  getCurrentWorth,
  getRemovedCount,
  isBundleSold,
} from "@/lib/utils/bundles";
import { Bundle, BundleFormOptions } from "@/lib/types";

export function BundleStatusBadge({ bundle }: { bundle: Bundle }) {
  if (isBundleSold(bundle))
    return (
      <span className="badge bg-slate-100 text-slate-600 ring-1 ring-slate-200">
        <span className="size-1.5 rounded-full bg-slate-400" />
        Sold
      </span>
    );
  if (getRemovedCount(bundle) > 0)
    return (
      <span className="badge bg-amber-50 text-amber-700 ring-1 ring-amber-100">
        <span className="size-1.5 rounded-full bg-amber-500" />
        Parts sold
      </span>
    );
  return (
    <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
      <span className="size-1.5 rounded-full bg-emerald-500" />
      Complete
    </span>
  );
}

interface BundleListProps {
  bundles: Bundle[];
  options: BundleFormOptions;
  search?: string;
}

export default function BundleList({
  bundles,
  options,
  search,
}: BundleListProps) {
  const [showForm, setShowForm] = useState(false);

  const inStock = bundles.filter((b) => !isBundleSold(b));
  const worth = inStock.reduce((sum, b) => sum + getCurrentWorth(b), 0);
  const takenOut = inStock.reduce((sum, b) => sum + getRemovedCount(b), 0);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Bundles"
        description="Complete units like PCs and laptops, with the parts inside them."
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="size-4" strokeWidth={2.5} />
            Add bundle
          </Button>
        }
      />

      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatTile
          label="Bundles in stock"
          value={inStock.length}
          icon={PackageOpen}
          tone="navy"
          hint="Not yet sold"
        />
        <StatTile
          label="Current worth"
          value={worth}
          format="currency"
          icon={Wallet}
          tone="glow"
          hint="Cost, minus parts sold separately"
        />
        <div className="col-span-2 lg:col-span-1">
          <StatTile
            label="Parts sold separately"
            value={takenOut}
            icon={Unplug}
            tone="amber"
            hint="From bundles still in stock"
          />
        </div>
      </Stagger>

      <AnimatedCard flush>
        <div className="px-5 pt-4 pb-3">
          <h2 className="card-title">All bundles</h2>
          <p className="card-subtitle mt-0.5">
            Open a bundle to see its parts or take one out and sell it.
          </p>
        </div>
        <div className="overflow-x-auto px-2 pb-2">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bundle</th>
                <th className="hidden md:table-cell">Parts</th>
                <th className="hidden text-right lg:table-cell">Total cost</th>
                <th className="text-right">Worth now</th>
                <th className="hidden text-right md:table-cell">Sell price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bundles.map((bundle) => {
                const removed = getRemovedCount(bundle);
                const parts = bundle.components.reduce(
                  (sum, c) => sum + c.quantity,
                  0,
                );
                return (
                  <tr key={bundle.id} className="group">
                    <td>
                      <Link
                        href={`/bundles/${bundle.id}`}
                        className="flex items-center gap-3"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy-700">
                          <PackageOpen className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink transition-colors group-hover:text-navy-600">
                            {bundle.product.product_name}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {bundle.bundle_type}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="hidden text-muted md:table-cell">
                      {parts === 0
                        ? "—"
                        : removed > 0
                          ? `${parts - removed} of ${parts} inside`
                          : `${parts} inside`}
                    </td>
                    <td className="hidden text-right tabular-nums text-muted lg:table-cell">
                      {formatCurrency(bundle.total_cost)}
                    </td>
                    <td className="text-right font-medium tabular-nums">
                      {formatCurrency(getCurrentWorth(bundle))}
                    </td>
                    <td className="hidden text-right tabular-nums md:table-cell">
                      {formatCurrency(bundle.product.sell_price)}
                    </td>
                    <td>
                      <BundleStatusBadge bundle={bundle} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {bundles.length === 0 && (
            <EmptyState
              icon={PackageOpen}
              title={search ? "No matching bundles" : "No bundles yet"}
              description="Add a PC, laptop or any other complete unit and list the parts inside it."
            />
          )}
        </div>
      </AnimatedCard>

      <BundleFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        options={options}
      />
    </div>
  );
}
