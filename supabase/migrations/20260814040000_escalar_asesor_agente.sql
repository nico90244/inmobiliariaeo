-- Registro de escalaciones a asesor humano hechas por el agente de IA (n8n).
-- Sin política pública de INSERT: solo se escribe a través de la función
-- escalar_asesor_agente (SECURITY DEFINER), nunca directo desde el cliente.
CREATE TABLE public.agente_escalaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  motivo text NOT NULL,
  mensaje_usuario text,
  fecha_creacion timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agente_escalaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin lee escalaciones" ON public.agente_escalaciones
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.escalar_asesor_agente(
  p_session_id text,
  p_motivo text,
  p_mensaje_usuario text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_session_id IS NULL OR length(trim(p_session_id)) = 0 THEN
    RAISE EXCEPTION 'p_session_id es requerido';
  END IF;
  IF p_motivo IS NULL OR length(trim(p_motivo)) = 0 THEN
    RAISE EXCEPTION 'p_motivo es requerido';
  END IF;

  INSERT INTO public.agente_escalaciones (session_id, motivo, mensaje_usuario)
  VALUES (p_session_id, p_motivo, p_mensaje_usuario);

  RETURN jsonb_build_object(
    'nombre', 'Inmobiliaria EO',
    'whatsapp_link', 'https://wa.me/573162225604?text=' || public._url_encode(
      'Hola, necesito hablar con un asesor sobre: ' || p_motivo
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.escalar_asesor_agente(text, text, text) TO anon, authenticated;
