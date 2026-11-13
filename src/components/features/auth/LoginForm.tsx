"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { login } from "@/lib/actions/auth";
import PasswordInput from "@/components/ui/PasswordInput";
import InputField from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import { FormAlert, PendingLabel } from "./FormAlert";

const initialState = { success: "", error: "" };

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

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
      <PasswordInput name="password" placeholder="Enter your password" />
      <div className="flex items-center justify-between gap-4 text-xs">
        <label className="flex cursor-pointer items-center gap-2 text-muted">
          <input
            type="checkbox"
            name="remember"
            defaultChecked
            className="size-3.5 cursor-pointer rounded accent-navy-700"
          />
          Remember for 30 days
        </label>
        <Link href="/forgot-password" className="link">
          Forgot password?
        </Link>
      </div>

      <FormAlert tone="error" message={state.error} />

      <Button type="submit" disabled={isPending} className="group mt-1 w-full">
        <PendingLabel
          pending={isPending}
          busy="Signing in…"
          idle={
            <>
              Sign in
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          }
        />
      </Button>
    </form>
  );
}
