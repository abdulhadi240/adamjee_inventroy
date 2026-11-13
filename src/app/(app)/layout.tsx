"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <Sidebar
        isOpen={isMobileSidebarOpen}
        setIsOpen={setIsMobileSidebarOpen}
      />

      <div className="flex min-h-screen flex-col md:pl-60">
        <Topbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
        {/* Page transition: each route fades/slides in */}
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 md:px-7"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default AppLayout;
