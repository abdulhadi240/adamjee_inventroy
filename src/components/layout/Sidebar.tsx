"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { LogOut, X } from "lucide-react";
import Logo from "@/components/brand/Logo";
import NavItem from "@/components/ui/NavItem";
import { logout } from "@/lib/actions/auth";
import { NAV_SECTIONS, FOOTER_NAV_LINKS } from "@/lib/constants";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function SidebarContent({
  layoutGroup,
  onClose,
}: {
  layoutGroup: string;
  onClose?: () => void;
}) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-navy-900">

      <div className="relative flex items-center justify-between px-5 pt-6 pb-7">
        <Logo tone="light" />
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-8 cursor-pointer place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <nav className="relative flex-1 space-y-6 overflow-y-auto px-3">
        {NAV_SECTIONS.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 + i * 0.07, duration: 0.4 }}
          >
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.links.map((link) => (
                <NavItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  layoutGroup={layoutGroup}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </nav>

      <div className="relative space-y-0.5 border-t border-white/10 px-3 pt-3 pb-5">
        {FOOTER_NAV_LINKS.map((link) => (
          <NavItem
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            layoutGroup={layoutGroup}
          />
        ))}
        <form action={logout}>
          <button className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white">
            <LogOut className="size-[18px]" />
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  return (
    <>
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 md:block">
        <SidebarContent layoutGroup="desktop" />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-navy-950/50 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-y-0 left-0 z-50 w-72 shadow-2xl md:hidden"
            >
              <SidebarContent
                layoutGroup="mobile"
                onClose={() => setIsOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
