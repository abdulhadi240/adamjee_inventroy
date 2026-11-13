"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import Logo from "@/components/brand/Logo";

export default function RedirectingSpinner({ text }: { text: string }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-5 bg-navy-900"
    >
      <Logo tone="light" />
      <div className="relative h-1 w-40 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="absolute inset-y-0 w-1/3 rounded-full bg-white/70"
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <p className="relative text-sm font-medium text-navy-100">{text}</p>
    </motion.div>,
    document.body
  );
}
