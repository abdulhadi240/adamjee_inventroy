"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

/* ---------------------------------------------------------------------------
   Date helpers — values are plain "YYYY-MM-DD" strings (what forms/actions use)
   --------------------------------------------------------------------------- */

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (s?: string | null) => {
  if (!s) return null;
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};
const formatDisplay = (s?: string | null) => {
  const d = fromISO(s);
  return d
    ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "";
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/** 6 weeks × 7 days grid starting on Monday. */
function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday = 0
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/* --------------------------------------------------------------------------- */

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  /** Form field name; the value is submitted as YYYY-MM-DD. */
  name?: string;
  label?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  placeholder?: string;
  /** field = standard form input · compact = table inline edit · bare = no border (inside a pill) */
  variant?: "field" | "compact" | "bare";
  "aria-label"?: string;
}

export default function DatePicker({
  value,
  onChange,
  name,
  label,
  id,
  required,
  disabled,
  min,
  max,
  placeholder = "Select date",
  variant = "field",
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  // Portals must not render during SSR/hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const selected = fromISO(value);
  const [view, setView] = useState(() => {
    const d = selected ?? new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [pos, setPos] = useState<{ top: number; left: number; up: boolean }>({
    top: 0,
    left: 0,
    up: false,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const todayISO = toISO(new Date());
  const days = useMemo(() => monthGrid(view.y, view.m), [view]);
  const isDisabledDay = (iso: string) =>
    (min && iso < min.slice(0, 10)) || (max && iso > max.slice(0, 10));

  const openPicker = () => {
    if (disabled) return;
    const d = selected ?? new Date();
    setView({ y: d.getFullYear(), m: d.getMonth() });
    setOpen((o) => !o);
  };

  // Position the popover against the trigger (fixed, so tables/modals can't clip it)
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r) return;
      const width = 288;
      const height = 340;
      const up = r.bottom + height + 8 > window.innerHeight && r.top > height;
      const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);
      setPos({ top: up ? r.top - 8 : r.bottom + 8, left, up });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  // Close on outside click / Escape (Escape here shouldn't also close a parent modal)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!popRef.current?.contains(t) && !triggerRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const pick = (iso: string) => {
    onChange(iso);
    setOpen(false);
  };

  const shiftMonth = (delta: number) =>
    setView(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const triggerClass = {
    field: `field flex items-center justify-between gap-2 text-left ${
      open ? "border-navy-500 ring-4 ring-navy-500/10" : ""
    }`,
    compact: `flex h-8 items-center gap-1.5 rounded-lg border bg-white px-2.5 text-xs font-medium text-ink transition-colors ${
      open ? "border-navy-500" : "border-line hover:border-navy-200"
    } disabled:opacity-50`,
    bare: "flex h-8 items-center gap-1.5 rounded-full px-1.5 text-xs font-medium text-ink transition-colors hover:bg-navy-50",
  }[variant];

  return (
    <div className={variant === "field" ? "" : "inline-block"}>
      {label && (
        <label htmlFor={id ?? name} className="field-label">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          ref={triggerRef}
          id={id ?? name}
          type="button"
          onClick={openPicker}
          disabled={disabled}
          aria-label={ariaLabel ?? label}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={`cursor-pointer disabled:cursor-not-allowed ${triggerClass}`}
        >
          <span className={value ? "text-ink" : "text-muted/70"}>
            {value ? formatDisplay(value) : placeholder}
          </span>
          {variant !== "bare" && (
            <CalendarDays
              className={`shrink-0 text-muted ${variant === "compact" ? "size-3.5" : "size-4"}`}
            />
          )}
        </button>

        {/* Submits the value with the form and keeps native "required" validation */}
        {name && (
          <input
            tabIndex={-1}
            aria-hidden="true"
            name={name}
            value={value}
            required={required}
            onChange={() => {}}
            onFocus={() => triggerRef.current?.focus()}
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-full opacity-0"
          />
        )}
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="datepicker"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "fixed",
                  left: pos.left,
                  top: pos.top,
                  transform: pos.up ? "translateY(-100%)" : undefined,
                }}
                className="z-[150]"
              >
              <motion.div
                ref={popRef}
                role="dialog"
                aria-label="Choose date"
                initial={{ opacity: 0, y: pos.up ? 6 : -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: pos.up ? 4 : -4 }}
                transition={{ duration: 0.15 }}
                className="w-72 rounded-2xl border border-line bg-white p-3 shadow-lift"
              >
                {/* Header */}
                <div className="mb-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => shiftMonth(-1)}
                    aria-label="Previous month"
                    className="grid size-8 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-navy-50 hover:text-navy-700"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <p className="font-display text-sm font-semibold text-ink">
                    {new Date(view.y, view.m, 1).toLocaleDateString("en-GB", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    aria-label="Next month"
                    className="grid size-8 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-navy-50 hover:text-navy-700"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>

                {/* Weekdays */}
                <div className="grid grid-cols-7 pb-1">
                  {WEEKDAYS.map((w) => (
                    <span
                      key={w}
                      className="py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted"
                    >
                      {w}
                    </span>
                  ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-0.5">
                  {days.map((d) => {
                    const iso = toISO(d);
                    const inMonth = d.getMonth() === view.m;
                    const isSel = iso === value?.slice(0, 10);
                    const isToday = iso === todayISO;
                    const off = isDisabledDay(iso);
                    return (
                      <button
                        key={iso}
                        type="button"
                        disabled={!!off}
                        onClick={() => pick(iso)}
                        className={`relative grid h-9 cursor-pointer place-items-center rounded-lg text-[13px] tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-25 ${
                          isSel
                            ? "bg-navy-700 font-semibold text-white"
                            : isToday
                            ? "font-semibold text-navy-700 ring-1 ring-inset ring-navy-200 hover:bg-navy-50"
                            : inMonth
                            ? "text-ink hover:bg-navy-50"
                            : "text-muted/50 hover:bg-canvas"
                        }`}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                  <button
                    type="button"
                    disabled={!!isDisabledDay(todayISO)}
                    onClick={() => pick(todayISO)}
                    className="cursor-pointer rounded-full px-3 py-1 text-xs font-semibold text-navy-700 transition-colors hover:bg-navy-50 disabled:opacity-40"
                  >
                    Today
                  </button>
                  {!required && value && (
                    <button
                      type="button"
                      onClick={() => pick("")}
                      className="cursor-pointer rounded-full px-3 py-1 text-xs font-semibold text-muted transition-colors hover:bg-canvas hover:text-ink"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
