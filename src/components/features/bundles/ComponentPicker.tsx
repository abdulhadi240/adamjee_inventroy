"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Boxes, ChevronDown, Plus, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";
import { BundleFormOptions } from "@/lib/types";

export type PickedComponent = {
  name: string;
  /** Set when the component was chosen from inventory. */
  product_id: number | null;
  /** Cost price of the chosen inventory item, to prefill "cost each". */
  buy_price?: number;
};

interface ComponentPickerProps {
  id?: string;
  name: string;
  productId: number | null;
  options: BundleFormOptions;
  onChange: (picked: PickedComponent) => void;
  placeholder?: string;
  ariaLabel?: string;
  autoFocus?: boolean;
  className?: string;
}

type Item =
  | { kind: "name"; key: string; label: string }
  | {
      kind: "product";
      key: string;
      label: string;
      id: number;
      stock: number;
      buyPrice: number;
    }
  | { kind: "create"; key: string; label: string };

/** Tallest the list gets, and the room it wants below the field. */
const MAX_HEIGHT = 300;
const MIN_ROOM = 220;
const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, "");

/**
 * Dropdown for a bundle component: pick a kind of part (Processor, RAM, …),
 * pick an item from inventory, or type a new one. Whatever is typed is kept
 * as-is, so the list never restricts the user.
 */
export default function ComponentPicker({
  id,
  name,
  productId,
  options,
  onChange,
  placeholder = "Choose or type a component",
  ariaLabel,
  autoFocus,
  className = "",
}: ComponentPickerProps) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  // Show the full list until the user types after opening
  const [filtering, setFiltering] = useState(false);
  const [active, setActive] = useState(-1);
  const [position, setPosition] = useState<React.CSSProperties | null>(null);

  const typed = name.trim();
  const query = filtering ? normalize(name) : "";

  const names: Item[] = options.componentNames
    .filter((n) => !query || normalize(n).includes(query))
    .map((n) => ({ kind: "name", key: `n-${n}`, label: n }));
  const products: Item[] = options.products
    .filter((p) => !query || normalize(p.product_name).includes(query))
    .map((p) => ({
      kind: "product",
      key: `p-${p.id}`,
      label: p.product_name,
      id: p.id,
      stock: p.amount_stock,
      buyPrice: Number(p.buy_price),
    }));
  const isKnown =
    options.componentNames.some((n) => normalize(n) === normalize(typed)) ||
    options.products.some(
      (p) => normalize(p.product_name) === normalize(typed)
    );
  const create: Item[] =
    typed && !isKnown ? [{ kind: "create", key: "create", label: typed }] : [];

  // One flat list drives both rendering and arrow-key navigation
  const items = [...names, ...products, ...create];

  const close = () => {
    setIsOpen(false);
    setFiltering(false);
    setActive(-1);
  };

  const open = () => {
    if (isOpen) return;
    // Make room below the field first, so the list never has to cover the form
    const rect = inputRef.current?.getBoundingClientRect();
    if (rect && window.innerHeight - rect.bottom < MIN_ROOM) {
      inputRef.current?.scrollIntoView({ block: "center" });
    }
    setIsOpen(true);
    setActive(-1);
  };

  const pick = (item: Item) => {
    onChange(
      item.kind === "product"
        ? { name: item.label, product_id: item.id, buy_price: item.buyPrice }
        : { name: item.label, product_id: null }
    );
    close();
  };

  // The list is portalled to <body> so popups and tables never clip it. It
  // opens below the field and only flips above when there is no room at all.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const place = () => {
      const rect = inputRef.current?.getBoundingClientRect();
      if (!rect) return;
      const below = window.innerHeight - rect.bottom - 12;
      const above = rect.top - 12;
      const openUp = below < 140 && above > below;
      const width = Math.max(rect.width, 300);
      setPosition({
        left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
        width,
        maxHeight: Math.min(MAX_HEIGHT, openUp ? above : below),
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + 6 }
          : { top: rect.bottom + 6 }),
      });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !inputRef.current?.parentElement?.contains(target) &&
        !listRef.current?.contains(target)
      ) {
        setIsOpen(false);
        setFiltering(false);
        setActive(-1);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen]);

  // Keep the highlighted row in view while arrowing through the list
  useEffect(() => {
    if (active < 0) return;
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        open();
        return;
      }
      if (items.length === 0) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((prev) =>
        prev < 0
          ? step === 1
            ? 0
            : items.length - 1
          : (prev + step + items.length) % items.length
      );
    } else if (e.key === "Enter" && isOpen) {
      // Never submit the surrounding form from an open list
      e.preventDefault();
      if (active >= 0 && items[active]) pick(items[active]);
      else close();
    } else if (e.key === "Escape" && isOpen) {
      e.stopPropagation();
      close();
    } else if (e.key === "Tab") {
      close();
    }
  };

  const optionProps = (item: Item, index: number, selected: boolean) => ({
    type: "button" as const,
    role: "option",
    "aria-selected": selected,
    "data-index": index,
    onMouseEnter: () => setActive(index),
    onClick: () => pick(item),
  });

  const groupLabel =
    "px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted";

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={name}
        onChange={(e) => {
          // Typing makes it a custom component until an item is picked again
          onChange({ name: e.target.value, product_id: null });
          setFiltering(true);
          setActive(-1);
          setIsOpen(true);
        }}
        onFocus={open}
        onClick={open}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label={ariaLabel}
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder={placeholder}
        className={`field py-2 pr-9 ${productId ? "pl-9" : ""}`}
      />
      {productId && (
        <Boxes
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-emerald-600"
          aria-label="From inventory"
        />
      )}
      {name ? (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            onChange({ name: "", product_id: null });
            inputRef.current?.focus();
          }}
          aria-label="Clear component"
          className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink"
        >
          <X className="size-3.5" />
        </button>
      ) : (
        <ChevronDown
          className={`pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      )}

      {isOpen &&
        position &&
        createPortal(
          <div
            ref={listRef}
            id={listId}
            role="listbox"
            style={position}
            // Keep focus in the field so typing and arrow keys keep working
            onMouseDown={(e) => e.preventDefault()}
            className="fixed z-[200] flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-lift"
          >
            <div className="min-h-0 flex-1 overflow-y-auto p-2 [scrollbar-width:thin]">
              {names.length > 0 && (
                <div className="pt-1">
                  <p className={groupLabel}>Type of part</p>
                  {/* Chips keep the common types to a couple of lines */}
                  <div className="flex flex-wrap gap-1.5 px-1 pb-1">
                    {names.map((item, index) => {
                      const selected =
                        !productId &&
                        normalize(item.label) === normalize(typed);
                      return (
                        <button
                          key={item.key}
                          {...optionProps(item, index, selected)}
                          className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            selected
                              ? "border-navy-700 bg-navy-700 text-white"
                              : index === active
                                ? "border-navy-300 bg-navy-50 text-navy-800"
                                : "border-line bg-white text-ink"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {products.length > 0 && (
                <div
                  className={
                    names.length > 0 ? "mt-2 border-t border-line/70 pt-3" : "pt-1"
                  }
                >
                  <p className={groupLabel}>From your inventory</p>
                  {products.map((item, i) => {
                    if (item.kind !== "product") return null;
                    const index = names.length + i;
                    const selected = item.id === productId;
                    return (
                      <button
                        key={item.key}
                        {...optionProps(item, index, selected)}
                        className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors ${
                          selected
                            ? "bg-navy-50"
                            : index === active
                              ? "bg-canvas"
                              : ""
                        }`}
                      >
                        <span
                          className={`min-w-0 flex-1 truncate text-sm ${
                            selected
                              ? "font-semibold text-navy-800"
                              : "font-medium text-ink"
                          }`}
                        >
                          {item.label}
                        </span>
                        <span className="shrink-0 text-right text-[11px] tabular-nums text-muted">
                          {formatCurrency(item.buyPrice)}
                          <span
                            className={`ml-2 rounded-full px-1.5 py-0.5 font-medium ${
                              item.stock > 0
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {item.stock} in stock
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {names.length === 0 && products.length === 0 && (
                <p className="px-2 py-2 text-sm text-muted">
                  {typed
                    ? "Nothing matches. Add it as a new component below."
                    : "Type a name to add a component."}
                </p>
              )}
            </div>

            {create.map((item) => {
              const index = items.length - 1;
              return (
                <button
                  key={item.key}
                  {...optionProps(item, index, false)}
                  className={`flex w-full shrink-0 cursor-pointer items-center gap-2.5 border-t border-line px-3 py-2.5 text-left text-sm font-semibold text-navy-700 transition-colors ${
                    index === active ? "bg-navy-50" : "bg-canvas/60"
                  }`}
                >
                  <span className="grid size-5 shrink-0 place-items-center rounded-md bg-navy-700 text-white">
                    <Plus className="size-3" strokeWidth={3} />
                  </span>
                  <span className="truncate">
                    Add &ldquo;{item.label}&rdquo; as a new component
                  </span>
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
