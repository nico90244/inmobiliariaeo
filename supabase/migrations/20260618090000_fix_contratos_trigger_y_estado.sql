-- Fix: el trigger de contratos_arrendamiento usaba update_fecha_actualizacion(), que escribe en
-- NEW.fecha_actualizacion, columna que NO existe en esta tabla (existe updated_at). Esto rompía
-- todo UPDATE a contratos_arrendamiento. Se define la función aquí mismo (CREATE OR REPLACE) en
-- vez de depender de que ya exista de una migración previa.
CREATE OR REPLACE FUNCTION public.update_updated_at_pagos()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_contratos_updated ON public.contratos_arrendamiento;
CREATE TRIGGER trg_contratos_updated
  BEFORE UPDATE ON public.contratos_arrendamiento
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_pagos();

-- Historial de arrendatarios: estado del contrato + fecha de fin
ALTER TABLE public.contratos_arrendamiento
  ADD COLUMN IF NOT EXISTS estado_contrato TEXT NOT NULL DEFAULT 'Activo', -- 'Activo' | 'Finalizado'
  ADD COLUMN IF NOT EXISTS fecha_fin DATE;

-- Póliza de seguro (embebida 1:1 en el contrato, igual patrón que propietario_*)
ALTER TABLE public.contratos_arrendamiento
  ADD COLUMN IF NOT EXISTS poliza_asegurado BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS poliza_compania TEXT,        -- Fianzacredito | El Libertador | Sura | Otra
  ADD COLUMN IF NOT EXISTS poliza_compania_otra TEXT,
  ADD COLUMN IF NOT EXISTS poliza_valor NUMERIC,
  ADD COLUMN IF NOT EXISTS poliza_fecha_inicio DATE;

CREATE INDEX IF NOT EXISTS idx_contratos_propiedad_estado
  ON public.contratos_arrendamiento (propiedad_id, estado_contrato);
