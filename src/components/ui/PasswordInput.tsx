"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  hint?: string;
}

export default function PasswordInput({
  name,
  label = "Password",
  placeholder,
  hint,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className="field pl-10 pr-11"
        />
        <button
          type="button"
          onClick={() => setShowPassword((p) => !p)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-navy-50 hover:text-navy-700"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={showPassword ? "hide" : "show"}
              initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
              transition={{ duration: 0.15 }}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}
