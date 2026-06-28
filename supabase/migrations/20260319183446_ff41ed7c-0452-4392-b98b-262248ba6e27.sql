
CREATE TABLE public.citas_disponibles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha date NOT NULL,
  hora text NOT NULL,
  propiedad_id uuid REFERENCES public.propiedades(id) ON DELETE SET NULL,
  agente text NOT NULL DEFAULT 'Eliana Osorio',
  activo boolean NOT NULL DEFAULT true,
  estado text NOT NULL DEFAULT 'Disponible',
  fecha_creacion timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.citas_reservas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid REFERENCES public.citas_disponibles(id) ON DELETE SET NULL,
  propiedad_id uuid REFERENCES public.propiedades(id) ON DELETE SET NULL,
  nombre_cliente text NOT NULL,
  celular_cliente text NOT NULL,
  correo_cliente text,
  estado text NOT NULL DEFAULT 'Pendiente',
  fecha_creacion timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.citas_disponibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas_reservas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active available slots" ON public.citas_disponibles
  FOR SELECT TO public USING (activo = true AND estado = 'Disponible');

CREATE POLICY "Authenticated full access disponibles select" ON public.citas_disponibles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated insert disponibles" ON public.citas_disponibles
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update disponibles" ON public.citas_disponibles
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated delete disponibles" ON public.citas_disponibles
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Public can insert reservations" ON public.citas_reservas
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Authenticated full access reservas select" ON public.citas_reservas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated update reservas" ON public.citas_reservas
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated delete reservas" ON public.citas_reservas
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Public can update slot to Reservado" ON public.citas_disponibles
  FOR UPDATE TO public USING (activo = true AND estado = 'Disponible') WITH CHECK (estado = 'Reservado');
