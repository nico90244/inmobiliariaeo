-- Distingue publicaciones que son inventario propio de Inmobiliaria EO (verificadas
-- manualmente por el equipo) de publicaciones de terceros (propietarios, otras
-- inmobiliarias o agentes) que solo usan la iniciativa como vitrina. El público NUNCA
-- puede marcarse a sí mismo como "Inmobiliaria EO" al publicar -- elegir "Inmobiliaria"
-- en el campo perfil solo describe su propio rol, no implica que sea EO.
ALTER TABLE public.emergencia_inmuebles
  ADD COLUMN IF NOT EXISTS es_inmobiliaria_eo boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "Cualquiera puede publicar (pendiente)" ON public.emergencia_inmuebles;
CREATE POLICY "Cualquiera puede publicar (pendiente)"
  ON public.emergencia_inmuebles FOR INSERT TO public
  WITH CHECK (estado = 'Pendiente' AND es_inmobiliaria_eo = false);
