"use client";

import { AuthFormCard } from "@/components/features/auth/AuthFormCard";
import { AuthHeader } from "@/components/features/auth/AuthHeader";
import UpdatePasswordForm from "@/components/features/auth/UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <AuthFormCard
      header={
        <AuthHeader
          title="Choose a new password"
          subtitle="Please enter your new password below."
        />
      }
    >
      <UpdatePasswordForm />
    </AuthFormCard>
  );
}
