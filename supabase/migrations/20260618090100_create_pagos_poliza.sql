-- Tabla para seguimiento de pagos de pólizas de seguro (mensual para Fianzacrédito/El
-- Libertador/Otra, anual para Sura usando mes = NULL)
CREATE TABLE public.pagos_poliza (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id uuid NOT NULL REFERENCES public.contratos_arrendamiento(id) ON DELETE CASCADE,
  anio integer NOT NULL,
  mes integer CHECK (mes IS NULL OR (mes BETWEEN 1 AND 12)), -- NULL = pago anual (Sura)
  valor numeric,
  fecha_pago date,
  estado text NOT NULL DEFAULT 'Pendiente', -- Pendiente | Pagado
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contrato_id, anio, mes)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pagos_poliza TO authenticated;
GRANT ALL ON public.pagos_poliza TO service_role;

ALTER TABLE public.pagos_poliza ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins authenticated manage pagos_poliza"
  ON public.pagos_poliza
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_pagos_poliza()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_pagos_poliza_updated
  BEFORE UPDATE ON public.pagos_poliza
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_pagos_poliza();
