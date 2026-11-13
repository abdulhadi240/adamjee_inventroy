"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/Button";
import DatePicker from "@/components/ui/DatePicker";

const PRESETS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

const iso = (d: Date) => d.toISOString().split("T")[0];

export default function DateRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const defaultEnd = iso(new Date());
  const defaultStart = iso(new Date(Date.now() - 30 * 86_400_000));

  const [start, setStart] = useState(searchParams.get("start") || defaultStart);
  const [end, setEnd] = useState(searchParams.get("end") || defaultEnd);

  const apply = (s: string, e: string) =>
    startTransition(() => router.push(`?start=${s}&end=${e}`, { scroll: false }));

  const applyPreset = (days: number) => {
    const e = iso(new Date());
    const s = iso(new Date(Date.now() - days * 86_400_000));
    setStart(s);
    setEnd(e);
    apply(s, e);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-0.5 rounded-full border border-line bg-white p-1 shadow-card">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p.days)}
            className="cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold text-muted transition-colors hover:bg-navy-50 hover:text-navy-700"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-full border border-line bg-white px-3 shadow-card transition-colors ">
        <CalendarDays className="size-4 text-muted" />
        <DatePicker
          variant="bare"
          aria-label="From date"
          value={start}
          max={end}
          onChange={setStart}
        />
        <ArrowRight className="size-3.5 text-muted" />
        <DatePicker
          variant="bare"
          aria-label="To date"
          value={end}
          min={start}
          onChange={setEnd}
        />
      </div>

      <Button size="sm" className="h-10 px-4" onClick={() => apply(start, end)} disabled={isPending}>
        {isPending ? (
          <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : null}
        Apply
      </Button>
    </div>
  );
}
