import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-lg font-semibold text-ink">Page not found</h1>
      <p className="mt-1 text-sm text-muted">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/dashboard"
        className="mt-5 inline-flex h-9 items-center rounded-full bg-navy-800 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-navy-700"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
