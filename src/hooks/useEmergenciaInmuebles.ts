import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/integrations/supabase/types";

export type EmergenciaInmueblePublico = Tables<"emergencia_inmuebles_publicas">;

/**
 * Costo mensual real para quien busca: si el canon ya incluye la administración
 * (incluye_administracion = true) no se suma de nuevo; si no, la administración es
 * un cobro aparte y se suma al canon.
 */
export const costoTotalMensual = (inm: EmergenciaInmueblePublico): number => {
  const canon = inm.canon ?? 0;
  if (inm.incluye_administracion) return canon;
  return canon + (inm.valor_administracion ?? 0);
};

export const useEmergenciaInmuebles = (filters?: {
  ciudad?: string;
  tipoInmueble?: string;
  presupuestoMax?: number;
}) => {
  return useQuery({
    queryKey: ["emergencia_inmuebles_publicas", filters],
    queryFn: async () => {
      let query = supabase.from("emergencia_inmuebles_publicas").select("*");

      if (filters?.ciudad) {
        query = query.ilike("ciudad", `%${filters.ciudad}%`);
      }
      if (filters?.tipoInmueble) {
        query = query.eq("tipo_inmueble", filters.tipoInmueble);
      }

      const { data, error } = await query.order("fecha_creacion", { ascending: false });
      if (error) throw error;

      const rows = (data ?? []) as EmergenciaInmueblePublico[];
      // El costo total (canon + administración cuando aplica) no es filtrable en la
      // consulta a Postgrest sin una columna calculada, así que se filtra en cliente.
      if (!filters?.presupuestoMax) return rows;
      return rows.filter((r) => costoTotalMensual(r) <= filters.presupuestoMax!);
    },
  });
};
