"use client";

import { useRef } from "react";
import { IconPlus, IconClose } from "./icons";

const MAX_PHOTOS = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png";

export function PhotoUpload({
  photos,
  onAdd,
  onRemove,
  variant = "grid",
}: {
  photos: string[];
  onAdd: (dataUrl: string) => void;
  onRemove: (index: number) => void;
  variant?: "grid" | "scroll";
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function pick() {
    inputRef.current?.click();
  }

  async function handleFiles(list: FileList | null) {
    if (!list) return;
    const remaining = MAX_PHOTOS - photos.length;
    const arr = Array.from(list).slice(0, remaining);
    for (const f of arr) {
      if (f.size > MAX_BYTES) continue;
      if (!/^image\/(jpe?g|png)$/.test(f.type)) continue;
      // eslint-disable-next-line no-await-in-loop
      const dataUrl = await toDataURL(f);
      onAdd(dataUrl);
    }
  }

  const slots = Array.from({ length: MAX_PHOTOS }, (_, i) => i);
  const containerCls =
    variant === "grid"
      ? "grid grid-cols-5 gap-2.5"
      : "flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
  const slotCls =
    variant === "grid"
      ? "aspect-square"
      : "w-[110px] min-w-[110px] aspect-square";

  return (
    <>
      <div className={containerCls}>
        {slots.map((i) => {
          const photo = photos[i];
          if (photo) {
            return (
              <div
                key={i}
                className={`${slotCls} relative rounded-[14px] overflow-hidden border border-rule`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt={`Foto ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  aria-label={`Quitar foto ${i + 1}`}
                  className="absolute top-1.5 right-1.5 w-[22px] h-[22px] rounded-full inline-flex items-center justify-center text-cream"
                  style={{
                    background: "rgba(31,27,22,0.6)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <IconClose className="w-3 h-3" />
                </button>
                {i === 0 && (
                  <span
                    aria-hidden
                    className="absolute bottom-1.5 left-1.5 bg-cream text-ink text-[9px] font-semibold tracking-[0.1em] px-2 py-[2px] rounded-full"
                  >
                    PORTADA
                  </span>
                )}
              </div>
            );
          }
          return (
            <button
              key={i}
              type="button"
              onClick={pick}
              aria-label={`Subir foto ${i + 1}`}
              className={`${slotCls} rounded-[14px] border-2 border-dashed border-rule-strong bg-cream text-ink-muted inline-flex items-center justify-center transition-colors hover:border-sage-soft hover:bg-[rgba(229,237,229,0.25)] hover:text-sage`}
            >
              <IconPlus className="w-[22px] h-[22px]" />
            </button>
          );
        })}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
    </>
  );
}

function toDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
