"use client";

import { AuthFormCard } from "@/components/features/auth/AuthFormCard";
import { AuthHeader } from "@/components/features/auth/AuthHeader";
import LoginForm from "@/components/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthFormCard
      header={
        <AuthHeader
          title="Sign in"
          subtitle="Use your Adamjee Computers staff account."
        />
      }
      footer={
        <p className="text-xs text-muted">
          Don&apos;t have access? Ask your administrator for an account.
        </p>
      }
    >
      <LoginForm />
    </AuthFormCard>
  );
}
