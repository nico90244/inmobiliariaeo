
-- Fix trigger de contratos_arrendamiento: la función previa escribía en fecha_actualizacion (no existe)
CREATE OR REPLACE FUNCTION public.update_updated_at_pagos()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_contratos_updated ON public.contratos_arrendamiento;
CREATE TRIGGER trg_contratos_updated
  BEFORE UPDATE ON public.contratos_arrendamiento
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_pagos();

-- Historial de arrendatarios: estado + fecha_fin
ALTER TABLE public.contratos_arrendamiento
  ADD COLUMN IF NOT EXISTS estado_contrato TEXT NOT NULL DEFAULT 'Activo',
  ADD COLUMN IF NOT EXISTS fecha_fin DATE;

-- Póliza embebida en el contrato
ALTER TABLE public.contratos_arrendamiento
  ADD COLUMN IF NOT EXISTS poliza_asegurado BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS poliza_compania TEXT,
  ADD COLUMN IF NOT EXISTS poliza_compania_otra TEXT,
  ADD COLUMN IF NOT EXISTS poliza_valor NUMERIC,
  ADD COLUMN IF NOT EXISTS poliza_fecha_inicio DATE;

CREATE INDEX IF NOT EXISTS idx_contratos_propiedad_estado
  ON public.contratos_arrendamiento (propiedad_id, estado_contrato);

-- Tabla de pagos de pólizas (mensual Fianzacrédito/El Libertador, anual Sura → mes NULL)
CREATE TABLE IF NOT EXISTS public.pagos_poliza (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id uuid NOT NULL REFERENCES public.contratos_arrendamiento(id) ON DELETE CASCADE,
  anio integer NOT NULL,
  mes integer CHECK (mes IS NULL OR (mes BETWEEN 1 AND 12)),
  valor numeric,
  fecha_pago date,
  estado text NOT NULL DEFAULT 'Pendiente',
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contrato_id, anio, mes)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pagos_poliza TO authenticated;
GRANT ALL ON public.pagos_poliza TO service_role;

ALTER TABLE public.pagos_poliza ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins authenticated manage pagos_poliza" ON public.pagos_poliza;
CREATE POLICY "Admins authenticated manage pagos_poliza"
  ON public.pagos_poliza FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_pagos_poliza()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_pagos_poliza_updated ON public.pagos_poliza;
CREATE TRIGGER trg_pagos_poliza_updated
  BEFORE UPDATE ON public.pagos_poliza
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_pagos_poliza();
