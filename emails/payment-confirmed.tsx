import { Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./_layout";

type Props = {
  guestName: string;
  propertyName: string;
  amountFormatted: string;
  reference: string;
  paymentMethodLabel: string;
};

export default function PaymentConfirmedEmail({
  guestName,
  propertyName,
  amountFormatted,
  reference,
  paymentMethodLabel,
}: Props) {
  return (
    <EmailLayout
      preview={`Pago confirmado para tu reserva en ${propertyName} (${reference}).`}
    >
      <Text style={styles.h1}>Pago confirmado</Text>
      <Text style={styles.body}>
        Hola {guestName}, recibimos tu pago para la reserva en{" "}
        <span style={{ fontFamily: styles.fontSerif, fontStyle: "italic" }}>
          {propertyName}
        </span>
        . Te enviaremos por separado el correo con las instrucciones de llegada.
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
        <Text style={styles.label}>Monto</Text>
        <Text style={styles.value}>{amountFormatted}</Text>
        <Text style={styles.label}>Metodo de pago</Text>
        <Text style={styles.value}>{paymentMethodLabel}</Text>
        <Text style={styles.label}>Referencia</Text>
        <Text style={{ ...styles.value, fontFamily: "monospace" }}>
          {reference}
        </Text>
      </Section>

      <Text style={styles.muted}>
        Guarda este correo como comprobante.
      </Text>
    </EmailLayout>
  );
}
