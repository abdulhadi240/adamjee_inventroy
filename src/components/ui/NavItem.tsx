"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  /** Distinguishes the sliding indicator between desktop and mobile sidebars. */
  layoutGroup?: string;
}

/** Sidebar link for the navy sidebar, with a sliding active pill. */
export default function NavItem({
  href,
  icon: Icon,
  label,
  layoutGroup = "desktop",
}: NavItemProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors duration-200 ${
        isActive ? "font-semibold text-white" : "text-white/80 hover:text-white"
      }`}
    >
      {isActive && (
        <motion.span
          layoutId={`nav-active-${layoutGroup}`}
          className="absolute inset-0 rounded-xl bg-white/10"
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
        >
          <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-x-[3px] -translate-y-1/2 rounded-full bg-white" />
        </motion.span>
      )}
      {!isActive && (
        <span className="absolute inset-0 rounded-xl bg-white/0 transition-colors duration-200 group-hover:bg-white/[0.06]" />
      )}
      <Icon
        className={`relative size-[18px] ${isActive ? "text-white" : ""}`}
        strokeWidth={2}
      />
      <span className="relative">{label}</span>
    </Link>
  );
}
