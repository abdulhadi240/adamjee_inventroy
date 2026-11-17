"use client";

import { useActionState, useEffect, useRef } from "react";
import { ShieldCheck } from "lucide-react";
import { updatePasswordSettings } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import PasswordInput from "@/components/ui/PasswordInput";
import { notify } from "@/components/ui/Dialog";
import { PendingLabel } from "@/components/features/auth/FormAlert";
import { FormState } from "@/lib/types";

const initialState: FormState = { success: false, message: "" };

export function SecuritySettings() {
  const [state, formAction, isPending] = useActionState(
    updatePasswordSettings,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message) notify(state.message, state.success ? "success" : "error");
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      <div className="flex items-start gap-3 rounded-xl bg-navy-50 p-3.5 ring-1 ring-navy-100">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-navy-600 shadow-card">
          <ShieldCheck className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Keep your account secure</p>
          <p className="text-xs text-muted">
            Use at least 8 characters with a mix of letters, numbers and symbols.
          </p>
        </div>
      </div>

      <PasswordInput
        label="Current password"
        name="current_password"
        placeholder="Enter your current password"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordInput
          label="New password"
          name="new_password"
          placeholder="New password"
        />
        <PasswordInput
          label="Confirm new password"
          name="confirm_password"
          placeholder="Repeat new password"
        />
      </div>

      <div className="flex justify-end border-t border-line pt-5">
        <Button type="submit" disabled={isPending}>
          <PendingLabel pending={isPending} busy="Updating…" idle="Update password" />
        </Button>
      </div>
    </form>
  );
}
