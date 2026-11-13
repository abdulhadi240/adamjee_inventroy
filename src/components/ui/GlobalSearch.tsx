"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { AnimatePresence, motion } from "motion/react";
import {
  ClipboardList,
  Package,
  Receipt,
  Search,
  Truck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { globalSearch, SearchResult } from "@/lib/actions/search";
import { getTypeLabel } from "@/lib/utils/formatters";

const TYPE_ICONS: Record<SearchResult["type"], LucideIcon> = {
  product: Package,
  supplier: Truck,
  customer: UserRound,
  sale: Receipt,
  order: ClipboardList,
};

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam) {
      setQuery(searchParam);
    }
  }, [searchParams]);

  const handleSearch = useDebouncedCallback(async (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
      params.set("page", "1");
    } else {
      params.delete("search");
      params.delete("page");
    }
    router.replace(`${pathname}?${params.toString()}`);

    if (!term || term.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    try {
      const data = await globalSearch(term);
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    handleSearch(val);

    if (val.length === 0) {
      setIsOpen(false);
      setResults([]);
      setIsLoading(false);
    } else if (val.length >= 2) {
      setIsLoading(true);
    }
  };

  const handleSelect = (result: SearchResult) => {
    router.push(result.url);
    setIsOpen(false);
    setQuery("");
  };

  // Press "/" anywhere to jump to search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") inputRef.current?.blur();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="group relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search products, suppliers, invoices…"
          className="h-10 w-full rounded-full border border-line bg-white pl-10 pr-12 text-sm text-ink shadow-card outline-none transition-all duration-200 placeholder:text-muted/70 hover:border-navy-200 focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10"
          value={query}
          onChange={onInputChange}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true);
          }}
        />
        <div className="pointer-events-none absolute left-3.5 top-0 flex h-full items-center">
          {isLoading ? (
            <div className="size-4 animate-spin rounded-full border-2 border-navy-100 border-t-navy-600" />
          ) : (
            <Search className="size-4 text-muted transition-colors group-focus-within:text-navy-600" />
          )}
        </div>
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-canvas px-1.5 py-0.5 font-sans text-[10px] font-semibold text-muted sm:block">
          /
        </kbd>
      </div>

      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-96 origin-top overflow-y-auto rounded-2xl border border-line bg-white p-1.5 shadow-lift"
          >
            {isLoading && results.length === 0 && (
              <div className="space-y-2 p-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="skeleton h-10" />
                ))}
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <ul>
                {results.map((result, index) => {
                  const Icon = TYPE_ICONS[result.type] ?? Search;
                  return (
                    <motion.li
                      key={`${result.type}-${result.id}-${index}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.025 }}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-canvas"
                      onClick={() => handleSelect(result)}
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy-600">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {result.title}
                        </p>
                        <p className="truncate text-xs text-muted">
                          <span className="font-semibold uppercase tracking-wide text-[10px]">
                            {getTypeLabel(result.type)}
                          </span>
                          {result.subtitle ? ` · ${result.subtitle}` : ""}
                        </p>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            )}

            {!isLoading && results.length === 0 && (
              <div className="p-5 text-center text-sm text-muted">
                No results for &ldquo;{query}&rdquo;
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
