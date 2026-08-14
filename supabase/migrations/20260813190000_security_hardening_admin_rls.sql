-- Endurecimiento de seguridad: las políticas RLS existentes usaban "TO authenticated
-- USING (true)", lo que otorgaba acceso total (leer/crear/editar/borrar) a CUALQUIER
-- usuario autenticado -- incluyendo cuentas creadas por el botón de auto-registro que
-- existía en /admin/login. Esto exponía cédulas, datos bancarios de propietarios/
-- inquilinos, contactos de clientes y datos de la iniciativa de emergencia.
--
-- Esta migración introduce una tabla de administradores explícita (admins) y una
-- función is_admin() para que solo cuentas autorizadas tengan acceso administrativo,
-- independientemente de si alguien logra crear una cuenta con Supabase Auth.

-- 1. Tabla de administradores. Sin políticas propias => nadie puede leerla/escribirla
--    vía API (ni siquiera un usuario autenticado); solo se gestiona por migración/SQL.
CREATE TABLE IF NOT EXISTS public.admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 2. Función de verificación. SECURITY DEFINER + search_path fijo para poder leer
--    admins pese a que la tabla no tiene políticas públicas.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 3. Da de alta como admin a la única cuenta que existe hoy en el proyecto.
INSERT INTO public.admins (user_id, email)
SELECT id, email FROM auth.users WHERE email = 'nicole.90244@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- 4. Reemplaza las políticas "authenticated + true" por "authenticated + is_admin()"

-- propiedades
DROP POLICY IF EXISTS "Admin puede ver todas las propiedades" ON public.propiedades;
CREATE POLICY "Admin puede ver todas las propiedades" ON public.propiedades
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin puede insertar propiedades" ON public.propiedades;
CREATE POLICY "Admin puede insertar propiedades" ON public.propiedades
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin puede actualizar propiedades" ON public.propiedades;
CREATE POLICY "Admin puede actualizar propiedades" ON public.propiedades
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin puede eliminar propiedades" ON public.propiedades;
CREATE POLICY "Admin puede eliminar propiedades" ON public.propiedades
  FOR DELETE TO authenticated USING (public.is_admin());

-- captaciones
DROP POLICY IF EXISTS "Solo admin lee" ON public.captaciones;
CREATE POLICY "Solo admin lee" ON public.captaciones
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin puede actualizar captaciones" ON public.captaciones;
CREATE POLICY "Admin puede actualizar captaciones" ON public.captaciones
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- citas_disponibles
DROP POLICY IF EXISTS "Authenticated full access disponibles select" ON public.citas_disponibles;
CREATE POLICY "Authenticated full access disponibles select" ON public.citas_disponibles
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Authenticated insert disponibles" ON public.citas_disponibles;
CREATE POLICY "Authenticated insert disponibles" ON public.citas_disponibles
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated update disponibles" ON public.citas_disponibles;
CREATE POLICY "Authenticated update disponibles" ON public.citas_disponibles
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated delete disponibles" ON public.citas_disponibles;
CREATE POLICY "Authenticated delete disponibles" ON public.citas_disponibles
  FOR DELETE TO authenticated USING (public.is_admin());

-- citas_reservas
DROP POLICY IF EXISTS "Authenticated full access reservas select" ON public.citas_reservas;
CREATE POLICY "Authenticated full access reservas select" ON public.citas_reservas
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Authenticated update reservas" ON public.citas_reservas;
CREATE POLICY "Authenticated update reservas" ON public.citas_reservas
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated delete reservas" ON public.citas_reservas;
CREATE POLICY "Authenticated delete reservas" ON public.citas_reservas
  FOR DELETE TO authenticated USING (public.is_admin());

-- contratos_arrendamiento (cédulas, cuentas bancarias)
DROP POLICY IF EXISTS "Admins authenticated manage contratos" ON public.contratos_arrendamiento;
CREATE POLICY "Admins authenticated manage contratos" ON public.contratos_arrendamiento
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- pagos_alquiler
DROP POLICY IF EXISTS "Admins authenticated manage pagos_alquiler" ON public.pagos_alquiler;
CREATE POLICY "Admins authenticated manage pagos_alquiler" ON public.pagos_alquiler
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- pagos_poliza
DROP POLICY IF EXISTS "Admins authenticated manage pagos_poliza" ON public.pagos_poliza;
CREATE POLICY "Admins authenticated manage pagos_poliza" ON public.pagos_poliza
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- propietarios (datos bancarios)
DROP POLICY IF EXISTS "propietarios_auth" ON public.propietarios;
CREATE POLICY "propietarios_auth" ON public.propietarios
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- emergencia_buscadores
DROP POLICY IF EXISTS "Admin lee buscadores" ON public.emergencia_buscadores;
CREATE POLICY "Admin lee buscadores" ON public.emergencia_buscadores
  FOR SELECT TO authenticated USING (public.is_admin());

-- emergencia_inmuebles
DROP POLICY IF EXISTS "Admin lee todas las publicaciones" ON public.emergencia_inmuebles;
CREATE POLICY "Admin lee todas las publicaciones" ON public.emergencia_inmuebles
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin actualiza publicaciones" ON public.emergencia_inmuebles;
CREATE POLICY "Admin actualiza publicaciones" ON public.emergencia_inmuebles
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin elimina publicaciones" ON public.emergencia_inmuebles;
CREATE POLICY "Admin elimina publicaciones" ON public.emergencia_inmuebles
  FOR DELETE TO authenticated USING (public.is_admin());

-- emergencia_swipes
DROP POLICY IF EXISTS "Admin lee swipes" ON public.emergencia_swipes;
CREATE POLICY "Admin lee swipes" ON public.emergencia_swipes
  FOR SELECT TO authenticated USING (public.is_admin());

-- 5. Storage: mismos permisos administrativos para subir/editar/borrar archivos
DROP POLICY IF EXISTS "Admin sube fotos" ON storage.objects;
CREATE POLICY "Admin sube fotos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'propiedades-fotos' AND public.is_admin());

DROP POLICY IF EXISTS "Admin actualiza fotos" ON storage.objects;
CREATE POLICY "Admin actualiza fotos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'propiedades-fotos' AND public.is_admin());

DROP POLICY IF EXISTS "Admin elimina fotos" ON storage.objects;
CREATE POLICY "Admin elimina fotos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'propiedades-fotos' AND public.is_admin());

DROP POLICY IF EXISTS "Admin actualiza fotos emergencia" ON storage.objects;
CREATE POLICY "Admin actualiza fotos emergencia" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'emergencia-fotos' AND public.is_admin());

DROP POLICY IF EXISTS "Admin elimina fotos emergencia" ON storage.objects;
CREATE POLICY "Admin elimina fotos emergencia" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'emergencia-fotos' AND public.is_admin());

DROP POLICY IF EXISTS "auth read contratos-docs" ON storage.objects;
CREATE POLICY "auth read contratos-docs" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'contratos-docs' AND public.is_admin());

DROP POLICY IF EXISTS "auth insert contratos-docs" ON storage.objects;
CREATE POLICY "auth insert contratos-docs" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'contratos-docs' AND public.is_admin());

DROP POLICY IF EXISTS "auth update contratos-docs" ON storage.objects;
CREATE POLICY "auth update contratos-docs" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'contratos-docs' AND public.is_admin());

DROP POLICY IF EXISTS "auth delete contratos-docs" ON storage.objects;
CREATE POLICY "auth delete contratos-docs" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'contratos-docs' AND public.is_admin());

-- Nota deliberada: NO se toca public.emergencia_inmuebles_publicas. El linter de
-- Supabase la marca como SECURITY DEFINER, pero es el patrón correcto aquí: la
-- tabla base emergencia_inmuebles no tiene (ni debe tener) política SELECT para
-- anon -- eso expondría celular/correo/token_gestion de cada publicación. La vista
-- ya filtra a columnas no sensibles y a estado='Disponible', así que sirve como la
-- única puerta de lectura pública. Pasarla a security_invoker rompería el swipe
-- público (quedaría sin filas visibles) sin ganar nada en seguridad real.

-- 6. rls_auto_enable() es la función de un event trigger (se dispara sola al crear
--    tablas); no está pensada para invocarse por RPC. Postgres otorga EXECUTE a
--    PUBLIC por defecto al crearla, lo que la deja llamable vía
--    /rest/v1/rpc/rls_auto_enable. Se revoca explícitamente.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
