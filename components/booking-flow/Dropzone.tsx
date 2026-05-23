"use client";

import { useRef, useState } from "react";
import { IconUploadSimple, IconFileText, IconClose } from "./icons";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ".jpg,.jpeg,.png,.pdf";

export function Dropzone({
  onFile,
}: {
  onFile?: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function handle(f: File | null) {
    if (!f) {
      setFile(null);
      setError(null);
      onFile?.(null);
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("El archivo supera el límite de 5 MB.");
      return;
    }
    if (!/(jpe?g|png|pdf)$/i.test(f.name)) {
      setError("Sube un JPG, PNG o PDF.");
      return;
    }
    setError(null);
    setFile(f);
    onFile?.(f);
  }

  if (file) {
    return (
      <div className="flex items-center gap-3.5 bg-paper border border-rule rounded-2xl p-4 mt-6">
        <span className="w-12 h-12 rounded-[10px] bg-linen text-clay inline-flex items-center justify-center flex-shrink-0">
          <IconFileText className="w-[22px] h-[22px]" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-ink m-0 mb-0.5 truncate">{file.name}</p>
          <p className="text-[11px] text-ink-muted m-0 oldstyle">
            {formatBytes(file.size)} · {extOf(file.name)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => handle(null)}
          aria-label="Quitar archivo"
          className="w-[30px] h-[30px] rounded-lg text-ink-muted hover:bg-linen hover:text-ink inline-flex items-center justify-center transition-colors"
        >
          <IconClose className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handle(f);
        }}
        className={[
          "w-full mt-6 rounded-2xl px-6 py-8 text-center transition-colors",
          "border-2 border-dashed",
          dragging
            ? "border-sage bg-sage-tint/40"
            : "border-rule-strong bg-cream hover:border-sage-soft hover:bg-[rgba(229,237,229,0.3)]",
        ].join(" ")}
      >
        <IconUploadSimple className="w-8 h-8 text-ink-muted mx-auto mb-3" />
        <p className="font-serif italic font-medium text-[17px] text-ink m-0 mb-1.5">
          Arrastra aquí tu comprobante
        </p>
        <p className="text-[13px] text-ink-muted m-0">
          o haz click para seleccionar · JPG, PNG, PDF · máx 5 MB
        </p>
      </button>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={ACCEPT}
        onChange={(e) => handle(e.target.files?.[0] ?? null)}
      />
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function extOf(name: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return m ? m[1].toUpperCase() : "ARCHIVO";
}
