"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SectionHeader } from "../primitives";
import { IconPlus } from "../icons";
import {
  uploadPropertyPhotoAction,
  deletePropertyPhotoAction,
  setCoverPhotoAction,
} from "@/app/actions/photos";

export type GalleryPhoto = {
  id: string;
  url: string;
  alt: string;
  path?: string;
};

const MAX_PHOTOS = 30;
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export function PhotosTab({
  propertyId,
  initial,
}: {
  propertyId: string;
  initial: GalleryPhoto[];
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initial);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [banner, setBanner] = useState<
    { kind: "error" | "success"; text: string } | null
  >(null);
  const [busy, startBusy] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function pickFiles() {
    setBanner(null);
    fileInputRef.current?.click();
  }

  async function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // reset para permitir re-seleccionar mismo archivo
    if (files.length === 0) return;

    // Validación client-side antes de subir (la action revalida igual).
    const remaining = MAX_PHOTOS - photos.length;
    if (files.length > remaining) {
      setBanner({
        kind: "error",
        text: `Solo puedes agregar ${remaining} ${remaining === 1 ? "foto" : "fotos"} más.`,
      });
      return;
    }
    for (const f of files) {
      if (!ALLOWED_MIME.includes(f.type)) {
        setBanner({
          kind: "error",
          text: `"${f.name}" no es PNG, JPG ni WebP.`,
        });
        return;
      }
      if (f.size > MAX_BYTES) {
        setBanner({
          kind: "error",
          text: `"${f.name}" excede 5 MB.`,
        });
        return;
      }
    }

    setUploading(true);
    setBanner(null);
    try {
      let ok = 0;
      let fail = 0;
      for (const file of files) {
        const fd = new FormData();
        fd.append("propertyId", propertyId);
        fd.append("alt", "");
        fd.append("file", file);
        const res = await uploadPropertyPhotoAction(fd);
        if (res.ok) {
          ok += 1;
          setPhotos((arr) => [...arr, res.photo]);
        } else {
          fail += 1;
          setBanner({
            kind: "error",
            text: `Error subiendo "${file.name}": ${res.error}`,
          });
          break; // Detenemos en el primer fail para no spamear.
        }
      }
      if (ok > 0 && fail === 0) {
        setBanner({
          kind: "success",
          text:
            ok === 1
              ? "Foto subida."
              : `${ok} fotos subidas.`,
        });
      }
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  function makeCover(id: string) {
    const idx = photos.findIndex((p) => p.id === id);
    if (idx <= 0) return;
    setBanner(null);
    const next = [...photos];
    const [pic] = next.splice(idx, 1);
    next.unshift(pic);
    setPhotos(next); // optimista
    startBusy(async () => {
      const res = await setCoverPhotoAction({ propertyId, photoId: id });
      if (!res.ok) {
        setPhotos(initial); // revertir si falla
        setBanner({ kind: "error", text: res.error });
      } else {
        router.refresh();
      }
    });
  }

  function remove(id: string) {
    setConfirmDelete(null);
    setBanner(null);
    const prev = photos;
    setPhotos((arr) => arr.filter((p) => p.id !== id)); // optimista
    startBusy(async () => {
      const res = await deletePropertyPhotoAction({
        propertyId,
        photoId: id,
      });
      if (!res.ok) {
        setPhotos(prev);
        setBanner({ kind: "error", text: res.error });
      } else {
        router.refresh();
      }
    });
  }

  const disabled = busy || uploading;

  return (
    <>
      <SectionHeader
        eyebrow="Fotos"
        title="Galería"
        subtitle="Sube hasta 30 fotos. La primera es la portada."
      />

      {banner && (
        <div
          role="alert"
          className={[
            "mb-6 flex gap-2.5 px-4 py-3 rounded-[10px] text-sm leading-[1.45] text-ink border-l-[3px]",
            banner.kind === "success"
              ? "bg-[rgba(94,138,95,0.10)] border-success"
              : "bg-[rgba(168,72,60,0.08)] border-danger",
          ].join(" ")}
        >
          {banner.text}
        </div>
      )}

      <div className="flex items-baseline justify-between mb-4 gap-3 flex-wrap">
        <span className="text-[13px] font-medium text-ink-muted">
          <span className="text-ink-soft font-medium oldstyle">{photos.length}</span> de{" "}
          <span className="text-ink-soft font-medium oldstyle">{MAX_PHOTOS}</span> fotos
        </span>
        <p className="font-serif italic font-medium text-sm text-ink-soft max-w-[48ch] tracking-[-0.005em] m-0">
          Para mejor resultado, sube fotos horizontales de al menos{" "}
          <span className="oldstyle">1.600</span>px de ancho.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_MIME.join(",")}
        multiple
        hidden
        onChange={onFilesSelected}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {photos.map((photo, idx) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            isCover={idx === 0}
            disabled={disabled}
            onMakeCover={() => makeCover(photo.id)}
            onRequestDelete={() => setConfirmDelete(photo.id)}
          />
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={pickFiles}
            disabled={disabled}
            className="aspect-[4/3] rounded-[14px] border-2 border-dashed border-rule-strong bg-cream text-ink-muted flex flex-col items-center justify-center gap-2 transition-colors hover:border-sage-soft hover:bg-[rgba(229,237,229,0.25)] hover:text-sage disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <IconPlus className="w-[22px] h-[22px]" />
            <span className="text-[12px] font-medium">
              {uploading ? "Subiendo…" : "Agregar fotos"}
            </span>
          </button>
        )}
      </div>

      {confirmDelete && (
        <ConfirmDeleteModal
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => remove(confirmDelete)}
        />
      )}
    </>
  );
}

function PhotoCard({
  photo,
  isCover,
  disabled,
  onMakeCover,
  onRequestDelete,
}: {
  photo: GalleryPhoto;
  isCover: boolean;
  disabled: boolean;
  onMakeCover: () => void;
  onRequestDelete: () => void;
}) {
  return (
    <div className="group relative aspect-[4/3] rounded-[14px] overflow-hidden bg-linen">
      <Image src={photo.url} alt={photo.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
      {isCover && (
        <span className="absolute top-2.5 left-2.5 z-[2] bg-cream text-ink text-[10px] font-semibold tracking-[0.1em] px-2.5 py-1 rounded-full">
          PORTADA
        </span>
      )}
      <div
        className="absolute inset-0 flex items-end justify-end gap-2 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
        style={{
          background: "linear-gradient(0deg, rgba(31,27,22,0.55) 0%, rgba(31,27,22,0.05) 60%)",
        }}
      >
        {!isCover && (
          <button
            type="button"
            onClick={onMakeCover}
            disabled={disabled}
            className="inline-flex items-center h-[30px] px-3 rounded-lg text-[12px] font-medium text-ink disabled:opacity-60"
            style={{ background: "rgba(251,248,242,0.92)", backdropFilter: "blur(4px)" }}
          >
            Hacer portada
          </button>
        )}
        <button
          type="button"
          onClick={onRequestDelete}
          disabled={disabled}
          className="inline-flex items-center h-[30px] px-3 rounded-lg text-[12px] font-medium text-danger disabled:opacity-60"
          style={{ background: "rgba(251,248,242,0.92)", backdropFilter: "blur(4px)" }}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirmar eliminación de foto"
      className="fixed inset-0 z-[100] flex items-center justify-center px-5"
    >
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onCancel}
        className="absolute inset-0 cursor-default"
        style={{ background: "rgba(31,27,22,0.32)" }}
      />
      <div
        className="relative z-[101] bg-paper border border-rule rounded-[20px] p-7 max-w-[440px] w-full"
        style={{ boxShadow: "var(--shadow-pop)" }}
      >
        <h3 className="font-serif italic font-medium text-[22px] text-ink m-0 mb-2 tracking-[-0.015em]">
          ¿Eliminar esta foto?
        </h3>
        <p className="text-sm text-ink-soft m-0 mb-6 leading-[1.55]">
          La foto se quitará de tu galería pública. Si era la portada, la siguiente pasa a serlo. Puedes volver a subirla cuando quieras.
        </p>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-[18px] rounded-xl bg-cream text-ink-soft border border-rule text-sm font-medium hover:bg-linen hover:text-ink transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 px-[18px] rounded-xl bg-transparent text-danger border border-danger text-sm font-medium hover:bg-[rgba(168,72,60,0.08)] transition-colors"
          >
            Eliminar foto
          </button>
        </div>
      </div>
    </div>
  );
}
