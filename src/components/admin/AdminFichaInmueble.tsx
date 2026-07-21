import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import {
  Loader2, FileText, Download, Building2, Calendar, ShieldCheck, UserPlus, History,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import AdminContratoArrendamiento from "@/components/admin/AdminContratoArrendamiento";

type Propiedad = Tables<"propiedades">;
type Contrato = Tables<"contratos_arrendamiento">;

const fmt = (n: number | null | undefined) =>
  n == null ? "—" : new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("es-CO") : "—";

const labelCls = "font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase block mb-1";

interface Props {
  open: boolean;
  onClose: () => void;
  propiedadId: string;
  onChanged?: () => void;
}

const AdminFichaInmueble = ({ open, onClose, propiedadId, onChanged }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [propiedad, setPropiedad] = useState<Propiedad | null>(null);
  const [contratoActivo, setContratoActivo] = useState<Contrato | null>(null);
  const [contratosHistoricos, setContratosHistoricos] = useState<Contrato[]>([]);
  const [citasStats, setCitasStats] = useState({ total: 0, pendiente: 0, confirmada: 0, cancelada: 0 });
  const [busy, setBusy] = useState(false);

  const [contratoModalOpen, setContratoModalOpen] = useState(false);
  const [contratoModalExistingId, setContratoModalExistingId] = useState<string | null>(null);

  const loadFicha = async () => {
    setLoading(true);
    const [propRes, activoRes, histRes, reservasRes, slotsRes] = await Promise.all([
      supabase.from("propiedades").select("*").eq("id", propiedadId).single(),
      (supabase as any).from("contratos_arrendamiento").select("*").eq("propiedad_id", propiedadId).eq("estado_contrato", "Activo").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      (supabase as any).from("contratos_arrendamiento").select("*").eq("propiedad_id", propiedadId).eq("estado_contrato", "Finalizado").order("fecha_fin", { ascending: false }),
      supabase.from("citas_reservas").select("id, slot_id, propiedad_id, estado").neq("estado", "Eliminada"),
      supabase.from("citas_disponibles").select("id, propiedad_id"),
    ]);
    setPropiedad((propRes.data as Propiedad) || null);
    setContratoActivo((activoRes.data as Contrato) || null);
    setContratosHistoricos((histRes.data || []) as Contrato[]);

    const slotProp: Record<string, string | null> = {};
    (slotsRes.data || []).forEach((s: any) => { slotProp[s.id] = s.propiedad_id; });
    const reservasInmueble = (reservasRes.data || []).filter((r: any) => {
      const pid = r.propiedad_id || (r.slot_id ? slotProp[r.slot_id] : null);
      return pid === propiedadId;
    });
    setCitasStats({
      total: reservasInmueble.length,
      pendiente: reservasInmueble.filter((r: any) => r.estado === "Pendiente").length,
      confirmada: reservasInmueble.filter((r: any) => r.estado === "Confirmada").length,
      cancelada: reservasInmueble.filter((r: any) => r.estado === "Cancelada").length,
    });
    setLoading(false);
  };

  useEffect(() => {
    if (open && propiedadId) loadFicha();
  }, [open, propiedadId]);

  const descargarDoc = async (path: string) => {
    const { data, error } = await supabase.storage.from("contratos-docs").createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) {
      toast({ title: "No se pudo generar el enlace de descarga", variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const cambiarEstadoInmueble = async (nuevoEstado: string) => {
    if (!propiedad) return;
    setBusy(true);
    const { error } = await supabase.from("propiedades").update({ estado: nuevoEstado }).eq("id", propiedad.id);
    setBusy(false);
    if (error) {
      toast({ title: "Error al cambiar estado", variant: "destructive" });
      return;
    }
    toast({ title: `Estado → ${nuevoEstado}` });
    loadFicha();
    onChanged?.();
  };

  const finalizarContrato = async (contratoId: string) => {
    if (!confirm("¿Finalizar este contrato? Pasará al historial de arrendatarios.")) return;
    setBusy(true);
    const hoy = new Date().toISOString().split("T")[0];
    const { error } = await (supabase as any).from("contratos_arrendamiento").update({ estado_contrato: "Finalizado", fecha_fin: hoy }).eq("id", contratoId);
    setBusy(false);
    if (error) {
      toast({ title: "Error al finalizar contrato", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Contrato finalizado" });
    loadFicha();
    onChanged?.();
  };

  const registrarNuevoArrendatario = async () => {
    if (contratoActivo) {
      if (!confirm("Esto finalizará el contrato actual y abrirá un formulario nuevo para el arrendatario entrante. ¿Continuar?")) return;
      setBusy(true);
      const hoy = new Date().toISOString().split("T")[0];
      const { error } = await (supabase as any).from("contratos_arrendamiento").update({ estado_contrato: "Finalizado", fecha_fin: hoy }).eq("id", contratoActivo.id);
      setBusy(false);
      if (error) {
        toast({ title: "Error al finalizar contrato anterior", description: error.message, variant: "destructive" });
        return;
      }
      await loadFicha();
    }
    setContratoModalExistingId(null);
    setContratoModalOpen(true);
  };

  const editarContrato = () => {
    if (!contratoActivo) return;
    setContratoModalExistingId(contratoActivo.id);
    setContratoModalOpen(true);
  };

  const handleContratoClose = () => {
    setContratoModalOpen(false);
    loadFicha();
    onChanged?.();
  };

  const DocLinks = ({ docs }: { docs: string[] }) => (
    <ul className="space-y-1">
      {docs.length === 0 && <li className="font-body text-xs text-muted-foreground">Sin documentos</li>}
      {docs.map((path, i) => {
        const name = path.split("/").pop()?.replace(/^\d+-/, "") ?? "documento";
        return (
          <li key={i}>
            <button onClick={() => descargarDoc(path)} className="flex items-center gap-1.5 text-xs font-body text-primary hover:underline">
              <Download size={12} /> {name}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin">
          {loading || !propiedad ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
          ) : (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">{propiedad.nombre_inmueble}</DialogTitle>
                <p className="font-body text-sm text-muted-foreground">
                  {propiedad.direccion}{propiedad.barrio ? ` · ${propiedad.barrio}` : ""} · {propiedad.tipo_inmueble} en {propiedad.tipo_negocio} · {fmt(propiedad.precio)}
                </p>
              </DialogHeader>

              {/* Fotos */}
              {(propiedad.foto_portada || (propiedad.fotos && propiedad.fotos.length > 0)) && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {propiedad.foto_portada && (
                    <img src={propiedad.foto_portada} alt="" className="h-28 w-40 object-cover shrink-0" />
                  )}
                  {(propiedad.fotos || []).map((url, i) => (
                    <img key={i} src={url} alt="" className="h-28 w-40 object-cover shrink-0" />
                  ))}
                </div>
              )}

              {/* Estado + datos básicos */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelCls}>Estado</label>
                  <select
                    value={propiedad.estado}
                    onChange={(e) => cambiarEstadoInmueble(e.target.value)}
                    disabled={busy}
                    className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none bg-background"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Arrendado">Arrendado</option>
                    <option value="Vendido">Vendido</option>
                    <option value="Descartado">Descartado</option>
                  </select>
                </div>
                <div><label className={labelCls}>Área</label><p className="font-body text-sm">{propiedad.area_m2 ?? "—"} m²</p></div>
                <div><label className={labelCls}>Habitaciones</label><p className="font-body text-sm">{propiedad.habitaciones ?? "—"}</p></div>
                <div><label className={labelCls}>Baños</label><p className="font-body text-sm">{propiedad.banos ?? "—"}</p></div>
              </div>

              {propiedad.descripcion && (
                <div>
                  <label className={labelCls}>Descripción</label>
                  <p className="font-body text-sm text-foreground whitespace-pre-line">{propiedad.descripcion}</p>
                </div>
              )}

              {/* Citas */}
              <section>
                <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2 mb-3 pb-2 border-b border-foreground/10">
                  <Calendar size={15} className="text-primary" /> Citas / Visitas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="border border-foreground/10 p-3"><p className={labelCls}>Total</p><p className="font-heading text-lg font-bold text-primary">{citasStats.total}</p></div>
                  <div className="border border-foreground/10 p-3"><p className={labelCls}>Pendientes</p><p className="font-heading text-lg font-bold">{citasStats.pendiente}</p></div>
                  <div className="border border-foreground/10 p-3"><p className={labelCls}>Confirmadas</p><p className="font-heading text-lg font-bold text-green-600">{citasStats.confirmada}</p></div>
                  <div className="border border-foreground/10 p-3"><p className={labelCls}>Canceladas</p><p className="font-heading text-lg font-bold text-destructive">{citasStats.cancelada}</p></div>
                </div>
              </section>

              {/* Contrato actual */}
              <section>
                <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2 mb-3 pb-2 border-b border-foreground/10">
                  <Building2 size={15} className="text-primary" /> Contrato actual
                </h3>
                {contratoActivo ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm font-body">
                      <div>
                        <p className="font-heading text-xs font-semibold text-primary uppercase mb-1">Inquilino</p>
                        <p>{contratoActivo.inquilino_nombre}</p>
                        <p className="text-muted-foreground">CC {contratoActivo.inquilino_cedula} · {contratoActivo.inquilino_celular}</p>
                        {contratoActivo.inquilino_correo && <p className="text-muted-foreground">{contratoActivo.inquilino_correo}</p>}
                        <p className="text-muted-foreground mt-1">Inicio: {fmtDate(contratoActivo.fecha_inicio)}</p>
                        <p className="text-muted-foreground">Canon: {fmt(contratoActivo.valor_canon)}</p>
                      </div>
                      <div>
                        <p className="font-heading text-xs font-semibold text-primary uppercase mb-1">Propietario</p>
                        <p>{contratoActivo.propietario_nombre || "—"}</p>
                        {contratoActivo.propietario_celular && (
                          <p className="text-muted-foreground">{contratoActivo.propietario_celular}</p>
                        )}
                        <p className="text-muted-foreground">{contratoActivo.propietario_banco} {contratoActivo.propietario_tipo_cuenta}</p>
                        <p className="text-muted-foreground">Cta: {contratoActivo.propietario_num_cuenta || "—"}</p>
                        <p className="text-muted-foreground mt-1">Pago: {fmt(contratoActivo.valor_pago_propietario)}</p>
                      </div>
                    </div>

                    {contratoActivo.poliza_asegurado && (
                      <div className="bg-primary/5 border border-primary/20 p-3 text-xs font-body">
                        <p className="font-heading text-[10px] font-semibold tracking-widest text-primary uppercase mb-1 flex items-center gap-1">
                          <ShieldCheck size={12} /> Póliza
                        </p>
                        <p>{contratoActivo.poliza_compania === "Otra" ? contratoActivo.poliza_compania_otra : contratoActivo.poliza_compania} · {fmt(contratoActivo.poliza_valor)} · desde {fmtDate(contratoActivo.poliza_fecha_inicio)}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className={labelCls}>Documentos inquilino</p>
                        <DocLinks docs={contratoActivo.docs_inquilino || []} />
                      </div>
                      <div>
                        <p className={labelCls}>Documentos codeudor</p>
                        <DocLinks docs={contratoActivo.docs_codeudor || []} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button onClick={editarContrato} className="px-4 py-2 bg-primary text-primary-foreground font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors">
                        Editar contrato
                      </button>
                      <button onClick={() => finalizarContrato(contratoActivo.id)} disabled={busy} className="px-4 py-2 border border-foreground/20 font-heading text-xs font-semibold tracking-widest uppercase hover:bg-muted/20 transition-colors disabled:opacity-50">
                        Finalizar contrato
                      </button>
                      <button onClick={registrarNuevoArrendatario} disabled={busy} className="flex items-center gap-1.5 px-4 py-2 border border-foreground/20 font-heading text-xs font-semibold tracking-widest uppercase hover:bg-muted/20 transition-colors disabled:opacity-50">
                        <UserPlus size={13} /> Registrar nuevo arrendatario
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="font-body text-sm text-muted-foreground mb-3">No hay un contrato activo para este inmueble.</p>
                    {propiedad.tipo_negocio === "Alquiler" && (
                      <button onClick={registrarNuevoArrendatario} className="flex items-center gap-1.5 mx-auto px-4 py-2 bg-primary text-primary-foreground font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors">
                        <UserPlus size={13} /> Registrar arrendatario
                      </button>
                    )}
                  </div>
                )}
              </section>

              {/* Historial */}
              {contratosHistoricos.length > 0 && (
                <section>
                  <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2 mb-3 pb-2 border-b border-foreground/10">
                    <History size={15} className="text-primary" /> Historial de arrendatarios
                  </h3>
                  <div className="space-y-3">
                    {contratosHistoricos.map((c) => (
                      <div key={c.id} className="border border-foreground/10 p-3 text-xs font-body">
                        <p className="font-heading text-sm font-semibold text-foreground">{c.inquilino_nombre}</p>
                        <p className="text-muted-foreground">{fmtDate(c.fecha_inicio)} — {fmtDate(c.fecha_fin)} · Canon: {fmt(c.valor_canon)}</p>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <DocLinks docs={c.docs_inquilino || []} />
                          <DocLinks docs={c.docs_codeudor || []} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {propiedad && (
        <AdminContratoArrendamiento
          open={contratoModalOpen}
          onClose={handleContratoClose}
          propiedad={propiedad}
          existingId={contratoModalExistingId}
        />
      )}
    </>
  );
};

export default AdminFichaInmueble;
