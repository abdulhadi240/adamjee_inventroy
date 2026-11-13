"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";
import type { LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";

const EASE = [0.16, 1, 0.3, 1] as const;

/* -------------------------------------------------------------------------- */
/* Stagger                                                                     */
/* -------------------------------------------------------------------------- */

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
};

/** Container that reveals its <StaggerItem>/<AnimatedCard> children one by one. */
export function Stagger({ className, children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={staggerParent}
      initial="hidden"
      animate="show"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ className, children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={fadeUp} className={className} {...props}>
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Card                                                                        */
/* -------------------------------------------------------------------------- */

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  /** Lift + glow border on hover. */
  interactive?: boolean;
  /** Remove default padding (for tables/media that bleed to the edge). */
  flush?: boolean;
}

/**
 * The standard surface. Fades up on mount (or as part of a <Stagger>),
 * optionally lifts on hover.
 */
export function AnimatedCard({
  interactive = false,
  flush = false,
  className = "",
  children,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className={`card relative ${flush ? "" : "p-5"} ${
        interactive ? "cursor-pointer transition-colors hover:border-navy-200" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  subtitle,
  icon: Icon,
  action,
  className = "",
}: CardHeaderProps) {
  return (
    <div className={`mb-4 flex items-start justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className="grid size-8 place-items-center rounded-lg bg-navy-50 text-navy-600">
            <Icon className="size-4" strokeWidth={2.2} />
          </span>
        )}
        <div>
          <h2 className="card-title">{title}</h2>
          {subtitle && <p className="card-subtitle mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Animated number                                                             */
/* -------------------------------------------------------------------------- */

export type NumberFormat = "number" | "currency" | "percent";

function formatValue(v: number, format: NumberFormat) {
  if (format === "currency") return formatCurrency(Math.round(v));
  if (format === "percent") return `${v.toFixed(1)}%`;
  return Math.round(v).toLocaleString("en-PK");
}

/** Counts up from 0 to `value` once it scrolls into view. */
export function AnimatedNumber({
  value,
  format = "number",
  className = "",
}: {
  value: number;
  format?: NumberFormat;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => formatValue(v, format));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, Number(value) || 0, {
      duration: 1.1,
      ease: EASE,
    });
    return () => controls.stop();
  }, [inView, value, mv]);

  return (
    <motion.span ref={ref} className={`tabular-nums ${className}`}>
      {text}
    </motion.span>
  );
}

/* -------------------------------------------------------------------------- */
/* KPI tile                                                                    */
/* -------------------------------------------------------------------------- */

const tones = {
  navy: "bg-navy-50 text-navy-600 ring-navy-100",
  glow: "bg-sky-50 text-sky-700 ring-sky-100",
  green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  red: "bg-rose-50 text-rose-600 ring-rose-100",
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
} as const;

export type Tone = keyof typeof tones;

interface StatTileProps {
  label: string;
  value: number | string;
  format?: NumberFormat;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
  /** Highlight style: navy gradient card with glow. */
  featured?: boolean;
}

/** Animated KPI card: icon chip, label, count-up value. Place inside <Stagger>. */
export function StatTile({
  label,
  value,
  format = "number",
  icon: Icon,
  tone = "navy",
  hint,
  featured = false,
}: StatTileProps) {
  return (
    // Inherits hidden/show from the parent <Stagger> so tiles cascade in
    <motion.div
      variants={fadeUp}
      className={`relative overflow-hidden rounded-2xl p-4.5 ${
        featured ? "bg-navy-800 text-white" : "card"
      }`}
    >
      <div className="relative flex items-start justify-between gap-3">
        <p
          className={`text-xs font-medium ${
            featured ? "text-navy-200" : "text-muted"
          }`}
        >
          {label}
        </p>
        <span
          className={`grid size-9 place-items-center rounded-xl ring-1 ${
            featured ? "bg-white/10 text-white ring-white/15" : tones[tone]
          }`}
        >
          <Icon className="size-[18px]" strokeWidth={2.1} />
        </span>
      </div>

      <p
        className={`font-display relative mt-2 text-[22px] font-semibold tracking-tight ${
          featured ? "text-white" : "text-ink"
        }`}
      >
        {typeof value === "number" ? (
          <AnimatedNumber value={value} format={format} />
        ) : (
          value
        )}
      </p>
      {hint && (
        <p
          className={`relative mt-1 text-[11px] ${
            featured ? "text-navy-200/80" : "text-muted"
          }`}
        >
          {hint}
        </p>
      )}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page header                                                                 */
/* -------------------------------------------------------------------------- */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                 */
/* -------------------------------------------------------------------------- */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex flex-col items-center justify-center px-6 py-12 text-center"
    >
      <span className="mb-3 grid size-12 place-items-center rounded-2xl bg-navy-50 text-navy-400">
        <Icon className="size-6" strokeWidth={1.8} />
      </span>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-xs text-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
