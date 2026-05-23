"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OTPInput } from "./OTPInput";
import { FieldShell, TextField } from "./fields";
import { IconLock } from "./icons";
import { ErrorBanner } from "./Banner";
import { verifyMfaAction } from "@/lib/auth/actions";

export function TwoFAForm({ initialBackup = false }: { initialBackup?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"totp" | "backup">(initialBackup ? "backup" : "totp");
  const [code, setCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    setError(null);
    if (mode === "totp") {
      if (code.length !== 6) {
        setError("Ingresa los 6 dígitos.");
        setSubmitting(false);
        return;
      }
      const result = await verifyMfaAction({ code });
      if (!result.ok) {
        setError(result.error);
        setSubmitting(false);
        return;
      }
    } else {
      if (backupCode.replace(/[^A-Za-z0-9]/g, "").length < 10) {
        setError("Código de respaldo incompleto.");
        setSubmitting(false);
        return;
      }
      // TODO(B8): backup codes flow — requiere lib propia (Supabase MFA
      // no provee backup codes out of the box; usaremos custom storage).
    }
    router.push("/dashboard");
  }

  if (mode === "backup") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        noValidate
      >
        {error && <ErrorBanner>{error}</ErrorBanner>}

        <FieldShell
          label="Código de respaldo"
          helper={
            <p className="text-[12px] text-ink-muted m-0">
              Estos códigos son de un solo uso. Tienes <span className="oldstyle">9</span> restantes.
            </p>
          }
        >
          <TextField
            value={backupCode}
            onChange={(e) =>
              setBackupCode(e.target.value.toUpperCase())
            }
            placeholder="XXXX-XXXX-XXXX"
            autoComplete="one-time-code"
            iconLeft={<IconLock className="w-4 h-4" />}
            style={{
              fontFamily: "var(--font-mono, ui-monospace, monospace)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          />
        </FieldShell>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 mt-2 rounded-[14px] bg-sage text-cream text-sm font-medium hover:bg-[#4F6759] active:scale-[0.99] transition-[background-color,transform] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Verificando…" : "Verificar"}
        </button>

        <p className="text-center text-[13px] text-ink-muted mt-7">
          <button
            type="button"
            onClick={() => {
              setMode("totp");
              setError(null);
            }}
            className="text-sage underline underline-offset-[3px] decoration-1 decoration-[rgba(92,117,103,0.4)] hover:decoration-sage font-medium"
          >
            ← Usar app de autenticación
          </button>
        </p>
      </form>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      noValidate
    >
      {error && <ErrorBanner>{error}</ErrorBanner>}

      <OTPInput
        value={code}
        onChange={setCode}
        onComplete={() => submit()}
      />

      <button
        type="submit"
        disabled={submitting || code.length < 6}
        className="w-full h-12 rounded-[14px] bg-sage text-cream text-sm font-medium hover:bg-[#4F6759] active:scale-[0.99] transition-[background-color,transform] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Verificando…" : "Verificar"}
      </button>

      <p className="text-center text-[13px] text-ink-muted mt-7">
        ¿Perdiste acceso a tu app?{" "}
        <button
          type="button"
          onClick={() => {
            setMode("backup");
            setError(null);
          }}
          className="text-sage underline underline-offset-[3px] decoration-1 decoration-[rgba(92,117,103,0.4)] hover:decoration-sage font-medium"
        >
          Usar código de respaldo
        </button>
      </p>
    </form>
  );
}
