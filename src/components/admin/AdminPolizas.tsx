import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, AlertTriangle, DollarSign, RefreshCw } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type Contrato = {
  id: string;
  propiedad_id: string;
  inquilino_nombre: string;
  poliza_compania: string | null;
  poliza_compania_otra: string | null;
  poliza_valor: number | null;
  poliza_fecha_inicio: string | null;
};

type PagoPoliza = {
  id: string;
  contrato_id: string;
  anio: number;
  mes: number | null;
  valor: number | null;
  fecha_pago: string | null;
  estado: string;
  notas: string | null;
};

type Prop = { id: string; nombre_inmueble: string };

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const MESES_LARGO = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIA_MS = 86400000;

const fmt = (n: number | null | undefined) =>
  n == null ? "—" : new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

const nombreCompania = (c: Contrato) => c.poliza_compania === "Otra" ? (c.poliza_compania_otra || "Otra") : c.poliza_compania;

const vencimientoSura = (fechaInicio: string) => {
  const d = new Date(fechaInicio + "T00:00:00");
  d.setFullYear(d.getFullYear() + 1);
  return d;
};

const AdminPolizas = () => {
  const { toast } = useToast();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [pagos, setPagos] = useState<PagoPoliza[]>([]);
  const [props, setProps] = useState<Record<string, Prop>>({});
  const [loading, setLoading] = useState(true);

  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);
  const [pagoOpen, setPagoOpen] = useState(false);
  const [pagoForm, setPagoForm] = useState<Partial<PagoPoliza>>({});
  const [renovarOpen, setRenovarOpen] = useState(false);
  const [renovarContrato, setRenovarContrato] = useState<Contrato | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [cRes, pRes, prRes] = await Promise.all([
      (supabase as any).from("contratos_arrendamiento").select("*").eq("poliza_asegurado", true).eq("estado_contrato", "Activo"),
      (supabase as any).from("pagos_poliza").select("*").eq("anio", year),
      supabase.from("propiedades").select("id, nombre_inmueble"),
    ]);
    setContratos((cRes.data || []) as Contrato[]);
    setPagos((pRes.data || []) as PagoPoliza[]);
    const pm: Record<string, Prop> = {};
    ((prRes.data || []) as Prop[]).forEach(p => { pm[p.id] = p; });
    setProps(pm);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [year]);

  const pagoOf = (contratoId: string, mes: number) =>
    pagos.find(p => p.contrato_id === contratoId && p.mes === mes);

  const stats = useMemo(() => {
    const activas = contratos.length;
    const valorTotal = contratos.reduce((s, c) => s + (c.poliza_valor || 0), 0);
    const proximasVencer = contratos.filter(c => {
      if (c.poliza_compania !== "Sura" || !c.poliza_fecha_inicio) return false;
      const dias = Math.ceil((vencimientoSura(c.poliza_fecha_inicio).getTime() - today.getTime()) / DIA_MS);
      return dias <= 60;
    }).length;
    return { activas, valorTotal, proximasVencer };
  }, [contratos]);

  const openPagoForm = (contrato: Contrato, mes: number) => {
    const existing = pagoOf(contrato.id, mes);
    setSelectedContrato(contrato);
    setPagoForm(existing || {
      contrato_id: contrato.id,
      anio: year,
      mes,
      valor: contrato.poliza_valor,
      fecha_pago: "",
      estado: "Pendiente",
      notas: "",
    });
    setPagoOpen(true);
  };

  const savePago = async () => {
    setSaving(true);
    try {
      const payload: any = {
        contrato_id: pagoForm.contrato_id,
        anio: pagoForm.anio,
        mes: pagoForm.mes,
        valor: pagoForm.valor,
        fecha_pago: pagoForm.fecha_pago || null,
        estado: pagoForm.estado,
        notas: pagoForm.notas || null,
      };
      if ((pagoForm as any).id) {
        const { error } = await (supabase as any).from("pagos_poliza").update(payload).eq("id", (pagoForm as any).id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("pagos_poliza").insert(payload);
        if (error) throw error;
      }
      toast({ title: "Pago de póliza guardado" });
      setPagoOpen(false);
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const confirmarRenovacion = async () => {
    if (!renovarContrato) return;
    setSaving(true);
    try {
      const hoy = new Date().toISOString().split("T")[0];
      const { error: e1 } = await (supabase as any).from("pagos_poliza").insert({
        contrato_id: renovarContrato.id,
        anio: year,
        mes: null,
        valor: renovarContrato.poliza_valor,
        fecha_pago: hoy,
        estado: "Pagado",
      });
      if (e1) throw e1;
      const { error: e2 } = await (supabase as any).from("contratos_arrendamiento").update({ poliza_fecha_inicio: hoy }).eq("id", renovarContrato.id);
      if (e2) throw e2;
      toast({ title: "Póliza renovada" });
      setRenovarOpen(false);
      loadData();
    } catch (err: any) {
      toast({ title: "Error al renovar", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  const Card = ({ icon: Icon, label, value, color = "text-primary" }: any) => (
    <div className="border border-foreground/10 bg-background p-3 md:p-4 flex items-center gap-3">
      <div className={`w-9 h-9 flex items-center justify-center bg-primary/10 ${color}`}><Icon size={18} /></div>
      <div className="min-w-0">
        <p className="font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase truncate">{label}</p>
        <p className={`font-heading text-base md:text-lg font-bold ${color} truncate`}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-heading text-xl font-bold text-foreground">Pólizas de Seguro</h2>
        <select value={year} onChange={e => setYear(parseInt(e.target.value))}
          className="border border-foreground/10 py-1.5 px-3 font-body text-sm bg-background focus:border-primary focus:outline-none">
          {[today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card icon={ShieldCheck} label="Pólizas activas" value={stats.activas} />
        <Card icon={DollarSign} label="Valor total en pólizas" value={fmt(stats.valorTotal)} color="text-green-600" />
        <Card icon={AlertTriangle} label="Sura por vencer (≤60d)" value={stats.proximasVencer} color="text-destructive" />
      </div>

      {contratos.length === 0 ? (
        <p className="p-8 text-center font-body text-muted-foreground border border-foreground/10">
          No hay inmuebles asegurados registrados. Marca "Inmueble asegurado: Sí" en el contrato de arrendamiento para hacerle seguimiento aquí.
        </p>
      ) : (
        <div className="space-y-4">
          {contratos.map(c => {
            const prop = props[c.propiedad_id];
            const esSura = c.poliza_compania === "Sura";
            const vencimiento = esSura && c.poliza_fecha_inicio ? vencimientoSura(c.poliza_fecha_inicio) : null;
            const diasRestantes = vencimiento ? Math.ceil((vencimiento.getTime() - today.getTime()) / DIA_MS) : null;
            const alerta = diasRestantes != null && diasRestantes <= 60;

            return (
              <div key={c.id} className="border border-foreground/10 p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                  <div>
                    <p className="font-heading font-semibold text-foreground">{prop?.nombre_inmueble || "Inmueble"}</p>
                    <p className="font-body text-xs text-muted-foreground">{c.inquilino_nombre} · {nombreCompania(c)} · {fmt(c.poliza_valor)}</p>
                  </div>
                  {esSura ? (
                    <div className="flex items-center gap-3">
                      {vencimiento && (
                        <span className={`font-heading text-xs font-bold uppercase tracking-wider px-2 py-1 border ${alerta ? "bg-destructive/10 text-destructive border-destructive/40" : "bg-green-100 text-green-700 border-green-500/40 dark:bg-green-950/40 dark:text-green-400"}`}>
                          {diasRestantes! < 0 ? "Vencida" : `Vence en ${diasRestantes} días`} ({vencimiento.toLocaleDateString("es-CO")})
                        </span>
                      )}
                      <button
                        onClick={() => { setRenovarContrato(c); setRenovarOpen(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary-hover transition-colors"
                      >
                        <RefreshCw size={13} /> Marcar renovado
                      </button>
                    </div>
                  ) : null}
                </div>

                {!esSura && (
                  <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
                    {MESES.map((_, idx) => {
                      const mes = idx + 1;
                      const p = pagoOf(c.id, mes);
                      const pagado = p?.estado === "Pagado";
                      const isPast = year < today.getFullYear() || (year === today.getFullYear() && mes <= today.getMonth() + 1);
                      const status = pagado ? "pagado" : isPast ? "vencido" : "pendiente";
                      const colors: Record<string, string> = {
                        pagado: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 border-green-500/40",
                        vencido: "bg-destructive/10 text-destructive border-destructive/40",
                        pendiente: "bg-muted/40 text-muted-foreground border-foreground/10",
                      };
                      return (
                        <button
                          key={mes}
                          onClick={() => openPagoForm(c, mes)}
                          className={`px-1.5 py-2 border text-[10px] font-heading font-bold uppercase tracking-wider transition-opacity hover:opacity-80 ${colors[status]}`}
                          title={`${MESES_LARGO[idx]} ${year}`}
                        >
                          {MESES[idx]}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pago mensual dialog */}
      <Dialog open={pagoOpen} onOpenChange={o => !o && setPagoOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              Pago póliza {pagoForm.mes ? MESES_LARGO[pagoForm.mes - 1] : ""} {pagoForm.anio}
            </DialogTitle>
          </DialogHeader>
          {selectedContrato && (
            <div className="mt-4 space-y-4">
              <div className="bg-muted/30 p-3 text-xs font-body">
                <p><strong>Inmueble:</strong> {props[selectedContrato.propiedad_id]?.nombre_inmueble}</p>
                <p><strong>Compañía:</strong> {nombreCompania(selectedContrato)}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Valor</label>
                  <input type="number" value={pagoForm.valor ?? ""} onFocus={(e) => e.target.select()} onChange={e => setPagoForm(f => ({ ...f, valor: e.target.value === "" ? null : Number(e.target.value) }))}
                    className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none bg-background" />
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Fecha pago</label>
                  <input type="date" value={pagoForm.fecha_pago ?? ""} onChange={e => setPagoForm(f => ({ ...f, fecha_pago: e.target.value }))}
                    className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none bg-background" />
                </div>
              </div>
              <div>
                <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Estado</label>
                <select value={pagoForm.estado} onChange={e => setPagoForm(f => ({ ...f, estado: e.target.value }))}
                  className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none bg-background">
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pagado">Pagado</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setPagoOpen(false)} className="flex-1 py-2.5 border border-foreground/20 font-heading text-sm font-semibold tracking-widest uppercase hover:bg-muted/20 transition-colors">Cancelar</button>
                <button onClick={savePago} disabled={saving} className="flex-1 py-2.5 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Guardar pago
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Renovación Sura dialog */}
      <Dialog open={renovarOpen} onOpenChange={o => !o && setRenovarOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Marcar póliza renovada</DialogTitle>
          </DialogHeader>
          {renovarContrato && (
            <div className="mt-4 space-y-4">
              <p className="font-body text-sm text-muted-foreground">
                Se registrará el pago anual de <strong>{fmt(renovarContrato.poliza_valor)}</strong> con fecha de hoy y se actualizará la
                vigencia de la póliza Sura de <strong>{props[renovarContrato.propiedad_id]?.nombre_inmueble}</strong> por un año más.
              </p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setRenovarOpen(false)} className="flex-1 py-2.5 border border-foreground/20 font-heading text-sm font-semibold tracking-widest uppercase hover:bg-muted/20 transition-colors">Cancelar</button>
                <button onClick={confirmarRenovacion} disabled={saving} className="flex-1 py-2.5 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Confirmar renovación
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPolizas;
