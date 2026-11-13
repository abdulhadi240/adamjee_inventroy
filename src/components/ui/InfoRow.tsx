import { ReactNode } from "react";

interface InfoRowProps {
  label: string;
  value?: ReactNode;
}

export default function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line/70 py-2.5 text-sm last:border-b-0">
      <span className="text-muted">{label}</span>
      <div className="text-right font-medium text-ink">{value ?? "—"}</div>
    </div>
  );
}
