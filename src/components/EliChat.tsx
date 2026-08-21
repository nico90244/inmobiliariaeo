import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, AlertTriangle } from "lucide-react";
import { getEliChatSessionId } from "@/lib/eliChatSession";

type Mensaje = {
  rol: "usuario" | "eli";
  texto: string;
};

// En desarrollo local, el agente de n8n corre en localhost -- solo funciona
// mientras pruebas con `npm run dev` en la misma máquina donde corre n8n.
// Para que funcione en el sitio ya desplegado, el webhook necesita ser público
// (ver VITE_AGENTE_WEBHOOK_URL).
const WEBHOOK_URL = import.meta.env.VITE_AGENTE_WEBHOOK_URL || "http://localhost:5678/webhook/agente-inmobiliaria-eo";

const EliChat = () => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { rol: "eli", texto: "¡Hola! Soy Eli, tu asistente de Inmobiliaria EO. Cuéntame qué inmueble buscas (tipo, ciudad y si es arriendo o venta) y te ayudo a encontrarlo." },
  ]);
  const [input, setInput] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [mensajes, enviando]);

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    const texto = input.trim();
    if (!texto || enviando) return;

    setMensajes((m) => [...m, { rol: "usuario", texto }]);
    setInput("");
    setEnviando(true);
    setError(false);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: texto, session_id: getEliChatSessionId() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const respuesta = data?.respuesta || "No obtuve una respuesta clara, intenta reformular tu pregunta.";
      setMensajes((m) => [...m, { rol: "eli", texto: respuesta }]);
    } catch {
      setError(true);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col h-[26rem]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
        {mensajes.map((m, i) => (
          <div key={i} className={`flex ${m.rol === "usuario" ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[85%] font-body text-sm leading-relaxed px-3 py-2 rounded-lg whitespace-pre-wrap ${
                m.rol === "usuario"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted/40 text-foreground rounded-bl-none"
              }`}
            >
              {m.texto}
            </p>
          </div>
        ))}
        {enviando && (
          <div className="flex justify-start">
            <div className="bg-muted/40 px-3 py-2 rounded-lg rounded-bl-none">
              <Loader2 size={14} className="animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 bg-destructive/5 border border-destructive/20 rounded-lg p-2.5">
            <AlertTriangle size={14} className="text-destructive shrink-0 mt-0.5" />
            <p className="font-body text-xs text-destructive">
              Eli no está disponible en este momento. Escríbenos por WhatsApp mientras tanto.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={enviarMensaje} className="flex items-center gap-2 border-t border-foreground/10 pt-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escríbele a Eli..."
          disabled={enviando}
          maxLength={500}
          className="flex-1 bg-muted/20 border border-foreground/10 rounded-full py-2 px-4 font-body text-sm text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={enviando || !input.trim()}
          aria-label="Enviar mensaje"
          className="shrink-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-40"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};

export default EliChat;
