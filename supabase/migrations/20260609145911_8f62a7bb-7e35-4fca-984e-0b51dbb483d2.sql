ALTER TABLE public.propiedades 
  ADD COLUMN IF NOT EXISTS foto_portada_position text DEFAULT '50% 50%',
  ADD COLUMN IF NOT EXISTS foto_portada_zoom numeric DEFAULT 1;