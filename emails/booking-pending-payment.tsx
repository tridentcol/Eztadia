import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./_layout";

type Props = {
  guestName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  totalFormatted: string;
  paymentMethod: "pse" | "manual_transfer";
  payUrl: string;
  /** Solo aplica si paymentMethod === "manual_transfer". */
  bankInstructions?: string | null;
  /** Codigo legible (8 chars usualmente). */
  reference: string;
  /** Numero de horas / minutos hasta que el hold expira. */
  expiresInHours: number;
};

export default function BookingPendingPaymentEmail({
  guestName,
  propertyName,
  checkIn,
  checkOut,
  totalFormatted,
  paymentMethod,
  payUrl,
  bankInstructions,
  reference,
  expiresInHours,
}: Props) {
  const isPse = paymentMethod === "pse";
  return (
    <EmailLayout
      preview={`Tu reserva en ${propertyName} esta pendiente de pago — referencia ${reference}`}
    >
      <Text style={styles.h1}>Reserva pendiente de pago</Text>
      <Text style={styles.body}>
        Hola {guestName}, gracias por elegir{" "}
        <span style={{ fontFamily: styles.fontSerif, fontStyle: "italic" }}>
          {propertyName}
        </span>
        . Tu reserva quedo apartada y estamos esperando el pago para
        confirmarla.
      </Text>

      <Section
        style={{
          backgroundColor: "#F2EDE2",
          border: `1px solid ${styles.rule}`,
          borderRadius: 10,
          padding: "16px 18px",
          margin: "20px 0",
        }}
      >
        <Text style={styles.label}>Llegada</Text>
        <Text style={styles.value}>{checkIn}</Text>
        <Text style={styles.label}>Salida</Text>
        <Text style={styles.value}>{checkOut}</Text>
        <Text style={styles.label}>Total a pagar</Text>
        <Text style={styles.value}>{totalFormatted}</Text>
        <Text style={styles.label}>Referencia</Text>
        <Text style={{ ...styles.value, fontFamily: "monospace" }}>{reference}</Text>
      </Section>

      {isPse ? (
        <>
          <Text style={styles.body}>
            Completa el pago con tu banco en PSE haciendo clic abajo. Tienes{" "}
            {expiresInHours} {expiresInHours === 1 ? "hora" : "horas"} antes de
            que la reserva libere las fechas.
          </Text>
          <Section style={{ margin: "24px 0" }}>
            <Button href={payUrl} style={styles.cta("terracotta")}>
              Pagar ahora
            </Button>
          </Section>
        </>
      ) : (
        <>
          <Text style={styles.body}>
            Te dejamos las instrucciones para hacer la transferencia bancaria.
            Tienes {expiresInHours} {expiresInHours === 1 ? "hora" : "horas"}{" "}
            para enviarnos el comprobante.
          </Text>
          {bankInstructions ? (
            <Section
              style={{
                backgroundColor: "#FBF8F2",
                border: `1px solid ${styles.rule}`,
                borderRadius: 10,
                padding: "14px 16px",
                margin: "16px 0 20px",
              }}
            >
              <Text style={{ ...styles.muted, whiteSpace: "pre-line" }}>
                {bankInstructions}
              </Text>
            </Section>
          ) : null}
          <Section style={{ margin: "20px 0" }}>
            <Button href={payUrl} style={styles.cta("terracotta")}>
              Subir comprobante
            </Button>
          </Section>
        </>
      )}

      <Text style={styles.muted}>
        Conserva la referencia <strong>{reference}</strong> por si necesitas
        contactarnos.
      </Text>
    </EmailLayout>
  );
}
