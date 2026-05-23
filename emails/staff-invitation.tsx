import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./_layout";

type Props = {
  inviterName: string;
  propertyName: string;
  roleLabel: string;
  acceptUrl: string;
};

export default function StaffInvitationEmail({
  inviterName,
  propertyName,
  roleLabel,
  acceptUrl,
}: Props) {
  return (
    <EmailLayout
      preview={`${inviterName} te invito a ${propertyName} como ${roleLabel}.`}
    >
      <Text style={styles.h1}>Te invitaron a una propiedad</Text>
      <Text style={styles.body}>
        {inviterName} te agrego al equipo de{" "}
        <span style={{ fontFamily: styles.fontSerif, fontStyle: "italic" }}>
          {propertyName}
        </span>{" "}
        en Eztadia como <strong>{roleLabel}</strong>. Acepta la invitacion para
        empezar a recibir reservas y notificaciones.
      </Text>

      <Section style={{ margin: "24px 0" }}>
        <Button href={acceptUrl} style={styles.cta("sage")}>
          Aceptar invitacion
        </Button>
      </Section>

      <Text style={styles.muted}>
        Si no esperabas esta invitacion, ignora este correo.
      </Text>
    </EmailLayout>
  );
}
