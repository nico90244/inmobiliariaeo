import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Home, Calendar, DollarSign, TrendingUp, Building2, ClipboardList } from "lucide-react";

type Propiedad = { id: string; nombre_inmueble: string; tipo_negocio: string; tipo_inmueble: string; estado: string; precio: number | null };
type Reserva = { id: string; propiedad_id: string | null; slot_id: string | null; estado: string };
type Slot = { id: string; propiedad_id: string | null };

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

const AdminReportes = () => {
  const [loading, setLoading] = useState(true);
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    (async () => {
      const [pRes, rRes, sRes] = await Promise.all([
        supabase.from("propiedades").select("id, nombre_inmueble, tipo_negocio, tipo_inmueble, estado, precio"),
        supabase.from("citas_reservas").select("id, propiedad_id, slot_id, estado").neq("estado", "Eliminada"),
        supabase.from("citas_disponibles").select("id, propiedad_id"),
      ]);
      setPropiedades((pRes.data || []) as Propiedad[]);
      setReservas((rRes.data || []) as Reserva[]);
      setSlots((sRes.data || []) as Slot[]);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const total = propiedades.length;
    const disponibles = propiedades.filter(p => p.estado === "Disponible").length;
    const arrendados = propiedades.filter(p => p.estado === "Arrendado").length;
    const vendidos = propiedades.filter(p => p.estado === "Vendido").length;
    const enVenta = propiedades.filter(p => p.tipo_negocio === "Venta").length;
    const enAlquiler = propiedades.filter(p => p.tipo_negocio === "Alquiler").length;
    const valorInventario = propiedades
      .filter(p => p.estado === "Disponible")
      .reduce((s, p) => s + (p.precio || 0), 0);
    const valorVendido = propiedades
      .filter(p => p.estado === "Vendido")
      .reduce((s, p) => s + (p.precio || 0), 0);
    const valorArrendado = propiedades
      .filter(p => p.estado === "Arrendado" && p.tipo_negocio === "Alquiler")
      .reduce((s, p) => s + (p.precio || 0), 0);

    return { total, disponibles, arrendados, vendidos, enVenta, enAlquiler, valorInventario, valorVendido, valorArrendado };
  }, [propiedades]);

  const citasStats = useMemo(() => {
    const total = reservas.length;
    const pendientes = reservas.filter(r => r.estado === "Pendiente").length;
    const confirmadas = reservas.filter(r => r.estado === "Confirmada").length;
    const canceladas = reservas.filter(r => r.estado === "Cancelada").length;
    return { total, pendientes, confirmadas, canceladas };
  }, [reservas]);

  // Citas por inmueble (top 10)
  const citasPorInmueble = useMemo(() => {
    const map: Record<string, number> = {};
    const slotProp: Record<string, string | null> = {};
    slots.forEach(s => { slotProp[s.id] = s.propiedad_id; });

    reservas.forEach(r => {
      const pid = r.propiedad_id || (r.slot_id ? slotProp[r.slot_id] : null);
      if (!pid) return;
      map[pid] = (map[pid] || 0) + 1;
    });

    return Object.entries(map)
      .map(([pid, count]) => ({
        prop: propiedades.find(p => p.id === pid),
        count,
      }))
      .filter(x => x.prop)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [reservas, slots, propiedades]);

  // Distribución por tipo de inmueble
  const porTipo = useMemo(() => {
    const map: Record<string, number> = {};
    propiedades.forEach(p => { map[p.tipo_inmueble] = (map[p.tipo_inmueble] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [propiedades]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  const Card = ({ icon: Icon, label, value, color = "text-primary" }: any) => (
    <div className="border border-foreground/10 bg-background p-4 flex items-center gap-3">
      <div className={`w-10 h-10 flex items-center justify-center bg-primary/10 ${color}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase truncate">{label}</p>
        <p className={`font-heading text-xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <h2 className="font-heading text-xl font-bold text-foreground">Reportes y Estadísticas</h2>

      {/* Inmuebles */}
      <section>
        <h3 className="font-heading text-sm font-semibold tracking-widest text-muted-foreground uppercase mb-3">Inmuebles</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card icon={Home} label="Total" value={stats.total} />
          <Card icon={Building2} label="Disponibles" value={stats.disponibles} />
          <Card icon={TrendingUp} label="Arrendados" value={stats.arrendados} color="text-green-600" />
          <Card icon={TrendingUp} label="Vendidos" value={stats.vendidos} color="text-blue-600" />
          <Card icon={Home} label="En venta" value={stats.enVenta} />
          <Card icon={Home} label="En alquiler" value={stats.enAlquiler} />
        </div>
      </section>

      {/* Valores */}
      <section>
        <h3 className="font-heading text-sm font-semibold tracking-widest text-muted-foreground uppercase mb-3">Valores</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card icon={DollarSign} label="Inventario disponible" value={formatCurrency(stats.valorInventario)} />
          <Card icon={DollarSign} label="Vendido (total)" value={formatCurrency(stats.valorVendido)} color="text-blue-600" />
          <Card icon={DollarSign} label="Canon arrendado (mensual)" value={formatCurrency(stats.valorArrendado)} color="text-green-600" />
        </div>
      </section>

      {/* Citas */}
      <section>
        <h3 className="font-heading text-sm font-semibold tracking-widest text-muted-foreground uppercase mb-3">Citas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card icon={Calendar} label="Total reservas" value={citasStats.total} />
          <Card icon={Calendar} label="Pendientes" value={citasStats.pendientes} />
          <Card icon={Calendar} label="Confirmadas" value={citasStats.confirmadas} color="text-green-600" />
          <Card icon={Calendar} label="Canceladas" value={citasStats.canceladas} color="text-destructive" />
        </div>
      </section>

      {/* Citas por inmueble */}
      <section>
        <h3 className="font-heading text-sm font-semibold tracking-widest text-muted-foreground uppercase mb-3">Top inmuebles por citas</h3>
        <div className="border border-foreground/10">
          {citasPorInmueble.length === 0 ? (
            <p className="p-6 text-center font-body text-sm text-muted-foreground">Aún no hay reservas asignadas a inmuebles.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Inmueble</th>
                  <th className="text-left p-3 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Estado</th>
                  <th className="text-right p-3 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Citas</th>
                </tr>
              </thead>
              <tbody>
                {citasPorInmueble.map(({ prop, count }) => (
                  <tr key={prop!.id} className="border-t border-foreground/5">
                    <td className="p-3 font-body">{prop!.nombre_inmueble}</td>
                    <td className="p-3 font-body text-muted-foreground">{prop!.estado}</td>
                    <td className="p-3 font-heading font-bold text-primary text-right">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Distribución por tipo */}
      <section>
        <h3 className="font-heading text-sm font-semibold tracking-widest text-muted-foreground uppercase mb-3">Distribución por tipo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {porTipo.map(([tipo, count]) => (
            <Card key={tipo} icon={ClipboardList} label={tipo} value={count} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminReportes;
