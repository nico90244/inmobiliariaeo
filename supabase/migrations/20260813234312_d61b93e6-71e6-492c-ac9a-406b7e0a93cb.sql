
ALTER VIEW public.emergencia_inmuebles_publicas SET (security_invoker = on);

CREATE POLICY "Publico ve inmuebles aprobados" ON public.emergencia_inmuebles
FOR SELECT TO anon USING (estado = 'Disponible');

GRANT SELECT (id, tipo_inmueble, ciudad, barrio, area_m2, habitaciones, banos, piso,
  parqueadero, amoblado, canon, incluye_administracion, valor_administracion,
  descripcion, foto_portada, fotos, fecha_creacion)
ON public.emergencia_inmuebles TO anon;
