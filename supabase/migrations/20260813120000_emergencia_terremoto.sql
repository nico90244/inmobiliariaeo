-- ============================================================================
-- Programa "Afectados por el terremoto de Colombia"
-- Micrositio de emergencia: oferentes (propietarios/agentes/inmobiliarias)
-- publican inmuebles en arriendo; buscadores los descubren en formato swipe.
--
-- Diseño de privacidad:
--   * La tabla base NUNCA es legible por el público (anon): solo por el
--     staff autenticado (misma sesión "authenticated" que ya usa /admin).
--   * El público solo ve datos de contacto del negocio (WhatsApp EO),
--     nunca el celular/nombre/token del oferente.
--   * Cada publicación recibe un token_gestion (UUID no adivinable) que
--     permite al oferente cambiar el estado de SU inmueble sin necesidad
--     de crear una cuenta/usuario nuevo. El token solo se entrega una vez,
--     en el momento de publicar, y solo se puede usar a través de las
--     funciones RPC de abajo (nunca vía SELECT directo a la tabla).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabla: emergencia_inmuebles (oferentes)
-- ----------------------------------------------------------------------------
CREATE TABLE public.emergencia_inmuebles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Datos de contacto del oferente (nunca expuestos al público)
  nombre TEXT NOT NULL,
  celular TEXT NOT NULL,
  correo TEXT,

  -- Perfil de quien publica
  perfil TEXT NOT NULL CHECK (perfil IN ('Propietario', 'Agente', 'Inmobiliaria')),
  tipo_gestion TEXT CHECK (tipo_gestion IN ('Corretaje', 'Administración')),
  desea_administracion BOOLEAN NOT NULL DEFAULT false,
  comision_administracion NUMERIC NOT NULL DEFAULT 10,

  -- Datos del inmueble
  tipo_inmueble TEXT NOT NULL,
  ciudad TEXT NOT NULL DEFAULT 'Cali',
  barrio TEXT,
  direccion TEXT,
  canon NUMERIC NOT NULL,
  incluye_administracion BOOLEAN NOT NULL DEFAULT false,
  valor_administracion NUMERIC,
  area_m2 NUMERIC,
  habitaciones INTEGER NOT NULL DEFAULT 0,
  banos INTEGER NOT NULL DEFAULT 0,
  piso TEXT,
  parqueadero TEXT NOT NULL DEFAULT 'No' CHECK (parqueadero IN ('No', 'Carro', 'Moto', 'Carro y moto')),
  amoblado BOOLEAN NOT NULL DEFAULT false,
  descripcion TEXT,
  foto_portada TEXT,
  fotos TEXT[] DEFAULT '{}',

  -- Moderación y autogestión
  estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Disponible', 'Alquilada', 'Pausada', 'Rechazada')),
  motivo_rechazo TEXT,
  token_gestion UUID NOT NULL DEFAULT gen_random_uuid(),

  acepta_politica BOOLEAN NOT NULL DEFAULT false,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX emergencia_inmuebles_token_idx ON public.emergencia_inmuebles (token_gestion);
CREATE INDEX emergencia_inmuebles_estado_idx ON public.emergencia_inmuebles (estado);

ALTER TABLE public.emergencia_inmuebles ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede publicar, pero SIEMPRE queda "Pendiente" (moderación previa
-- obligatoria: evita que alguien inserte directamente un anuncio "Disponible"
-- y salte la revisión anti-fraude).
CREATE POLICY "Cualquiera puede publicar (pendiente)"
ON public.emergencia_inmuebles FOR INSERT
WITH CHECK (estado = 'Pendiente');

-- Solo el staff autenticado (mismo modelo que /admin) puede leer, actualizar
-- o eliminar directamente la tabla base. El público NO tiene policy de
-- SELECT aquí a propósito: solo accede vía la vista pública (sin PII) o
-- vía las funciones RPC con token (ver abajo).
CREATE POLICY "Admin lee todas las publicaciones"
ON public.emergencia_inmuebles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin actualiza publicaciones"
ON public.emergencia_inmuebles FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admin elimina publicaciones"
ON public.emergencia_inmuebles FOR DELETE
TO authenticated
USING (true);

CREATE TRIGGER update_emergencia_inmuebles_fecha
BEFORE UPDATE ON public.emergencia_inmuebles
FOR EACH ROW EXECUTE FUNCTION public.update_fecha_actualizacion();

-- Vista pública: solo columnas necesarias para el swipe, cero datos
-- personales del oferente (ni nombre, ni celular, ni token). Al no marcar
-- la vista como security_invoker, corre con los privilegios del dueño
-- (el rol de migraciones), así que no depende de que "anon" tenga permisos
-- sobre la tabla base.
CREATE VIEW public.emergencia_inmuebles_publicas AS
SELECT
  id, tipo_inmueble, ciudad, barrio, canon, incluye_administracion,
  valor_administracion, area_m2, habitaciones, banos, piso, parqueadero,
  amoblado, descripcion, foto_portada, fotos, fecha_creacion
FROM public.emergencia_inmuebles
WHERE estado = 'Disponible';

GRANT SELECT ON public.emergencia_inmuebles_publicas TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- Tabla: emergencia_buscadores (leads de personas buscando arriendo)
-- ----------------------------------------------------------------------------
CREATE TABLE public.emergencia_buscadores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  celular TEXT NOT NULL,
  presupuesto NUMERIC,
  ciudad TEXT NOT NULL DEFAULT 'Cali',
  tipo_inmueble TEXT,
  acepta_politica BOOLEAN NOT NULL DEFAULT false,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.emergencia_buscadores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede dejar sus datos de búsqueda"
ON public.emergencia_buscadores FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin lee buscadores"
ON public.emergencia_buscadores FOR SELECT
TO authenticated
USING (true);

-- ----------------------------------------------------------------------------
-- Tabla: emergencia_swipes (like/pass del "tinder de propiedades")
-- ----------------------------------------------------------------------------
CREATE TABLE public.emergencia_swipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  inmueble_id UUID NOT NULL REFERENCES public.emergencia_inmuebles(id) ON DELETE CASCADE,
  accion TEXT NOT NULL CHECK (accion IN ('like', 'pass')),
  buscador_id UUID REFERENCES public.emergencia_buscadores(id) ON DELETE SET NULL,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, inmueble_id)
);

ALTER TABLE public.emergencia_swipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede registrar un swipe"
ON public.emergencia_swipes FOR INSERT
WITH CHECK (accion IN ('like', 'pass'));

CREATE POLICY "Admin lee swipes"
ON public.emergencia_swipes FOR SELECT
TO authenticated
USING (true);

-- ----------------------------------------------------------------------------
-- Autogestión por token (sin crear un sistema de cuentas nuevo):
-- el oferente recibe su token_gestion al publicar y con eso puede consultar
-- y actualizar SOLO el estado de SU propia publicación. Las funciones son
-- SECURITY DEFINER con search_path fijo (evita hijacking) y son la ÚNICA
-- vía de acceso al token: la tabla nunca lo expone por SELECT directo.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.emergencia_obtener_por_token(p_token UUID)
RETURNS TABLE (
  id UUID,
  tipo_inmueble TEXT,
  barrio TEXT,
  ciudad TEXT,
  canon NUMERIC,
  estado TEXT,
  motivo_rechazo TEXT,
  foto_portada TEXT,
  fecha_creacion TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.tipo_inmueble, e.barrio, e.ciudad, e.canon, e.estado,
         e.motivo_rechazo, e.foto_portada, e.fecha_creacion
  FROM public.emergencia_inmuebles e
  WHERE e.token_gestion = p_token;
END;
$$;

CREATE OR REPLACE FUNCTION public.emergencia_actualizar_estado(p_token UUID, p_nuevo_estado TEXT)
RETURNS TABLE (id UUID, estado TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_estado_actual TEXT;
  v_id UUID;
BEGIN
  IF p_nuevo_estado NOT IN ('Disponible', 'Alquilada', 'Pausada') THEN
    RAISE EXCEPTION 'Estado no permitido';
  END IF;

  SELECT e.id, e.estado INTO v_id, v_estado_actual
  FROM public.emergencia_inmuebles e
  WHERE e.token_gestion = p_token;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Enlace inválido';
  END IF;

  IF v_estado_actual = 'Rechazada' THEN
    RAISE EXCEPTION 'Esta publicación fue rechazada por el equipo. Escríbenos por WhatsApp para más información.';
  END IF;

  UPDATE public.emergencia_inmuebles e
  SET estado = p_nuevo_estado
  WHERE e.token_gestion = p_token;

  RETURN QUERY SELECT v_id, p_nuevo_estado;
END;
$$;

REVOKE ALL ON FUNCTION public.emergencia_obtener_por_token(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.emergencia_actualizar_estado(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.emergencia_obtener_por_token(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emergencia_actualizar_estado(UUID, TEXT) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- Storage: fotos del programa de emergencia
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('emergencia-fotos', 'emergencia-fotos', true, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp']);

CREATE POLICY "Emergencia fotos publicas" ON storage.objects
FOR SELECT USING (bucket_id = 'emergencia-fotos');

CREATE POLICY "Cualquiera sube fotos de su publicación" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'emergencia-fotos');

CREATE POLICY "Admin actualiza fotos emergencia" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'emergencia-fotos');

CREATE POLICY "Admin elimina fotos emergencia" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'emergencia-fotos');
