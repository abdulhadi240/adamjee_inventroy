"use client";

import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, CircleCheck } from "lucide-react";

/** Animated success / error message for forms. */
export function FormAlert({
  message,
  tone,
}: {
  message?: string | null;
  tone: "success" | "error";
}) {
  const Icon = tone === "success" ? CircleCheck : CircleAlert;
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, height: 0, y: -4 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div
            role={tone === "error" ? "alert" : "status"}
            className={`flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-sm ring-1 ${
              tone === "success"
                ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                : "bg-rose-50 text-rose-700 ring-rose-100"
            }`}
          >
            <Icon className="mt-0.5 size-4 shrink-0" />
            <span>{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Spinner + label for pending submit buttons. */
export function PendingLabel({
  pending,
  idle,
  busy,
}: {
  pending: boolean;
  idle: React.ReactNode;
  busy: string;
}) {
  return pending ? (
    <>
      <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      {busy}
    </>
  ) : (
    <>{idle}</>
  );
}
