import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, ExternalLink } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type Reserva = {
  id: string;
  slot_id: string | null;
  propiedad_id: string | null;
  nombre_cliente: string;
  celular_cliente: string;
  correo_cliente: string | null;
  estado: string;
  fecha_creacion: string;
};

type Slot = { id: string; fecha: string; hora: string; agente: string; propiedad_id: string | null };
type Prop = { id: string; nombre_inmueble: string; direccion: string | null };

const AdminCitasReservas = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [slots, setSlots] = useState<Record<string, Slot>>({});
  const [props, setProps] = useState<Record<string, Prop>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Reserva | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [resR, resS, resP] = await Promise.all([
      supabase.from("citas_reservas").select("*").order("fecha_creacion", { ascending: false }),
      supabase.from("citas_disponibles").select("id, fecha, hora, agente, propiedad_id"),
      supabase.from("propiedades").select("id, nombre_inmueble, direccion"),
    ]);

    setReservas((resR.data || []) as Reserva[]);

    const sMap: Record<string, Slot> = {};
    ((resS.data || []) as Slot[]).forEach(s => { sMap[s.id] = s; });
    setSlots(sMap);

    const pMap: Record<string, Prop> = {};
    ((resP.data || []) as Prop[]).forEach(p => { pMap[p.id] = p; });
    setProps(pMap);

    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const updateEstado = async (id: string, estado: string) => {
    await supabase.from("citas_reservas").update({ estado }).eq("id", id);
    loadData();
  };

  const getSlot = (r: Reserva) => r.slot_id ? slots[r.slot_id] : null;
  const getProp = (r: Reserva) => {
    const pid = r.propiedad_id || getSlot(r)?.propiedad_id;
    return pid ? props[pid] : null;
  };

  const buildGCalLink = (r: Reserva) => {
    const slot = getSlot(r);
    if (!slot) return "#";
    const dateStr = slot.fecha.replace(/-/g, "");
    const [h] = slot.hora.split(":");
    const start = `${dateStr}T${h.padStart(2, "0")}0000`;
    const end = `${dateStr}T${String(parseInt(h) + 1).padStart(2, "0")}0000`;
    const prop = getProp(r);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Visita ${prop?.nombre_inmueble || "inmueble"}`)}&dates=${start}/${end}&details=${encodeURIComponent("Cita agendada Inmobiliaria EO")}&location=${encodeURIComponent(prop?.direccion || "Cali, Colombia")}`;
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-foreground mb-6">Reservas recibidas</h2>

      <div className="overflow-x-auto border border-foreground/10">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              {["Fecha", "Hora", "Inmueble", "Cliente", "Celular", "Estado", "Acciones"].map(h => (
                <th key={h} className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reservas.map(r => {
              const slot = getSlot(r);
              const prop = getProp(r);
              return (
                <tr key={r.id} className="border-t border-foreground/5 hover:bg-muted/20 cursor-pointer" onClick={() => setSelected(r)}>
                  <td className="p-4 font-body">{slot ? new Date(slot.fecha + "T12:00:00").toLocaleDateString("es-CO") : "-"}</td>
                  <td className="p-4 font-body">{slot?.hora || "-"}</td>
                  <td className="p-4 font-body">{prop?.nombre_inmueble || "Cualquier inmueble"}</td>
                  <td className="p-4 font-body">{r.nombre_cliente}</td>
                  <td className="p-4 font-body">{r.celular_cliente}</td>
                  <td className="p-4">
                    <select
                      value={r.estado}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateEstado(r.id, e.target.value)}
                      className={`px-2 py-1 text-xs font-heading font-semibold border-0 bg-transparent focus:outline-none ${
                        r.estado === "Pendiente" ? "text-primary" :
                        r.estado === "Confirmada" ? "text-[hsl(142,70%,45%)]" :
                        "text-destructive"
                      }`}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Confirmada">Confirmada</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </td>
                  <td className="p-4" onClick={e => e.stopPropagation()}>
                    <a href={buildGCalLink(r)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-heading font-semibold text-primary hover:text-primary/70">
                      <ExternalLink size={14} /> Calendar
                    </a>
                  </td>
                </tr>
              );
            })}
            {reservas.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center font-body text-muted-foreground">No hay reservas.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-heading text-xl">Detalle de Reserva</DialogTitle></DialogHeader>
          {selected && (() => {
            const slot = getSlot(selected);
            const prop = getProp(selected);
            return (
              <div className="space-y-3 mt-4">
                {[
                  ["Cliente", selected.nombre_cliente],
                  ["Celular", selected.celular_cliente],
                  ["Correo", selected.correo_cliente],
                  ["Inmueble", prop?.nombre_inmueble || "Cualquier inmueble"],
                  ["Fecha", slot ? new Date(slot.fecha + "T12:00:00").toLocaleDateString("es-CO") : "-"],
                  ["Hora", slot?.hora],
                  ["Agente", slot?.agente],
                  ["Estado", selected.estado],
                  ["Fecha solicitud", new Date(selected.fecha_creacion).toLocaleString("es-CO")],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <p className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">{label}</p>
                    <p className="font-body text-foreground">{value || "-"}</p>
                  </div>
                ))}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCitasReservas;
