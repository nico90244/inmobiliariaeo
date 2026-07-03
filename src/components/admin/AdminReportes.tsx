import { useEffect, useState, useMemo } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Loader2, Building2, TrendingUp, DollarSign,
  CheckCircle2, Calendar, ArrowUpRight,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────
type Propiedad = {
  id: string; nombre_inmueble: string; tipo_negocio: string;
  tipo_inmueble: string; estado: string; precio: number | null;
};
type Reserva = {
  id: string; propiedad_id: string | null; slot_id: string | null;
  estado: string; fecha_creacion: string;
};
type Slot = { id: string; propiedad_id: string | null };
type PagoAlquiler = {
  anio: number; mes: number;
  valor_administracion: number | null; estado_inquilino: string;
};
type Contrato = { id: string; valor_canon: number | null; estado_contrato: string };

// ─── Palette ─────────────────────────────────────────────────────────────────
const GOLD   = "#C9A84C";
const GOLD2  = "#D4BC72";
const GOLD3  = "#DFCF98";
const GREEN  = "#4ade80";
const BLUE   = "#60a5fa";
const RED    = "#f87171";
const MESES  = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

const fK = (n: number) => {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `$${Math.round(n / 1_000)}K`;
  return fCOP(n);
};

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Tooltip oscuro personalizado para Recharts */
const ChartTooltip = ({
  active, payload, label, currency = false,
}: { active?: boolean; payload?: any[]; label?: string; currency?: boolean }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A1A] border border-white/10 px-3 py-2 shadow-2xl text-xs">
      {label && (
        <p className="font-heading text-[10px] tracking-widest text-white/40 uppercase mb-1">{label}</p>
      )}
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-heading font-bold text-sm" style={{ color: p.fill || p.color || GOLD }}>
          {currency ? fCOP(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

/** Tarjeta KPI principal */
const KPICard = ({
  icon: Icon, label, value, sub, accent = GOLD,
}: {
  icon: any; label: string; value: string | number; sub?: string; accent?: string;
}) => (
  <div className="bg-background border border-foreground/10 p-4 sm:p-5 hover:border-foreground/25 transition-colors duration-200 flex flex-col gap-3 min-h-[110px]">
    <div className="flex items-start justify-between gap-2">
      <span className="font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase leading-tight">
        {label}
      </span>
      <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0" style={{ background: `${accent}18` }}>
        <Icon size={15} style={{ color: accent }} />
      </div>
    </div>
    <div className="mt-auto">
      <p className="font-heading text-xl sm:text-2xl font-bold text-foreground leading-none mb-1">{value}</p>
      {sub && <p className="font-body text-[11px] text-muted-foreground leading-tight">{sub}</p>}
    </div>
  </div>
);

/** Encabezado de sección */
const SectionHeader = ({ title, action }: { title: string; action?: ReactNode }) => (
  <div className="flex items-center justify-between mb-4 sm:mb-5">
    <h3 className="font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
      {title}
    </h3>
    {action}
  </div>
);

/** Donut chart con etiqueta central */
const DonutChart = ({
  data, centerLabel, centerSub, height = 180,
}: {
  data: { name: string; value: number; color: string }[];
  centerLabel: string | number; centerSub: string; height?: number;
}) => (
  <div className="relative">
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={height * 0.27}
          outerRadius={height * 0.42}
          paddingAngle={data.length > 1 ? 3 : 0}
          dataKey="value"
          strokeWidth={0}
          animationBegin={0}
          animationDuration={700}
        >
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip
          content={({ active, payload }: any) => {
            if (!active || !payload?.length) return null;
            const p = payload[0];
            return (
              <div className="bg-[#1A1A1A] border border-white/10 px-3 py-2 shadow-2xl text-xs">
                <p className="font-heading text-[10px] tracking-widest text-white/40 uppercase mb-0.5">{p.name}</p>
                <p className="font-heading font-bold text-base" style={{ color: p.payload?.color || GOLD }}>{p.value}</p>
              </div>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span className="font-heading text-2xl font-bold text-foreground">{centerLabel}</span>
      <span className="font-heading text-[9px] tracking-widest text-muted-foreground uppercase">{centerSub}</span>
    </div>
  </div>
);

/** Leyenda para los charts */
const ChartLegend = ({ items }: {
  items: { name: string; color: string; value?: number | string }[];
}) => (
  <div className="flex flex-col gap-2.5">
    {items.map((item) => (
      <div key={item.name} className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 flex-shrink-0" style={{ background: item.color }} />
          <span className="font-body text-sm text-foreground/70 truncate">{item.name}</span>
        </div>
        {item.value !== undefined && (
          <span className="font-heading text-sm font-bold text-foreground ml-2 flex-shrink-0">{item.value}</span>
        )}
      </div>
    ))}
  </div>
);

/** Barra de progreso horizontal */
const HorizBar = ({ label, value, max, color = GOLD }: {
  label: string; value: number; max: number; color?: string;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="font-body text-sm text-foreground/80">{label}</span>
      <span className="font-heading text-xs font-bold text-foreground">{value}</span>
    </div>
    <div className="h-[3px] bg-foreground/5 overflow-hidden">
      <div
        className="h-full transition-all duration-700 ease-out"
        style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, background: color }}
      />
    </div>
  </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────
const AdminReportes = () => {
  const [loading, setLoading]           = useState(true);
  const [propiedades, setPropiedades]   = useState<Propiedad[]>([]);
  const [reservas, setReservas]         = useState<Reserva[]>([]);
  const [slots, setSlots]               = useState<Slot[]>([]);
  const [pagosAlquiler, setPagos]       = useState<PagoAlquiler[]>([]);
  const [contratos, setContratos]       = useState<Contrato[]>([]);
  const [anioSel, setAnioSel]           = useState(new Date().getFullYear());

  useEffect(() => {
    (async () => {
      const [pRes, rRes, sRes, paRes, cRes] = await Promise.all([
        supabase.from("propiedades").select("id, nombre_inmueble, tipo_negocio, tipo_inmueble, estado, precio"),
        supabase.from("citas_reservas").select("id, propiedad_id, slot_id, estado, created_at").neq("estado", "Eliminada"),
        supabase.from("citas_disponibles").select("id, propiedad_id"),
        (supabase as any).from("pagos_alquiler").select("anio, mes, valor_administracion, estado_inquilino"),
        (supabase as any).from("contratos_arrendamiento").select("id, valor_canon, estado_contrato"),
      ]);
      setPropiedades((pRes.data || []) as Propiedad[]);
      setReservas((rRes.data || []) as Reserva[]);
      setSlots((sRes.data || []) as Slot[]);
      setPagos((paRes.data || []) as PagoAlquiler[]);
      setContratos((cRes.data || []) as Contrato[]);
      setLoading(false);
    })();
  }, []);

  // ─── Cálculos ─────────────────────────────────────────────────────────────

  const porEstado = useMemo(() => {
    const disponibles = propiedades.filter(p => p.estado === "Disponible").length;
    const arrendados  = propiedades.filter(p => p.estado === "Arrendado").length;
    const vendidos    = propiedades.filter(p => p.estado === "Vendido").length;
    return [
      { name: "Disponible", value: disponibles, color: GOLD },
      { name: "Arrendado",  value: arrendados,  color: GREEN },
      { name: "Vendido",    value: vendidos,    color: BLUE },
    ].filter(d => d.value > 0);
  }, [propiedades]);

  const ocupacion = useMemo(() => {
    const total    = propiedades.filter(p => p.tipo_negocio === "Alquiler").length;
    const activos  = propiedades.filter(p => p.estado === "Arrendado" && p.tipo_negocio === "Alquiler").length;
    return total > 0 ? Math.round((activos / total) * 100) : 0;
  }, [propiedades]);

  const comisionesAnio = useMemo(() =>
    pagosAlquiler
      .filter(p => p.estado_inquilino === "Recibido" && p.anio === anioSel)
      .reduce((s, p) => s + (p.valor_administracion || 0), 0),
    [pagosAlquiler, anioSel]);

  const comisionesHistorico = useMemo(() =>
    pagosAlquiler
      .filter(p => p.estado_inquilino === "Recibido")
      .reduce((s, p) => s + (p.valor_administracion || 0), 0),
    [pagosAlquiler]);

  const citasStats = useMemo(() => {
    const total       = reservas.length;
    const pendientes  = reservas.filter(r => r.estado === "Pendiente").length;
    const confirmadas = reservas.filter(r => r.estado === "Confirmada").length;
    const canceladas  = reservas.filter(r => r.estado === "Cancelada").length;
    const tasaConversion = total > 0 ? Math.round((confirmadas / total) * 100) : 0;
    const now = new Date();
    const esteMes = reservas.filter(r => {
      const d = new Date(r.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    return { total, pendientes, confirmadas, canceladas, tasaConversion, esteMes };
  }, [reservas]);

  const citasPorEstado = useMemo(() => [
    { name: "Pendiente",  value: citasStats.pendientes,  color: GOLD },
    { name: "Confirmada", value: citasStats.confirmadas, color: GREEN },
    { name: "Cancelada",  value: citasStats.canceladas,  color: RED },
  ].filter(d => d.value > 0), [citasStats]);

  const porTipo = useMemo(() => {
    const map: Record<string, number> = {};
    propiedades.forEach(p => { map[p.tipo_inmueble] = (map[p.tipo_inmueble] || 0) + 1; });
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const max = entries[0]?.[1] || 1;
    return { entries, max };
  }, [propiedades]);

  const comisionesMensuales = useMemo(() =>
    MESES.map((mes, i) => ({
      mes,
      total: pagosAlquiler
        .filter(p => p.anio === anioSel && p.mes === i + 1 && p.estado_inquilino === "Recibido")
        .reduce((s, p) => s + (p.valor_administracion || 0), 0),
    })),
    [pagosAlquiler, anioSel]);

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

  const valores = useMemo(() => ({
    inventario: propiedades
      .filter(p => p.estado === "Disponible")
      .reduce((s, p) => s + (p.precio || 0), 0),
    canonMensual: contratos
      .filter(c => c.estado_contrato === "Activo")
      .reduce((s, c) => s + (c.valor_canon || 0), 0),
    totalVendido: propiedades
      .filter(p => p.estado === "Vendido")
      .reduce((s, p) => s + (p.precio || 0), 0),
  }), [propiedades, contratos]);

  const years = useMemo(() => {
    const cur = new Date().getFullYear();
    return Array.from({ length: cur - 2022 }, (_, i) => 2023 + i);
  }, []);

  const sinComisionesMes = comisionesMensuales.every(m => m.total === 0);

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="animate-spin" size={28} style={{ color: GOLD }} />
      <p className="font-body text-sm text-muted-foreground">Cargando estadísticas…</p>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 sm:space-y-8 pb-8">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-5 border-b border-foreground/10">
        <div>
          <p className="font-heading text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: GOLD }}>
            Panel
          </p>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Reportes</h2>
        </div>
        {/* Selector de año */}
        <div className="flex items-center gap-0.5 bg-muted/40 border border-foreground/10 p-1 self-start sm:self-auto">
          {years.map(y => (
            <button
              key={y}
              onClick={() => setAnioSel(y)}
              className={`px-3 py-1.5 font-heading text-xs font-semibold tracking-widest transition-all ${
                anioSel === y
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <KPICard
          icon={Building2}
          label="Portafolio"
          value={propiedades.length}
          sub={`${propiedades.filter(p => p.estado === "Disponible").length} disponibles`}
          accent={GOLD}
        />
        <KPICard
          icon={TrendingUp}
          label="Ocupación"
          value={`${ocupacion}%`}
          sub={`${propiedades.filter(p => p.estado === "Arrendado").length} arrendados`}
          accent={ocupacion >= 70 ? GREEN : ocupacion >= 40 ? GOLD : RED}
        />
        <KPICard
          icon={DollarSign}
          label={`Comisiones ${anioSel}`}
          value={fK(comisionesAnio)}
          sub={`Histórico: ${fK(comisionesHistorico)}`}
          accent={GREEN}
        />
        <KPICard
          icon={CheckCircle2}
          label="Conversión citas"
          value={`${citasStats.tasaConversion}%`}
          sub={`${citasStats.confirmadas} de ${citasStats.total} citas`}
          accent={citasStats.tasaConversion >= 50 ? GREEN : GOLD}
        />
      </div>

      {/* ── PORTAFOLIO: estado + tipos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        {/* Estado del portafolio */}
        <div className="bg-background border border-foreground/10 p-5 sm:p-6">
          <SectionHeader title="Estado del portafolio" />
          {porEstado.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground py-10 text-center">Sin datos</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 items-center">
              <DonutChart
                data={porEstado}
                centerLabel={propiedades.length}
                centerSub="total"
                height={180}
              />
              <div className="space-y-1">
                <ChartLegend items={porEstado.map(e => ({ name: e.name, color: e.color, value: e.value }))} />
                <div className="pt-4 mt-2 border-t border-foreground/5 space-y-1">
                  <div className="flex justify-between">
                    <span className="font-body text-xs text-muted-foreground">Alquiler</span>
                    <span className="font-heading text-xs font-bold text-foreground">
                      {propiedades.filter(p => p.tipo_negocio === "Alquiler").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-xs text-muted-foreground">Venta</span>
                    <span className="font-heading text-xs font-bold text-foreground">
                      {propiedades.filter(p => p.tipo_negocio === "Venta").length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Distribución por tipo */}
        <div className="bg-background border border-foreground/10 p-5 sm:p-6">
          <SectionHeader title="Distribución por tipo" />
          {porTipo.entries.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground py-10 text-center">Sin datos</p>
          ) : (
            <div className="space-y-4">
              {porTipo.entries.map(([tipo, count], i) => (
                <HorizBar
                  key={tipo}
                  label={tipo}
                  value={count}
                  max={porTipo.max}
                  color={i === 0 ? GOLD : i === 1 ? GOLD2 : i === 2 ? GOLD3 : "#e8d9b0"}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── COMISIONES MENSUALES ── */}
      <div className="bg-background border border-foreground/10 p-5 sm:p-6">
        <SectionHeader
          title={`Comisiones mensuales — ${anioSel}`}
          action={
            <p className="font-heading text-xs text-muted-foreground">
              Total:{" "}
              <span className="font-bold text-foreground">{fCOP(comisionesAnio)}</span>
            </p>
          }
        />
        {sinComisionesMes ? (
          <div className="flex flex-col items-center justify-center h-36 text-muted-foreground gap-2">
            <ArrowUpRight size={24} className="opacity-20" />
            <p className="font-body text-sm">Sin comisiones registradas en {anioSel}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={comisionesMensuales} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 10, fontFamily: "Josefin Sans", fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={v =>
                  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M`
                  : v >= 1_000   ? `$${Math.round(v / 1_000)}K`
                  : `$${v}`
                }
                tick={{ fontSize: 10, fontFamily: "Josefin Sans", fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                content={(props: any) => (
                  <ChartTooltip {...props} currency />
                )}
              />
              <Bar dataKey="total" fill={GOLD} radius={[2, 2, 0, 0]} animationDuration={700} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── CITAS: donut + top inmuebles ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">

        {/* Donut estado citas */}
        <div className="lg:col-span-2 bg-background border border-foreground/10 p-5 sm:p-6">
          <SectionHeader title="Estado de citas" />
          {citasPorEstado.length === 0 ? (
            <div className="flex items-center justify-center h-36 text-muted-foreground">
              <p className="font-body text-sm">Sin reservas</p>
            </div>
          ) : (
            <>
              <DonutChart
                data={citasPorEstado}
                centerLabel={citasStats.total}
                centerSub="reservas"
                height={170}
              />
              <div className="mt-3">
                <ChartLegend
                  items={citasPorEstado.map(e => ({ name: e.name, color: e.color, value: e.value }))}
                />
              </div>
              {/* Tasa de conversión inline */}
              <div className="mt-4 pt-4 border-t border-foreground/5 flex items-center justify-between">
                <span className="font-body text-xs text-muted-foreground">Tasa de conversión</span>
                <span
                  className="font-heading text-sm font-bold"
                  style={{ color: citasStats.tasaConversion >= 50 ? GREEN : GOLD }}
                >
                  {citasStats.tasaConversion}%
                </span>
              </div>
            </>
          )}
        </div>

        {/* Top inmuebles por interés */}
        <div className="lg:col-span-3 bg-background border border-foreground/10 p-5 sm:p-6">
          <SectionHeader
            title="Top inmuebles por interés"
            action={
              <div className="flex items-center gap-3 text-[10px] font-heading tracking-widest uppercase text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 inline-block" style={{ background: GREEN }} /> Conf.
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 inline-block" style={{ background: GOLD }} /> Pend.
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 inline-block" style={{ background: RED }} /> Canc.
                </span>
              </div>
            }
          />
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
                      </p>
                    </div>
                    <span
                      className="font-heading text-base font-bold flex-shrink-0"
                      style={{ color: GOLD }}
                    >
                      {total}
                    </span>
                  </div>
                  {/* Stacked mini bar */}
                  <div className="h-1.5 bg-foreground/5 overflow-hidden flex">
                    {confirmada > 0 && (
                      <div style={{ width: `${(confirmada / total) * 100}%`, background: GREEN }} />
                    )}
                    {pendiente > 0 && (
                      <div style={{ width: `${(pendiente / total) * 100}%`, background: GOLD }} />
                    )}
                    {cancelada > 0 && (
                      <div style={{ width: `${(cancelada / total) * 100}%`, background: RED }} />
                    )}
                  </div>
                  <div className="flex gap-4 mt-1.5">
                    {confirmada > 0 && (
                      <span className="font-body text-[10px] tracking-wide" style={{ color: GREEN }}>
                        ✓ {confirmada}
                      </span>
                    )}
                    {pendiente > 0 && (
                      <span className="font-body text-[10px] tracking-wide" style={{ color: GOLD }}>
                        ● {pendiente}
                      </span>
                    )}
                    {cancelada > 0 && (
                      <span className="font-body text-[10px] tracking-wide" style={{ color: RED }}>
                        ✕ {cancelada}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
          <div
            key={item.label}
            className="bg-background border border-foreground/10 p-5 sm:p-6"
            style={{ borderTopColor: item.color, borderTopWidth: 2 }}
          >
            <p className="font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-4">
              {item.label}
            </p>
            <p className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-1 leading-none">
              {fK(item.value)}
            </p>
            <p className="font-body text-xs text-muted-foreground mb-4">
              {fCOP(item.value)}
            </p>
            <div className="border-t border-foreground/5 pt-3">
              <p className="font-body text-xs text-muted-foreground">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── CITAS ESTE MES ── */}
      {citasStats.esteMes > 0 && (
        <div className="border border-foreground/10 bg-background p-5 sm:p-6 flex items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ background: `${GOLD}18` }}>
            <Calendar size={18} style={{ color: GOLD }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              Citas este mes
            </p>
            <p className="font-heading text-xl font-bold text-foreground">{citasStats.esteMes}</p>
          </div>
          <p className="font-body text-xs text-muted-foreground text-right hidden sm:block">
            {MESES[new Date().getMonth()]} {new Date().getFullYear()}
          </p>
        </div>
      )}

    </div>
  );
};

export default AdminReportes;
