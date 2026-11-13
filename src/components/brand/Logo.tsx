interface LogoProps {
  /** "light" for navy backgrounds, "dark" for white backgrounds. */
  tone?: "light" | "dark";
  /** Hide the wordmark and show only the monogram. */
  compact?: boolean;
  className?: string;
}

/** Adamjee Computers "AC" monogram with wordmark. */
export default function Logo({
  tone = "dark",
  compact = false,
  className = "",
}: LogoProps) {
  const text = tone === "light" ? "text-white" : "text-navy-800";
  const sub = tone === "light" ? "text-white/55" : "text-muted";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 40 40"
        className="size-9 shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ac-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1f4f94" />
            <stop offset="1" stopColor="#061631" />
          </linearGradient>
          <linearGradient id="ac-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7fdcff" />
            <stop offset="1" stopColor="#10b3ee" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill="url(#ac-bg)" />
        <rect
          x="0.75"
          y="0.75"
          width="38.5"
          height="38.5"
          rx="10.25"
          fill="none"
          stroke="#38c8ff"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
        {/* A */}
        <path
          d="M8.5 28.5 15.2 11.5h2.1l6.7 17"
          fill="none"
          stroke="url(#ac-stroke)"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.6 22.6h9.3"
          stroke="url(#ac-stroke)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* C */}
        <path
          d="M32.4 14.2a7.6 7.6 0 1 0 0 11.6"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>

      {!compact && (
        <div className="leading-none">
          <p className={`text-[15px] font-semibold tracking-tight ${text}`}>
            Adamjee Computers
          </p>
          <p
            className={`mt-1 text-[10px] font-medium uppercase tracking-[0.18em] ${sub}`}
          >
            Inventory
          </p>
        </div>
      )}
    </div>
  );
}
