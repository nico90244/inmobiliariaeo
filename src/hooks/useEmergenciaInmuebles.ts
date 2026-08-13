import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/integrations/supabase/types";

export type EmergenciaInmueblePublico = Tables<"emergencia_inmuebles_publicas">;

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
      if (filters?.presupuestoMax) {
        query = query.lte("canon", filters.presupuestoMax);
      }

      const { data, error } = await query.order("fecha_creacion", { ascending: false });
      if (error) throw error;
      return data as EmergenciaInmueblePublico[];
    },
  });
};
