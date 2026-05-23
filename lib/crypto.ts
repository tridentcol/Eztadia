import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * AES-256-GCM symmetric encryption para secrets en DB (wompi/whatsapp tokens).
 *
 * Formato cifrado en DB: base64(iv || authTag || ciphertext)
 *   iv:        12 bytes (recomendacion GCM)
 *   authTag:   16 bytes
 *   ciphertext: variable
 *
 * ENCRYPTION_KEY: 64 hex chars (32 bytes). Generar con `openssl rand -hex 32`.
 * Si rota la key, todos los secrets cifrados se vuelven irrecuperables → tener
 * plan de rotacion antes de cambiarla (re-encrypt en migration).
 */

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("ENCRYPTION_KEY debe estar en .env (64 hex chars).");
  }
  return Buffer.from(hex, "hex");
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decrypt(blob: string): string {
  const raw = Buffer.from(blob, "base64");
  if (raw.length < 12 + 16 + 1) throw new Error("Cipher blob invalido.");
  const iv  = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const ct  = raw.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

/**
 * Verifica HMAC SHA-256 contra un payload firmado.
 * Constant-time compare evita timing attacks.
 *
 * @param payload string crudo recibido (body raw del webhook)
 * @param signatureHex hex string firmado por el remitente
 * @param secret secreto compartido (e.g. wompi events_secret)
 */
export function verifyHmacSha256(payload: string, signatureHex: string, secret: string): boolean {
  if (!signatureHex || signatureHex.length % 2 !== 0) return false;
  const expected = createHash("sha256").update(payload + secret).digest();

  const provided = Buffer.from(signatureHex, "hex");
  if (provided.length !== expected.length) return false;

  return timingSafeEqual(provided, expected);
}
