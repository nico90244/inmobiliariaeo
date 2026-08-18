const STORAGE_KEY = "eo_eli_chat_session_id";

/**
 * Identificador de sesión del chat de Eli — se manda al agente en cada mensaje
 * para que su memoria (n8n) recuerde el hilo de la conversación.
 */
export function getEliChatSessionId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
