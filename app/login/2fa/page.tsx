import type { Metadata } from "next";
import {
  AuthSplitLayout,
  AuthHeader,
  QUOTES,
  IMAGES,
} from "@/components/auth/AuthSplitLayout";
import { TwoFAForm } from "@/components/auth/TwoFAForm";

export const metadata: Metadata = {
  title: "Verificación adicional — Eztadia",
};

export default async function TwoFAPage({
  searchParams,
}: {
  searchParams: Promise<{ backup?: string }>;
}) {
  const { backup } = await searchParams;
  const useBackup = backup === "1";

  return (
    <AuthSplitLayout quote={QUOTES.default} image={IMAGES.bedroom}>
      <AuthHeader
        eyebrow={useBackup ? "Código de respaldo" : "Verificación adicional"}
        title={useBackup ? "Usa uno de tus códigos." : "Confirma que eres tú."}
        subtitle={
          useBackup ? (
            <>
              Estos son de un solo uso. Después de usarlo, revoca el resto desde tu configuración.
            </>
          ) : (
            <>
              Ingresa el código de <span className="oldstyle">6</span> dígitos de tu app de autenticación.
            </>
          )
        }
      />
      <div className="mt-9">
        <TwoFAForm initialBackup={useBackup} />
      </div>
    </AuthSplitLayout>
  );
}
