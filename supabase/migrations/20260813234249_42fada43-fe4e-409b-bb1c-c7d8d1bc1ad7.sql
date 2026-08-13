
CREATE TABLE public.emergencia_inmuebles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  celular text NOT NULL,
  correo text,
  perfil text NOT NULL,
  tipo_gestion text,
  desea_administracion boolean NOT NULL DEFAULT false,
  tipo_inmueble text NOT NULL,
  ciudad text NOT NULL,
  barrio text,
  direccion text,
  area_m2 numeric,
  habitaciones integer NOT NULL DEFAULT 0,
  banos integer NOT NULL DEFAULT 0,
  piso text,
  parqueadero text,
  amoblado boolean NOT NULL DEFAULT false,
  canon numeric NOT NULL,
  incluye_administracion boolean NOT NULL DEFAULT false,
  valor_administracion numeric,
  descripcion text,
  foto_portada text,
  fotos text[] NOT NULL DEFAULT '{}',
  acepta_politica boolean NOT NULL DEFAULT false,
  token_gestion uuid NOT NULL DEFAULT gen_random_uuid(),
  estado text NOT NULL DEFAULT 'Pendiente',
  motivo_rechazo text,
  fecha_creacion timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.emergencia_inmuebles TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.emergencia_inmuebles TO authenticated;
GRANT ALL ON public.emergencia_inmuebles TO service_role;
ALTER TABLE public.emergencia_inmuebles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cualquiera puede publicar" ON public.emergencia_inmuebles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff lee publicaciones" ON public.emergencia_inmuebles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff actualiza publicaciones" ON public.emergencia_inmuebles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff elimina publicaciones" ON public.emergencia_inmuebles FOR DELETE TO authenticated USING (true);

CREATE TABLE public.emergencia_buscadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  celular text NOT NULL,
  presupuesto numeric,
  ciudad text,
  tipo_inmueble text,
  acepta_politica boolean NOT NULL DEFAULT false,
  fecha_creacion timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.emergencia_buscadores TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.emergencia_buscadores TO authenticated;
GRANT ALL ON public.emergencia_buscadores TO service_role;
ALTER TABLE public.emergencia_buscadores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cualquiera se registra como buscador" ON public.emergencia_buscadores FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff lee buscadores" ON public.emergencia_buscadores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff actualiza buscadores" ON public.emergencia_buscadores FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff elimina buscadores" ON public.emergencia_buscadores FOR DELETE TO authenticated USING (true);

CREATE TABLE public.emergencia_swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  inmueble_id uuid NOT NULL REFERENCES public.emergencia_inmuebles(id) ON DELETE CASCADE,
  buscador_id uuid REFERENCES public.emergencia_buscadores(id) ON DELETE SET NULL,
  accion text NOT NULL,
  fecha_creacion timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.emergencia_swipes TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.emergencia_swipes TO authenticated;
GRANT ALL ON public.emergencia_swipes TO service_role;
ALTER TABLE public.emergencia_swipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cualquiera registra swipes" ON public.emergencia_swipes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff lee swipes" ON public.emergencia_swipes FOR SELECT TO authenticated USING (true);

CREATE VIEW public.emergencia_inmuebles_publicas
WITH (security_invoker = off) AS
SELECT id, tipo_inmueble, ciudad, barrio, area_m2, habitaciones, banos, piso,
       parqueadero, amoblado, canon, incluye_administracion, valor_administracion,
       descripcion, foto_portada, fotos, fecha_creacion
FROM public.emergencia_inmuebles
WHERE estado = 'Disponible';
GRANT SELECT ON public.emergencia_inmuebles_publicas TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.emergencia_obtener_por_token(p_token uuid)
RETURNS TABLE (
  id uuid, tipo_inmueble text, barrio text, ciudad text, canon numeric,
  estado text, motivo_rechazo text, foto_portada text, fecha_creacion timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT i.id, i.tipo_inmueble, i.barrio, i.ciudad, i.canon, i.estado,
         i.motivo_rechazo, i.foto_portada, i.fecha_creacion
  FROM public.emergencia_inmuebles i
  WHERE i.token_gestion = p_token;
$$;
GRANT EXECUTE ON FUNCTION public.emergencia_obtener_por_token(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.emergencia_actualizar_estado(p_token uuid, p_nuevo_estado text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_nuevo_estado NOT IN ('Disponible', 'Alquilada', 'Pausada') THEN
    RAISE EXCEPTION 'Estado no permitido';
  END IF;
  UPDATE public.emergencia_inmuebles
     SET estado = p_nuevo_estado
   WHERE token_gestion = p_token
     AND estado IN ('Disponible', 'Alquilada', 'Pausada');
END;
$$;
GRANT EXECUTE ON FUNCTION public.emergencia_actualizar_estado(uuid, text) TO anon, authenticated;
