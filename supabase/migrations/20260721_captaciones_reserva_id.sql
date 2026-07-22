-- Vincula una captación con la cita/reserva que originó la conversión
ALTER TABLE captaciones ADD COLUMN IF NOT EXISTS reserva_id uuid REFERENCES citas_reservas(id) ON DELETE SET NULL;
