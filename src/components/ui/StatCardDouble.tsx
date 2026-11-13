interface StatCardDoubleProps {
  title: string;
  valueA: string | number;
  descriptionA: string;
  valueB: string | number;
  descriptionB: string;
  titleColor?: string;
}

export default function StatCardDouble({
  title,
  valueA,
  descriptionA,
  valueB,
  descriptionB,
  titleColor = "text-navy-600",
}: StatCardDoubleProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className={`text-xs font-semibold ${titleColor}`}>{title}</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-lg font-semibold tracking-tight text-ink tabular-nums">
            {valueA}
          </p>
          <p className="text-[11px] text-muted">{descriptionA}</p>
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight text-ink tabular-nums">
            {valueB}
          </p>
          <p className="text-[11px] text-muted">{descriptionB}</p>
        </div>
      </div>
    </div>
  );
}
