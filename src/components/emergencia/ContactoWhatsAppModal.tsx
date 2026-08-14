import { useEffect, useState } from "react";
import { Heart, Loader2, AlertTriangle } from "lucide-react";
import { supabase, type TablesInsert } from "@/lib/supabase";
import { getSwipeSessionId } from "@/lib/emergenciaSession";
import ExencionResponsabilidad from "@/components/terremoto/ExencionResponsabilidad";
import type { TarjetaSwipe } from "@/hooks/useSwipeInventario";

type Contacto = { nombre: string; celular: string; es_inmobiliaria_eo: boolean };

type Props = {
  tarjeta: TarjetaSwipe;
  nombreBuscador: string;
  onClose: () => void;
};

const ContactoWhatsAppModal = ({ tarjeta, nombreBuscador, onClose }: Props) => {
  // El candado de "obtener_contacto_inmueble" (solo revela contacto tras un like)
  // aplica ÚNICAMENTE a publicaciones de terceros de la Iniciativa Terremoto
  // (emergencia_inmuebles): son datos que llenó un desconocido en un formulario
  // público. El inventario propio de EO (propiedades) ya es público en el resto
  // del sitio sin ese candado, así que aquí se usa directo su link_whatsapp.
  const esInventarioPropio = tarjeta.fuente === "propiedades";

  const [contacto, setContacto] = useState<Contacto | null>(null);
  const [loading, setLoading] = useState(!esInventarioPropio);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (esInventarioPropio) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      const { data, error: rpcError } = await supabase.rpc("obtener_contacto_inmueble", {
        p_inmueble_id: tarjeta.id,
        p_session_id: getSwipeSessionId(),
      });
      if (cancelled) return;
      setLoading(false);
      if (rpcError || !data || data.length === 0) {
        setError(true);
        return;
      }
      setContacto(data[0] as Contacto);
    })();
    return () => { cancelled = true; };
  }, [esInventarioPropio, tarjeta.id]);

  const handleContactarClick = async () => {
    onClose();
    if (esInventarioPropio) return; // no hay swipe que registrar para inventario propio
    await supabase.from("emergencia_swipes").insert({
      session_id: getSwipeSessionId(),
      inmueble_id: tarjeta.id,
      accion: "contacto_whatsapp",
    } satisfies TablesInsert<"emergencia_swipes">);
  };

  const waLink = esInventarioPropio
    ? tarjeta.link_whatsapp ?? "#"
    : contacto
    ? `https://wa.me/57${contacto.celular.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hola, vi tu publicación de ${tarjeta.tipo_inmueble} en ${tarjeta.barrio} a través de Inmobiliaria EO (Iniciativa Terremoto Colombia) y me interesa. Mi nombre es ${nombreBuscador}.`
      )}`
    : "#";

  const esInmobiliariaEO = esInventarioPropio ? true : !!contacto?.es_inmobiliaria_eo;

  return (
    <div className="fixed inset-0 z-[100] bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in" role="dialog" aria-modal="true">
      <div className="rounded-3xl bg-background max-w-sm w-full p-7 text-center border-t-4 border-primary shadow-2xl animate-scale-in">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Heart size={22} className="text-primary" fill="currentColor" />
        </div>
        <h2 className="font-heading text-lg font-bold text-foreground mb-2">¡Te interesó esta propiedad!</h2>

        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        )}

        {!loading && error && (
          <>
            <div className="flex items-start gap-2 text-left bg-destructive/5 border border-destructive/20 rounded-xl p-3 mb-5">
              <AlertTriangle size={15} className="text-destructive shrink-0 mt-0.5" />
              <p className="font-body text-xs text-destructive">
                No pudimos obtener el contacto de este inmueble. Intenta de nuevo más tarde o escríbenos
                directamente a Inmobiliaria EO por WhatsApp.
              </p>
            </div>
            <a
              href="https://wa.me/573162225604"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="block w-full py-3 rounded-full bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase shadow-md shadow-primary/20 transition-all duration-200 hover:bg-primary-hover mb-2"
            >
              Escribir a Inmobiliaria EO
            </a>
          </>
        )}

        {!loading && !error && (
          <>
            <p className="font-body text-sm text-muted-foreground mb-5">
              Escríbenos por WhatsApp y te ayudamos a dar el siguiente paso con este inmueble.
            </p>
            {!esInmobiliariaEO && (
              <div className="mb-5 text-left rounded-xl bg-muted/20 border border-foreground/10 p-3">
                <ExencionResponsabilidad />
              </div>
            )}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleContactarClick}
              className="block w-full py-3 rounded-full bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase shadow-md shadow-primary/20 transition-all duration-200 hover:bg-primary-hover hover:shadow-lg hover:-translate-y-0.5 active:scale-95 active:translate-y-0 mb-2"
            >
              Contactar por WhatsApp
            </a>
          </>
        )}

        <button onClick={onClose} className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors">
          Seguir viendo propiedades
        </button>
      </div>
    </div>
  );
};

export default ContactoWhatsAppModal;
