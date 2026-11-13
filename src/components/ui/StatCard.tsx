interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  /** Legacy text-color class; mapped onto the accent bar. */
  titleColor?: string;
}

/** Compact metric block used inside page "overall" summary cards. */
export default function StatCard({
  title,
  value,
  description,
  titleColor = "text-navy-600",
}: StatCardProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className={`text-xs font-semibold ${titleColor}`}>{title}</p>
      <p className="text-lg font-semibold tracking-tight text-ink tabular-nums">
        {value}
      </p>
      <p className="text-[11px] text-muted">{description}</p>
    </div>
  );
}
