"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

// Open modals, innermost last, so Escape only closes the top one
const openStack: symbol[] = [];

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  size?: "md" | "lg";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  // Portals must not render during SSR/hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const token = Symbol("modal");
    openStack.push(token);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openStack[openStack.length - 1] === token) {
        onClose();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      openStack.splice(openStack.indexOf(token), 1);
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-navy-950/40 p-4 backdrop-blur-[6px]"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className={`relative my-10 flex w-full flex-col rounded-3xl border border-white/60 bg-white shadow-[0_30px_80px_-20px_rgba(6,22,49,0.45)] ${
              size === "lg" ? "max-w-3xl" : "max-w-xl"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-6 pt-5 pb-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-ink">
                  {title}
                </h2>
                {description && (
                  <p className="mt-0.5 text-xs text-muted">{description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid size-8 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-navy-50 hover:text-navy-700"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4 px-6 py-5">{children}</div>

            <div className="flex items-center justify-end gap-2.5 rounded-b-3xl border-t border-line bg-canvas/60 px-6 py-4">
              {footer}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
