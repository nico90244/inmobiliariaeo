/**
 * Los dos números de WhatsApp reales del equipo. `link_whatsapp` en `propiedades`
 * guarda el link completo (para compatibilidad con valores antiguos que incluían
 * un mensaje propio); estas utilidades extraen solo el número para poder armar
 * el mensaje de contacto correcto en cada pantalla.
 */
export const AGENTES_WHATSAPP = {
  eliana: { nombre: "Eliana", numero: "573186531598" },
  valeria: { nombre: "Valeria", numero: "573162225604" },
} as const;

export type AgenteWhatsAppKey = keyof typeof AGENTES_WHATSAPP;

/** Extrae el número de un `link_whatsapp` guardado (acepta URLs completas o solo dígitos). */
export function extraerNumeroWhatsApp(raw?: string | null): string | null {
  if (!raw) return null;
  const match = raw.match(/(\d{10,15})/);
  return match ? match[1] : null;
}

/** Detecta a qué agente corresponde un `link_whatsapp` guardado, si coincide con alguno conocido. */
export function detectarAgenteWhatsApp(raw?: string | null): AgenteWhatsAppKey | null {
  const numero = extraerNumeroWhatsApp(raw);
  if (!numero) return null;
  const entry = (Object.entries(AGENTES_WHATSAPP) as [AgenteWhatsAppKey, typeof AGENTES_WHATSAPP[AgenteWhatsAppKey]][])
    .find(([, agente]) => agente.numero === numero);
  return entry ? entry[0] : null;
}

/** Arma el link de wa.me a partir de un `link_whatsapp` guardado, con número y mensaje por defecto. */
export function buildWhatsAppLink(linkWhatsapp: string | null | undefined, numeroFallback: string, mensaje: string): string {
  const numero = extraerNumeroWhatsApp(linkWhatsapp) || numeroFallback;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
