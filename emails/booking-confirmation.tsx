import { Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./_layout";

type Props = {
  guestName: string;
  propertyName: string;
  propertyAddress?: string | null;
  propertyContactPhone?: string | null;
  checkIn: string;
  checkOut: string;
  roomLabel?: string | null;
  reference: string;
};

export default function BookingConfirmationEmail({
  guestName,
  propertyName,
  propertyAddress,
  propertyContactPhone,
  checkIn,
  checkOut,
  roomLabel,
  reference,
}: Props) {
  return (
    <EmailLayout
      preview={`Tu reserva en ${propertyName} esta confirmada (${reference}).`}
    >
      <Text style={styles.h1}>Tu reserva esta confirmada</Text>
      <Text style={styles.body}>
        Hola {guestName}, te esperamos en{" "}
        <span style={{ fontFamily: styles.fontSerif, fontStyle: "italic" }}>
          {propertyName}
        </span>
        . Aqui van los detalles para que los tengas a mano.
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
        {roomLabel ? (
          <>
            <Text style={styles.label}>Habitacion asignada</Text>
            <Text style={styles.value}>{roomLabel}</Text>
          </>
        ) : null}
        <Text style={styles.label}>Referencia</Text>
        <Text style={{ ...styles.value, fontFamily: "monospace" }}>
          {reference}
        </Text>
      </Section>

      {propertyAddress ? (
        <Text style={styles.body}>
          <strong>Direccion:</strong> {propertyAddress}
        </Text>
      ) : null}
      {propertyContactPhone ? (
        <Text style={styles.body}>
          <strong>Contacto:</strong> {propertyContactPhone}
        </Text>
      ) : null}

      <Text style={styles.muted}>
        Si necesitas modificar la reserva, responde a este correo o contactanos
        al numero de la propiedad.
      </Text>
    </EmailLayout>
  );
}
