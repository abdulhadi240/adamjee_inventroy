"use client";

import { useActionState } from "react";
import { Mail, Send } from "lucide-react";
import { resetPasswordEmail } from "@/lib/actions/auth";
import InputField from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import { FormAlert, PendingLabel } from "./FormAlert";

const initialState = {
  error: "",
  success: "",
};

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    resetPasswordEmail,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <InputField
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="you@adamjee.pk"
        icon={<Mail />}
        required
      />

      <FormAlert tone="error" message={state?.error} />
      <FormAlert tone="success" message={state?.success} />

      <Button type="submit" disabled={isPending} className="mt-1 w-full">
        <PendingLabel
          pending={isPending}
          busy="Sending…"
          idle={
            <>
              <Send className="size-4" />
              Send reset link
            </>
          }
        />
      </Button>
    </form>
  );
}
