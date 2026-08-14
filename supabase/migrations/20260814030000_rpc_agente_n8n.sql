-- ============================================================
-- RPCs para el agente de IA (n8n) del sitio: consultan inventario real por
-- HTTP, nunca desde el Google Sheet desactualizado.
-- ============================================================

-- Helper: percent-encoding correcto a nivel de byte (RFC 3986), necesario
-- para armar links wa.me con acentos/ñ en el mensaje. Postgres no trae una
-- función de URL-encode nativa.
CREATE OR REPLACE FUNCTION public._url_encode(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  bytes bytea := convert_to(input, 'UTF8');
  result text := '';
  b int;
  i int;
BEGIN
  FOR i IN 0..length(bytes) - 1 LOOP
    b := get_byte(bytes, i);
    IF (b BETWEEN 48 AND 57) OR (b BETWEEN 65 AND 90) OR (b BETWEEN 97 AND 122) OR b IN (45, 46, 95, 126) THEN
      result := result || chr(b);
    ELSE
      result := result || '%' || upper(to_hex(b));
    END IF;
  END LOOP;
  RETURN result;
END;
$$;

-- ============================================================
-- 1. buscar_propiedades_agente
--    SECURITY INVOKER (default, sin SECURITY DEFINER): no hace falta
--    elevar privilegios porque anon YA puede leer ambas fuentes vía RLS
--    (propiedades con estado='Disponible' es pública; la vista
--    emergencia_inmuebles_publicas ya tiene SELECT otorgado a anon).
-- ============================================================
CREATE OR REPLACE FUNCTION public.buscar_propiedades_agente(
  p_operacion text,
  p_tipo_inmueble text DEFAULT NULL,
  p_ciudad text DEFAULT NULL,
  p_presupuesto_max numeric DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  fuente text,
  tipo_inmueble text,
  operacion text,
  ciudad text,
  barrio text,
  precio numeric,
  foto_portada text,
  es_inmobiliaria_eo boolean,
  sin_comision boolean,
  acepta_mascotas boolean,
  disponible_desde date
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_tipo_negocio text;
BEGIN
  IF p_operacion NOT IN ('arriendo', 'venta') THEN
    RAISE EXCEPTION 'p_operacion debe ser ''arriendo'' o ''venta''';
  END IF;

  v_tipo_negocio := CASE WHEN p_operacion = 'arriendo' THEN 'Alquiler' ELSE 'Venta' END;

  RETURN QUERY
  WITH inventario_propio AS (
    SELECT
      p.id, 'propiedades'::text AS fuente, p.tipo_inmueble, p_operacion AS operacion,
      p.ciudad, p.barrio, (p.precio + COALESCE(p.administracion, 0)) AS precio, p.foto_portada,
      true AS es_inmobiliaria_eo, NULL::boolean AS sin_comision, NULL::boolean AS acepta_mascotas,
      NULL::date AS disponible_desde, p.fecha_creacion
    FROM public.propiedades p
    WHERE p.estado = 'Disponible'
      AND p.tipo_negocio = v_tipo_negocio
      AND (p_tipo_inmueble IS NULL OR p.tipo_inmueble = p_tipo_inmueble)
      AND (p_ciudad IS NULL OR p.ciudad ILIKE '%' || p_ciudad || '%')
      AND (p_presupuesto_max IS NULL OR (p.precio + COALESCE(p.administracion, 0)) <= p_presupuesto_max)
  ),
  iniciativa_terremoto AS (
    -- La iniciativa solo es de arriendo: se excluye por completo si piden 'venta'.
    SELECT
      e.id, 'emergencia'::text AS fuente, e.tipo_inmueble, 'arriendo'::text AS operacion,
      e.ciudad, e.barrio,
      (CASE WHEN e.incluye_administracion THEN e.canon ELSE e.canon + COALESCE(e.valor_administracion, 0) END) AS precio,
      e.foto_portada, e.es_inmobiliaria_eo, e.sin_comision, e.acepta_mascotas, e.disponible_desde, e.fecha_creacion
    FROM public.emergencia_inmuebles_publicas e
    WHERE p_operacion = 'arriendo'
      AND (p_tipo_inmueble IS NULL OR e.tipo_inmueble = p_tipo_inmueble)
      AND (p_ciudad IS NULL OR e.ciudad ILIKE '%' || p_ciudad || '%')
      AND (
        p_presupuesto_max IS NULL
        OR (CASE WHEN e.incluye_administracion THEN e.canon ELSE e.canon + COALESCE(e.valor_administracion, 0) END) <= p_presupuesto_max
      )
  )
  SELECT c.id, c.fuente, c.tipo_inmueble, c.operacion, c.ciudad, c.barrio, c.precio, c.foto_portada,
         c.es_inmobiliaria_eo, c.sin_comision, c.acepta_mascotas, c.disponible_desde
  FROM (
    SELECT * FROM inventario_propio
    UNION ALL
    SELECT * FROM iniciativa_terremoto
  ) c
  ORDER BY c.fecha_creacion DESC
  LIMIT 15;
END;
$$;

GRANT EXECUTE ON FUNCTION public.buscar_propiedades_agente(text, text, text, numeric) TO anon, authenticated;

-- ============================================================
-- 2. solicitar_contacto_agente
--    SECURITY DEFINER: necesita insertar en emergencia_swipes como anon,
--    igual que ya hacen emergencia_actualizar_estado / obtener_contacto_inmueble.
-- ============================================================
CREATE OR REPLACE FUNCTION public.solicitar_contacto_agente(
  p_inmueble_id uuid,
  p_fuente text,
  p_session_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nombre text;
  v_celular text;
  v_tipo_inmueble text;
  v_barrio text;
  v_nombre_inmueble text;
  v_link_whatsapp text;
BEGIN
  IF p_fuente NOT IN ('emergencia', 'propiedades') THEN
    RAISE EXCEPTION 'p_fuente debe ser ''emergencia'' o ''propiedades''';
  END IF;

  IF p_fuente = 'emergencia' THEN
    IF p_session_id IS NULL OR length(trim(p_session_id)) = 0 THEN
      RAISE EXCEPTION 'p_session_id es requerido para fuente emergencia';
    END IF;

    -- Registra el "like" si no existe ya (UNIQUE(session_id, inmueble_id)).
    INSERT INTO public.emergencia_swipes (session_id, inmueble_id, accion)
    VALUES (p_session_id, p_inmueble_id, 'like')
    ON CONFLICT (session_id, inmueble_id) DO NOTHING;

    -- Reutiliza exactamente el mismo candado que ya protege el contacto: solo
    -- revela nombre/celular porque el like de arriba ya quedó registrado, y
    -- solo si el inmueble sigue Disponible (obtener_contacto_inmueble lanza
    -- excepción si no se cumple cualquiera de las dos condiciones).
    SELECT nombre, celular
      INTO v_nombre, v_celular
    FROM public.obtener_contacto_inmueble(p_inmueble_id, p_session_id);

    SELECT tipo_inmueble, barrio INTO v_tipo_inmueble, v_barrio
    FROM public.emergencia_inmuebles_publicas
    WHERE id = p_inmueble_id;

    v_link_whatsapp := 'https://wa.me/57' || regexp_replace(v_celular, '\D', '', 'g')
      || '?text=' || public._url_encode(
        'Hola, vi tu publicación de ' || COALESCE(v_tipo_inmueble, 'este inmueble')
        || ' en ' || COALESCE(v_barrio, 'Cali')
        || ' a través de Inmobiliaria EO (Iniciativa Terremoto Colombia) y me interesa.'
      );

  ELSE -- p_fuente = 'propiedades': inventario propio, ya público en el resto
       -- del sitio -- mismo mecanismo que PropertyCard/PropertyModal (link_whatsapp
       -- propio, o un link genérico a EO como respaldo). Sin candado de "like".
    SELECT nombre_inmueble, barrio, link_whatsapp
      INTO v_nombre_inmueble, v_barrio, v_link_whatsapp
    FROM public.propiedades
    WHERE id = p_inmueble_id AND estado = 'Disponible';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Propiedad no encontrada o ya no disponible';
    END IF;

    v_nombre := 'Inmobiliaria EO';

    IF v_link_whatsapp IS NULL OR length(trim(v_link_whatsapp)) = 0 THEN
      v_link_whatsapp := 'https://wa.me/573162225604?text=' || public._url_encode(
        'Hola, me interesa ' || v_nombre_inmueble || ' en ' || COALESCE(v_barrio, 'Cali')
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('nombre', v_nombre, 'whatsapp_link', v_link_whatsapp);
END;
$$;

GRANT EXECUTE ON FUNCTION public.solicitar_contacto_agente(uuid, text, text) TO anon, authenticated;
