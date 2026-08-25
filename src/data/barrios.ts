export interface Barrio {
  slug: string;
  nombre: string;
}

// Barrios/sectores de Cali que la inmobiliaria ya menciona en su contenido
// (FAQ de la home). Cada uno obtiene su propia página indexable en
// /venta/:slug y /alquiler/:slug para competir en búsquedas específicas
// como "casa en venta en ciudad jardín" — algo que un catálogo genérico
// con filtros por JS no puede lograr por sí solo.
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
];

export function getBarrioBySlug(slug: string | undefined): Barrio | undefined {
  return barrios.find((b) => b.slug === slug);
}
