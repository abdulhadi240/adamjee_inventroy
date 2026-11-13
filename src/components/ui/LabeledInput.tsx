"use client";
import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
interface LabeledInputProps extends InputProps {
  label: string;
  id: string;
}

export default function LabeledInput({
  label,
  id,
  className = "",
  type,
  name,
  ...props
}: LabeledInputProps) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className={`field no-spinner ${className}`}
        {...props}
      />
    </div>
  );
}
