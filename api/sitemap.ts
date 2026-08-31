import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { barrios, slugify } from "../src/data/barrios";

/**
 * Sitemap dinámico: además de las páginas estáticas del sitio, incluye una
 * <url> por cada propiedad disponible en Supabase. Sin esto, Google y los
 * crawlers de IA (que no ejecutan JavaScript) no tienen forma confiable de
 * descubrir las fichas de propiedad individuales.
 */

const SITE_URL = "https://inmobiliariaeo.com";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

const STATIC_PAGES: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/propiedades", changefreq: "daily", priority: "0.9" },
  { path: "/venta", changefreq: "daily", priority: "0.9" },
  { path: "/alquiler", changefreq: "daily", priority: "0.9" },
  { path: "/servicios", changefreq: "monthly", priority: "0.8" },
  { path: "/captacion", changefreq: "monthly", priority: "0.7" },
  { path: "/contacto", changefreq: "monthly", priority: "0.7" },
  { path: "/mapa-del-sitio", changefreq: "monthly", priority: "0.4" },
];

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string, image?: { url: string; title: string }): string {
  const imageTag = image
    ? `\n    <image:image>\n      <image:loc>${xmlEscape(image.url)}</image:loc>\n      <image:title>${xmlEscape(image.title)}</image:title>\n    </image:image>`
    : "";
  return `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>${imageTag}\n  </url>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const today = new Date().toISOString().split("T")[0];
  const entries: string[] = STATIC_PAGES.map((p) => urlEntry(`${SITE_URL}${p.path}`, today, p.changefreq, p.priority));

  // Los barrios curados siempre tienen página, tengan o no inventario activo
  // en este momento (el catálogo rota a diario).
  const barrioPages = new Set<string>();
  for (const barrio of barrios) {
    barrioPages.add(`venta/${barrio.slug}`);
    barrioPages.add(`alquiler/${barrio.slug}`);
  }

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await supabase
        .from("propiedades")
        .select("id, fecha_actualizacion, barrio, tipo_negocio, foto_portada, nombre_inmueble")
        .eq("estado", "Disponible");

      if (!error && data) {
        for (const row of data as {
          id: string;
          fecha_actualizacion: string | null;
          barrio: string | null;
          tipo_negocio: string | null;
          foto_portada: string | null;
          nombre_inmueble: string | null;
        }[]) {
          const lastmod = row.fecha_actualizacion ? row.fecha_actualizacion.split("T")[0] : today;
          // La extensión de imágenes del sitemap es una señal explícita para que
          // Google considere esta foto como miniatura del resultado de búsqueda.
          const image = row.foto_portada
            ? { url: row.foto_portada, title: row.nombre_inmueble || "Propiedad en Cali" }
            : undefined;
          entries.push(urlEntry(`${SITE_URL}/propiedades/${row.id}`, lastmod, "weekly", "0.85", image));

          // Cualquier barrio con inventario real obtiene su propia página en
          // el sitemap, aunque no esté en la lista curada — así una
          // propiedad publicada en un barrio nuevo queda indexable de una vez.
          if (!row.barrio) continue;
          const slug = slugify(row.barrio);
          if (!slug) continue;
          if (row.tipo_negocio === "Venta" || row.tipo_negocio === "Ambos") barrioPages.add(`venta/${slug}`);
          if (row.tipo_negocio === "Alquiler" || row.tipo_negocio === "Ambos") barrioPages.add(`alquiler/${slug}`);
        }
      }
    } catch {
      // Si Supabase falla, igual servimos el sitemap con las páginas estáticas y curadas.
    }
  }

  for (const page of barrioPages) {
    entries.push(urlEntry(`${SITE_URL}/${page}`, today, "weekly", "0.75"));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${entries.join("\n")}\n</urlset>\n`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(xml);
}
