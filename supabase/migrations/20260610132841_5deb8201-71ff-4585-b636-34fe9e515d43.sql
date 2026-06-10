-- Tabla para pagos mensuales de alquileres (cartera)
CREATE TABLE public.pagos_alquiler (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id uuid NOT NULL REFERENCES public.contratos_arrendamiento(id) ON DELETE CASCADE,
  anio integer NOT NULL,
  mes integer NOT NULL CHECK (mes BETWEEN 1 AND 12),
  -- Pago del inquilino
  valor_canon numeric,
  valor_administracion numeric DEFAULT 0,
  valor_recibido numeric,
  fecha_pago_inquilino date,
  estado_inquilino text NOT NULL DEFAULT 'Pendiente', -- Pendiente | Recibido | Vencido
  -- Pago al propietario
  valor_propietario numeric,
  fecha_pago_propietario date,
  estado_propietario text NOT NULL DEFAULT 'Pendiente', -- Pendiente | Pagado
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contrato_id, anio, mes)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pagos_alquiler TO authenticated;
GRANT ALL ON public.pagos_alquiler TO service_role;

ALTER TABLE public.pagos_alquiler ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins authenticated manage pagos_alquiler"
  ON public.pagos_alquiler
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER trg_pagos_alquiler_updated
  BEFORE UPDATE ON public.pagos_alquiler
  FOR EACH ROW EXECUTE FUNCTION public.update_fecha_actualizacion();

-- Renombrar columna trigger esperada
CREATE OR REPLACE FUNCTION public.update_updated_at_pagos()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_pagos_alquiler_updated ON public.pagos_alquiler;
CREATE TRIGGER trg_pagos_alquiler_updated
  BEFORE UPDATE ON public.pagos_alquiler
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_pagos();