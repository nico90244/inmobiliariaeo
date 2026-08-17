import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * El sitio es una SPA (Vite/React): las etiquetas og: y twitter: que arma
 * PropertyDetail.tsx con react-helmet-async solo existen después de que el
 * JS corre en el navegador. Los bots que generan la vista previa de un link
 * (WhatsApp, Facebook, Twitter, etc.) NO ejecutan JS — solo leen el HTML tal
 * cual llega, así que siempre veían las etiquetas genéricas de index.html.
 *
 * vercel.json reescribe /propiedades/:id hacia esta función SOLO cuando el
 * User-Agent es uno de esos bots (ver el `has` del rewrite); a un navegador
 * normal le sigue llegando la SPA de siempre.
 */

const SITE_URL = "https://inmobiliariaeo.com";
const DEFAULT_IMAGE = `${SITE_URL}/hero-bg.jpg`;
const DEFAULT_TITLE = "Inmobiliaria en Cali, Colombia | Venta y Arriendo de Propiedades | Eliana Osorio";
const DEFAULT_DESCRIPTION =
  "Compra, vende o arrienda inmuebles en Cali y el Valle del Cauca con asesoría jurídica incluida. Atendemos colombianos en Colombia y en el exterior.";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatPrice(price: number | null): string {
  if (!price) return "Consultar";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);
}

function renderHtml(opts: { title: string; description: string; image: string; url: string }): string {
  const title = escapeHtml(opts.title);
  const description = escapeHtml(opts.description);
  const image = escapeHtml(opts.image);
  const url = escapeHtml(opts.url);
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Inmobiliaria Eliana Osorio" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="${url}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
</head>
<body></body>
</html>
`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");

  const rawId = req.query.id;
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : null;

  const fallback = (url: string) =>
    res.status(200).send(renderHtml({ title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, image: DEFAULT_IMAGE, url }));

  if (!id) {
    fallback(SITE_URL);
    return;
  }

  const propertyUrl = `${SITE_URL}/propiedades/${id}`;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    fallback(propertyUrl);
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: property } = await supabase.from("propiedades").select("*").eq("id", id).single();

    if (!property) {
      fallback(propertyUrl);
      return;
    }

    const title = `${property.nombre_inmueble} en ${property.tipo_negocio} | ${property.barrio || property.ciudad || "Cali"}`.slice(0, 60);
    const description = `${property.tipo_inmueble || "Inmueble"} en ${(property.tipo_negocio || "").toLowerCase()} en ${property.barrio || property.ciudad || "Cali"}. ${formatPrice(property.precio)}.`;
    const image = property.foto_portada || DEFAULT_IMAGE;

    res.status(200).send(renderHtml({ title, description, image, url: propertyUrl }));
  } catch {
    fallback(propertyUrl);
  }
}
