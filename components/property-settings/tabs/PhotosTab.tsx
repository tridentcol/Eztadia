"use client";

import { useState } from "react";
import Image from "next/image";
import { SectionHeader } from "../primitives";
import { IconPlus } from "../icons";

export type GalleryPhoto = { id: string; url: string; alt: string };

const MAX_PHOTOS = 30;

export function PhotosTab({ initial }: { initial: GalleryPhoto[] }) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initial);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function makeCover(id: string) {
    setPhotos((arr) => {
      const idx = arr.findIndex((p) => p.id === id);
      if (idx <= 0) return arr;
      const next = [...arr];
      const [pic] = next.splice(idx, 1);
      next.unshift(pic);
      return next;
    });
  }

  function remove(id: string) {
    setPhotos((arr) => arr.filter((p) => p.id !== id));
    setConfirmDelete(null);
  }

  return (
    <>
      <SectionHeader
        eyebrow="Fotos"
        title="Galería"
        subtitle="Sube hasta 30 fotos. La primera es la portada. Arrastra para reordenar."
      />

      <div
        role="status"
        className="rounded-xl bg-linen border border-rule px-4 py-3 mb-6 text-[13px] text-ink-soft leading-[1.55]"
      >
        <strong className="text-ink font-medium">Próximamente.</strong>{" "}
        La subida real de fotos llega cuando habilitemos almacenamiento de
        archivos. Por ahora puedes preparar tu galería pero los cambios no se
        guardan.
      </div>

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {photos.map((photo, idx) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            isCover={idx === 0}
            onMakeCover={() => makeCover(photo.id)}
            onRequestDelete={() => setConfirmDelete(photo.id)}
          />
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            className="aspect-[4/3] rounded-[14px] border-2 border-dashed border-rule-strong bg-cream text-ink-muted flex flex-col items-center justify-center gap-2 transition-colors hover:border-sage-soft hover:bg-[rgba(229,237,229,0.25)] hover:text-sage"
          >
            <IconPlus className="w-[22px] h-[22px]" />
            <span className="text-[12px] font-medium">Agregar fotos</span>
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
  onMakeCover,
  onRequestDelete,
}: {
  photo: GalleryPhoto;
  isCover: boolean;
  onMakeCover: () => void;
  onRequestDelete: () => void;
}) {
  return (
    <div className="group relative aspect-[4/3] rounded-[14px] overflow-hidden bg-linen cursor-grab">
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
            className="inline-flex items-center h-[30px] px-3 rounded-lg text-[12px] font-medium text-ink"
            style={{ background: "rgba(251,248,242,0.92)", backdropFilter: "blur(4px)" }}
          >
            Hacer portada
          </button>
        )}
        <button
          type="button"
          onClick={onRequestDelete}
          className="inline-flex items-center h-[30px] px-3 rounded-lg text-[12px] font-medium text-danger"
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
