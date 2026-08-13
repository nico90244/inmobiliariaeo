import { useState } from "react";
import { Loader2, X, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";
import SwipeDeck from "@/components/emergencia/SwipeDeck";
import { useEmergenciaInmuebles, type EmergenciaInmueblePublico } from "@/hooks/useEmergenciaInmuebles";
import { supabase, type TablesInsert } from "@/lib/supabase";
import { getSwipeSessionId } from "@/lib/emergenciaSession";
import { useToast } from "@/hooks/use-toast";
import { trackSubmitForm, trackContact } from "@/lib/pixelEvents";

const propertyTypes = ["Apartamento", "Casa", "Apartaestudio", "Local", "Habitación", "Oficina", "Bodega"];
const inputClass = "w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none";
const labelClass = "font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1";

const EmergenciaBuscar = () => {
  const { toast } = useToast();
  const [ciudad, setCiudad] = useState("Cali");
  const [tipoInmueble, setTipoInmueble] = useState("");
  const [presupuestoMax, setPresupuestoMax] = useState("");
  const [match, setMatch] = useState<EmergenciaInmueblePublico | null>(null);

  const [buscadorId, setBuscadorId] = useState<string | null>(null);
  const [leadForm, setLeadForm] = useState({ nombre: "", celular: "", presupuesto: "", ciudad: "Cali", tipo_inmueble: "" });
  const [leadSaving, setLeadSaving] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [leadDismissed, setLeadDismissed] = useState(false);

  const { data, isLoading } = useEmergenciaInmuebles({
    ciudad: ciudad || undefined,
    tipoInmueble: tipoInmueble || undefined,
    presupuestoMax: presupuestoMax ? Number(presupuestoMax) : undefined,
  });

  const handleSwipe = async (inmueble: EmergenciaInmueblePublico, accion: "like" | "pass") => {
    if (!inmueble.id) return;
    await supabase.from("emergencia_swipes").insert({
      session_id: getSwipeSessionId(),
      inmueble_id: inmueble.id,
      accion,
      buscador_id: buscadorId,
    } satisfies TablesInsert<"emergencia_swipes">);

    if (accion === "like") {
      trackContact({ content_id: inmueble.id, content_name: inmueble.tipo_inmueble ?? undefined });
      setMatch(inmueble);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.nombre.trim() || !leadForm.celular.trim()) return;
    setLeadSaving(true);
    // No hacemos .select() tras el insert: la tabla base no es legible por
    // el rol anónimo (solo el staff autenticado), así que generamos el id
    // en el navegador para poder enlazarlo a los swipes de esta sesión.
    const id = crypto.randomUUID();
    const { error } = await supabase.from("emergencia_buscadores").insert({
      id,
      nombre: leadForm.nombre.trim(),
      celular: leadForm.celular.trim(),
      presupuesto: leadForm.presupuesto ? Number(leadForm.presupuesto) : null,
      ciudad: leadForm.ciudad.trim() || "Cali",
      tipo_inmueble: leadForm.tipo_inmueble || null,
      acepta_politica: true,
    } satisfies TablesInsert<"emergencia_buscadores">);
    setLeadSaving(false);

    if (error) {
      toast({ title: "No se pudo guardar", description: "Intenta de nuevo.", variant: "destructive" });
      return;
    }
    setBuscadorId(id);
    setLeadSent(true);
    trackSubmitForm({ content_type: "emergencia_buscador" });
    toast({ title: "¡Listo!", description: "Te avisaremos si hay novedades." });
  };

  const waMatchLink = match
    ? `https://wa.me/573162225604?text=${encodeURIComponent(
        `Hola, vi en el programa de apoyo del terremoto un ${match.tipo_inmueble} en ${match.barrio}, ${match.ciudad} (canon ${match.canon ? new Intl.NumberFormat("es-CO").format(match.canon) : ""}). Me interesa, ¿me pueden dar más información?`
      )}`
    : "";

  return (
    <>
      <SEO
        title="Busca Arriendo | Programa Terremoto Colombia | Inmobiliaria EO"
        description="Desliza entre inmuebles disponibles para arriendo en el programa de apoyo del terremoto en Colombia y conecta por WhatsApp con lo que más te interesa."
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
              Desliza a la derecha (o toca el corazón) si te interesa una propiedad. Te
              conectaremos por WhatsApp con Inmobiliaria EO para dar el siguiente paso.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto mb-10">
              <input
                aria-label="Ciudad"
                placeholder="Ciudad"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className={inputClass}
              />
              <select aria-label="Tipo de inmueble" value={tipoInmueble} onChange={(e) => setTipoInmueble(e.target.value)} className={inputClass}>
                <option value="">Cualquier tipo</option>
                {propertyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input
                aria-label="Presupuesto máximo"
                type="number"
                min={0}
                placeholder="Presupuesto máx."
                value={presupuestoMax}
                onChange={(e) => setPresupuestoMax(e.target.value)}
                className={inputClass}
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={28} /></div>
            ) : (
              <SwipeDeck inmuebles={data ?? []} onSwipe={handleSwipe} />
            )}

            {!leadSent && !leadDismissed && (
              <div className="relative max-w-md mx-auto mt-14 bg-muted/20 border border-foreground/10 p-6">
                <button onClick={() => setLeadDismissed(true)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground" aria-label="Cerrar">
                  <X size={16} />
                </button>
                <h2 className="font-heading text-base font-semibold text-foreground mb-1">¿Quieres que te avisemos?</h2>
                <p className="font-body text-xs text-muted-foreground mb-4">
                  Déjanos tus datos (opcional) y te contactamos si aparece algo que encaje contigo.
                </p>
                <form onSubmit={handleLeadSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass} htmlFor="lead-nombre">Nombre</label>
                      <input id="lead-nombre" required value={leadForm.nombre} onChange={(e) => setLeadForm((f) => ({ ...f, nombre: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="lead-celular">Celular</label>
                      <input id="lead-celular" type="tel" required value={leadForm.celular} onChange={(e) => setLeadForm((f) => ({ ...f, celular: e.target.value }))} className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass} htmlFor="lead-presupuesto">Presupuesto</label>
                      <input id="lead-presupuesto" type="number" min={0} value={leadForm.presupuesto} onChange={(e) => setLeadForm((f) => ({ ...f, presupuesto: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="lead-tipo">Tipo</label>
                      <select id="lead-tipo" value={leadForm.tipo_inmueble} onChange={(e) => setLeadForm((f) => ({ ...f, tipo_inmueble: e.target.value }))} className={inputClass}>
                        <option value="">Cualquiera</option>
                        {propertyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={leadSaving} className="w-full py-2.5 bg-primary text-primary-foreground font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary-hover transition-colors disabled:opacity-50">
                    {leadSaving ? "Enviando..." : "Guardar mis datos"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />

      {match && (
        <div className="fixed inset-0 z-[100] bg-foreground/50 flex items-center justify-center p-6 animate-fade-in" role="dialog" aria-modal="true">
          <div className="bg-background max-w-sm w-full p-7 text-center border-t-2 border-primary animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Heart size={20} className="text-primary" fill="currentColor" />
            </div>
            <h2 className="font-heading text-lg font-bold text-foreground mb-2">¡Te interesó esta propiedad!</h2>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Escríbenos por WhatsApp y te ayudamos a dar el siguiente paso con este inmueble.
            </p>
            <a
              href={waMatchLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMatch(null)}
              className="block w-full py-3 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary-hover transition-colors mb-2"
            >
              Escribir por WhatsApp
            </a>
            <button onClick={() => setMatch(null)} className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors">
              Seguir viendo propiedades
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EmergenciaBuscar;
