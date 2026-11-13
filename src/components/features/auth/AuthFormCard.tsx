"use client";

import { motion } from "motion/react";

interface AuthFormCardProps {
  header: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthFormCard({ header, children, footer }: AuthFormCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-sm"
    >
      <div className="mb-7">{header}</div>
      {children}
      {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
    </motion.div>
  );
}
