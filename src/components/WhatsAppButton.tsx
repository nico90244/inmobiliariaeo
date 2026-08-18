import { useState } from "react";
import { X, Bot } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { trackContact } from "@/lib/pixelEvents";
import EliChat from "@/components/EliChat";

const WhatsAppButton = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      {/* WhatsApp button - bottom right */}
      <a
        href="https://wa.me/573162225604"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackContact()}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground hover:bg-primary-hover transition-colors duration-300 flex items-center justify-center shadow-lg rounded-full"
        aria-label="Contactar por WhatsApp"
      >
        <WhatsAppIcon size={24} className="text-primary-foreground" />
      </a>

      {/* Eli chatbot button - bottom left */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 left-6 z-50 h-12 px-4 bg-primary text-primary-foreground hover:bg-primary-hover transition-colors duration-300 flex items-center gap-2 shadow-lg rounded-full font-heading text-sm font-semibold"
        aria-label="Chatea con Eli"
      >
        <Bot size={20} />
        <span className="hidden sm:inline">Chatea con Eli</span>
      </button>

      {/* Eli popup */}
      {chatOpen && (
        <div className="fixed bottom-24 left-6 z-50 w-80 bg-background border border-foreground/10 shadow-2xl p-6 animate-scale-in origin-bottom-left">
          <button
            onClick={() => setChatOpen(false)}
            aria-label="Cerrar chat de Eli"
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-full">
              <Bot size={22} className="text-primary" />
            </div>
            <p className="font-heading text-sm font-semibold text-foreground">Eli - Asistente</p>
          </div>

          <EliChat />
        </div>
      )}
    </>
  );
};

export default WhatsAppButton;
