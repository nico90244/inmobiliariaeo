import { ShieldAlert } from "lucide-react";
import { EXENCION_RESPONSABILIDAD } from "@/lib/terremoto/textosLegales";

/**
 * Aviso no intrusivo (ícono + texto gris, sin modal) de que Inmobiliaria EO solo
 * facilita el contacto y no responde por el inmueble ni la negociación. Se muestra
 * en cualquier vista de una publicación que no sea inventario propio de EO
 * (es_inmobiliaria_eo = false): tarjeta de swipe, resultados del chatbot y detalle
 * de publicación.
 */
const ExencionResponsabilidad = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-start gap-2 ${className}`}>
    <ShieldAlert size={14} className="shrink-0 mt-0.5 text-muted-foreground/70" aria-hidden="true" />
    <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
      {EXENCION_RESPONSABILIDAD}
    </p>
  </div>
);

export default ExencionResponsabilidad;
