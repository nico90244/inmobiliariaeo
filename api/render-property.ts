import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * Renderizado dinámico ("dynamic rendering") de una ficha de propiedad.
 *
 * El sitio es una SPA (React + Vite) sin SSR: los meta tags por propiedad
 * (title, description, OG, JSON-LD) los inyecta react-helmet-async DESPUÉS
 * de que el JS carga. Los bots que no ejecutan JavaScript — la mayoría de
 * crawlers de IA (GPTBot, ClaudeBot, PerplexityBot, etc.) y los bots de
 * vista previa de redes sociales (WhatsApp, Facebook, Twitter/X, LinkedIn,
 * Telegram) — solo verían el HTML genérico del sitio para TODAS las
 * propiedades.
 *
 * Esta función sirve exactamente los mismos datos que ve un usuario real en
 * el navegador (no es cloaking: es el mismo contenido, solo que ya
 * renderizado en HTML) para esos bots específicos. vercel.json enruta aquí
 * las peticiones a /propiedades/:id cuyo User-Agent coincide con un bot
 * conocido; los usuarios reales siguen recibiendo la SPA normal.
 */

const SITE_URL = "https://inmobiliariaeo.com";
const DEFAULT_IMAGE = `${SITE_URL}/hero-bg.jpg`;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

interface PropiedadRow {
  id: string;
  nombre_inmueble: string;
  descripcion: string | null;
  tipo_inmueble: string;
  tipo_negocio: string;
  precio: number | null;
  barrio: string | null;
  ciudad: string | null;
  direccion: string | null;
  habitaciones: number | null;
  banos: number | null;
  area_m2: number | null;
  parqueadero: string | null;
  piso: string | null;
  estrato: number | null;
  foto_portada: string | null;
  fotos: string[] | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estado: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** JSON-LD embebido en <script>: escapamos "<" para que un valor con
 * "</script>" no pueda cortar la etiqueta al parsear el HTML como texto. */
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function formatPrice(price: number | null): string {
  if (!price) return "Consultar precio";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
}

function tipoNegocioLabel(tipo: string): string {
  return tipo === "Ambos" ? "Alquiler o Venta" : tipo;
}

const SCHEMA_TYPE_BY_TIPO_INMUEBLE: Record<string, string> = {
  Apartamento: "Apartment",
  Apartaestudio: "Apartment",
  Casa: "House",
  Finca: "House",
  Lote: "Place",
  Local: "Place",
  Bodega: "Place",
  Oficina: "Place",
};

function notFoundPage(res: VercelResponse) {
  res.status(404).setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Propiedad no encontrada | Inmobiliaria Eliana Osorio</title><meta name="robots" content="noindex"></head><body><h1>Propiedad no encontrada</h1><p><a href="${SITE_URL}/propiedades">Ver todas las propiedades</a></p></body></html>`,
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = typeof req.query.id === "string" ? req.query.id : Array.isArray(req.query.id) ? req.query.id[0] : "";

  if (!id || !SUPABASE_URL || !SUPABASE_KEY) {
    notFoundPage(res);
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data: property, error } = await supabase
    .from("propiedades")
    .select(
      "id, nombre_inmueble, descripcion, tipo_inmueble, tipo_negocio, precio, barrio, ciudad, direccion, habitaciones, banos, area_m2, parqueadero, piso, estrato, foto_portada, fotos, fecha_creacion, fecha_actualizacion, estado",
    )
    .eq("id", id)
    .maybeSingle<PropiedadRow>();

  if (error || !property || property.estado !== "Disponible") {
    notFoundPage(res);
    return;
  }

  const url = `${SITE_URL}/propiedades/${property.id}`;
  const locality = property.barrio || property.ciudad || "Cali";
  const allPhotos = [property.foto_portada, ...(property.fotos || [])].filter(Boolean) as string[];
  const image = property.foto_portada || DEFAULT_IMAGE;

  const title = `${property.nombre_inmueble} en ${tipoNegocioLabel(property.tipo_negocio)} | ${locality}`.slice(0, 60);
  const description = (
    property.descripcion?.slice(0, 155) ||
    `${property.tipo_inmueble} en ${tipoNegocioLabel(property.tipo_negocio).toLowerCase()} en ${locality}. ${
      property.area_m2 ? property.area_m2 + " m². " : ""
    }${property.habitaciones ? property.habitaciones + " hab. " : ""}Precio: ${formatPrice(property.precio)}.`
  ).slice(0, 160);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: property.nombre_inmueble,
    description: property.descripcion || description,
    image: allPhotos.length ? allPhotos : [DEFAULT_IMAGE],
    offers: property.precio
      ? {
          "@type": "Offer",
          price: property.precio,
          priceCurrency: "COP",
          availability: "https://schema.org/InStock",
          url,
        }
      : undefined,
    brand: { "@type": "Organization", name: "Inmobiliaria Eliana Osorio" },
  };

  const realEstateListingJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${url}#listing`,
    url,
    name: property.nombre_inmueble,
    description: property.descripcion || description,
    datePosted: property.fecha_creacion,
    dateModified: property.fecha_actualizacion,
    image: allPhotos.length ? allPhotos : [DEFAULT_IMAGE],
    broker: { "@type": "RealEstateAgent", "@id": `${SITE_URL}/#organization`, name: "Inmobiliaria Eliana Osorio" },
    about: {
      "@type": SCHEMA_TYPE_BY_TIPO_INMUEBLE[property.tipo_inmueble] || "Place",
      name: property.nombre_inmueble,
      address: {
        "@type": "PostalAddress",
        streetAddress: property.direccion || undefined,
        addressLocality: property.ciudad || "Cali",
        addressRegion: "Valle del Cauca",
        addressCountry: "CO",
      },
      numberOfRooms: property.habitaciones || undefined,
      numberOfBathroomsTotal: property.banos || undefined,
      floorSize: property.area_m2 ? { "@type": "QuantitativeValue", value: property.area_m2, unitCode: "MTK" } : undefined,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Propiedades", item: `${SITE_URL}/propiedades` },
      { "@type": "ListItem", position: 3, name: property.nombre_inmueble, item: url },
    ],
  };

  const specs: string[] = [];
  if (property.habitaciones) specs.push(`${property.habitaciones} habitaciones`);
  if (property.banos) specs.push(`${property.banos} baños`);
  if (property.area_m2) specs.push(`${property.area_m2} m²`);
  if (property.parqueadero && property.parqueadero.toLowerCase() !== "no") specs.push("Parqueadero");
  if (property.piso) specs.push(`Piso ${property.piso}`);
  if (property.estrato) specs.push(`Estrato ${property.estrato}`);

  const photosHtml = allPhotos
    .slice(0, 12)
    .map(
      (src, i) =>
        `<img src="${escapeHtml(src)}" alt="${escapeHtml(`Foto ${i + 1} de ${property.nombre_inmueble}`)}" loading="lazy" width="640" height="480">`,
    )
    .join("\n      ");

  const waMessage = encodeURIComponent(`Hola, me interesa la propiedad ${property.nombre_inmueble} en ${locality}. ¿Podría obtener más información?`);

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">

  <meta name="geo.region" content="CO-VAC">
  <meta name="geo.placename" content="${escapeHtml(locality)}, Valle del Cauca, Colombia">
  <meta name="geo.position" content="3.4516;-76.5320">

  <meta property="og:type" content="product">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="Inmobiliaria Eliana Osorio">
  <meta property="og:locale" content="es_CO">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">

  <script type="application/ld+json">${safeJsonLd(productJsonLd)}</script>
  <script type="application/ld+json">${safeJsonLd(realEstateListingJsonLd)}</script>
  <script type="application/ld+json">${safeJsonLd(breadcrumbJsonLd)}</script>
</head>
<body>
  <header>
    <a href="${SITE_URL}/">Inmobiliaria Eliana Osorio</a>
  </header>
  <main>
    <nav aria-label="Breadcrumb">
      <a href="${SITE_URL}/">Inicio</a> &gt;
      <a href="${SITE_URL}/propiedades">Propiedades</a> &gt;
      <span>${escapeHtml(property.nombre_inmueble)}</span>
    </nav>
    <article>
      <h1>${escapeHtml(property.nombre_inmueble)}</h1>
      <p><strong>${escapeHtml(tipoNegocioLabel(property.tipo_negocio))}</strong> — ${escapeHtml(property.tipo_inmueble)} en ${escapeHtml(locality)}, Cali, Colombia</p>
      <p><strong>Precio:</strong> ${escapeHtml(formatPrice(property.precio))}</p>
      ${specs.length ? `<ul>\n        ${specs.map((s) => `<li>${escapeHtml(s)}</li>`).join("\n        ")}\n      </ul>` : ""}
      ${property.direccion ? `<p><strong>Dirección:</strong> ${escapeHtml(property.direccion)}</p>` : ""}
      ${property.descripcion ? `<p>${escapeHtml(property.descripcion)}</p>` : ""}
      <section aria-label="Fotos de la propiedad">
        ${photosHtml}
      </section>
      <p>
        <a href="https://wa.me/573186531598?text=${waMessage}">Contactar por WhatsApp sobre esta propiedad</a>
      </p>
      <p><a href="${SITE_URL}/propiedades">Ver más propiedades en Cali y el Valle del Cauca</a></p>
    </article>
  </main>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=86400");
  res.status(200).send(html);
}
