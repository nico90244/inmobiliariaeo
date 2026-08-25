import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { barrios } from "../src/data/barrios";

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

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const today = new Date().toISOString().split("T")[0];
  const entries: string[] = STATIC_PAGES.map((p) => urlEntry(`${SITE_URL}${p.path}`, today, p.changefreq, p.priority));

  for (const barrio of barrios) {
    entries.push(urlEntry(`${SITE_URL}/venta/${barrio.slug}`, today, "weekly", "0.75"));
    entries.push(urlEntry(`${SITE_URL}/alquiler/${barrio.slug}`, today, "weekly", "0.75"));
  }

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await supabase
        .from("propiedades")
        .select("id, fecha_actualizacion")
        .eq("estado", "Disponible");

      if (!error && data) {
        for (const row of data as { id: string; fecha_actualizacion: string | null }[]) {
          const lastmod = row.fecha_actualizacion ? row.fecha_actualizacion.split("T")[0] : today;
          entries.push(urlEntry(`${SITE_URL}/propiedades/${row.id}`, lastmod, "weekly", "0.85"));
        }
      }
    } catch {
      // Si Supabase falla, igual servimos el sitemap con las páginas estáticas.
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(xml);
}
