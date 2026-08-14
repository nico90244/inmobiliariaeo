import { useEffect, useState } from "react";
import { supabase, type TablesUpdate } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { Loader2, CheckCircle2, XCircle, PauseCircle, Home, Users, RefreshCw, BadgeCheck } from "lucide-react";

type Inmueble = Tables<"emergencia_inmuebles">;
type Buscador = Tables<"emergencia_buscadores">;

const fmt = (n: number | null | undefined) =>
  n == null ? "—" : new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

const estadoBadge: Record<string, string> = {
  Pendiente: "bg-primary/10 text-primary",
  Disponible: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  Alquilada: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  Pausada: "bg-muted text-muted-foreground",
  Rechazada: "bg-destructive/10 text-destructive",
};

const AdminEmergencia = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<"inmuebles" | "buscadores">("inmuebles");
  const [filtroEstado, setFiltroEstado] = useState<string>("Pendiente");
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [buscadores, setBuscadores] = useState<Buscador[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [iRes, bRes] = await Promise.all([
      supabase.from("emergencia_inmuebles").select("*").order("fecha_creacion", { ascending: false }),
      supabase.from("emergencia_buscadores").select("*").order("fecha_creacion", { ascending: false }),
    ]);
    setInmuebles((iRes.data || []) as Inmueble[]);
    setBuscadores((bRes.data || []) as Buscador[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const actualizarEstado = async (id: string, estado: Inmueble["estado"], motivo?: string) => {
    setSavingId(id);
    const { error } = await supabase
      .from("emergencia_inmuebles")
      .update({ estado, motivo_rechazo: motivo ?? null } satisfies TablesUpdate<"emergencia_inmuebles">)
      .eq("id", id);
    setSavingId(null);
    if (error) {
      toast({ title: "No se pudo actualizar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Actualizado" });
    load();
  };

  const rechazar = (id: string) => {
    const motivo = window.prompt("Motivo del rechazo (se lo mostraremos al oferente):") ?? "";
    actualizarEstado(id, "Rechazada", motivo || undefined);
  };

  const toggleInmobiliariaEO = async (inm: Inmueble) => {
    setSavingId(inm.id);
    const { error } = await supabase
      .from("emergencia_inmuebles")
      .update({ es_inmobiliaria_eo: !inm.es_inmobiliaria_eo } satisfies TablesUpdate<"emergencia_inmuebles">)
      .eq("id", inm.id);
    setSavingId(null);
    if (error) {
      toast({ title: "No se pudo actualizar", description: error.message, variant: "destructive" });
      return;
    }
    load();
  };

  const visibles = inmuebles.filter((i) => (filtroEstado === "Todos" ? true : i.estado === filtroEstado));

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={28} /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-lg font-bold text-foreground">Iniciativa Terremoto Colombia</h2>
        <button onClick={load} className="flex items-center gap-1.5 text-xs font-heading text-muted-foreground hover:text-primary transition-colors">
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-foreground/10">
        <button
          onClick={() => setTab("inmuebles")}
          className={`flex items-center gap-2 px-4 py-2.5 font-heading text-sm font-medium border-b-2 -mb-px transition-colors ${tab === "inmuebles" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Home size={16} /> Publicaciones ({inmuebles.filter((i) => i.estado === "Pendiente").length} pendientes)
        </button>
        <button
          onClick={() => setTab("buscadores")}
          className={`flex items-center gap-2 px-4 py-2.5 font-heading text-sm font-medium border-b-2 -mb-px transition-colors ${tab === "buscadores" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Users size={16} /> Buscadores ({buscadores.length})
        </button>
      </div>

      {tab === "inmuebles" && (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {["Todos", "Pendiente", "Disponible", "Alquilada", "Pausada", "Rechazada"].map((e) => (
              <button
                key={e}
                onClick={() => setFiltroEstado(e)}
                className={`px-3 py-1.5 font-heading text-xs font-medium transition-colors ${filtroEstado === e ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"}`}
              >
                {e}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {visibles.length === 0 && (
              <p className="font-body text-sm text-muted-foreground py-8 text-center">No hay publicaciones en este estado.</p>
            )}
            {visibles.map((inm) => (
              <div key={inm.id} className="border border-foreground/10 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-20 h-20 shrink-0 bg-muted/20 overflow-hidden">
                  <img src={inm.foto_portada || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-sm font-heading text-[10px] font-bold uppercase tracking-wide ${estadoBadge[inm.estado] || ""}`}>{inm.estado}</span>
                    {inm.es_inmobiliaria_eo && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-primary/10 text-primary font-heading text-[10px] font-bold uppercase tracking-wide">
                        <BadgeCheck size={11} /> Verificado EO
                      </span>
                    )}
                    <span className="font-heading text-sm font-semibold text-foreground">{inm.tipo_inmueble}</span>
                    <span className="font-body text-xs text-muted-foreground">· {inm.barrio}, {inm.ciudad}</span>
                  </div>
                  <p className="font-body text-xs text-muted-foreground">
                    {inm.nombre} · {inm.celular} · {inm.perfil}
                    {inm.tipo_gestion ? ` (${inm.tipo_gestion}${inm.sin_comision ? " · sin comisión" : inm.condiciones_comision ? ` · ${inm.condiciones_comision}` : ""})` : ""}
                    {inm.desea_administracion ? " · quiere administración (10%)" : ""}
                  </p>
                  <p className="font-body text-sm font-bold text-primary tabular-nums mt-1">{fmt(inm.canon)}/mes</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    disabled={savingId === inm.id}
                    onClick={() => toggleInmobiliariaEO(inm)}
                    title="Marcar como inventario propio de Inmobiliaria EO"
                    className={`flex items-center gap-1 px-3 py-2 border font-heading text-xs font-semibold transition-colors disabled:opacity-50 ${
                      inm.es_inmobiliaria_eo
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-foreground/10 text-muted-foreground hover:bg-foreground/5"
                    }`}
                  >
                    <BadgeCheck size={14} /> {inm.es_inmobiliaria_eo ? "Es EO" : "Marcar EO"}
                  </button>
                  {inm.estado !== "Disponible" && (
                    <button
                      disabled={savingId === inm.id}
                      onClick={() => actualizarEstado(inm.id, "Disponible")}
                      className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground font-heading text-xs font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} /> Aprobar
                    </button>
                  )}
                  {inm.estado !== "Pausada" && (
                    <button
                      disabled={savingId === inm.id}
                      onClick={() => actualizarEstado(inm.id, "Pausada")}
                      className="flex items-center gap-1 px-3 py-2 border border-foreground/10 font-heading text-xs font-semibold hover:bg-foreground/5 transition-colors disabled:opacity-50"
                    >
                      <PauseCircle size={14} /> Pausar
                    </button>
                  )}
                  {inm.estado !== "Rechazada" && (
                    <button
                      disabled={savingId === inm.id}
                      onClick={() => rechazar(inm.id)}
                      className="flex items-center gap-1 px-3 py-2 border border-red-500/30 text-red-700 font-heading text-xs font-semibold hover:bg-red-500/5 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={14} /> Rechazar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "buscadores" && (
        <div className="space-y-2">
          {buscadores.length === 0 && (
            <p className="font-body text-sm text-muted-foreground py-8 text-center">Aún no hay buscadores registrados.</p>
          )}
          {buscadores.map((b) => (
            <div key={b.id} className="border border-foreground/10 p-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-heading text-sm font-semibold text-foreground">{b.nombre} · {b.celular}</p>
                <p className="font-body text-xs text-muted-foreground">
                  {b.ciudad}{b.tipo_inmueble ? ` · ${b.tipo_inmueble}` : ""}{b.presupuesto ? ` · presupuesto ${fmt(b.presupuesto)}` : ""}
                </p>
              </div>
              <a
                href={`https://wa.me/57${b.celular.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-heading text-xs font-semibold text-primary hover:underline"
              >
                WhatsApp
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEmergencia;
