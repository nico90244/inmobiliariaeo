ALTER TABLE public.emergencia_inmuebles
  ADD COLUMN IF NOT EXISTS es_inmobiliaria_eo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sin_comision boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS condiciones_comision text,
  ADD COLUMN IF NOT EXISTS imagen_preview_url text,
  ADD COLUMN IF NOT EXISTS imagen_preview_fuente text,
  ADD COLUMN IF NOT EXISTS link_portal_externo text,
  ADD COLUMN IF NOT EXISTS disponible_desde date,
  ADD COLUMN IF NOT EXISTS acepta_mascotas boolean NOT NULL DEFAULT false;

ALTER TABLE public.emergencia_buscadores
  ADD COLUMN IF NOT EXISTS origen text;

CREATE OR REPLACE VIEW public.emergencia_inmuebles_publicas AS
 SELECT id, tipo_inmueble, ciudad, barrio, area_m2, habitaciones, banos, piso,
        parqueadero, amoblado, canon, incluye_administracion, valor_administracion,
        descripcion, foto_portada, fotos, fecha_creacion,
        disponible_desde, acepta_mascotas, sin_comision, es_inmobiliaria_eo,
        link_portal_externo, imagen_preview_url, imagen_preview_fuente
   FROM public.emergencia_inmuebles
  WHERE estado = 'Disponible';

GRANT SELECT ON public.emergencia_inmuebles_publicas TO anon, authenticated;
GRANT ALL ON public.emergencia_inmuebles_publicas TO service_role;

CREATE OR REPLACE FUNCTION public.obtener_contacto_inmueble(p_inmueble_id uuid, p_session_id text)
RETURNS TABLE(nombre text, celular text, es_inmobiliaria_eo boolean)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.emergencia_swipes s
    WHERE s.inmueble_id = p_inmueble_id
      AND s.session_id = p_session_id
      AND s.accion IN ('like', 'contacto_whatsapp')
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT i.nombre, i.celular, i.es_inmobiliaria_eo
  FROM public.emergencia_inmuebles i
  WHERE i.id = p_inmueble_id AND i.estado = 'Disponible';
END;
$$;

GRANT EXECUTE ON FUNCTION public.obtener_contacto_inmueble(uuid, text) TO anon, authenticated;