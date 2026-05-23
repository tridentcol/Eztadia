import type { Metadata } from "next";
import { ErrorState } from "@/components/shared/ErrorState";

export const metadata: Metadata = {
  title: "Sin permisos — Eztadia",
};

export default function ForbiddenPage() {
  return (
    <main id="main" className="min-h-screen flex items-center justify-center bg-cream">
      <ErrorState
        variant="403"
        title="Esta puerta no es tuya."
        body="No tienes permisos para ver esta página. Si crees que deberías tenerlos, pídele al owner de la propiedad que te invite."
        actions={[
          { label: "← Volver a mi dashboard", href: "/dashboard", variant: "outline-sage" },
        ]}
      />
    </main>
  );
}
