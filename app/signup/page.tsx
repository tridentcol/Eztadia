import type { Metadata } from "next";
import Link from "next/link";
import {
  AuthSplitLayout,
  AuthHeader,
  QUOTES,
  IMAGES,
} from "@/components/auth/AuthSplitLayout";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Crear cuenta — Eztadia",
};

export default function SignupPage() {
  return (
    <AuthSplitLayout
      quote={QUOTES.signup}
      image={IMAGES.patio}
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="text-sage font-medium underline underline-offset-[3px] decoration-1 decoration-[rgba(92,117,103,0.4)] hover:decoration-sage"
          >
            Inicia sesión
          </Link>
        </>
      }
    >
      <AuthHeader
        eyebrow="Crear cuenta"
        title={
          <>
            Empieza tu <em className="italic">Eztadia</em>.
          </>
        }
        subtitle="5 minutos para tener tu primera propiedad publicada. Sin tarjeta."
      />
      <div className="mt-9">
        <SignupForm />
      </div>
    </AuthSplitLayout>
  );
}
