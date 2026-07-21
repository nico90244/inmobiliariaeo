-- Trazabilidad captación → propiedad
ALTER TABLE public.propiedades
  ADD COLUMN IF NOT EXISTS captacion_id uuid
  REFERENCES public.captaciones(id) ON DELETE SET NULL;

-- Celular del propietario en contrato de arrendamiento
ALTER TABLE public.contratos_arrendamiento
  ADD COLUMN IF NOT EXISTS propietario_celular text;
