import * as React from "react";
import { ChevronDown } from "lucide-react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

interface LabeledSelectProps extends SelectProps {
  label: string;
  id: string;
}

export default function LabeledSelect({
  label,
  id,
  className = "",
  children,
  ...props
}: LabeledSelectProps) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className={`field cursor-pointer appearance-none pr-9 ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      </div>
    </div>
  );
}
