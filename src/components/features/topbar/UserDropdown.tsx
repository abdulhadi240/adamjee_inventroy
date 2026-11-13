"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { User } from "@/lib/types";
import { logout } from "@/lib/actions/auth";

function Avatar({ user, size }: { user: User; size: number }) {
  return (
    <span
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-navy-700 text-white ring-2 ring-white"
      style={{ width: size, height: size }}
    >
      {user.profile_picture ? (
        <Image
          src={user.profile_picture}
          alt={user.name}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span className="text-xs font-semibold">
          {user.name?.charAt(0).toUpperCase() || "A"}
        </span>
      )}
    </span>
  );
}

export default function UserDropdown({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex cursor-pointer items-center gap-2 rounded-full border bg-white py-0.5 pl-0.5 pr-0.5 transition-all md:pr-3 ${
          isOpen ? "border-navy-200 shadow-card" : "border-line hover:border-navy-200"
        }`}
      >
        <Avatar user={user} size={32} />
        <span className="hidden max-w-28 truncate text-[13px] font-medium text-ink md:block">
          {user.name}
        </span>
        <ChevronDown
          className={`hidden size-3.5 text-muted transition-transform duration-200 md:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full z-50 mt-2.5 w-64 origin-top-right overflow-hidden rounded-2xl border border-line bg-white shadow-lift"
          >
            <div className="flex items-center gap-3 bg-navy-800 p-4">
              <Avatar user={user} size={40} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user.name}
                </p>
                <p className="truncate text-xs text-navy-200" title={user.email}>
                  {user.email}
                </p>
              </div>
            </div>

            <div className="p-1.5">
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink transition-colors hover:bg-canvas"
              >
                <Settings className="size-4 text-muted" />
                Account settings
              </Link>
              <button
                onClick={() => logout()}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-50"
              >
                <LogOut className="size-4" />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
