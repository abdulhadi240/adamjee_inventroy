"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

type Option = {
  id: string;
  main_text: string;
  secondary_text?: string;
};

interface SearchableSelectProps {
  label: string;
  name: string;
  options: Option[];
  onSelect: (value: string | null) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  value?: string | null;
  emptyText?: string;
  /** Shows an "Add new …" action that hands the typed text to the caller. */
  onCreateNew?: (query: string) => void;
  /** Noun for the create action, e.g. "supplier". */
  createLabel?: string;
}

export default function SearchableSelect({
  label,
  name,
  options,
  onSelect,
  required = false,
  disabled = false,
  placeholder = "Search...",
  value,
  emptyText = "No matches found.",
  onCreateNew,
  createLabel = "item",
}: SearchableSelectProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) =>
          (option.main_text + (option.secondary_text || ""))
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        const validOption = options.find((o) => o.id === value);
        setQuery(validOption ? validOption.main_text : "");
      }
    }
    if (isOpen && !disabled) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, options, value, disabled]);

  // Keep the visible text in sync when the value is set from outside
  // (e.g. a record created through the quick-add popup gets auto-selected).
  const selectedText = options.find((o) => o.id === value)?.main_text;
  useEffect(() => {
    if (selectedText) setQuery(selectedText);
  }, [selectedText]);

  const handleCreateNew = () => {
    setIsOpen(false);
    const typed = query.trim();
    // Don't prefill with the name of an already-selected record
    onCreateNew?.(typed && typed !== selectedText ? typed : "");
  };

  const handleSelectOption = (option: Option) => {
    setQuery(option.main_text);
    onSelect(option.id);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef}>
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="field-label">
          {label}
        </label>
        {onCreateNew && !disabled && (
          <button
            type="button"
            onClick={handleCreateNew}
            className="mb-1.5 inline-flex cursor-pointer items-center gap-0.5 text-xs font-semibold text-navy-600 hover:text-navy-800"
          >
            <Plus className="size-3" strokeWidth={2.5} />
            New {createLabel}
          </button>
        )}
      </div>
      <div className="relative">
        <input
          type="text"
          id={name}
          value={query}
          onChange={(e) => {
            if (disabled) return;
            setQuery(e.target.value);
            setIsOpen(true);
            if (e.target.value === "") {
              onSelect(null);
            }
          }}
          onClick={() => {
            if (disabled) return;
            setIsOpen(true);
          }}
          disabled={disabled}
          className="field pr-9"
          autoComplete="off"
          placeholder={placeholder}
        />
        <ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          type="hidden"
          name={name}
          value={value || ""}
          required={required}
        />
        <AnimatePresence>
          {isOpen && !disabled && (
            <motion.ul
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="absolute z-20 mt-1.5 max-h-60 w-full origin-top overflow-y-auto rounded-xl border border-line bg-white p-1 shadow-lift"
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const selected = option.id === value;
                  return (
                    <li
                      key={option.id}
                      className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 transition-colors ${
                        selected ? "bg-navy-50" : "hover:bg-canvas"
                      }`}
                      onClick={() => handleSelectOption(option)}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-ink">
                          {option.main_text}
                        </div>
                        {option.secondary_text && (
                          <div className="truncate text-xs text-muted">
                            {option.secondary_text}
                          </div>
                        )}
                      </div>
                      {selected && (
                        <Check className="size-4 shrink-0 text-navy-600" />
                      )}
                    </li>
                  );
                })
              ) : (
                <li className="px-3 py-2 text-sm text-muted">{emptyText}</li>
              )}
              {onCreateNew && (
                <li className="sticky bottom-0 -mx-1 -mb-1 mt-1 border-t border-line bg-white p-1">
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50"
                  >
                    <span className="grid size-5 place-items-center rounded-md bg-navy-700 text-white">
                      <Plus className="size-3" strokeWidth={3} />
                    </span>
                    <span className="truncate">
                      {query.trim() && query.trim() !== selectedText
                        ? `Add "${query.trim()}" as new ${createLabel}`
                        : `Add new ${createLabel}`}
                    </span>
                  </button>
                </li>
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
