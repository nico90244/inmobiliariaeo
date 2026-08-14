import type { VercelRequest, VercelResponse } from "@vercel/node";
import { promises as dns } from "node:dns";

/**
 * Genera una vista previa (og:image / og:title / og:description) de UNA sola URL
 * puntual que el usuario pega en el formulario "Ofrezco" de la Iniciativa Terremoto
 * (ej: su publicación en Fincaraíz, Metrocuadrado o Facebook Marketplace).
 *
 * Esta función SOLO hace fetch de esa página exacta para leer sus metaetiquetas —
 * es el mismo mecanismo que usa cualquier app de chat (WhatsApp, iMessage, Slack)
 * para mostrar la tarjeta de vista previa de un link. No navega el resto del
 * portal, no sigue enlaces internos, no indexa ni recorre su catálogo.
 */

const FETCH_TIMEOUT_MS = 6000;
const MAX_BYTES = 200_000; // el <head> con los meta tags siempre cabe muy por debajo de esto
const MAX_REDIRECTS = 3;

function isPrivateOrReservedIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true; // formato raro -> bloquear
  const [a, b] = parts;
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local (incluye metadata de nube 169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  return false;
}

function isPrivateOrReservedIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1") return true; // loopback
  if (lower.startsWith("fe80:") || lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) return true; // link-local fe80::/10
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local fc00::/7
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateOrReservedIPv4(mapped[1]);
  return false;
}

/** Resuelve el hostname y rechaza si CUALQUIER IP resuelta es privada/reservada. */
async function assertHostnameIsPublic(hostname: string): Promise<void> {
  const results = await dns.lookup(hostname, { all: true });
  if (results.length === 0) throw new Error("No se pudo resolver el dominio");
  for (const { address, family } of results) {
    const bloqueada = family === 4 ? isPrivateOrReservedIPv4(address) : isPrivateOrReservedIPv6(address);
    if (bloqueada) throw new Error("Dominio no permitido");
  }
}

async function assertUrlIsSafe(url: URL): Promise<void> {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Solo se permiten links http o https");
  }
  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".local")) {
    throw new Error("Dominio no permitido");
  }
  await assertHostnameIsPublic(hostname);
}

/** Extrae og:image / og:title / og:description (y algunos respaldos) de un HTML. */
function extraerMetaTags(html: string) {
  const getMeta = (prop: string) => {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${prop}["']`,
      "i",
    );
    const m = html.match(re);
    return m ? (m[1] || m[2] || "").trim() : null;
  };

  const image = getMeta("og:image") || getMeta("twitter:image");
  const title = getMeta("og:title") || getMeta("twitter:title") || (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? null);
  const description = getMeta("og:description") || getMeta("twitter:description");

  return { image, title, description };
}

/** Descarga como máximo MAX_BYTES del cuerpo de la respuesta (el head basta). */
async function leerHtmlLimitado(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let html = "";
  let total = 0;
  while (total < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    html += decoder.decode(value, { stream: true });
  }
  reader.cancel().catch(() => {});
  return html;
}

async function fetchConValidacionDeRedirects(urlInicial: string): Promise<string> {
  let currentUrl = new URL(urlInicial);
  await assertUrlIsSafe(currentUrl);

  for (let intento = 0; intento <= MAX_REDIRECTS; intento++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(currentUrl.toString(), {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; InmobiliariaEO-LinkPreview/1.0; +https://inmobiliariaeo.com)",
          Accept: "text/html",
        },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Redirect sin destino");
      currentUrl = new URL(location, currentUrl);
      await assertUrlIsSafe(currentUrl); // revalida CADA salto, no solo el primero
      continue;
    }

    if (!response.ok) throw new Error(`El portal respondió ${response.status}`);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) throw new Error("La página no es HTML");

    return leerHtmlLimitado(response);
  }

  throw new Error("Demasiados redirects");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const { url } = (req.body ?? {}) as { url?: string };
  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Falta el parámetro url" });
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    res.status(400).json({ error: "URL inválida" });
    return;
  }

  try {
    const html = await fetchConValidacionDeRedirects(parsed.toString());
    const { image, title, description } = extraerMetaTags(html);
    if (!image) {
      res.status(422).json({ error: "No se encontró una imagen de vista previa en ese link" });
      return;
    }
    res.status(200).json({ image, title, description });
  } catch (err) {
    res.status(422).json({ error: err instanceof Error ? err.message : "No se pudo generar la vista previa" });
  }
}
