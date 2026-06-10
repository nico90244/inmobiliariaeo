import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, DollarSign, AlertCircle, CheckCircle2, Building2, Plus } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type Contrato = {
  id: string;
  propiedad_id: string;
  inquilino_nombre: string;
  valor_canon: number | null;
  dia_pago_inquilino: number | null;
  fecha_inicio: string | null;
  propietario_nombre: string | null;
  valor_pago_propietario: number | null;
  dia_pago_propietario: number | null;
};

type Pago = {
  id: string;
  contrato_id: string;
  anio: number;
  mes: number;
  valor_canon: number | null;
  valor_administracion: number | null;
  valor_recibido: number | null;
  fecha_pago_inquilino: string | null;
  estado_inquilino: string;
  valor_propietario: number | null;
  fecha_pago_propietario: string | null;
  estado_propietario: string;
  notas: string | null;
};

type Prop = { id: string; nombre_inmueble: string; direccion: string | null };

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const MESES_LARGO = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const fmt = (n: number | null | undefined) =>
  n == null ? "—" : new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

const AdminAlquileres = () => {
  const { toast } = useToast();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [props, setProps] = useState<Record<string, Prop>>({});
  const [loading, setLoading] = useState(true);

  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);
  const [pagoOpen, setPagoOpen] = useState(false);
  const [pagoForm, setPagoForm] = useState<Partial<Pago>>({});
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [cRes, pRes, prRes] = await Promise.all([
      (supabase as any).from("contratos_arrendamiento").select("*"),
      (supabase as any).from("pagos_alquiler").select("*").eq("anio", year),
      supabase.from("propiedades").select("id, nombre_inmueble, direccion"),
    ]);
    setContratos((cRes.data || []) as Contrato[]);
    setPagos((pRes.data || []) as Pago[]);
    const pm: Record<string, Prop> = {};
    ((prRes.data || []) as Prop[]).forEach(p => { pm[p.id] = p; });
    setProps(pm);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [year]);

  const pagoOf = (contratoId: string, mes: number) =>
    pagos.find(p => p.contrato_id === contratoId && p.mes === mes);

  // Stats
  const stats = useMemo(() => {
    const totalContratos = contratos.length;
    const totalRecibido = pagos.reduce((s, p) => s + (p.valor_recibido || 0), 0);
    const totalPagadoProp = pagos
      .filter(p => p.estado_propietario === "Pagado")
      .reduce((s, p) => s + (p.valor_propietario || 0), 0);
    const totalAdmin = pagos
      .filter(p => p.estado_inquilino === "Recibido")
      .reduce((s, p) => s + (p.valor_administracion || 0), 0);

    // Cartera vencida: pagos del mes actual o anteriores no recibidos
    const cartera = contratos.reduce((sum, c) => {
      for (let m = 1; m <= today.getMonth() + 1; m++) {
        if (year > today.getFullYear()) continue;
        const p = pagoOf(c.id, m);
        if (!p || p.estado_inquilino !== "Recibido") {
          sum += c.valor_canon || 0;
        }
      }
      return sum;
    }, 0);

    return { totalContratos, totalRecibido, totalPagadoProp, totalAdmin, cartera };
  }, [contratos, pagos, year]);

  const openPagoForm = (contrato: Contrato, mes: number) => {
    const existing = pagoOf(contrato.id, mes);
    setSelectedContrato(contrato);
    setPagoForm(existing || {
      contrato_id: contrato.id,
      anio: year,
      mes,
      valor_canon: contrato.valor_canon,
      valor_administracion: 0,
      valor_recibido: contrato.valor_canon,
      valor_propietario: contrato.valor_pago_propietario || contrato.valor_canon,
      estado_inquilino: "Pendiente",
      estado_propietario: "Pendiente",
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
        valor_canon: pagoForm.valor_canon,
        valor_administracion: pagoForm.valor_administracion,
        valor_recibido: pagoForm.valor_recibido,
        fecha_pago_inquilino: pagoForm.fecha_pago_inquilino || null,
        estado_inquilino: pagoForm.estado_inquilino,
        valor_propietario: pagoForm.valor_propietario,
        fecha_pago_propietario: pagoForm.fecha_pago_propietario || null,
        estado_propietario: pagoForm.estado_propietario,
        notas: pagoForm.notas || null,
      };
      if ((pagoForm as any).id) {
        const { error } = await (supabase as any).from("pagos_alquiler").update(payload).eq("id", (pagoForm as any).id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("pagos_alquiler").insert(payload);
        if (error) throw error;
      }
      toast({ title: "Pago guardado" });
      setPagoOpen(false);
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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
        <h2 className="font-heading text-xl font-bold text-foreground">Administración de Alquileres</h2>
        <select value={year} onChange={e => setYear(parseInt(e.target.value))}
          className="border border-foreground/10 py-1.5 px-3 font-body text-sm bg-background focus:border-primary focus:outline-none">
          {[today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card icon={Building2} label="Contratos activos" value={stats.totalContratos} />
        <Card icon={DollarSign} label="Recibido del año" value={fmt(stats.totalRecibido)} color="text-green-600" />
        <Card icon={DollarSign} label="Pagado a propietarios" value={fmt(stats.totalPagadoProp)} color="text-blue-600" />
        <Card icon={DollarSign} label="Administración cobrada" value={fmt(stats.totalAdmin)} />
        <Card icon={AlertCircle} label="Cartera vencida" value={fmt(stats.cartera)} color="text-destructive" />
      </div>

      {contratos.length === 0 ? (
        <p className="p-8 text-center font-body text-muted-foreground border border-foreground/10">
          No hay contratos de arrendamiento registrados. Crea uno desde la sección de Propiedades marcando una propiedad de alquiler como "Arrendado".
        </p>
      ) : (
        <div className="overflow-x-auto border border-foreground/10">
          <table className="w-full text-xs">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left p-3 font-heading font-semibold tracking-widest text-muted-foreground uppercase">Inmueble / Inquilino</th>
                <th className="text-right p-3 font-heading font-semibold tracking-widest text-muted-foreground uppercase">Canon</th>
                {MESES.map(m => (
                  <th key={m} className="text-center p-2 font-heading font-semibold tracking-widest text-muted-foreground uppercase">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contratos.map(c => {
                const prop = props[c.propiedad_id];
                return (
                  <tr key={c.id} className="border-t border-foreground/5 hover:bg-muted/20">
                    <td className="p-3 font-body">
                      <p className="font-semibold text-foreground truncate max-w-[200px]">{prop?.nombre_inmueble || "Inmueble"}</p>
                      <p className="text-muted-foreground text-[11px] truncate max-w-[200px]">{c.inquilino_nombre}</p>
                    </td>
                    <td className="p-3 font-body text-right">{fmt(c.valor_canon)}</td>
                    {MESES.map((_, idx) => {
                      const mes = idx + 1;
                      const p = pagoOf(c.id, mes);
                      const recibido = p?.estado_inquilino === "Recibido";
                      const pagadoProp = p?.estado_propietario === "Pagado";
                      const isPast = year < today.getFullYear() || (year === today.getFullYear() && mes <= today.getMonth() + 1);
                      const status = !p ? (isPast ? "vencido" : "pendiente")
                        : recibido && pagadoProp ? "completo"
                        : recibido ? "parcial"
                        : "pendiente";
                      const colors: Record<string, string> = {
                        completo: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 border-green-500/40",
                        parcial: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-500/40",
                        vencido: "bg-destructive/10 text-destructive border-destructive/40",
                        pendiente: "bg-muted/40 text-muted-foreground border-foreground/10",
                      };
                      return (
                        <td key={mes} className="p-1 text-center">
                          <button
                            onClick={() => openPagoForm(c, mes)}
                            className={`w-full px-1.5 py-2 border text-[10px] font-heading font-bold uppercase tracking-wider transition-opacity hover:opacity-80 ${colors[status]}`}
                            title={`${MESES_LARGO[idx]} ${year}`}
                          >
                            {status === "completo" ? "✓✓" : status === "parcial" ? "✓" : status === "vencido" ? "!" : "+"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Leyenda */}
          <div className="flex items-center gap-4 p-3 border-t border-foreground/10 text-[11px] font-body text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500/40 border border-green-500" /> Completo</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500/40 border border-blue-500" /> Recibido (falta pagar al propietario)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-destructive/40 border border-destructive" /> Vencido</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-muted border border-foreground/20" /> Pendiente</span>
          </div>
        </div>
      )}

      {/* Pago dialog */}
      <Dialog open={pagoOpen} onOpenChange={o => !o && setPagoOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              Pago {pagoForm.mes ? MESES_LARGO[pagoForm.mes - 1] : ""} {pagoForm.anio}
            </DialogTitle>
          </DialogHeader>
          {selectedContrato && (
            <div className="mt-4 space-y-4">
              <div className="bg-muted/30 p-3 text-xs font-body">
                <p><strong>Inmueble:</strong> {props[selectedContrato.propiedad_id]?.nombre_inmueble}</p>
                <p><strong>Inquilino:</strong> {selectedContrato.inquilino_nombre}</p>
                <p><strong>Propietario:</strong> {selectedContrato.propietario_nombre || "—"}</p>
              </div>

              <div>
                <h4 className="font-heading text-xs font-semibold tracking-widest text-primary uppercase mb-2">Pago del Inquilino</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Valor canon" type="number" value={pagoForm.valor_canon ?? ""} onChange={v => setPagoForm(f => ({ ...f, valor_canon: v === "" ? null : Number(v) }))} />
                  <Field label="Valor administración" type="number" value={pagoForm.valor_administracion ?? ""} onChange={v => setPagoForm(f => ({ ...f, valor_administracion: v === "" ? null : Number(v) }))} />
                  <Field label="Valor recibido" type="number" value={pagoForm.valor_recibido ?? ""} onChange={v => setPagoForm(f => ({ ...f, valor_recibido: v === "" ? null : Number(v) }))} />
                  <Field label="Fecha pago" type="date" value={pagoForm.fecha_pago_inquilino ?? ""} onChange={v => setPagoForm(f => ({ ...f, fecha_pago_inquilino: v }))} />
                </div>
                <div className="mt-2">
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Estado</label>
                  <select value={pagoForm.estado_inquilino} onChange={e => setPagoForm(f => ({ ...f, estado_inquilino: e.target.value }))}
                    className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none bg-background">
                    <option value="Pendiente">Pendiente</option>
                    <option value="Recibido">Recibido</option>
                    <option value="Vencido">Vencido</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="font-heading text-xs font-semibold tracking-widest text-primary uppercase mb-2">Pago al Propietario</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Valor al propietario" type="number" value={pagoForm.valor_propietario ?? ""} onChange={v => setPagoForm(f => ({ ...f, valor_propietario: v === "" ? null : Number(v) }))} />
                  <Field label="Fecha pago" type="date" value={pagoForm.fecha_pago_propietario ?? ""} onChange={v => setPagoForm(f => ({ ...f, fecha_pago_propietario: v }))} />
                </div>
                <div className="mt-2">
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Estado</label>
                  <select value={pagoForm.estado_propietario} onChange={e => setPagoForm(f => ({ ...f, estado_propietario: e.target.value }))}
                    className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none bg-background">
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagado">Pagado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Notas</label>
                <textarea value={pagoForm.notas ?? ""} onChange={e => setPagoForm(f => ({ ...f, notas: e.target.value }))} rows={2}
                  className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none bg-background" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setPagoOpen(false)} className="flex-1 py-2.5 border border-foreground/20 font-heading text-sm font-semibold tracking-widest uppercase hover:bg-muted/20 transition-colors">Cancelar</button>
                <button onClick={savePago} disabled={saving} className="flex-1 py-2.5 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Guardar pago
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Field = ({ label, type, value, onChange }: { label: string; type: string; value: any; onChange: (v: string) => void }) => (
  <div>
    <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none bg-background" />
  </div>
);

export default AdminAlquileres;
