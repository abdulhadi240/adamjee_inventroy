"use client";

import React from "react";

interface InputFieldProps {
  id: string;
  name: string;
  label: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export default function InputField({
  id,
  name,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  className = "",
  icon,
}: InputFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted [&_svg]:size-4">
            {icon}
          </span>
        )}
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`field ${icon ? "pl-10" : ""}`}
        />
      </div>
    </div>
  );
}
