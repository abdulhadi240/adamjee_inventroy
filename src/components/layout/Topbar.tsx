"use client";

import { Suspense, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import GlobalSearch from "@/components/ui/GlobalSearch";
import UserDropdown from "@/components/features/topbar/UserDropdown";
import NotificationDropdown from "@/components/features/topbar/NotificationDropdown";
import Logo from "@/components/brand/Logo";
import { User, StockAlert } from "@/lib/types";
import { getTopbarData } from "@/lib/actions/profile";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { user: userData, alerts: notificationData } =
          await getTopbarData();

        setUser(userData);
        setAlerts(notificationData);
      } catch (error) {
        console.error("Failed to fetch topbar data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line/80 bg-canvas/75 px-4 backdrop-blur-xl md:px-7">
      <button
        onClick={onMenuClick}
        className="grid size-9 cursor-pointer place-items-center rounded-xl text-ink transition hover:bg-white md:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>
      <div className="md:hidden">
        <Logo compact />
      </div>

      <div className="max-w-xl flex-1">
        {/* useSearchParams needs a Suspense boundary for static prerendering */}
        <Suspense fallback={<div className="skeleton h-10 w-full rounded-xl" />}>
          <GlobalSearch />
        </Suspense>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {loading ? (
          <>
            <div className="skeleton size-9 rounded-full" />
            <div className="skeleton h-9 w-9 rounded-full md:w-36" />
          </>
        ) : (
          <>
            <NotificationDropdown alerts={alerts} />
            {user ? (
              <UserDropdown user={user} />
            ) : (
              <div className="size-9 rounded-full bg-line" />
            )}
          </>
        )}
      </div>
    </header>
  );
}
