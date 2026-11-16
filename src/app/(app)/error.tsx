"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="text-lg font-semibold text-ink">Something went wrong</h1>
      <p className="mt-1 max-w-sm text-sm text-muted">
        This page could not be loaded. Check your connection and try again.
      </p>
      <button
        onClick={reset}
        className="mt-5 inline-flex h-9 cursor-pointer items-center rounded-full bg-navy-800 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-navy-700"
      >
        Try again
      </button>
    </div>
  );
}
