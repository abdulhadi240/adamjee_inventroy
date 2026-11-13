"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { KeyRound, UserRound } from "lucide-react";
import { SecuritySettings } from "@/components/features/settings/SecuritySettings";
import { ProfileSettings } from "./ProfileSettings";
import { AnimatedCard, CardHeader, PageHeader } from "@/components/ui/motion";
import { User } from "@/lib/types";

interface SettingsClientWrapperProps {
  user: User;
}

const TABS = [
  {
    id: "profile",
    label: "Profile",
    icon: UserRound,
    subtitle: "Your name and photo as shown across the app",
  },
  {
    id: "security",
    label: "Security",
    icon: KeyRound,
    subtitle: "Change the password you sign in with",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsClientWrapper({
  user,
}: SettingsClientWrapperProps) {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const current = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Settings"
        description="Manage your account details and security."
        actions={
          <div className="inline-flex gap-1 rounded-full border border-line bg-white p-1 shadow-card">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors duration-200 ${
                    active ? "text-white" : "text-muted hover:text-ink"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="settings-tab-pill"
                      className="absolute inset-0 rounded-full bg-navy-700 shadow-[0_6px_16px_-6px_rgba(22,58,110,0.6)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon className="relative size-3.5" />
                  <span className="relative">{tab.label}</span>
                </button>
              );
            })}
          </div>
        }
      />

      <AnimatedCard className="overflow-hidden">
        <CardHeader title={current.label} subtitle={current.subtitle} icon={current.icon} />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22 }}
          >
            {activeTab === "profile" ? (
              <ProfileSettings user={user} />
            ) : (
              <SecuritySettings />
            )}
          </motion.div>
        </AnimatePresence>
      </AnimatedCard>
    </div>
  );
}
