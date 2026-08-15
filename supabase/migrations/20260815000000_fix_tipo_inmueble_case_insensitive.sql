-- El agente de IA no siempre manda tipo_inmueble con la misma capitalización que
-- usa el resto del sitio ("Apartamento" vs "apartamento"), y la comparación exacta
-- (=) descartaba resultados válidos. Se cambia a comparación insensible a mayúsculas.
CREATE OR REPLACE FUNCTION public.buscar_propiedades_agente(
  p_operacion text,
  p_tipo_inmueble text DEFAULT NULL,
  p_ciudad text DEFAULT NULL,
  p_presupuesto_max numeric DEFAULT NULL
)
RETURNS TABLE (
  id uuid, fuente text, tipo_inmueble text, operacion text, ciudad text, barrio text,
  precio numeric, foto_portada text, es_inmobiliaria_eo boolean, sin_comision boolean,
  acepta_mascotas boolean, disponible_desde date
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
      AND (p_tipo_inmueble IS NULL OR lower(p.tipo_inmueble) = lower(p_tipo_inmueble))
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
      AND (p_tipo_inmueble IS NULL OR lower(e.tipo_inmueble) = lower(p_tipo_inmueble))
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
