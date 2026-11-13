"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";

export interface DropdownOption {
  label: string;
  value: string | null;
}

interface FilterDropdownProps {
  icon: ReactNode;
  label: string;
  options: DropdownOption[];
  onSelectFilter: (value: string | null) => void;
  /** Currently active value, to show a check mark. */
  selected?: string | null;
}

export default function FilterDropdown({
  icon,
  label,
  options,
  onSelectFilter,
  selected,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (value: string | null) => {
    onSelectFilter(value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-all duration-200 [&_svg]:size-4 ${
          isOpen
            ? "border-navy-500 bg-navy-50 text-navy-700 ring-4 ring-navy-500/10"
            : "border-line bg-white text-ink hover:border-navy-200 hover:bg-navy-50"
        }`}
      >
        {icon}
        {label}
        <ChevronDown
          className={`text-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 z-30 mt-2 min-w-44 origin-top-right rounded-xl border border-line bg-white p-1 shadow-lift"
          >
            {options.map((option) => {
              const active = selected !== undefined && option.value === selected;
              return (
                <li
                  key={option.label}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-navy-50 font-semibold text-navy-700"
                      : "text-ink hover:bg-canvas"
                  }`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                  {active && <Check className="size-3.5" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
