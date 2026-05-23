import type { Metadata } from "next";
import Link from "next/link";
import {
  AuthSplitLayout,
  AuthHeader,
  QUOTES,
  IMAGES,
} from "@/components/auth/AuthSplitLayout";
import { ResetRequestForm } from "@/components/auth/ResetRequestForm";

export const metadata: Metadata = {
  title: "Recuperar contraseña — Eztadia",
};

export default function ResetPasswordPage() {
  return (
    <AuthSplitLayout
      quote={QUOTES.reset}
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
        eyebrow="Recuperar contraseña"
        title="Te ayudamos a entrar."
        subtitle="Te enviamos un link a tu email para crear una contraseña nueva."
      />
      <div className="mt-9">
        <ResetRequestForm />
      </div>
    </AuthSplitLayout>
  );
}
