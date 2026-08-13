import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Home, CheckCircle2, PauseCircle, XCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type Publicacion = {
  id: string;
  tipo_inmueble: string;
  barrio: string | null;
  ciudad: string;
  canon: number;
  estado: string;
  motivo_rechazo: string | null;
  foto_portada: string | null;
  fecha_creacion: string;
};

const estadoLabel: Record<string, string> = {
  Pendiente: "En revisión por nuestro equipo",
  Disponible: "Publicada — visible para buscadores",
  Alquilada: "Marcada como alquilada",
  Pausada: "Pausada — no visible temporalmente",
  Rechazada: "No aprobada",
};

const EmergenciaMiPublicacion = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publicacion, setPublicacion] = useState<Publicacion | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("emergencia_obtener_por_token", { p_token: token });
    setLoading(false);
    if (error || !data || data.length === 0) {
      setNotFound(true);
      return;
    }
    setPublicacion(data[0]);
  };

  useEffect(() => { load(); }, [token]);

  const cambiarEstado = async (nuevo: "Disponible" | "Alquilada" | "Pausada") => {
    if (!token) return;
    setSaving(true);
    const { error } = await supabase.rpc("emergencia_actualizar_estado", { p_token: token, p_nuevo_estado: nuevo });
    setSaving(false);
    if (error) {
      toast({ title: "No se pudo actualizar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Actualizado" });
    load();
  };

  return (
    <>
      <SEO title="Gestionar mi publicación | Inmobiliaria EO" description="Gestiona el estado de tu inmueble publicado." path="/emergencia-terremoto/mi-publicacion" />
      <Header />
      <main className="pt-20">
        <section className="py-16">
          <div className="container mx-auto px-6 max-w-lg">
            {loading && (
              <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={28} /></div>
            )}

            {!loading && notFound && (
              <div className="text-center">
                <h1 className="font-heading text-xl font-bold text-foreground mb-2">Enlace no válido</h1>
                <p className="font-body text-sm text-muted-foreground">
                  Este enlace de gestión no existe o ya no está disponible. Si crees que es un error,
                  escríbenos por WhatsApp.
                </p>
              </div>
            )}

            {!loading && publicacion && (
              <div>
                <div className="w-8 h-0.5 bg-primary mb-5" aria-hidden="true" />
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">Tu publicación</h1>
                <p className="font-body text-sm text-muted-foreground mb-6">
                  {publicacion.tipo_inmueble} en {publicacion.barrio ? `${publicacion.barrio}, ` : ""}{publicacion.ciudad}
                </p>

                <div className="bg-muted/20 border border-foreground/10 p-5 mb-6 flex items-center gap-4">
                  <div className="w-16 h-16 shrink-0 bg-background overflow-hidden">
                    <img src={publicacion.foto_portada || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-heading text-xs font-semibold tracking-widest uppercase text-primary mb-1">
                      {estadoLabel[publicacion.estado] ?? publicacion.estado}
                    </p>
                    {publicacion.estado === "Rechazada" && publicacion.motivo_rechazo && (
                      <p className="font-body text-xs text-muted-foreground">{publicacion.motivo_rechazo}</p>
                    )}
                  </div>
                </div>

                {publicacion.estado !== "Rechazada" && (
                  <>
                    <p className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">
                      Cambiar estado
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        disabled={saving || publicacion.estado === "Disponible"}
                        onClick={() => cambiarEstado("Disponible")}
                        className="flex items-center gap-3 py-3 px-4 border border-foreground/10 font-body text-sm text-left hover:border-primary/40 disabled:opacity-40 transition-colors"
                      >
                        <Home size={18} className="text-primary" /> Sigue disponible
                      </button>
                      <button
                        disabled={saving || publicacion.estado === "Alquilada"}
                        onClick={() => cambiarEstado("Alquilada")}
                        className="flex items-center gap-3 py-3 px-4 border border-foreground/10 font-body text-sm text-left hover:border-primary/40 disabled:opacity-40 transition-colors"
                      >
                        <CheckCircle2 size={18} className="text-primary" /> Ya se alquiló — quitar de la lista
                      </button>
                      <button
                        disabled={saving || publicacion.estado === "Pausada"}
                        onClick={() => cambiarEstado("Pausada")}
                        className="flex items-center gap-3 py-3 px-4 border border-foreground/10 font-body text-sm text-left hover:border-primary/40 disabled:opacity-40 transition-colors"
                      >
                        <PauseCircle size={18} className="text-primary" /> Pausar temporalmente
                      </button>
                    </div>
                  </>
                )}

                {publicacion.estado === "Rechazada" && (
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <XCircle size={18} className="shrink-0 mt-0.5" />
                    <p className="font-body text-xs">
                      Si crees que esto es un error, escríbenos por WhatsApp y lo revisamos contigo.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default EmergenciaMiPublicacion;
