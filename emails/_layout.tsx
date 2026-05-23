import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

/**
 * Layout compartido para todos los emails de Eztadia.
 *
 * Tokens hardcoded inline (los emails no pueden cargar CSS externo).
 * Paleta y tipografias siguen el sistema (DESIGN_NOTES.md):
 *   - --cream #FBF8F2 (background)
 *   - --paper #FFFFFF (card)
 *   - --rule  #E5DFD3 (hairlines)
 *   - --ink   #1F1B16
 *   - --ink-soft #5A5147
 *   - --sage  #5C7567 (marca)
 *   - --terracotta #C76F4C (CTA importante)
 *
 * Fonts: serif/sans del sistema (no podemos cargar Fraunces/Inter
 * en clientes de email). El emisor que quiera CSS custom puede
 * sobrescribir el style.
 */

const cream = "#FBF8F2";
const paper = "#FFFFFF";
const rule = "#E5DFD3";
const ink = "#1F1B16";
const inkSoft = "#5A5147";
const sage = "#5C7567";

const fontSerif =
  '"Fraunces", "Cormorant Garamond", "Iowan Old Style", "Apple Garamond", Garamond, "Times New Roman", serif';
const fontSans =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: cream,
          margin: 0,
          padding: "32px 16px",
          fontFamily: fontSans,
          color: ink,
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <Container
          style={{
            backgroundColor: paper,
            border: `1px solid ${rule}`,
            borderRadius: 14,
            maxWidth: 560,
            margin: "0 auto",
            padding: "32px 32px 28px",
          }}
        >
          <Section style={{ paddingBottom: 8 }}>
            <Text
              style={{
                fontFamily: fontSerif,
                fontStyle: "italic",
                fontSize: 22,
                fontWeight: 500,
                color: sage,
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              Eztadia
            </Text>
          </Section>

          <Hr style={{ borderTop: `1px solid ${rule}`, margin: "12px 0 24px" }} />

          {children}

          <Hr style={{ borderTop: `1px solid ${rule}`, margin: "32px 0 16px" }} />
          <Text
            style={{
              fontSize: 12,
              lineHeight: "18px",
              color: inkSoft,
              margin: 0,
            }}
          >
            Recibiste este correo porque interactuaste con una propiedad
            gestionada en Eztadia. Si crees que es un error, responde a este
            mensaje.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const styles = {
  cream,
  paper,
  rule,
  ink,
  inkSoft,
  sage,
  fontSerif,
  fontSans,
  h1: {
    fontFamily: fontSerif,
    fontSize: 28,
    fontWeight: 500,
    lineHeight: "34px",
    color: ink,
    margin: "0 0 12px",
    letterSpacing: "-0.01em",
  } as const,
  body: {
    fontSize: 15,
    lineHeight: "24px",
    color: ink,
    margin: "0 0 16px",
  } as const,
  muted: {
    fontSize: 14,
    lineHeight: "22px",
    color: inkSoft,
    margin: "0 0 12px",
  } as const,
  label: {
    fontSize: 12,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: inkSoft,
    margin: "0 0 4px",
  },
  value: {
    fontFamily: fontSerif,
    fontSize: 20,
    lineHeight: "28px",
    color: ink,
    margin: "0 0 12px",
  },
  cta: (color: "sage" | "terracotta") => ({
    backgroundColor: color === "terracotta" ? "#C76F4C" : sage,
    color: "#FBF8F2",
    fontSize: 15,
    fontWeight: 600,
    padding: "12px 24px",
    borderRadius: 10,
    textDecoration: "none",
    display: "inline-block",
  }),
};
