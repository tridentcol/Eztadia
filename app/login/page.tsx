import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  AuthSplitLayout,
  AuthHeader,
  QUOTES,
  IMAGES,
} from "@/components/auth/AuthSplitLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Inicia sesión — Eztadia",
};

export default function LoginPage() {
  return (
    <AuthSplitLayout
      quote={QUOTES.default}
      image={IMAGES.bedroom}
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link
            href="/signup"
            className="text-sage font-medium underline underline-offset-[3px] decoration-1 decoration-[rgba(92,117,103,0.4)] hover:decoration-sage"
          >
            Crea una
          </Link>
        </>
      }
    >
      <AuthHeader
        eyebrow="Inicia sesión"
        title="Bienvenido de vuelta."
        subtitle="Entra a gestionar tus propiedades."
      />
      <div className="mt-9">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </AuthSplitLayout>
  );
}
