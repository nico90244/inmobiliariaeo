const STORAGE_KEY = "eo_emergencia_session_id";

/**
 * Identificador anónimo de sesión de swipe (no es un dato personal).
 * Se usa solo para no repetir la misma propiedad dos veces en el mismo
 * navegador y para agrupar likes/pass en el panel de moderación.
 */
export function getSwipeSessionId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
