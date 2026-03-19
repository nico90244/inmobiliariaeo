import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/integrations/supabase/types";

export type Propiedad = Tables<"propiedades">;

export const usePropiedades = (filters?: {
  tipo_negocio?: string;
  tipo_inmueble?: string;
  barrio?: string;
  ciudad?: string;
  precioMin?: number;
  precioMax?: number;
  allStates?: boolean;
}) => {
  return useQuery({
    queryKey: ["propiedades", filters],
    queryFn: async () => {
      let query = supabase.from("propiedades").select("*");

      if (!filters?.allStates) {
        query = query.eq("estado", "Disponible");
      }

      if (filters?.tipo_negocio) {
        query = query.eq("tipo_negocio", filters.tipo_negocio);
      }
      if (filters?.tipo_inmueble) {
        query = query.eq("tipo_inmueble", filters.tipo_inmueble);
      }
      if (filters?.barrio) {
        query = query.ilike("barrio", `%${filters.barrio}%`);
      }
      if (filters?.precioMin) {
        query = query.gte("precio", filters.precioMin);
      }
      if (filters?.precioMax) {
        query = query.lte("precio", filters.precioMax);
      }

      const { data, error } = await query.order("fecha_creacion", { ascending: false });
      if (error) throw error;
      return data as Propiedad[];
    },
  });
};
