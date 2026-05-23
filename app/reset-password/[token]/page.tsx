import type { Metadata } from "next";
import Link from "next/link";
import {
  AuthSplitLayout,
  AuthHeader,
  QUOTES,
  IMAGES,
} from "@/components/auth/AuthSplitLayout";
import { ResetNewForm } from "@/components/auth/ResetNewForm";

export const metadata: Metadata = {
  title: "Nueva contraseña — Eztadia",
};

export default async function ResetNewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <AuthSplitLayout
      quote={QUOTES.default}
      image={IMAGES.bedroom}
      footer={
        <Link
          href="/login"
          className="text-sage font-medium underline underline-offset-[3px] decoration-1 decoration-[rgba(92,117,103,0.4)] hover:decoration-sage"
        >
          ← Volver al login
        </Link>
      }
    >
      <AuthHeader
        eyebrow="Cambia tu contraseña"
        title="Una contraseña nueva."
        subtitle="Algo que recuerdes y que no uses en otros lugares."
      />
      <div className="mt-9">
        <ResetNewForm token={token} />
      </div>
    </AuthSplitLayout>
  );
}
