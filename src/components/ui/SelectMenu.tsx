"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
  /** Small secondary text shown on the right. */
  hint?: string;
};

interface SelectMenuProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Adds a search box at the top of the list; use for long lists. */
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
}

const MAX_HEIGHT = 280;

/**
 * A styled replacement for a native <select>: a button that opens a list
 * matching the rest of the app, with keyboard support and optional search.
 */
export default function SelectMenu({
  id,
  label,
  value,
  onChange,
  options,
  searchable = false,
  searchPlaceholder = "Search…",
  disabled = false,
}: SelectMenuProps) {
  const listId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const [position, setPosition] = useState<React.CSSProperties | null>(null);

  const selected = options.find((o) => o.value === value);
  const needle = query.trim().toLowerCase();
  const visible = needle
    ? options.filter((o) => o.label.toLowerCase().includes(needle))
    : options;

  const open = () => {
    if (disabled) return;
    setQuery("");
    setActive(options.findIndex((o) => o.value === value));
    setIsOpen(true);
  };

  const close = (refocus = true) => {
    setIsOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  const pick = (option: SelectOption) => {
    onChange(option.value);
    close();
  };

  // Portalled to <body> so popups never clip it; flips above the button when
  // there is clearly more room there.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const place = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const below = window.innerHeight - rect.bottom - 12;
      const above = rect.top - 12;
      const openUp = below < 180 && above > below;
      setPosition({
        left: rect.left,
        width: rect.width,
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
    if (searchable) searchRef.current?.focus();
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !buttonRef.current?.contains(target) &&
        !popupRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen, searchable]);

  // Keep the highlighted row in view while arrowing through the list
  useEffect(() => {
    if (!isOpen || active < 0) return;
    popupRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [isOpen, active, position]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        open();
      }
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (visible.length === 0) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((prev) =>
        prev < 0
          ? step === 1
            ? 0
            : visible.length - 1
          : (prev + step + visible.length) % visible.length
      );
    } else if (e.key === "Enter") {
      // Never submit the surrounding form from an open list
      e.preventDefault();
      if (visible[active]) pick(visible[active]);
    } else if (e.key === "Escape") {
      e.stopPropagation();
      close();
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
        className={`field flex cursor-pointer items-center justify-between gap-2 text-left ${
          isOpen ? "border-navy-500 ring-4 ring-navy-500/10" : ""
        }`}
      >
        <span className="truncate">{selected?.label ?? "Select…"}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen &&
        position &&
        createPortal(
          <div
            ref={popupRef}
            style={position}
            className="fixed z-[200] flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-lift"
          >
            {searchable && (
              <div className="relative shrink-0 border-b border-line">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  autoComplete="off"
                  className="w-full bg-transparent py-2.5 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted/60"
                />
              </div>
            )}
            <div
              id={listId}
              role="listbox"
              aria-label={label}
              className="min-h-0 flex-1 overflow-y-auto p-1.5 [scrollbar-width:thin]"
            >
              {visible.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-index={index}
                    // Keep focus where it is so keyboard control keeps working
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => pick(option)}
                    className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                      index === active ? "bg-navy-50" : ""
                    } ${
                      isSelected
                        ? "font-semibold text-navy-800"
                        : "font-medium text-ink"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {option.label}
                    </span>
                    {option.hint && (
                      <span className="shrink-0 text-[11px] font-normal tabular-nums text-muted">
                        {option.hint}
                      </span>
                    )}
                    <Check
                      className={`size-4 shrink-0 text-navy-600 ${
                        isSelected ? "" : "invisible"
                      }`}
                    />
                  </button>
                );
              })}
              {visible.length === 0 && (
                <p className="px-2.5 py-2 text-sm text-muted">
                  No matches found.
                </p>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
