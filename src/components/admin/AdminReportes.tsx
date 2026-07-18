import { useEffect, useState, useMemo } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Loader2, CheckCircle2, Users, FileText, Wallet, Activity,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Propiedad = {
  id: string; nombre_inmueble: string; tipo_negocio: string;
  tipo_inmueble: string; estado: string; precio: number | null;
  barrio: string | null;
};
type Reserva = {
  id: string; propiedad_id: string | null; slot_id: string | null;
  estado: string; fecha_creacion: string;
};
type Slot = { id: string; propiedad_id: string | null };
type PagoAlquiler = {
  id: string; contrato_id: string; anio: number; mes: number;
  valor_administracion: number | null; valor_canon: number | null;
  valor_recibido: number | null; estado_inquilino: string; estado_propietario: string;
};
type Contrato = {
  id: string; propiedad_id: string; inquilino_nombre: string;
  valor_canon: number | null; valor_pago_propietario: number | null;
  estado_contrato: string; fecha_fin: string | null;
  poliza_asegurado: boolean; poliza_valor: number | null;
};
type Captacion = {
  id: string; estado: string | null; fecha_creacion: string;
  tipo_inmueble: string | null; tipo_negocio: string | null;
};
type PagoPoliza = {
  id: string; contrato_id: string; estado: string; valor: number | null; anio: number;
};

// ─── Palette ──────────────────────────────────────────────────────────────────
const GOLD  = "#C9A84C";
const GOLD2 = "#D4BC72";
const GOLD3 = "#DFCF98";
const GREEN = "#4ade80";
const BLUE  = "#60a5fa";
const RED   = "#f87171";
const AMBER = "#fb923c";
const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

const fK = fCOP;

const daysUntil = (dateStr: string): number =>
  Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);

// ─── Sub-components ───────────────────────────────────────────────────────────

const ChartTooltip = ({
  active, payload, label, currency = false,
}: { active?: boolean; payload?: any[]; label?: string; currency?: boolean }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A1A] border border-white/10 px-3 py-2 shadow-2xl text-xs">
      {label && <p className="font-heading text-[10px] tracking-widest text-white/40 uppercase mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-heading font-bold text-sm" style={{ color: p.fill || p.color || GOLD }}>
          {currency ? fCOP(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

const SectionTitle = ({ children, action }: { children: ReactNode; action?: ReactNode }) => (
  <div className="flex items-start justify-between mb-4 sm:mb-5">
    <div>
      <div className="w-8 h-0.5 bg-primary mb-2.5" aria-hidden="true" />
      <h3 className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        {children}
      </h3>
    </div>
    {action}
  </div>
);

const HeroKPI = ({
  label, value, sub, accent = GOLD,
}: { label: string; value: string | number; sub?: string; accent?: string }) => (
  <div className="flex flex-col gap-2">
    <div className="w-8 h-0.5 mb-1" style={{ background: accent }} aria-hidden="true" />
    <p className="font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">{label}</p>
    <p
      className="font-heading text-4xl sm:text-5xl font-bold text-foreground leading-none tabular-nums"
      aria-label={`${label}: ${value}`}
    >{value}</p>
    {sub && <p className="font-body text-xs text-muted-foreground">{sub}</p>}
  </div>
);

const KPICard = ({
  icon: Icon, label, value, sub, accent = GOLD,
}: { icon: any; label: string; value: string | number; sub?: string; accent?: string }) => (
  <div className="bg-background border border-foreground/10 p-4 sm:p-5 hover:border-foreground/25 transition-colors duration-200 flex flex-col gap-3 min-h-[110px]">
    <div className="flex items-start justify-between gap-2">
      <span className="font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase leading-tight">
        {label}
      </span>
      <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18` }}>
        <Icon size={15} style={{ color: accent }} />
      </div>
    </div>
    <div className="mt-auto">
      <p className="font-heading text-xl sm:text-2xl font-bold text-foreground leading-none mb-1 tabular-nums">{value}</p>
      {sub && <p className="font-body text-[11px] text-muted-foreground leading-tight">{sub}</p>}
    </div>
  </div>
);

const DonutChart = ({
  data, centerLabel, centerSub, height = 180,
}: { data: { name: string; value: number; color: string }[]; centerLabel: string | number; centerSub: string; height?: number }) => (
  <div className="relative">
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%"
          innerRadius={height * 0.27} outerRadius={height * 0.42}
          paddingAngle={data.length > 1 ? 3 : 0}
          dataKey="value" strokeWidth={0} animationBegin={0} animationDuration={700}>
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip content={({ active, payload }: any) => {
          if (!active || !payload?.length) return null;
          const p = payload[0];
          return (
            <div className="bg-[#1A1A1A] border border-white/10 px-3 py-2 shadow-2xl text-xs">
              <p className="font-heading text-[10px] tracking-widest text-white/40 uppercase mb-0.5">{p.name}</p>
              <p className="font-heading font-bold text-base" style={{ color: p.payload?.color || GOLD }}>{p.value}</p>
            </div>
          );
        }} />
      </PieChart>
    </ResponsiveContainer>
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span className="font-heading text-2xl font-bold text-foreground tabular-nums">{centerLabel}</span>
      <span className="font-heading text-[9px] tracking-widest text-muted-foreground uppercase">{centerSub}</span>
    </div>
  </div>
);

const ChartLegend = ({ items }: { items: { name: string; color: string; value?: number | string }[] }) => (
  <div className="flex flex-col gap-2.5">
    {items.map(item => (
      <div key={item.name} className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 flex-shrink-0" style={{ background: item.color }} />
          <span className="font-body text-sm text-foreground/70 truncate">{item.name}</span>
        </div>
        {item.value !== undefined && (
          <span className="font-heading text-sm font-bold text-foreground ml-2 flex-shrink-0 tabular-nums">{item.value}</span>
        )}
      </div>
    ))}
  </div>
);

const HorizBar = ({ label, value, max, color = GOLD, sub }: {
  label: string; value: number; max: number; color?: string; sub?: string;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0 flex-1">
        <span className="font-body text-sm text-foreground/80 truncate block">{label}</span>
        {sub && <span className="font-body text-[10px] text-muted-foreground">{sub}</span>}
      </div>
      <span className="font-heading text-sm font-bold text-foreground flex-shrink-0 tabular-nums">{value}</span>
    </div>
    <div className="h-[3px] bg-foreground/5 overflow-hidden">
      <div className="h-full transition-all duration-700 ease-out"
        style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, background: color }} />
    </div>
  </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────
const AdminReportes = () => {
  const [loading, setLoading]       = useState(true);
  const [propiedades, setProp]      = useState<Propiedad[]>([]);
  const [reservas, setReservas]     = useState<Reserva[]>([]);
  const [slots, setSlots]           = useState<Slot[]>([]);
  const [pagos, setPagos]           = useState<PagoAlquiler[]>([]);
  const [contratos, setContratos]   = useState<Contrato[]>([]);
  const [captaciones, setCap]       = useState<Captacion[]>([]);
  const [pagosPoliza, setPolizas]   = useState<PagoPoliza[]>([]);
  const [anioSel, setAnioSel]       = useState(new Date().getFullYear());

  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    (async () => {
      const [pR, rR, sR, paR, cR, capR, ppR] = await Promise.all([
        supabase.from("propiedades").select("id, nombre_inmueble, tipo_negocio, tipo_inmueble, estado, precio, barrio"),
        supabase.from("citas_reservas").select("id, propiedad_id, slot_id, estado, fecha_creacion").neq("estado", "Eliminada"),
        supabase.from("citas_disponibles").select("id, propiedad_id"),
        (supabase as any).from("pagos_alquiler").select("id, contrato_id, anio, mes, valor_administracion, valor_canon, valor_recibido, estado_inquilino, estado_propietario"),
        (supabase as any).from("contratos_arrendamiento").select("id, propiedad_id, inquilino_nombre, valor_canon, valor_pago_propietario, estado_contrato, fecha_fin, poliza_asegurado, poliza_valor"),
        supabase.from("captaciones").select("id, estado, fecha_creacion, tipo_inmueble, tipo_negocio"),
        supabase.from("pagos_poliza").select("id, contrato_id, estado, valor, anio"),
      ]);
      setProp((pR.data || []) as Propiedad[]);
      setReservas((rR.data || []) as Reserva[]);
      setSlots((sR.data || []) as Slot[]);
      setPagos((paR.data || []) as PagoAlquiler[]);
      setContratos((cR.data || []) as Contrato[]);
      setCap((capR.data || []) as Captacion[]);
      setPolizas((ppR.data || []) as PagoPoliza[]);
      setLoading(false);
    })();
  }, []);

  // ── Portafolio ───────────────────────────────────────────────────────────
  const porEstado = useMemo(() => [
    { name: "Disponible", value: propiedades.filter(p => p.estado === "Disponible").length, color: GOLD },
    { name: "Arrendado",  value: propiedades.filter(p => p.estado === "Arrendado").length,  color: GREEN },
    { name: "Vendido",    value: propiedades.filter(p => p.estado === "Vendido").length,    color: BLUE },
  ].filter(d => d.value > 0), [propiedades]);

  const ocupacion = useMemo(() => {
    const total  = propiedades.filter(p => p.tipo_negocio === "Alquiler").length;
    const ocup   = propiedades.filter(p => p.estado === "Arrendado" && p.tipo_negocio === "Alquiler").length;
    return total > 0 ? Math.round((ocup / total) * 100) : 0;
  }, [propiedades]);

  const porTipo = useMemo(() => {
    const map: Record<string, number> = {};
    propiedades.forEach(p => { map[p.tipo_inmueble] = (map[p.tipo_inmueble] || 0) + 1; });
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return { entries, max: entries[0]?.[1] || 1 };
  }, [propiedades]);

  // ── Contratos ────────────────────────────────────────────────────────────
  const contratosStats = useMemo(() => {
    const activos = contratos.filter(c => c.estado_contrato === "Activo");
    const canonBruto      = activos.reduce((s, c) => s + (c.valor_canon || 0), 0);
    const pagoPropietario = activos.reduce((s, c) => s + (c.valor_pago_propietario || 0), 0);
    const asegurados      = activos.filter(c => c.poliza_asegurado).length;
    const byEstado = contratos.reduce((acc, c) => {
      acc[c.estado_contrato] = (acc[c.estado_contrato] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { activos: activos.length, canonBruto, pagoPropietario, margen: canonBruto - pagoPropietario, asegurados, byEstado };
  }, [contratos]);

  // ── Cobros del mes ───────────────────────────────────────────────────────
  const cobrosDelMes = useMemo(() => {
    const mes = now.getMonth() + 1;
    const anio = now.getFullYear();
    const pagosMes   = pagos.filter(p => p.mes === mes && p.anio === anio);
    const recibidos  = pagosMes.filter(p => p.estado_inquilino === "Recibido");
    const pendientes = pagosMes.filter(p => p.estado_inquilino !== "Recibido");
    const totalEsperado  = pagosMes.reduce((s, p) => s + (p.valor_canon || 0), 0);
    const totalRecibido  = recibidos.reduce((s, p) => s + (p.valor_recibido || p.valor_canon || 0), 0);
    const comisiones     = recibidos.reduce((s, p) => s + (p.valor_administracion || 0), 0);
    const pct            = pagosMes.length > 0 ? Math.round((recibidos.length / pagosMes.length) * 100) : 0;
    return { total: pagosMes.length, recibidos: recibidos.length, pendientes: pendientes.length, totalEsperado, totalRecibido, comisiones, pct };
  }, [pagos, now]);

  // ── Comisiones históricas ────────────────────────────────────────────────
  const comisionesAnio = useMemo(() =>
    pagos.filter(p => p.estado_inquilino === "Recibido" && p.anio === anioSel)
      .reduce((s, p) => s + (p.valor_administracion || 0), 0),
    [pagos, anioSel]);

  const comisionesHistorico = useMemo(() =>
    pagos.filter(p => p.estado_inquilino === "Recibido")
      .reduce((s, p) => s + (p.valor_administracion || 0), 0),
    [pagos]);

  const comisionesMensuales = useMemo(() =>
    MESES.map((mes, i) => ({
      mes,
      total: pagos.filter(p => p.anio === anioSel && p.mes === i + 1 && p.estado_inquilino === "Recibido")
        .reduce((s, p) => s + (p.valor_administracion || 0), 0),
    })),
    [pagos, anioSel]);

  // ── Citas ────────────────────────────────────────────────────────────────
  const citasStats = useMemo(() => {
    const total       = reservas.length;
    const pendientes  = reservas.filter(r => r.estado === "Pendiente").length;
    const confirmadas = reservas.filter(r => r.estado === "Confirmada").length;
    const canceladas  = reservas.filter(r => r.estado === "Cancelada").length;
    const esteMes     = reservas.filter(r => {
      const d = new Date(r.fecha_creacion);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    return { total, pendientes, confirmadas, canceladas, esteMes,
      tasaConversion: total > 0 ? Math.round((confirmadas / total) * 100) : 0 };
  }, [reservas, now]);

  const citasPorEstado = useMemo(() => [
    { name: "Pendiente",  value: citasStats.pendientes,  color: GOLD },
    { name: "Confirmada", value: citasStats.confirmadas, color: GREEN },
    { name: "Cancelada",  value: citasStats.canceladas,  color: RED },
  ].filter(d => d.value > 0), [citasStats]);

  const citasPorInmueble = useMemo(() => {
    const map: Record<string, { total: number; confirmada: number; pendiente: number; cancelada: number }> = {};
    const slotProp: Record<string, string | null> = {};
    slots.forEach(s => { slotProp[s.id] = s.propiedad_id; });
    reservas.forEach(r => {
      const pid = r.propiedad_id || (r.slot_id ? slotProp[r.slot_id] : null);
      if (!pid) return;
      if (!map[pid]) map[pid] = { total: 0, confirmada: 0, pendiente: 0, cancelada: 0 };
      map[pid].total++;
      if (r.estado === "Confirmada")     map[pid].confirmada++;
      else if (r.estado === "Pendiente") map[pid].pendiente++;
      else if (r.estado === "Cancelada") map[pid].cancelada++;
    });
    return Object.entries(map)
      .map(([pid, counts]) => ({ prop: propiedades.find(p => p.id === pid), ...counts }))
      .filter(x => x.prop)
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [reservas, slots, propiedades]);

  // ── Captaciones ──────────────────────────────────────────────────────────
  const captacionesStats = useMemo(() => {
    const total = captaciones.length;
    const esteMes = captaciones.filter(c => {
      const d = new Date(c.fecha_creacion);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    const byEstado: Record<string, number> = {};
    captaciones.forEach(c => {
      const e = c.estado || "Sin estado";
      byEstado[e] = (byEstado[e] || 0) + 1;
    });
    return { total, esteMes, byEstado };
  }, [captaciones, now]);

  // ── Próximos vencimientos ────────────────────────────────────────────────
  const proximosVencimientos = useMemo(() =>
    contratos
      .filter(c => c.estado_contrato === "Activo" && c.fecha_fin)
      .map(c => ({ ...c, dias: daysUntil(c.fecha_fin!), propiedad: propiedades.find(p => p.id === c.propiedad_id) }))
      .filter(c => c.dias >= 0 && c.dias <= 90)
      .sort((a, b) => a.dias - b.dias),
    [contratos, propiedades]);

  // ── Pólizas ──────────────────────────────────────────────────────────────
  const polizasStats = useMemo(() => {
    const pagadas = pagosPoliza.filter(p => p.estado === "Pagada" || p.estado === "Recibida");
    return {
      totalCobrado: pagadas.reduce((s, p) => s + (p.valor || 0), 0),
      pagadas: pagadas.length,
      pendientes: pagosPoliza.filter(p => p.estado === "Pendiente").length,
    };
  }, [pagosPoliza]);

  // ── Valores ──────────────────────────────────────────────────────────────
  const valores = useMemo(() => ({
    inventario:   propiedades.filter(p => p.estado === "Disponible").reduce((s, p) => s + (p.precio || 0), 0),
    canonMensual: contratos.filter(c => c.estado_contrato === "Activo").reduce((s, c) => s + (c.valor_canon || 0), 0),
    totalVendido: propiedades.filter(p => p.estado === "Vendido").reduce((s, p) => s + (p.precio || 0), 0),
  }), [propiedades, contratos]);

  const years = useMemo(() => {
    const cur = new Date().getFullYear();
    return Array.from({ length: cur - 2022 }, (_, i) => 2023 + i);
  }, []);

  const sinComisionesMes = comisionesMensuales.every(m => m.total === 0);

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="animate-spin" size={28} style={{ color: GOLD }} />
      <p className="font-body text-sm text-muted-foreground">Cargando estadísticas…</p>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-12">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-5 border-b border-foreground/10">
        <div>
          <div className="w-8 h-0.5 bg-primary mb-2" aria-hidden="true" />
          <p className="font-heading text-[10px] font-semibold tracking-widest uppercase mb-1 text-muted-foreground">
            Panel ejecutivo
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">Reportes</h2>
          <p className="font-body text-xs text-muted-foreground mt-1">
            {MESES[now.getMonth()]} {now.getFullYear()} · Inmobiliaria Eliana Osorio
          </p>
        </div>
        <div className="flex items-center gap-0.5 bg-muted/40 border border-foreground/10 p-1 self-start sm:self-auto">
          {years.map(y => (
            <button key={y} onClick={() => setAnioSel(y)}
              className={`px-3 py-1.5 font-heading text-xs font-semibold tracking-widest transition-all cursor-pointer ${
                anioSel === y ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* ── HERO: 3 grandes números editoriales ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 pb-8 border-b border-foreground/5">
        <HeroKPI
          label="Total portafolio"
          value={propiedades.length}
          sub={`${propiedades.filter(p => p.estado === "Disponible").length} disponibles · ${propiedades.filter(p => p.estado === "Arrendado").length} arrendados`}
          accent={GOLD}
        />
        <HeroKPI
          label="Ocupación alquiler"
          value={`${ocupacion}%`}
          sub={`${propiedades.filter(p => p.estado === "Arrendado" && p.tipo_negocio === "Alquiler").length} de ${propiedades.filter(p => p.tipo_negocio === "Alquiler").length} inmuebles en alquiler`}
          accent={ocupacion >= 70 ? GREEN : ocupacion >= 40 ? GOLD : RED}
        />
        <HeroKPI
          label={`Comisiones ${anioSel}`}
          value={fK(comisionesAnio)}
          sub={`Histórico total: ${fK(comisionesHistorico)}`}
          accent={GREEN}
        />
      </div>

      {/* ── KPIs SECUNDARIOS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <KPICard
          icon={CheckCircle2}
          label="Conversión citas"
          value={`${citasStats.tasaConversion}%`}
          sub={`${citasStats.confirmadas} de ${citasStats.total} reservas`}
          accent={citasStats.tasaConversion >= 50 ? GREEN : GOLD}
        />
        <KPICard
          icon={FileText}
          label="Contratos activos"
          value={contratosStats.activos}
          sub={`${contratosStats.asegurados} con póliza`}
          accent={BLUE}
        />
        <KPICard
          icon={Users}
          label="Captaciones"
          value={captacionesStats.total}
          sub={`${captacionesStats.esteMes} ingresaron este mes`}
          accent={GOLD}
        />
        <KPICard
          icon={Wallet}
          label={`Cobros ${MESES[now.getMonth()]}`}
          value={`${cobrosDelMes.pct}%`}
          sub={`${cobrosDelMes.recibidos} de ${cobrosDelMes.total} pagos recibidos`}
          accent={cobrosDelMes.pct >= 80 ? GREEN : cobrosDelMes.pct >= 50 ? GOLD : RED}
        />
      </div>

      {/* ── PORTAFOLIO: estado + tipos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-background border border-foreground/10 p-5 sm:p-6">
          <SectionTitle>Estado del portafolio</SectionTitle>
          {porEstado.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground py-10 text-center">Sin datos</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 items-center">
              <DonutChart data={porEstado} centerLabel={propiedades.length} centerSub="total" height={180} />
              <div className="space-y-1">
                <ChartLegend items={porEstado.map(e => ({ name: e.name, color: e.color, value: e.value }))} />
                <div className="pt-4 mt-2 border-t border-foreground/5 space-y-2">
                  {[
                    ["En alquiler", propiedades.filter(p => p.tipo_negocio === "Alquiler").length],
                    ["En venta",    propiedades.filter(p => p.tipo_negocio === "Venta").length],
                    ["Destacados",  propiedades.filter(p => (p as any).destacada === true).length],
                  ].map(([label, count]) => (
                    <div key={String(label)} className="flex justify-between items-center">
                      <span className="font-body text-xs text-muted-foreground">{label}</span>
                      <span className="font-heading text-xs font-bold text-foreground tabular-nums">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-background border border-foreground/10 p-5 sm:p-6">
          <SectionTitle>Distribución por tipo</SectionTitle>
          {porTipo.entries.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground py-10 text-center">Sin datos</p>
          ) : (
            <div className="space-y-4 pt-1">
              {porTipo.entries.map(([tipo, count], i) => (
                <HorizBar
                  key={tipo}
                  label={tipo}
                  value={count}
                  max={porTipo.max}
                  color={[GOLD, GOLD2, GOLD3, "#e8d9b0"][i] || "#e8d9b0"}
                  sub={`${Math.round((count / propiedades.length) * 100)}% del portafolio`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── COBROS DEL MES ── */}
      <div className="bg-background border border-foreground/10 p-5 sm:p-6">
        <SectionTitle
          action={
            <p className="font-heading text-[10px] tracking-widest uppercase text-muted-foreground">
              {MESES[now.getMonth()]} {now.getFullYear()}
            </p>
          }
        >
          Estado de cobros del mes
        </SectionTitle>
        {cobrosDelMes.total === 0 ? (
          <p className="font-body text-sm text-muted-foreground py-6 text-center">
            Sin pagos registrados para {MESES[now.getMonth()]}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_1fr] gap-6 sm:gap-8">
            {/* SVG progress ring */}
            <div className="flex items-center gap-5 sm:flex-col sm:items-start sm:gap-4">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none"
                    stroke="currentColor" className="text-foreground/5" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none"
                    stroke={cobrosDelMes.pct >= 80 ? GREEN : cobrosDelMes.pct >= 50 ? GOLD : RED}
                    strokeWidth="3"
                    strokeDasharray={`${cobrosDelMes.pct} ${100 - cobrosDelMes.pct}`}
                    strokeLinecap="square" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading text-xl font-bold text-foreground tabular-nums">{cobrosDelMes.pct}%</span>
                  <span className="font-heading text-[7px] tracking-widest text-muted-foreground uppercase">cobrado</span>
                </div>
              </div>
              <div className="space-y-2 sm:hidden">
                <div>
                  <p className="font-heading text-[10px] tracking-widest text-muted-foreground uppercase">Recibidos</p>
                  <p className="font-heading text-2xl font-bold tabular-nums" style={{ color: GREEN }}>{cobrosDelMes.recibidos}</p>
                </div>
                <div>
                  <p className="font-heading text-[10px] tracking-widest text-muted-foreground uppercase">Pendientes</p>
                  <p className="font-heading text-2xl font-bold tabular-nums" style={{ color: cobrosDelMes.pendientes > 0 ? RED : GOLD }}>{cobrosDelMes.pendientes}</p>
                </div>
              </div>
            </div>

            {/* Counts — desktop only (hidden on mobile above) */}
            <div className="hidden sm:flex flex-col justify-center gap-5">
              <div>
                <p className="font-heading text-[10px] tracking-widest text-muted-foreground uppercase mb-1">Recibidos</p>
                <p className="font-heading text-3xl font-bold tabular-nums" style={{ color: GREEN }}>{cobrosDelMes.recibidos}</p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">{fK(cobrosDelMes.totalRecibido)}</p>
              </div>
              <div>
                <p className="font-heading text-[10px] tracking-widest text-muted-foreground uppercase mb-1">Pendientes</p>
                <p className="font-heading text-3xl font-bold tabular-nums"
                  style={{ color: cobrosDelMes.pendientes > 0 ? RED : GOLD }}>{cobrosDelMes.pendientes}</p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  {fK(cobrosDelMes.totalEsperado - cobrosDelMes.totalRecibido)}
                </p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="flex flex-col justify-center gap-2.5 sm:pl-4 sm:border-l sm:border-foreground/10">
              {[
                { label: `Canon esperado ${MESES[now.getMonth()]}`, value: fK(cobrosDelMes.totalEsperado), color: "text-foreground" },
                { label: "Recibido de inquilinos", value: fK(cobrosDelMes.totalRecibido), color: "" },
                { label: "Pendiente de cobro", value: fK(cobrosDelMes.totalEsperado - cobrosDelMes.totalRecibido), color: "" },
                { label: "Comisiones del mes", value: fK(cobrosDelMes.comisiones), color: "" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-foreground/5 last:border-0">
                  <span className="font-body text-xs text-muted-foreground">{label}</span>
                  <span className={`font-heading text-sm font-bold tabular-nums ${color || "text-foreground"}`}
                    style={label.includes("Comisiones") ? { color: GOLD } : label.includes("Recibido") ? { color: GREEN } : {}}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── COMISIONES MENSUALES ── */}
      <div className="bg-background border border-foreground/10 p-5 sm:p-6">
        <SectionTitle
          action={
            <p className="font-heading text-xs text-muted-foreground">
              Total: <span className="font-bold text-foreground tabular-nums">{fCOP(comisionesAnio)}</span>
            </p>
          }
        >
          Comisiones mensuales — {anioSel}
        </SectionTitle>
        {sinComisionesMes ? (
          <div className="flex flex-col items-center justify-center h-36 text-muted-foreground gap-2">
            <Activity size={24} className="opacity-20" />
            <p className="font-body text-sm">Sin comisiones registradas en {anioSel}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={comisionesMensuales} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="mes" tick={{ fontSize: 10, fontFamily: "Josefin Sans", fill: "#9ca3af" }}
                axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={v => v === 0 ? "$0" : fCOP(v)}
                tick={{ fontSize: 9, fontFamily: "Josefin Sans", fill: "#9ca3af" }}
                axisLine={false} tickLine={false} width={90} />
              <Tooltip content={(props: any) => <ChartTooltip {...props} currency />} />
              <Bar dataKey="total" fill={GOLD} radius={[2, 2, 0, 0]} animationDuration={700} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── CAPTACIONES + CONTRATOS + PÓLIZAS/MARGEN ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Pipeline captaciones */}
        <div className="bg-background border border-foreground/10 p-5 sm:p-6">
          <SectionTitle>Pipeline captaciones</SectionTitle>
          {captacionesStats.total === 0 ? (
            <p className="font-body text-sm text-muted-foreground py-6 text-center">Sin captaciones</p>
          ) : (
            <>
              <div className="mb-5">
                <p className="font-heading text-4xl font-bold text-foreground tabular-nums">{captacionesStats.total}</p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  {captacionesStats.esteMes} ingresaron este mes
                </p>
              </div>
              <div className="space-y-3 pt-4 border-t border-foreground/5">
                {Object.entries(captacionesStats.byEstado)
                  .sort((a, b) => b[1] - a[1])
                  .map(([estado, count], i) => (
                    <HorizBar
                      key={estado}
                      label={estado}
                      value={count as number}
                      max={captacionesStats.total}
                      color={[GOLD, GREEN, BLUE, GOLD2][i] || GOLD3}
                    />
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Contratos breakdown */}
        <div className="bg-background border border-foreground/10 p-5 sm:p-6">
          <SectionTitle>Contratos de arrendamiento</SectionTitle>
          <div className="mb-5">
            <p className="font-heading text-4xl font-bold text-foreground tabular-nums">{contratos.length}</p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">{contratosStats.activos} activos</p>
          </div>
          <div className="space-y-3 pt-4 border-t border-foreground/5">
            {Object.entries(contratosStats.byEstado)
              .sort((a, b) => b[1] - a[1])
              .map(([estado, count]) => (
                <HorizBar
                  key={estado}
                  label={estado}
                  value={count as number}
                  max={contratos.length}
                  color={estado === "Activo" ? GREEN : estado === "Vencido" ? RED : GOLD}
                />
              ))}
            {contratos.length === 0 && (
              <p className="font-body text-sm text-muted-foreground py-4 text-center">Sin contratos</p>
            )}
          </div>
        </div>

        {/* Pólizas y margen admin */}
        <div className="bg-background border border-foreground/10 p-5 sm:p-6">
          <SectionTitle>Pólizas y margen admin</SectionTitle>

          {/* Cobertura pólizas */}
          <div className="mb-5">
            <p className="font-heading text-[10px] tracking-widest text-muted-foreground uppercase mb-2">Cobertura póliza</p>
            <div className="flex items-end gap-2 mb-2">
              <p className="font-heading text-3xl font-bold text-foreground tabular-nums">{contratosStats.asegurados}</p>
              <p className="font-body text-xs text-muted-foreground pb-1">/ {contratosStats.activos} activos</p>
            </div>
            {contratosStats.activos > 0 && (
              <div className="h-[3px] bg-foreground/5 overflow-hidden mb-1.5">
                <div className="h-full transition-all duration-700"
                  style={{ width: `${(contratosStats.asegurados / contratosStats.activos) * 100}%`, background: GOLD }} />
              </div>
            )}
            <p className="font-body text-[11px] text-muted-foreground">
              {contratosStats.activos > 0
                ? `${Math.round((contratosStats.asegurados / contratosStats.activos) * 100)}% cobertura · ${polizasStats.totalCobrado > 0 ? fK(polizasStats.totalCobrado) + " cobrado" : ""}`
                : "Sin contratos activos"}
            </p>
          </div>

          {/* Margen admin */}
          <div className="pt-4 border-t border-foreground/5 space-y-2.5">
            <p className="font-heading text-[10px] tracking-widest text-muted-foreground uppercase">Margen mensual estimado</p>
            {[
              { label: "Canon bruto", value: fK(contratosStats.canonBruto), style: {} },
              { label: "Pago propietarios", value: `−${fK(contratosStats.pagoPropietario)}`, style: { color: "#9ca3af" } },
            ].map(({ label, value, style }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="font-body text-xs text-muted-foreground">{label}</span>
                <span className="font-heading text-xs font-bold tabular-nums" style={style}>{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t border-foreground/5">
              <span className="font-body text-xs text-muted-foreground">Margen administración</span>
              <span className="font-heading text-sm font-bold tabular-nums" style={{ color: GOLD }}>{fK(contratosStats.margen)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CITAS: donut + top inmuebles ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">

        <div className="lg:col-span-2 bg-background border border-foreground/10 p-5 sm:p-6">
          <SectionTitle>Estado de citas</SectionTitle>
          {citasPorEstado.length === 0 ? (
            <div className="flex items-center justify-center h-36 text-muted-foreground">
              <p className="font-body text-sm">Sin reservas registradas</p>
            </div>
          ) : (
            <>
              <DonutChart data={citasPorEstado} centerLabel={citasStats.total} centerSub="reservas" height={170} />
              <div className="mt-3">
                <ChartLegend items={citasPorEstado.map(e => ({ name: e.name, color: e.color, value: e.value }))} />
              </div>
              <div className="mt-4 pt-4 border-t border-foreground/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-muted-foreground">Tasa de conversión</span>
                  <span className="font-heading text-sm font-bold tabular-nums"
                    style={{ color: citasStats.tasaConversion >= 50 ? GREEN : GOLD }}>
                    {citasStats.tasaConversion}%
                  </span>
                </div>
                {citasStats.esteMes > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs text-muted-foreground">Citas este mes</span>
                    <span className="font-heading text-sm font-bold tabular-nums">{citasStats.esteMes}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-3 bg-background border border-foreground/10 p-5 sm:p-6">
          <SectionTitle
            action={
              <div className="flex items-center gap-3 text-[10px] font-heading tracking-widest uppercase text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block" style={{ background: GREEN }} />Conf.</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block" style={{ background: GOLD }} />Pend.</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block" style={{ background: RED }} />Canc.</span>
              </div>
            }
          >
            Top inmuebles por interés
          </SectionTitle>
          {citasPorInmueble.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground py-10 text-center">Sin datos de citas asignadas.</p>
          ) : (
            <div className="space-y-5">
              {citasPorInmueble.map(({ prop, total, confirmada, pendiente, cancelada }) => (
                <div key={prop!.id}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-sm font-medium text-foreground truncate leading-tight">
                        {prop!.nombre_inmueble}
                      </p>
                      <p className="font-body text-[11px] text-muted-foreground mt-0.5">
                        {prop!.tipo_inmueble} · {prop!.estado}
                        {prop!.barrio ? ` · ${prop!.barrio}` : ""}
                      </p>
                    </div>
                    <span className="font-heading text-base font-bold flex-shrink-0 tabular-nums" style={{ color: GOLD }}>
                      {total}
                    </span>
                  </div>
                  <div className="h-1.5 bg-foreground/5 overflow-hidden flex">
                    {confirmada > 0 && <div style={{ width: `${(confirmada/total)*100}%`, background: GREEN }} />}
                    {pendiente > 0  && <div style={{ width: `${(pendiente/total)*100}%`,  background: GOLD  }} />}
                    {cancelada > 0  && <div style={{ width: `${(cancelada/total)*100}%`,  background: RED   }} />}
                  </div>
                  <div className="flex gap-4 mt-1.5">
                    {confirmada > 0 && <span className="font-body text-[10px] tracking-wide" style={{ color: GREEN }}>✓ {confirmada}</span>}
                    {pendiente > 0  && <span className="font-body text-[10px] tracking-wide" style={{ color: GOLD }}>● {pendiente}</span>}
                    {cancelada > 0  && <span className="font-body text-[10px] tracking-wide" style={{ color: RED }}>✕ {cancelada}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── PRÓXIMOS VENCIMIENTOS ── */}
      {proximosVencimientos.length > 0 && (
        <div className="bg-background border border-foreground/10 p-5 sm:p-6">
          <SectionTitle
            action={
              <span className="font-heading text-[10px] tracking-widest uppercase text-muted-foreground">
                próximos 90 días · {proximosVencimientos.length} contrato{proximosVencimientos.length !== 1 ? "s" : ""}
              </span>
            }
          >
            Contratos próximos a vencer
          </SectionTitle>
          <div className="space-y-0">
            {proximosVencimientos.map(c => {
              const urgency = c.dias <= 15 ? RED : c.dias <= 45 ? AMBER : GOLD;
              return (
                <div key={c.id} className="flex items-center gap-3 py-3 border-b border-foreground/5 last:border-0">
                  <div className="w-0.5 self-stretch flex-shrink-0" style={{ background: urgency }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-foreground truncate">
                      {c.propiedad?.nombre_inmueble || "Inmueble"}
                    </p>
                    <p className="font-body text-[11px] text-muted-foreground">
                      {c.inquilino_nombre}
                      {c.propiedad?.barrio ? ` · ${c.propiedad.barrio}` : ""}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 min-w-[72px]">
                    <p className="font-heading text-sm font-bold tabular-nums" style={{ color: urgency }}>
                      {c.dias}d
                    </p>
                    <p className="font-body text-[10px] text-muted-foreground">
                      {new Date(c.fecha_fin!).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── VALORES FINANCIEROS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            label: "Inventario disponible",
            value: valores.inventario,
            sub: `${propiedades.filter(p => p.estado === "Disponible").length} inmuebles`,
            color: GOLD,
          },
          {
            label: "Canon mensual activo",
            value: valores.canonMensual,
            sub: `${contratos.filter(c => c.estado_contrato === "Activo").length} contratos activos`,
            color: GREEN,
          },
          {
            label: "Total captado (ventas)",
            value: valores.totalVendido,
            sub: `${propiedades.filter(p => p.estado === "Vendido").length} inmuebles vendidos`,
            color: BLUE,
          },
        ].map(item => (
          <div key={item.label} className="bg-background border border-foreground/10 p-5 sm:p-6"
            style={{ borderTopColor: item.color, borderTopWidth: 2 }}>
            <p className="font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-4">
              {item.label}
            </p>
            <p className="font-heading text-lg sm:text-xl font-bold text-foreground mb-1 leading-tight tabular-nums">
              {fK(item.value)}
            </p>
            <div className="border-t border-foreground/5 pt-3 mt-4">
              <p className="font-body text-xs text-muted-foreground">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminReportes;
