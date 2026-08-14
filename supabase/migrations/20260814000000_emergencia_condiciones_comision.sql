-- Agentes/inmobiliarias que gestionan por corretaje o administración pueden
-- especificar condiciones de su comisión, o marcar que no cobran comisión.
ALTER TABLE public.emergencia_inmuebles
  ADD COLUMN IF NOT EXISTS sin_comision boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS condiciones_comision text;
