"use client";

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
