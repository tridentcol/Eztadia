import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, styles } from "./_layout";

type Props = {
  resetUrl: string;
  /** Minutos hasta que el link expira. Default 60. */
  expiresInMinutes?: number;
};

export default function PasswordResetEmail({
  resetUrl,
  expiresInMinutes = 60,
}: Props) {
  return (
    <EmailLayout preview="Recibimos una solicitud para cambiar tu contrasena.">
      <Text style={styles.h1}>Cambia tu contrasena</Text>
      <Text style={styles.body}>
        Recibimos una solicitud para restablecer tu contrasena en Eztadia. El
        link es valido por {expiresInMinutes} minutos.
      </Text>

      <Section style={{ margin: "24px 0" }}>
        <Button href={resetUrl} style={styles.cta("sage")}>
          Cambiar contrasena
        </Button>
      </Section>

      <Text style={styles.muted}>
        Si no fuiste tu, ignora este correo y avisanos.
      </Text>
    </EmailLayout>
  );
}
