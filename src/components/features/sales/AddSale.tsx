"use client";

import { notify } from "@/components/ui/Dialog";
import {
  useState,
  useActionState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useTransition,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { insertSale } from "@/lib/actions/sales";
import { addProductStock } from "@/lib/actions/products";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { CustomerFormModal } from "@/components/features/customers/AddCustomer";
import { ProductFormModal } from "@/components/features/inventory/AddProduct";
import { useQuickCreate } from "@/lib/hooks/use-quick-create";
import {
  formatCurrency,
  formatDisplayPhoneNumber,
} from "@/lib/utils/formatters";
import {
  FormState,
  ProductOption,
  CustomerOption,
  SupplierOption,
  SaleItem,
} from "@/lib/types";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/constants";
import DatePicker from "@/components/ui/DatePicker";
import BundleContentsToggle, {
  countParts,
  useBundleContentsLookup,
} from "@/components/features/bundles/BundleContents";

const initialState: FormState = { success: false, message: "" };

const today = () => new Date().toISOString().split("T")[0];

// Cart columns from the sm breakpoint up: item, price, qty, amount, remove
const CART_COLS = "sm:grid-cols-[minmax(0,1fr)_7.5rem_6rem_6.5rem_2rem]";

/** "Rs 500 off" / "Rs 200 above" pill; nothing at the regular price. */
function PriceChangeBadge({
  listPrice,
  price,
}: {
  listPrice: number;
  price: number;
}) {
  if (price === listPrice) return null;
  const off = price < listPrice;
  return (
    <span
      className={`badge ring-1 ${
        off
          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
          : "bg-amber-50 text-amber-700 ring-amber-100"
      }`}
    >
      {formatCurrency(Math.abs(listPrice - price))} {off ? "off" : "above"}
    </span>
  );
}

interface AddSaleProps {
  products: ProductOption[];
  customers: CustomerOption[];
  suppliers?: SupplierOption[];
  onSaleChange: () => void;
}

/** Pill segmented control with a sliding highlight; mirrors value into a hidden input. */
function Segmented({
  name,
  label,
  options,
  value,
  onChange,
}: {
  name: string;
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="field-label">{label}</p>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap gap-1 rounded-2xl border border-line bg-canvas/70 p-1">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={`relative flex-1 cursor-pointer whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                active ? "text-white" : "text-muted hover:text-ink"
              }`}
            >
              {active && (
                <motion.span
                  layoutId={`seg-${name}`}
                  className="absolute inset-0 rounded-xl bg-navy-700"
                  transition={{ duration: 0.2, ease: "easeOut" }}
                />
              )}
              <span className="relative">{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QtyStepper({
  value,
  max,
  onChange,
  size = "md",
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  size?: "sm" | "md";
}) {
  const btn = `grid cursor-pointer place-items-center rounded-full text-ink transition-all hover:bg-navy-50 hover:text-navy-700 disabled:pointer-events-none disabled:opacity-30 ${
    size === "sm" ? "size-6" : "size-8"
  }`;
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-line bg-white p-0.5 ${
        size === "sm" ? "" : "h-10.5"
      }`}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        className={btn}
        disabled={value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        <Minus className="size-3.5" />
      </button>
      <span
        className={`min-w-7 text-center font-semibold tabular-nums ${
          size === "sm" ? "text-xs" : "text-sm"
        }`}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        className={btn}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

/**
 * Unit price field. Keeps what is being typed as text, so the field can be
 * cleared and retyped, and reports a number once it is a valid price.
 */
function PriceInput({
  value,
  onChange,
  label,
  size = "md",
  className = "",
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const [text, setText] = useState(String(value));

  // Follow changes made from outside (e.g. a different product was picked)
  useEffect(() => {
    setText((current) => (Number(current) === value ? current : String(value)));
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">
        Rs
      </span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step={1}
        onWheel={(e) => e.currentTarget.blur()}
        aria-label={label}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const next = Number(e.target.value);
          if (e.target.value !== "" && Number.isFinite(next) && next >= 0) {
            // Prices are shown in whole rupees everywhere
            onChange(Math.round(next));
          }
        }}
        onBlur={() => setText(String(value))}
        onKeyDown={(e) => {
          // Enter must not submit the whole sale
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        className={`field no-spinner w-full pl-8 text-right tabular-nums ${
          size === "sm" ? "rounded-lg py-1.5 text-[13px]" : ""
        }`}
      />
    </div>
  );
}

/**
 * "Add stock" shortcut for the selected product, so a sale is not blocked
 * when the shelf count in the app is behind the real one.
 */
function AddStockInline({
  productId,
  onAdded,
}: {
  productId: number;
  onAdded: (amountStock: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState("1");
  const [isSaving, startSaving] = useTransition();

  const amount = Number(qty);
  const valid = Number.isInteger(amount) && amount > 0;

  const save = () => {
    if (!valid || isSaving) return;
    startSaving(async () => {
      const result = await addProductStock(productId, amount);
      if (result.success && result.data) {
        onAdded(result.data.amount_stock);
        setOpen(false);
        setQty("1");
      } else {
        notify(result.message);
      }
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="badge cursor-pointer bg-navy-700 text-white transition-colors hover:bg-navy-800"
      >
        <Plus className="size-3" strokeWidth={2.5} />
        Add stock
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <input
        type="number"
        inputMode="numeric"
        min={1}
        step={1}
        autoFocus
        aria-label="Units to add to stock"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        onKeyDown={(e) => {
          // Enter must not submit the whole sale
          if (e.key === "Enter") {
            e.preventDefault();
            save();
          } else if (e.key === "Escape") {
            e.stopPropagation();
            setOpen(false);
          }
        }}
        className="field no-spinner w-16 rounded-lg px-2 py-1 text-center text-xs tabular-nums"
      />
      <button
        type="button"
        onClick={save}
        disabled={!valid || isSaving}
        className="badge cursor-pointer bg-navy-700 py-1 text-white transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? "Adding…" : "Add to stock"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        disabled={isSaving}
        className="badge cursor-pointer bg-white py-1 text-muted ring-1 ring-line hover:text-ink"
      >
        Cancel
      </button>
    </span>
  );
}

export default function AddSale({
  products: baseProducts = [],
  customers: baseCustomers = [],
  suppliers = [],
  onSaleChange,
}: AddSaleProps) {
  // "Add new …" shortcuts in the pickers
  const customerQuick = useQuickCreate(baseCustomers);
  const productQuick = useQuickCreate(baseProducts);
  const customers = customerQuick.items;

  // Stock added from this form, shown at once without waiting for a reload
  const [stockOverrides, setStockOverrides] = useState<Record<string, number>>(
    {},
  );
  // Fresh server data already includes it
  useEffect(() => setStockOverrides({}), [baseProducts]);

  const products = useMemo(
    () =>
      productQuick.items.map((p) =>
        String(p.id) in stockOverrides
          ? { ...p, amount_stock: stockOverrides[String(p.id)] }
          : p,
      ),
    [productQuick.items, stockOverrides],
  );

  const [showForm, setShowForm] = useState(false);
  const [state, formAction, isPending] = useActionState(
    insertSale,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [saleDate, setSaleDate] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");

  const [tempProductId, setTempProductId] = useState<string | null>(null);
  const [tempQty, setTempQty] = useState(1);
  const [tempPrice, setTempPrice] = useState(0);
  const [itemFormKey, setItemFormKey] = useState(0);
  const [itemError, setItemError] = useState<string | null>(null);

  const processedStateRef = useRef(initialState);

  const stockOf = (productId: string) =>
    products.find((p) => String(p.id) === productId)?.amount_stock ?? 0;

  const customerOptions = (customers || []).map((c) => ({
    id: String(c.id),
    main_text: c.name,
    secondary_text: formatDisplayPhoneNumber(c.contact_number),
  }));

  const bundleOf = useBundleContentsLookup();

  const productOptions = (products || []).map((p) => {
    const bundle = bundleOf(p.id);
    const parts = bundle ? countParts(bundle) : 0;
    return {
      id: String(p.id),
      main_text: p.product_name,
      secondary_text: `${
        bundle
          ? `${bundle.bundle_type} bundle · ${parts} ${
              parts === 1 ? "part" : "parts"
            } · `
          : ""
      }${p.amount_stock} in stock · ${formatCurrency(p.sell_price)}`,
    };
  });

  const tempProduct = products.find((p) => String(p.id) === tempProductId);
  const alreadyInCart =
    items.find((i) => i.product_id === tempProductId)?.quantity ?? 0;
  const tempMax = tempProduct
    ? Math.max(tempProduct.amount_stock - alreadyInCart, 0)
    : 1;

  const totalAmount = items.reduce(
    (acc, item) => acc + item.quantity * item.sell_price,
    0,
  );
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);
  // What the cart would cost at each product's regular price
  const regularTotal = items.reduce(
    (acc, item) => acc + item.quantity * item.list_price,
    0,
  );

  const resetItemForm = () => {
    setTempProductId(null);
    setTempQty(1);
    setItemError(null);
    setItemFormKey((prev) => prev + 1);
  };

  const handleDiscard = useCallback(() => {
    formRef.current?.reset();
    setItems([]);
    setPaymentStatus("Paid");
    setPaymentMethod("Cash");
    setSelectedCustomerId(null);
    setSaleDate(today());
    setTempProductId(null);
    setTempQty(1);
    setItemError(null);
    setItemFormKey((prev) => prev + 1);
    setShowForm(false);
  }, []);

  useEffect(() => {
    if (state !== processedStateRef.current && state.message) {
      processedStateRef.current = state;
      if (state.success) {
        handleDiscard();
        onSaleChange();
      } else {
        notify(state.message);
      }
    }
  }, [state, onSaleChange, handleDiscard]);

  const handleAddItem = () => {
    if (!tempProduct) return setItemError("Select a product first.");
    if (tempMax <= 0)
      return setItemError(
        `No more stock available for ${tempProduct.product_name}.`,
      );
    const qty = Math.min(tempQty, tempMax);

    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === tempProductId);
      if (existing) {
        // Same product again: more units, at the price entered this time
        return prev.map((i) =>
          i.product_id === tempProductId
            ? { ...i, quantity: i.quantity + qty, sell_price: tempPrice }
            : i,
        );
      }
      return [
        ...prev,
        {
          product_id: String(tempProduct.id),
          product_name: tempProduct.product_name,
          quantity: qty,
          sell_price: tempPrice,
          list_price: Number(tempProduct.sell_price),
        },
      ];
    });
    resetItemForm();
  };

  const updateQty = (productId: string, qty: number) =>
    setItems((prev) =>
      prev.map((i) =>
        i.product_id === productId ? { ...i, quantity: qty } : i,
      ),
    );

  const updatePrice = (productId: string, price: number) =>
    setItems((prev) =>
      prev.map((i) =>
        i.product_id === productId ? { ...i, sell_price: price } : i,
      ),
    );

  /** Picks a product for the add row and starts from its regular price. */
  const selectTempProduct = (id: string | null, price?: number) => {
    setTempProductId(id);
    setTempQty(1);
    setTempPrice(
      price ??
        // Already in the cart: keep the price agreed there
        items.find((i) => i.product_id === id)?.sell_price ??
        Number(products.find((p) => String(p.id) === id)?.sell_price ?? 0),
    );
    setItemError(null);
  };

  const removeItem = (productId: string) =>
    setItems((prev) => prev.filter((i) => i.product_id !== productId));

  // The price is the one charged in this sale, which may differ from the
  // product's regular sell price (e.g. a discount).
  const itemsPayload = items.map(({ product_id, quantity, sell_price }) => ({
    product_id,
    quantity: String(quantity),
    price: String(sell_price),
  }));

  return (
    <>
      <Button onClick={() => setShowForm(true)}>
        <Plus className="size-4" />
        New sale
      </Button>

      <Modal
        isOpen={showForm}
        onClose={handleDiscard}
        size="lg"
        title="New sale"
        description="Build the cart, then charge the customer."
        footer={
          <>
            <Button type="button" variant="secondary" onClick={handleDiscard}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="sale-form"
              variant="primary"
              disabled={isPending || items.length === 0}
            >
              {isPending
                ? "Processing…"
                : `Charge ${formatCurrency(totalAmount)}`}
            </Button>
          </>
        }
      >
        <form
          id="sale-form"
          ref={formRef}
          action={formAction}
          className="flex flex-col gap-5"
        >
          <input
            type="hidden"
            name="items"
            value={JSON.stringify(itemsPayload)}
          />

          {/* Sale details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <SearchableSelect
              label="Customer (optional)"
              name="customer_id"
              options={customerOptions}
              onSelect={setSelectedCustomerId}
              value={selectedCustomerId}
              placeholder="Walk-in customer"
              emptyText="No customers found."
              createLabel="customer"
              onCreateNew={customerQuick.open}
            />
            <DatePicker
              label="Date"
              name="sale_date"
              value={saleDate}
              onChange={setSaleDate}
              required
            />
            <Segmented
              name="payment_method"
              label="Payment method"
              options={PAYMENT_METHODS}
              value={paymentMethod}
              onChange={setPaymentMethod}
            />
            <Segmented
              name="payment_status"
              label="Payment status"
              options={PAYMENT_STATUSES}
              value={paymentStatus}
              onChange={setPaymentStatus}
            />
          </div>

          {/* Add to cart */}
          <div className="rounded-2xl border border-line bg-canvas/60 p-4">
            <SearchableSelect
              key={itemFormKey}
              label="Product"
              name="temp_product"
              options={productOptions}
              onSelect={(id) => selectTempProduct(id)}
              value={tempProductId}
              placeholder="Search products…"
              emptyText="No products found."
              createLabel="product"
              onCreateNew={productQuick.open}
            />

            <AnimatePresence initial={false}>
              {tempProduct && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  // Negative margin + inner padding leave room for focus rings,
                  // which the clipping needed for the height animation would cut
                  className="-mx-1.5 overflow-hidden"
                >
                  <div className="px-1.5 pb-1">
                    <div className="mt-4 border-t border-line pt-3.5">
                      {/* Facts about the selected product */}
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted">
                          <span>
                            Regular price{" "}
                            <span className="font-semibold tabular-nums text-ink">
                              {formatCurrency(tempProduct.sell_price)}
                            </span>
                          </span>
                          <span className="h-3 w-px bg-line" aria-hidden />
                          <span
                            className={
                              tempMax > 0
                                ? "font-semibold text-ink"
                                : "font-semibold text-rose-600"
                            }
                          >
                            {tempMax > 0
                              ? `${tempMax} in stock`
                              : "Out of stock"}
                          </span>
                          <PriceChangeBadge
                            listPrice={Number(tempProduct.sell_price)}
                            price={tempPrice}
                          />
                        </div>
                        <AddStockInline
                          key={tempProductId ?? "none"}
                          productId={Number(tempProduct.id)}
                          onAdded={(stock) => {
                            setStockOverrides((prev) => ({
                              ...prev,
                              [String(tempProduct.id)]: stock,
                            }));
                            setItemError(null);
                          }}
                        />
                      </div>

                      {tempMax > 0 ? (
                        <div className="mt-3.5 grid grid-cols-2 items-end gap-3 sm:grid-cols-[9rem_auto_minmax(0,1fr)_auto]">
                          <div>
                            <p className="field-label">Price each</p>
                            <PriceInput
                              key={tempProductId ?? "none"}
                              label="Price each"
                              value={tempPrice}
                              onChange={setTempPrice}
                            />
                          </div>
                          <div>
                            <p className="field-label">Quantity</p>
                            <QtyStepper
                              value={tempQty}
                              max={tempMax}
                              onChange={setTempQty}
                            />
                          </div>
                          <div className="sm:text-right">
                            <p className="field-label">Line total</p>
                            <p className="flex h-10.5 items-center text-base font-semibold tabular-nums text-ink sm:justify-end">
                              {formatCurrency(
                                tempPrice * Math.min(tempQty, tempMax),
                              )}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="primary"
                            onClick={handleAddItem}
                            className="h-10.5 justify-self-end"
                          >
                            <Plus className="size-4" />
                            Add to cart
                          </Button>
                        </div>
                      ) : (
                        <p className="mt-3.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700 ring-1 ring-rose-100">
                          {alreadyInCart > 0
                            ? "Every unit in stock is already in the cart."
                            : "There are no units left to sell."}{" "}
                          Use <span className="font-semibold">Add stock</span>{" "}
                          to put more in.
                        </p>
                      )}

                      {/* Parts inside the selected product, when it is a bundle */}
                      <BundleContentsToggle
                        key={tempProductId ?? "none"}
                        productId={tempProductId}
                        className="mt-3"
                        hideLink
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {itemError && (
              <p
                role="alert"
                className="mt-2 text-xs font-medium text-rose-600"
              >
                {itemError}
              </p>
            )}
          </div>

          {/* Cart */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Cart</p>
              {items.length > 0 && (
                <span className="badge bg-navy-50 text-navy-700">
                  {totalUnits} {totalUnits === 1 ? "unit" : "units"}
                </span>
              )}
            </div>

            {items.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-line bg-white">
                <div
                  className={`hidden gap-x-3 border-b border-line bg-canvas/60 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted sm:grid ${CART_COLS}`}
                >
                  <span>Item</span>
                  <span className="text-right">Price each</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Amount</span>
                  <span />
                </div>
                <ul className="divide-y divide-line">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.product_id}
                        layout="position"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-3.5 py-3 ${CART_COLS}`}
                      >
                        <div className="col-span-2 min-w-0 sm:col-span-1">
                          <p className="truncate text-sm font-medium text-ink">
                            {item.product_name}
                          </p>
                          {item.sell_price !== item.list_price && (
                            <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                              <span className="line-through">
                                {formatCurrency(item.list_price)}
                              </span>
                              <PriceChangeBadge
                                listPrice={item.list_price}
                                price={item.sell_price}
                              />
                            </p>
                          )}
                        </div>
                        <PriceInput
                          size="sm"
                          label={`Price each for ${item.product_name}`}
                          value={item.sell_price}
                          onChange={(p) => updatePrice(item.product_id, p)}
                        />
                        <div className="flex justify-center">
                          <QtyStepper
                            size="sm"
                            value={item.quantity}
                            max={stockOf(item.product_id)}
                            onChange={(q) => updateQty(item.product_id, q)}
                          />
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-ink sm:text-right">
                          {formatCurrency(item.sell_price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${item.product_name}`}
                          onClick={() => removeItem(item.product_id)}
                          className="grid size-8 cursor-pointer place-items-center justify-self-end rounded-full text-muted transition-colors hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                        <BundleContentsToggle
                          productId={item.product_id}
                          className="col-span-full"
                          hideLink
                        />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            )}

            {items.length === 0 && (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-line py-7 text-center">
                <ShoppingCart className="mb-1.5 size-5 text-navy-200" />
                <p className="text-xs text-muted">
                  The cart is empty. Add a product above.
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="field-label">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="e.g., Warranty card handed over"
              className="field resize-none"
            />
          </div>

          {/* Sticky total */}
          <div className="sticky bottom-0 -mx-6 -mb-5 border-t border-line bg-white px-6 py-3">
            {totalAmount !== regularTotal && (
              <div className="mb-1.5 flex flex-col gap-0.5 text-xs text-muted">
                <div className="flex items-center justify-between">
                  <span>Regular price</span>
                  <span className="tabular-nums">
                    {formatCurrency(regularTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>
                    {totalAmount < regularTotal ? "Discount" : "Added"}
                  </span>
                  <span
                    className={`font-medium tabular-nums ${
                      totalAmount < regularTotal
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }`}
                  >
                    {totalAmount < regularTotal ? "− " : "+ "}
                    {formatCurrency(Math.abs(regularTotal - totalAmount))}
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink">Total</span>
              <motion.span
                key={totalAmount}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="text-xl font-semibold tabular-nums text-navy-800"
              >
                {formatCurrency(totalAmount)}
              </motion.span>
            </div>
          </div>
        </form>
      </Modal>

      {/* Quick-add popups, outside the sale <form> so forms never nest */}
      <CustomerFormModal
        isOpen={customerQuick.isOpen}
        onClose={customerQuick.close}
        defaultName={customerQuick.draft}
        onCreated={(customer) => {
          customerQuick.add(customer);
          setSelectedCustomerId(String(customer.id));
        }}
      />
      <ProductFormModal
        isOpen={productQuick.isOpen}
        onClose={productQuick.close}
        suppliers={suppliers}
        defaultName={productQuick.draft}
        onCreated={(product) => {
          productQuick.add(product);
          // Not in `products` until the next render, so pass its price along
          selectTempProduct(String(product.id), Number(product.sell_price));
        }}
      />
    </>
  );
}
