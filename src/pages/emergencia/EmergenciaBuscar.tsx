import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";
import SwipeDeck from "@/components/emergencia/SwipeDeck";
import ContactoWhatsAppModal from "@/components/emergencia/ContactoWhatsAppModal";
import BuscarLeadForm, { type BuscarLeadData } from "@/components/emergencia/BuscarLeadForm";
import { useEmergenciaInmuebles, type EmergenciaInmueblePublico } from "@/hooks/useEmergenciaInmuebles";
import { supabase, type TablesInsert } from "@/lib/supabase";
import { getSwipeSessionId } from "@/lib/emergenciaSession";
import { trackContact } from "@/lib/pixelEvents";

const EmergenciaBuscar = () => {
  const [lead, setLead] = useState<BuscarLeadData | null>(null);
  const [match, setMatch] = useState<EmergenciaInmueblePublico | null>(null);

  const { data, isLoading, isError } = useEmergenciaInmuebles(
    lead
      ? {
          ciudad: lead.ciudad || undefined,
          tipoInmueble: lead.tipoInmueble || undefined,
          presupuestoMax: lead.presupuesto ?? undefined,
        }
      : undefined,
  );

  const handleSwipe = async (inmueble: EmergenciaInmueblePublico, accion: "like" | "pass") => {
    if (!inmueble.id) return;

    const { error } = await supabase.from("emergencia_swipes").insert({
      session_id: getSwipeSessionId(),
      inmueble_id: inmueble.id,
      accion,
      buscador_id: lead?.buscadorId ?? null,
    } satisfies TablesInsert<"emergencia_swipes">);

    // 23505 = ya existe un swipe de esta sesión para este inmueble (UNIQUE) — no es
    // un error real, solo significa que no hay que insertar de nuevo.
    if (error && error.code !== "23505") {
      return;
    }

    if (accion === "like") {
      trackContact({ content_id: inmueble.id, content_name: inmueble.tipo_inmueble ?? undefined });
      setMatch(inmueble);
    }
  };

  return (
    <>
      <SEO
        title="Busca Arriendo | Iniciativa Terremoto Colombia | Inmobiliaria EO"
        description="Desliza entre inmuebles disponibles para arriendo en esta iniciativa para el terremoto en Colombia y conecta por WhatsApp con lo que más te interesa."
        path="/emergencia-terremoto/buscar"
      />
      <Header />
      <main className="pt-20">
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="w-8 h-0.5 bg-primary mb-4 mx-auto" aria-hidden="true" />
            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2 text-center">
              Encuentra dónde vivir
            </h1>
            <p className="font-body text-sm text-muted-foreground mb-8 text-center max-w-lg mx-auto">
              {lead
                ? "Desliza a la derecha (o toca el corazón) si te interesa una propiedad."
                : "Cuéntanos qué buscas y te mostramos las propiedades disponibles para arrendar."}
            </p>

            {!lead && <BuscarLeadForm onSubmit={setLead} />}

            {lead && isLoading && (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={28} /></div>
            )}

            {lead && isError && (
              <div className="max-w-sm mx-auto flex items-start gap-3 bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                <AlertTriangle size={18} className="text-destructive shrink-0 mt-0.5" />
                <p className="font-body text-sm text-destructive">
                  No pudimos cargar las propiedades disponibles. Verifica tu conexión e intenta de nuevo.
                </p>
              </div>
            )}

            {lead && !isLoading && !isError && (
              <SwipeDeck
                inmuebles={data ?? []}
                onSwipe={handleSwipe}
                onAjustarBusqueda={() => setLead(null)}
              />
            )}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />

      {match && lead && (
        <ContactoWhatsAppModal
          inmueble={match}
          nombreBuscador={lead.nombre}
          onClose={() => setMatch(null)}
        />
      )}
    </>
  );
};

export default EmergenciaBuscar;
