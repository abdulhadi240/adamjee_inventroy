"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";
import PasswordInput from "@/components/ui/PasswordInput";
import RedirectingSpinner from "@/components/ui/RedirectingSpinner";
import { Button } from "@/components/ui/Button";
import { notify } from "@/components/ui/Dialog";
import { PendingLabel } from "./FormAlert";

export default function UpdatePasswordForm() {
  const [isPending, setIsPending] = useState(false);
  const [isRedirecting, setIsRiderecting] = useState(false);

  useEffect(() => {
    const verifyRecovery = async () => {
      const supabase = createClientBrowser();
      const params = new URLSearchParams(window.location.search);
      const token_hash = params.get("token_hash");

      window.history.replaceState({}, document.title, "/update-password");

      if (!token_hash) {
        notify("Invalid or missing token.");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: "recovery",
      });

      if (error) {
        console.error("Verify Otp error:", error);
        notify("Your reset link is invalid or expired.");
      }
    };

    verifyRecovery();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const supabase = createClientBrowser();
    const formData = new FormData(e.target as HTMLFormElement);
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      notify(error.message);
    } else {
      notify("Password updated.", "success");
      setIsRiderecting(true);
      setTimeout(() => {
        supabase.auth.signOut();
        window.location.href = "/login";
      }, 1500);
    }

    setIsPending(false);
  };

  if (isRedirecting) {
    return <RedirectingSpinner text="Redirecting to login..." />;
  }

  return (
    <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
      <PasswordInput
        name="password"
        label="New password"
        placeholder="Enter your new password"
      />
      <Button type="submit" disabled={isPending} className="mt-1 w-full">
        <PendingLabel
          pending={isPending}
          busy="Updating…"
          idle="Update password"
        />
      </Button>
    </form>
  );
}
