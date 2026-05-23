import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./_layout";

type Props = {
  guestName: string;
  propertyName: string;
  reference: string;
  /** URL para reintentar pago (resume del hold mientras siga activo). */
  retryUrl?: string | null;
  reasonHint?: string | null;
};

export default function PaymentRejectedEmail({
  guestName,
  propertyName,
  reference,
  retryUrl,
  reasonHint,
}: Props) {
  return (
    <EmailLayout
      preview={`No pudimos confirmar tu pago en ${propertyName} (${reference}).`}
    >
      <Text style={styles.h1}>No pudimos confirmar tu pago</Text>
      <Text style={styles.body}>
        Hola {guestName}, el banco rechazo el pago para tu reserva en{" "}
        <span style={{ fontFamily: styles.fontSerif, fontStyle: "italic" }}>
          {propertyName}
        </span>
        . Las fechas siguen apartadas mientras este link esta vigente — puedes
        intentarlo de nuevo.
      </Text>

      {reasonHint ? (
        <Section
          style={{
            backgroundColor: "#FBF8F2",
            border: `1px solid ${styles.rule}`,
            borderRadius: 10,
            padding: "12px 14px",
            margin: "12px 0 20px",
          }}
        >
          <Text style={styles.muted}>{reasonHint}</Text>
        </Section>
      ) : null}

      {retryUrl ? (
        <Section style={{ margin: "20px 0" }}>
          <Button href={retryUrl} style={styles.cta("terracotta")}>
            Reintentar pago
          </Button>
        </Section>
      ) : null}

      <Text style={styles.muted}>
        Referencia: <strong style={{ fontFamily: "monospace" }}>{reference}</strong>
      </Text>
    </EmailLayout>
  );
}
