"use client";

import { MotionConfig } from "motion/react";

/** Global motion defaults; respects the OS "reduce motion" setting. */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.8 }}
    >
      {children}
    </MotionConfig>
  );
}
