"use client";

import { useState, useEffect, useActionState, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Camera, Mail, RotateCcw, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import { FormAlert, PendingLabel } from "@/components/features/auth/FormAlert";
import { updateProfile } from "@/lib/actions/profile";
import { FormState, User } from "@/lib/types";

const initialState: FormState = { success: false, message: "" };

interface ProfileSettingsProps {
  user: User;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    initialState
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [name, setName] = useState(user?.name || "");

  useEffect(() => {
    if (state.success) {
      setPreviewUrl(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [state]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (file: File | undefined) => {
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const resetPhoto = () => {
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const displayImage = previewUrl || user?.profile_picture;
  const initial = (name || user?.email || "A").charAt(0).toUpperCase();

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Avatar */}
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div className="relative">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative grid size-24 cursor-pointer place-items-center overflow-hidden rounded-full bg-navy-700 text-3xl font-semibold text-white ring-1 ring-line"
            aria-label="Change profile photo"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={displayImage || "initial"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 grid place-items-center"
              >
                {displayImage ? (
                  previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="New profile photo" className="size-full object-cover" />
                  ) : (
                    <Image
                      src={displayImage}
                      alt="Profile photo"
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  )
                ) : (
                  initial
                )}
              </motion.span>
            </AnimatePresence>
            <span className="absolute inset-0 grid place-items-center bg-navy-950/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <Camera className="size-6 text-white" />
            </span>
          </button>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">Profile photo</p>
          <p className="mt-0.5 text-xs text-muted">JPG, PNG or WEBP · max 2MB</p>
          <div className="mt-3 flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              Upload new
            </Button>
            {previewUrl && (
              <Button type="button" variant="ghost" size="sm" onClick={resetPhoto}>
                <RotateCcw className="size-3.5" />
                Undo
              </Button>
            )}
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          name="profile_picture"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0])}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="full_name"
          name="full_name"
          label="Full name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<UserRound />}
        />
        <InputField
          id="email"
          name="email"
          label="Email address"
          value={user?.email || ""}
          icon={<Mail />}
          disabled
        />
      </div>

      <FormAlert tone={state.success ? "success" : "error"} message={state.message} />

      <div className="flex justify-end border-t border-line pt-5">
        <Button type="submit" disabled={isPending}>
          <PendingLabel pending={isPending} busy="Saving…" idle="Save changes" />
        </Button>
      </div>
    </form>
  );
}
