export interface Barrio {
  slug: string;
  nombre: string;
}

// Barrios/sectores de Cali con contenido curado (nombre bien acentuado,
// mencionados en el contenido existente del sitio). Cada uno obtiene su
// propia página indexable en /venta/:slug y /alquiler/:slug para competir
// en búsquedas específicas como "casa en venta en ciudad jardín" — algo que
// un catálogo genérico con filtros por JS no puede lograr por sí solo.
//
// Esta lista NO limita qué páginas de barrio existen: PropiedadesBarrio.tsx
// acepta cualquier slug y deriva un nombre a partir de él si no está aquí,
// y api/sitemap.ts agrega automáticamente cualquier barrio con inventario
// real en Supabase aunque no esté en esta lista. Esta lista solo controla
// qué barrios tienen nombre bien acentuado y aparecen como enlace destacado
// en /propiedades.
export const barrios: Barrio[] = [
  { slug: "ciudad-jardin", nombre: "Ciudad Jardín" },
  { slug: "el-penon", nombre: "El Peñón" },
  { slug: "bochalema", nombre: "Bochalema" },
  { slug: "chipichape", nombre: "Chipichape" },
  { slug: "san-fernando", nombre: "San Fernando" },
  { slug: "granada", nombre: "Granada" },
  { slug: "alameda", nombre: "Alameda" },
  { slug: "limonar", nombre: "Limonar" },
  { slug: "valle-del-lili", nombre: "Valle del Lili" },
  { slug: "san-antonio", nombre: "San Antonio" },
];

export function getBarrioBySlug(slug: string | undefined): Barrio | undefined {
  return barrios.find((b) => b.slug === slug);
}

/** Normaliza un nombre de barrio (tal como se escribe en Supabase) a un slug de URL. */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Deriva un nombre legible a partir de un slug que no está en la lista curada. */
export function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Resuelve un barrio por slug: usa el nombre curado si existe, si no lo deriva del slug. */
export function resolveBarrio(slug: string | undefined): Barrio | undefined {
  if (!slug) return undefined;
  const curated = getBarrioBySlug(slug);
  if (curated) return curated;
  return SLUG_PATTERN.test(slug) ? { slug, nombre: humanizeSlug(slug) } : undefined;
}
