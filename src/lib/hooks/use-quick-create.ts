"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * State for a picker's "Add new …" shortcut: whether the create popup is
 * open, the text to prefill it with, and records created in this session
 * (merged into the options until the server data refreshes).
 */
export function useQuickCreate<T extends { id: string | number }>(base: T[]) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [created, setCreated] = useState<T[]>([]);

  const items = useMemo(() => {
    const ids = new Set(base.map((b) => String(b.id)));
    return [...base, ...created.filter((c) => !ids.has(String(c.id)))];
  }, [base, created]);

  const open = useCallback((text: string) => {
    setDraft(text);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const add = useCallback(
    (item: T) => {
      setCreated((prev) => [...prev, item]);
      // Pull fresh lists for the rest of the page as well
      router.refresh();
    },
    [router]
  );

  return { items, isOpen, draft, open, close, add };
}
