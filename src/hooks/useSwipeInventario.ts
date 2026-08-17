import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/integrations/supabase/types";
import { AGENTES_WHATSAPP, buildWhatsAppLink } from "@/lib/whatsapp";

/**
 * Tarjeta unificada del swipe: puede venir de la Iniciativa Terremoto
 * (emergencia_inmuebles_publicas, terceros que llenaron "Ofrezco") o del
 * inventario propio de Inmobiliaria EO (propiedades, tipo_negocio = 'Alquiler').
 * El campo `fuente` decide qué badges se muestran y cómo se resuelve el contacto.
 */
export type TarjetaSwipe = {
  fuente: "emergencia" | "propiedades";
  id: string;
  tipo_inmueble: string | null;
  ciudad: string | null;
  barrio: string | null;
  canon: number;
  costoTotal: number;
  administracionAparte: number | null; // se muestra como "+ administración" cuando aplica
  area_m2: number | null;
  habitaciones: number | null;
  banos: number | null;
  piso: string | null;
  parqueadero: string | null;
  amoblado: boolean; // propiedades no distingue esto -> false
  descripcion: string | null;
  foto_portada: string | null;
  fotos: string[];
  fecha_creacion: string;
  // Solo emergencia:
  disponible_desde: string | null;
  acepta_mascotas: boolean;
  sin_comision: boolean;
  es_inmobiliaria_eo: boolean;
  // Solo propiedades (contacto directo, sin candado de "like"):
  link_whatsapp: string | null;
  nombre_inmueble: string | null;
};

type EmergenciaRow = Tables<"emergencia_inmuebles_publicas">;
type PropiedadRow = Tables<"propiedades">;

const costoTotalEmergencia = (r: EmergenciaRow): number => {
  const canon = r.canon ?? 0;
  return r.incluye_administracion ? canon : canon + (r.valor_administracion ?? 0);
};

const desdeEmergencia = (r: EmergenciaRow): TarjetaSwipe => ({
  fuente: "emergencia",
  id: r.id,
  tipo_inmueble: r.tipo_inmueble,
  ciudad: r.ciudad,
  barrio: r.barrio,
  canon: r.canon ?? 0,
  costoTotal: costoTotalEmergencia(r),
  administracionAparte: r.incluye_administracion ? null : r.valor_administracion,
  area_m2: r.area_m2,
  habitaciones: r.habitaciones,
  banos: r.banos,
  piso: r.piso,
  parqueadero: r.parqueadero,
  amoblado: !!r.amoblado,
  descripcion: r.descripcion,
  foto_portada: r.foto_portada,
  fotos: r.fotos ?? [],
  fecha_creacion: r.fecha_creacion ?? new Date().toISOString(),
  disponible_desde: r.disponible_desde,
  acepta_mascotas: !!r.acepta_mascotas,
  sin_comision: !!r.sin_comision,
  es_inmobiliaria_eo: !!r.es_inmobiliaria_eo,
  link_whatsapp: null,
  nombre_inmueble: null,
});

// Mismo patrón de contacto que ya usan PropertyCard/PropertyModal en el resto del
// sitio: link_whatsapp propio si existe, si no un link genérico a EO con mensaje.
const desdePropiedad = (p: PropiedadRow): TarjetaSwipe => {
  const canon = p.precio ?? 0;
  const administracion = p.administracion ?? 0;
  return {
    fuente: "propiedades",
    id: p.id,
    tipo_inmueble: p.tipo_inmueble,
    ciudad: p.ciudad,
    barrio: p.barrio,
    canon,
    costoTotal: canon + administracion,
    administracionAparte: administracion > 0 ? administracion : null,
    area_m2: p.area_m2,
    habitaciones: p.habitaciones,
    banos: p.banos,
    piso: p.piso,
    parqueadero: p.parqueadero,
    amoblado: false,
    descripcion: p.descripcion,
    foto_portada: p.foto_portada,
    fotos: p.fotos ?? [],
    fecha_creacion: p.fecha_creacion,
    disponible_desde: null,
    acepta_mascotas: false,
    sin_comision: false,
    es_inmobiliaria_eo: true,
    link_whatsapp: buildWhatsAppLink(
      p.link_whatsapp,
      AGENTES_WHATSAPP.valeria.numero,
      `Hola, me interesa ${p.nombre_inmueble} en ${p.barrio ?? p.ciudad ?? "Cali"}`
    ),
    nombre_inmueble: p.nombre_inmueble,
  };
};

/** Intercala dos listas en vez de mostrar primero todas las de una fuente. */
function intercalar<T>(a: T[], b: T[]): T[] {
  const result: T[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (i < a.length) result.push(a[i]);
    if (i < b.length) result.push(b[i]);
  }
  return result;
}

export const useSwipeInventario = (filters?: {
  ciudad?: string;
  tipoInmueble?: string;
  presupuestoMax?: number;
}) => {
  return useQuery({
    queryKey: ["swipe_inventario", filters],
    queryFn: async () => {
      let emergenciaQuery = supabase.from("emergencia_inmuebles_publicas").select("*");
      let propiedadesQuery = supabase.from("propiedades").select("*").eq("tipo_negocio", "Alquiler").eq("estado", "Disponible");

      if (filters?.ciudad) {
        emergenciaQuery = emergenciaQuery.ilike("ciudad", `%${filters.ciudad}%`);
        propiedadesQuery = propiedadesQuery.ilike("ciudad", `%${filters.ciudad}%`);
      }
      if (filters?.tipoInmueble) {
        emergenciaQuery = emergenciaQuery.eq("tipo_inmueble", filters.tipoInmueble);
        propiedadesQuery = propiedadesQuery.eq("tipo_inmueble", filters.tipoInmueble);
      }

      const [emergenciaRes, propiedadesRes] = await Promise.all([
        emergenciaQuery.order("fecha_creacion", { ascending: false }),
        propiedadesQuery.order("fecha_creacion", { ascending: false }),
      ]);

      if (emergenciaRes.error) throw emergenciaRes.error;
      if (propiedadesRes.error) throw propiedadesRes.error;

      let tarjetasEmergencia = (emergenciaRes.data ?? []).map(desdeEmergencia);
      let tarjetasPropiedades = (propiedadesRes.data ?? []).map(desdePropiedad);

      if (filters?.presupuestoMax) {
        tarjetasEmergencia = tarjetasEmergencia.filter((t) => t.costoTotal <= filters.presupuestoMax!);
        tarjetasPropiedades = tarjetasPropiedades.filter((t) => t.costoTotal <= filters.presupuestoMax!);
      }

      return intercalar(tarjetasEmergencia, tarjetasPropiedades);
    },
  });
};
