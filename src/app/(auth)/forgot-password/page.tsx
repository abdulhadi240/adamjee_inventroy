"use client";

import { AuthFormCard } from "@/components/features/auth/AuthFormCard";
import { AuthHeader } from "@/components/features/auth/AuthHeader";
import { AuthFooter } from "@/components/features/auth/AuthFooter";
import ForgotPasswordForm from "@/components/features/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthFormCard
      header={
        <AuthHeader
          title="Reset your password"
          subtitle="Enter your email and we'll send you a secure reset link."
        />
      }
      footer={
        <AuthFooter
          description="Remember your password?"
          linkText="Back to sign in"
          linkHref="/login"
        />
      }
    >
      <ForgotPasswordForm />
    </AuthFormCard>
  );
}
