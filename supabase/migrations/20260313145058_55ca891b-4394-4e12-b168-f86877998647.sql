
-- Create propiedades table
CREATE TABLE public.propiedades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_negocio TEXT NOT NULL DEFAULT 'Venta',
  nombre_inmueble TEXT NOT NULL,
  tipo_inmueble TEXT NOT NULL,
  direccion TEXT,
  barrio TEXT,
  zona TEXT,
  precio NUMERIC,
  area_m2 NUMERIC,
  habitaciones INTEGER DEFAULT 0,
  banos INTEGER DEFAULT 0,
  piso TEXT,
  parqueadero TEXT,
  estrato INTEGER,
  administracion NUMERIC,
  descripcion TEXT,
  estado TEXT NOT NULL DEFAULT 'Disponible',
  foto_portada TEXT,
  fotos TEXT[] DEFAULT '{}',
  link_whatsapp TEXT,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.propiedades ENABLE ROW LEVEL SECURITY;

-- Public read for available properties
CREATE POLICY "Propiedades disponibles son públicas"
ON public.propiedades FOR SELECT
USING (estado = 'Disponible');

-- Authenticated users can manage all properties
CREATE POLICY "Admin puede ver todas las propiedades"
ON public.propiedades FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin puede insertar propiedades"
ON public.propiedades FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admin puede actualizar propiedades"
ON public.propiedades FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admin puede eliminar propiedades"
ON public.propiedades FOR DELETE
TO authenticated
USING (true);

-- Auto-update fecha_actualizacion
CREATE OR REPLACE FUNCTION public.update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_propiedades_fecha
BEFORE UPDATE ON public.propiedades
FOR EACH ROW EXECUTE FUNCTION public.update_fecha_actualizacion();

-- Create captaciones table
CREATE TABLE public.captaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT,
  celular TEXT,
  correo TEXT,
  tipo_negocio TEXT,
  tipo_inmueble TEXT,
  barrio TEXT,
  valor_aproximado TEXT,
  observaciones TEXT,
  estado TEXT DEFAULT 'Pendiente',
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.captaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insert publico" ON public.captaciones
FOR INSERT WITH CHECK (true);

CREATE POLICY "Solo admin lee" ON public.captaciones
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admin puede actualizar captaciones" ON public.captaciones
FOR UPDATE TO authenticated
USING (true);

-- Create storage bucket for property photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('propiedades-fotos', 'propiedades-fotos', true);

CREATE POLICY "Fotos publicas" ON storage.objects
FOR SELECT USING (bucket_id = 'propiedades-fotos');

CREATE POLICY "Admin sube fotos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'propiedades-fotos');

CREATE POLICY "Admin actualiza fotos" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'propiedades-fotos');

CREATE POLICY "Admin elimina fotos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'propiedades-fotos');
