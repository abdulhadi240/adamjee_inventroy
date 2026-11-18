"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Boxes, ChevronDown } from "lucide-react";
import { getBundleContentsMap } from "@/lib/actions/bundles";
import { formatCurrency } from "@/lib/utils/formatters";
import { BundleContents } from "@/lib/types";

type ContentsMap = Record<number, BundleContents>;

const BundleContentsContext = createContext<{
  map: ContentsMap;
  refresh: () => void;
}>({ map: {}, refresh: () => {} });

/**
 * Loads every bundle's parts once for the whole app, so any screen can show
 * them next to a bundle's product. Reloads on navigation to stay current.
 */
export function BundleContentsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [map, setMap] = useState<ContentsMap>({});
  const pathname = usePathname();

  const refresh = useCallback(() => {
    getBundleContentsMap()
      .then(setMap)
      .catch((err) => console.error("Bundle contents failed to load:", err));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, pathname]);

  return (
    <BundleContentsContext.Provider value={{ map, refresh }}>
      {children}
    </BundleContentsContext.Provider>
  );
}

/** The parts of the bundle behind this product, or null if it is not a bundle. */
export function useBundleContents(
  productId: number | string | null | undefined
): BundleContents | null {
  const { map } = useContext(BundleContentsContext);
  if (productId === null || productId === undefined || productId === "") {
    return null;
  }
  return map[Number(productId)] ?? null;
}

/** Lookup by product id, for lists where a hook per row is not possible. */
export function useBundleContentsLookup() {
  const { map } = useContext(BundleContentsContext);
  return (productId: number | string): BundleContents | null =>
    map[Number(productId)] ?? null;
}

/** Reload bundle parts after something changed them without a navigation. */
export function useRefreshBundleContents() {
  return useContext(BundleContentsContext).refresh;
}

export function countParts(contents: BundleContents): number {
  return contents.components.reduce(
    (sum, c) => sum + c.quantity - c.removed_quantity,
    0
  );
}

interface BundleContentsToggleProps {
  productId: number | string | null | undefined;
  className?: string;
  defaultOpen?: boolean;
  /** Hide the "Open bundle" link, e.g. inside a form that should not be left. */
  hideLink?: boolean;
}

/**
 * A "N parts" dropdown listing what is inside a bundle, with quantities and
 * costs. Renders nothing when the product is not a bundle.
 */
export default function BundleContentsToggle({
  productId,
  className = "",
  defaultOpen = false,
  hideLink = false,
}: BundleContentsToggleProps) {
  const contents = useBundleContents(productId);
  const [open, setOpen] = useState(defaultOpen);

  if (!contents) return null;

  const parts = countParts(contents);
  const partsValue = contents.components.reduce(
    (sum, c) => sum + c.quantity * Number(c.unit_cost),
    0
  );
  const removedValue = contents.components.reduce(
    (sum, c) => sum + c.removed_quantity * Number(c.unit_cost),
    0
  );
  const worthNow = Math.max(contents.total_cost - removedValue, 0);

  return (
    <div className={`min-w-0 ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy-700 ring-1 ring-navy-100 transition-colors hover:bg-navy-100"
      >
        <Boxes className="size-3" />
        {contents.bundle_type} · {parts} {parts === 1 ? "part" : "parts"}
        <ChevronDown
          className={`size-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="mt-2 min-w-56 max-w-md whitespace-normal rounded-xl border border-line bg-canvas/60 p-2.5 text-left">
              {contents.components.length === 0 ? (
                <p className="text-xs text-muted">
                  No parts listed for this bundle.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-line">
                  {contents.components.map((c) => {
                    const remaining = c.quantity - c.removed_quantity;
                    return (
                      <li
                        key={c.id}
                        className="flex items-start justify-between gap-3 py-1.5 first:pt-0"
                      >
                        <div className="min-w-0">
                          <p
                            className={`truncate text-xs font-medium ${
                              remaining === 0
                                ? "text-muted line-through"
                                : "text-ink"
                            }`}
                          >
                            {c.model || c.name}
                          </p>
                          <p className="truncate text-[11px] text-muted">
                            {c.model ? `${c.name} · ` : ""}
                            {c.quantity} × {formatCurrency(c.unit_cost)}
                          </p>
                          {c.removed_quantity > 0 && (
                            <p className="text-[11px] font-medium text-amber-700">
                              {remaining === 0
                                ? "Sold separately"
                                : `${c.removed_quantity} sold separately, ${remaining} left`}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-xs font-semibold tabular-nums text-ink">
                          {formatCurrency(c.quantity * Number(c.unit_cost))}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}

              <dl className="mt-2 flex flex-col gap-0.5 border-t border-line pt-2 text-[11px]">
                {contents.components.length > 0 && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Parts total</dt>
                    <dd className="tabular-nums text-ink">
                      {formatCurrency(partsValue)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Bundle cost</dt>
                  <dd className="tabular-nums text-ink">
                    {formatCurrency(contents.total_cost)}
                  </dd>
                </div>
                {removedValue > 0 && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Worth now</dt>
                    <dd className="font-semibold tabular-nums text-ink">
                      {formatCurrency(worthNow)}
                    </dd>
                  </div>
                )}
              </dl>

              {!hideLink && (
                <Link
                  href={`/bundles/${contents.bundle_id}`}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-navy-600 hover:text-navy-800"
                >
                  Open bundle
                  <ArrowRight className="size-3" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
