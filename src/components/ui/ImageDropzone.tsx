"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ImagePlus } from "lucide-react";

interface ImageDropzoneProps {
  name: string;
  onChange: (file: File | null) => void;
  previewUrl: string | null;
}

const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ImageDropzone({
  name,
  onChange,
  previewUrl,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    setError(null);

    if (!file) {
      onChange(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
      setTimeout(() => setError(null), 3000);
      onChange(null);
      return;
    }

    onChange(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  return (
    <div>
      <label
        className={`group relative flex min-h-36 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-4 text-center transition-all duration-300 ${
          isDragging
            ? "border-navy-500 bg-navy-50"
            : "border-line bg-canvas/60 hover:border-navy-200 hover:bg-navy-50/50"
        }`}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDrop={handleDrop}
      >
        <AnimatePresence mode="wait">
          {previewUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Selected"
                className="mx-auto max-h-48 rounded-xl object-contain"
              />
              <span className="mt-3 inline-block text-xs font-semibold text-navy-600 group-hover:text-navy-800">
                Change image
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <span className="mb-2 grid size-11 place-items-center rounded-xl bg-white text-navy-500 shadow-card">
                <ImagePlus className="size-5" />
              </span>
              <p className="text-sm font-medium text-ink">
                Drop an image or <span className="text-navy-600">browse</span>
              </p>
              <p className="mt-0.5 text-xs text-muted">
                PNG, JPG or WEBP · up to {MAX_FILE_SIZE_MB}MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <input
          type="file"
          name={name}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        />
      </label>
      {error && <p className="mt-2 text-center text-xs text-rose-600">{error}</p>}
    </div>
  );
}
