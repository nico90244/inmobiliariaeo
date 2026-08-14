-- ============================================================
-- 1. emergencia_inmuebles: nuevas columnas
-- ============================================================
ALTER TABLE public.emergencia_inmuebles
  ADD COLUMN IF NOT EXISTS disponible_desde date,
  ADD COLUMN IF NOT EXISTS acepta_mascotas boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS link_portal_externo text,
  ADD COLUMN IF NOT EXISTS imagen_preview_url text,
  ADD COLUMN IF NOT EXISTS imagen_preview_fuente text;

ALTER TABLE public.emergencia_inmuebles
  DROP CONSTRAINT IF EXISTS emergencia_inmuebles_imagen_preview_fuente_check;
ALTER TABLE public.emergencia_inmuebles
  ADD CONSTRAINT emergencia_inmuebles_imagen_preview_fuente_check
  CHECK (imagen_preview_fuente IS NULL OR imagen_preview_fuente IN ('manual', 'automatica'));

-- ============================================================
-- 2. emergencia_swipes: amplía accion con 'contacto_whatsapp'
-- ============================================================

-- 2a. CHECK de la tabla
ALTER TABLE public.emergencia_swipes
  DROP CONSTRAINT IF EXISTS emergencia_swipes_accion_check;
ALTER TABLE public.emergencia_swipes
  ADD CONSTRAINT emergencia_swipes_accion_check
  CHECK (accion = ANY (ARRAY['like'::text, 'pass'::text, 'contacto_whatsapp'::text]));

-- 2b. Política RLS de INSERT (si no se amplía, el insert seguiría bloqueado)
DROP POLICY IF EXISTS "Cualquiera puede registrar un swipe" ON public.emergencia_swipes;
CREATE POLICY "Cualquiera puede registrar un swipe"
  ON public.emergencia_swipes FOR INSERT TO public
  WITH CHECK (accion = ANY (ARRAY['like'::text, 'pass'::text, 'contacto_whatsapp'::text]));

-- ============================================================
-- 3. emergencia_buscadores: columna origen
-- ============================================================
ALTER TABLE public.emergencia_buscadores
  ADD COLUMN IF NOT EXISTS origen text NOT NULL DEFAULT 'swipe';

-- ============================================================
-- 4. Recrea la vista pública con las columnas nuevas no sensibles
-- ============================================================
CREATE OR REPLACE VIEW public.emergencia_inmuebles_publicas
WITH (security_invoker = false) AS
SELECT
  id, tipo_inmueble, ciudad, barrio, canon, incluye_administracion, valor_administracion,
  area_m2, habitaciones, banos, piso, parqueadero, amoblado, descripcion, foto_portada,
  fotos, fecha_creacion,
  es_inmobiliaria_eo, sin_comision, condiciones_comision, tipo_gestion,
  disponible_desde, acepta_mascotas, link_portal_externo,
  imagen_preview_url, imagen_preview_fuente
FROM public.emergencia_inmuebles
WHERE estado = 'Disponible';

GRANT SELECT ON public.emergencia_inmuebles_publicas TO anon, authenticated;

-- ============================================================
-- 5. RPC: revela contacto solo si esa sesión ya dio "like" a ese inmueble
-- ============================================================
CREATE OR REPLACE FUNCTION public.obtener_contacto_inmueble(p_inmueble_id uuid, p_session_id text)
RETURNS TABLE (nombre text, celular text, es_inmobiliaria_eo boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nombre text;
  v_celular text;
  v_es_inmobiliaria_eo boolean;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.emergencia_swipes s
    WHERE s.inmueble_id = p_inmueble_id
      AND s.session_id = p_session_id
      AND s.accion = 'like'
  ) THEN
    RAISE EXCEPTION 'No autorizado: no se registró interés (like) en este inmueble desde esta sesión';
  END IF;

  SELECT i.nombre, i.celular, i.es_inmobiliaria_eo
    INTO v_nombre, v_celular, v_es_inmobiliaria_eo
  FROM public.emergencia_inmuebles i
  WHERE i.id = p_inmueble_id
    AND i.estado = 'Disponible';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El inmueble ya no está disponible';
  END IF;

  RETURN QUERY SELECT v_nombre, v_celular, v_es_inmobiliaria_eo;
END;
$$;

GRANT EXECUTE ON FUNCTION public.obtener_contacto_inmueble(uuid, text) TO anon, authenticated;
