"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, CircleCheck, CircleHelp } from "lucide-react";
import { Button } from "./Button";

type Tone = "success" | "error";

interface DialogState {
  id: number;
  message: string;
  tone: Tone | "confirm";
  confirmLabel?: string;
  danger?: boolean;
  resolve: (ok: boolean) => void;
}

// One dialog at a time; a new one replaces (and cancels) the current one.
let current: DialogState | null = null;
let nextId = 0;
const listeners = new Set<() => void>();

function open(dialog: Omit<DialogState, "id">) {
  current?.resolve(false);
  current = { ...dialog, id: ++nextId };
  listeners.forEach((l) => l());
}

function close(ok: boolean) {
  const dialog = current;
  current = null;
  listeners.forEach((l) => l());
  dialog?.resolve(ok);
}

/** Show a message modal. Resolves when it is dismissed. */
export function notify(message: string, tone: Tone = "error") {
  return new Promise<boolean>((resolve) => open({ message, tone, resolve }));
}

/** Ask for confirmation in a modal. Resolves true when confirmed. */
export function confirmDialog(
  message: string,
  { confirmLabel = "Confirm", danger = false } = {}
) {
  return new Promise<boolean>((resolve) =>
    open({ message, tone: "confirm", confirmLabel, danger, resolve })
  );
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const icons = {
  success: { Icon: CircleCheck, className: "bg-emerald-50 text-emerald-600" },
  error: { Icon: CircleAlert, className: "bg-rose-50 text-rose-600" },
  confirm: { Icon: CircleHelp, className: "bg-navy-50 text-navy-600" },
};

/** Renders the active dialog. Mounted once in the root layout. */
export default function DialogHost() {
  const dialog = useSyncExternalStore(
    subscribe,
    () => current,
    () => null
  );
  const primaryRef = useRef<HTMLButtonElement>(null);
  const id = dialog?.id;

  useEffect(() => {
    if (id === undefined) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    primaryRef.current?.focus();

    // Capture phase, so Escape closes this dialog and not a modal beneath it
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      close(false);
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      previousFocus?.focus?.();
    };
  }, [id]);

  const isConfirm = dialog?.tone === "confirm";
  const icon = dialog && icons[dialog.tone];

  return (
    <AnimatePresence>
      {dialog && icon && (
        <motion.div
          key={dialog.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] grid place-items-center bg-navy-950/40 p-4 backdrop-blur-[6px]"
          onClick={() => close(false)}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label={dialog.message}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center shadow-[0_30px_80px_-20px_rgba(6,22,49,0.45)]"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className={`grid size-10 place-items-center rounded-full ${icon.className}`}
            >
              <icon.Icon className="size-5" />
            </span>
            <p className="text-sm font-medium text-ink">{dialog.message}</p>
            <div className="flex w-full gap-2.5">
              {isConfirm && (
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => close(false)}
                >
                  Cancel
                </Button>
              )}
              <Button
                ref={primaryRef}
                type="button"
                variant={dialog.danger ? "danger" : "primary"}
                className="flex-1"
                onClick={() => close(true)}
              >
                {isConfirm ? dialog.confirmLabel : "OK"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
