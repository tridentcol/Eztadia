"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  bankAccountInputSchema,
  type BankAccountInput,
  ACCOUNT_TYPE_LABEL,
  HOLDER_DOC_TYPE_LABEL,
  ACCOUNT_TYPES,
  HOLDER_DOC_TYPES,
} from "@/lib/validation/bank-account";
import {
  upsertBankAccountAction,
  deleteBankAccountAction,
} from "@/app/actions/bank-account";
import {
  FieldShell,
  Input,
  Textarea,
  Select,
  SectionHeader,
  Divider,
} from "../primitives";
import { SaveBar } from "../SaveBar";

const EMPTY_VALUES: BankAccountInput = {
  holderName: "",
  holderDocumentType: "CC",
  holderDocumentNumber: "",
  bankName: "",
  accountType: "savings",
  accountNumber: "",
  notes: "",
};

export function PaymentsTab({
  propertyId,
  initial,
}: {
  propertyId: string;
  initial: BankAccountInput | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [, startTransition] = useTransition();

  const form = useForm<BankAccountInput>({
    resolver: zodResolver(bankAccountInputSchema),
    defaultValues: initial ?? EMPTY_VALUES,
  });
  const { register, formState } = form;
  const { errors } = formState;

  async function onSave(values: BankAccountInput) {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await upsertBankAccountAction({
        propertyId,
        data: values,
      });
      if (!res.ok) {
        setSaveError(res.error ?? "No pudimos guardar los datos bancarios.");
        throw new Error("save-failed");
      }
      startTransition(() => router.refresh());
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    setDeleting(true);
    try {
      const res = await deleteBankAccountAction({ propertyId });
      if (!res.ok) {
        setSaveError(res.error ?? "No pudimos eliminar los datos bancarios.");
        return;
      }
      setConfirmDelete(false);
      form.reset(EMPTY_VALUES);
      startTransition(() => router.refresh());
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <SectionHeader
        eyebrow="Pagos"
        title="Transferencia bancaria"
        subtitle="Datos que mostramos al huésped cuando elige pagar por transferencia. Si dejás esto vacío, el flujo público solo ofrecerá PSE."
      />

      <FieldShell label="Titular de la cuenta" error={errors.holderName?.message}>
        <Input
          placeholder="Ej: Casa Marina SAS"
          {...register("holderName")}
        />
      </FieldShell>

      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4">
        <FieldShell
          label="Tipo de documento"
          error={errors.holderDocumentType?.message}
        >
          <Select {...register("holderDocumentType")}>
            {HOLDER_DOC_TYPES.map((t) => (
              <option key={t} value={t}>
                {HOLDER_DOC_TYPE_LABEL[t]}
              </option>
            ))}
          </Select>
        </FieldShell>
        <FieldShell
          label="Número de documento"
          error={errors.holderDocumentNumber?.message}
        >
          <Input
            placeholder="Ej: 900.123.456-7"
            {...register("holderDocumentNumber")}
          />
        </FieldShell>
      </div>

      <Divider className="my-2" />

      <FieldShell label="Banco" error={errors.bankName?.message}>
        <Input placeholder="Ej: Bancolombia" {...register("bankName")} />
      </FieldShell>

      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4">
        <FieldShell label="Tipo de cuenta" error={errors.accountType?.message}>
          <Select {...register("accountType")}>
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>
                {ACCOUNT_TYPE_LABEL[t]}
              </option>
            ))}
          </Select>
        </FieldShell>
        <FieldShell
          label="Número de cuenta"
          error={errors.accountNumber?.message}
        >
          <Input
            placeholder="Ej: 1234-5678-9012"
            {...register("accountNumber")}
          />
        </FieldShell>
      </div>

      <FieldShell
        label="Notas para el huésped (opcional)"
        error={errors.notes?.message}
        helper="Instrucciones adicionales: horario para recibir comprobantes, persona de contacto, etc."
      >
        <Textarea
          rows={3}
          placeholder="Ej: Envianos el comprobante por WhatsApp al +57 311 …"
          {...register("notes")}
        />
      </FieldShell>

      {saveError && (
        <p
          role="alert"
          className="mt-3 text-xs text-danger border border-danger/30 bg-danger/5 rounded-md px-3 py-2"
        >
          {saveError}
        </p>
      )}

      {initial && (
        <>
          <Divider className="my-8" />
          <div className="mt-4">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-[13px] font-medium text-danger hover:underline underline-offset-[3px]"
              >
                Eliminar datos bancarios
              </button>
            ) : (
              <div className="border border-danger/30 bg-danger/5 rounded-lg p-4">
                <p className="text-[14px] text-ink m-0 mb-3">
                  Después de eliminar, los huéspedes ya no podrán elegir
                  transferencia como método de pago.
                </p>
                <div className="inline-flex gap-2.5">
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={onDelete}
                    className="h-9 px-4 rounded-lg bg-danger text-cream text-[13px] font-medium disabled:opacity-60"
                  >
                    {deleting ? "Eliminando…" : "Sí, eliminar"}
                  </button>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => setConfirmDelete(false)}
                    className="h-9 px-4 rounded-lg bg-cream text-ink-soft border border-rule text-[13px] font-medium hover:bg-linen"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <SaveBar form={form} onSave={onSave} saving={saving} />
    </>
  );
}
