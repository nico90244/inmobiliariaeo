import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    ttq?: {
      page: () => void;
      track: (event: string, params?: Record<string, unknown>) => void;
      identify: (params: Record<string, unknown>) => void;
    };
  }
}

/**
 * Registra una "Vista de página" del TikTok Pixel en cada cambio de ruta
 * dentro de la SPA. El código base en index.html ya dispara la primera
 * vista al cargar el sitio, así que aquí nos saltamos el primer render
 * para no duplicarla y solo reportamos las navegaciones siguientes.
 */
const TikTokPixelTracker = () => {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.ttq?.page();
  }, [location.pathname]);

  return null;
};

export default TikTokPixelTracker;
