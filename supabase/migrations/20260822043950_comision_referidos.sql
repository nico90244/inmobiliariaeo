-- Modalidad de comisión por propiedad (Directo/Corretaje/Administración/Compartida)
-- y tabla de referidos para llevar por separado los negocios que involucran a un
-- tercero (agente/inmobiliaria referente), sin mezclarlos con la base de
-- propietarios, pólizas ni canon de arrendamiento. Solo visible desde el panel
-- admin (RLS restringida a is_admin(), igual que propietarios/pagos_poliza).

ALTER TABLE public.propiedades
  ADD COLUMN IF NOT EXISTS modalidad_comision text;
-- Valores esperados: 'Directo' | 'Corretaje' | 'Administracion' | 'Compartida'.
-- NULL en propiedades existentes; la app las trata como 'Directo' por defecto.

CREATE TABLE IF NOT EXISTS public.referidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id uuid NOT NULL REFERENCES public.propiedades(id) ON DELETE CASCADE,
  tipo_negocio text NOT NULL,
  modalidad text NOT NULL, -- 'Corretaje' | 'Administracion' | 'Compartida'
  nombre_agente text,
  inmobiliaria text,
  celular text,
  comision_tipo text,      -- 'porcentaje' | 'valor'
  comision_valor numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.referidos TO authenticated;
GRANT ALL ON public.referidos TO service_role;

ALTER TABLE public.referidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins authenticated manage referidos" ON public.referidos
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.update_updated_at_referidos()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_referidos_updated
  BEFORE UPDATE ON public.referidos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_referidos();
