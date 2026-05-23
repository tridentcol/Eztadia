import { ErrorState } from "@/components/shared/ErrorState";

export default function NotFound() {
  return (
    <main id="main" className="min-h-screen flex items-center justify-center bg-cream">
      <ErrorState
        variant="404"
        title="Esa página se mudó (o nunca existió)."
        body="Lo más probable: un link viejo o una propiedad desactivada. Vuelve al inicio y prueba de nuevo."
        actions={[
          { label: "← Volver al inicio", href: "/", variant: "outline-sage" },
          { label: "Escribir a soporte", href: "https://wa.me/573112223344", variant: "ghost" },
        ]}
      />
    </main>
  );
}
