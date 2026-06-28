
CREATE TABLE public.contratos_arrendamiento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  propiedad_id UUID NOT NULL REFERENCES public.propiedades(id) ON DELETE CASCADE,
  inquilino_nombre TEXT NOT NULL,
  inquilino_cedula TEXT NOT NULL,
  inquilino_celular TEXT NOT NULL,
  inquilino_correo TEXT,
  docs_inquilino TEXT[] NOT NULL DEFAULT '{}',
  docs_codeudor TEXT[] NOT NULL DEFAULT '{}',
  valor_canon NUMERIC,
  dia_pago_inquilino INTEGER,
  fecha_inicio DATE,
  propietario_nombre TEXT,
  propietario_cedula TEXT,
  propietario_banco TEXT,
  propietario_tipo_cuenta TEXT,
  propietario_num_cuenta TEXT,
  valor_pago_propietario NUMERIC,
  dia_pago_propietario INTEGER,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contratos_arrendamiento TO authenticated;
GRANT ALL ON public.contratos_arrendamiento TO service_role;

ALTER TABLE public.contratos_arrendamiento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins authenticated manage contratos"
  ON public.contratos_arrendamiento FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE TRIGGER trg_contratos_updated
  BEFORE UPDATE ON public.contratos_arrendamiento
  FOR EACH ROW EXECUTE FUNCTION public.update_fecha_actualizacion();
