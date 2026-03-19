import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar as CalendarIcon, Plus, Loader2, X, ChevronLeft, ChevronRight,
  ExternalLink, ToggleLeft, ToggleRight,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type Slot = {
  id: string;
  fecha: string;
  hora: string;
  propiedad_id: string | null;
  agente: string;
  activo: boolean;
  estado: string;
  fecha_creacion: string;
};

type Propiedad = { id: string; nombre_inmueble: string; direccion: string | null };

const HOURS = ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfWeek = (year: number, month: number) => {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Monday = 0
};

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const AdminCitasDisponibilidad = () => {
  const { toast } = useToast();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [reservas, setReservas] = useState<{ slot_id: string }[]>([]);
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [formFecha, setFormFecha] = useState("");
  const [formHora, setFormHora] = useState(HOURS[0]);
  const [formPropiedadId, setFormPropiedadId] = useState<string | null>(null);
  const [formAgente, setFormAgente] = useState("Eliana Osorio");

  const loadData = async () => {
    setLoading(true);
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${getDaysInMonth(year, month)}`;

    const [slotsRes, reservasRes, propsRes] = await Promise.all([
      supabase.from("citas_disponibles").select("*").gte("fecha", startDate).lte("fecha", endDate).order("fecha").order("hora"),
      supabase.from("citas_reservas").select("slot_id, estado").gte("fecha_creacion", `${startDate}T00:00:00`),
      supabase.from("propiedades").select("id, nombre_inmueble, direccion").eq("estado", "Disponible"),
    ]);
    setSlots((slotsRes.data || []) as Slot[]);
    setReservas((reservasRes.data || []) as { slot_id: string }[]);
    setPropiedades((propsRes.data || []) as Propiedad[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [year, month]);

  const slotsByDay = useMemo(() => {
    const map: Record<number, Slot[]> = {};
    slots.forEach((s) => {
      const day = parseInt(s.fecha.split("-")[2], 10);
      if (!map[day]) map[day] = [];
      map[day].push(s);
    });
    return map;
  }, [slots]);

  const reservedSlotIds = useMemo(() => new Set(reservas.map((r) => r.slot_id)), [reservas]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const openNewSlotForm = () => {
    const d = selectedDay || today.getDate();
    setFormFecha(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    setFormHora(HOURS[0]);
    setFormPropiedadId(null);
    setFormAgente("Eliana Osorio");
    setFormOpen(true);
  };

  const handleSaveSlot = async () => {
    setSaving(true);
    const { error } = await supabase.from("citas_disponibles").insert({
      fecha: formFecha,
      hora: formHora,
      propiedad_id: formPropiedadId,
      agente: formAgente,
    });
    if (error) {
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Slot guardado" });
      setFormOpen(false);
      loadData();
    }
    setSaving(false);
  };

  const toggleSlotActivo = async (slot: Slot) => {
    await supabase.from("citas_disponibles").update({ activo: !slot.activo }).eq("id", slot.id);
    loadData();
  };

  const getPropName = (id: string | null) => {
    if (!id) return "Cualquier inmueble";
    return propiedades.find(p => p.id === id)?.nombre_inmueble || "Inmueble";
  };

  const getPropDireccion = (id: string | null) => {
    if (!id) return "Cali, Colombia";
    return propiedades.find(p => p.id === id)?.direccion || "Cali, Colombia";
  };

  const buildGoogleCalLink = (slot: Slot) => {
    const dateStr = slot.fecha.replace(/-/g, "");
    const [h, m] = slot.hora.split(":");
    const startTime = `${dateStr}T${h.padStart(2, "0")}${(m || "00").padStart(2, "0")}00`;
    const endH = String(parseInt(h) + 1).padStart(2, "0");
    const endTime = `${dateStr}T${endH}${(m || "00").padStart(2, "0")}00`;
    const name = getPropName(slot.propiedad_id);
    const location = getPropDireccion(slot.propiedad_id);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Visita ${name}`)}&dates=${startTime}/${endTime}&details=${encodeURIComponent("Cita agendada Inmobiliaria EO")}&location=${encodeURIComponent(location)}`;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const daySlots = selectedDay ? (slotsByDay[selectedDay] || []) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-bold text-foreground">Disponibilidad de Citas</h2>
        <button onClick={openNewSlotForm} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors">
          <Plus size={16} /> Nueva cita disponible
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Calendar */}
          <div className="border border-foreground/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="p-2 hover:bg-muted/30 transition-colors"><ChevronLeft size={20} /></button>
              <h3 className="font-heading text-lg font-bold">{MONTH_NAMES[month]} {year}</h3>
              <button onClick={nextMonth} className="p-2 hover:bg-muted/30 transition-colors"><ChevronRight size={20} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => (
                <div key={d} className="text-center font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase py-2">{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayS = slotsByDay[day] || [];
                const hasAvailable = dayS.some(s => s.activo && s.estado === "Disponible");
                const hasReserved = dayS.some(s => s.estado === "Reservado" || reservedSlotIds.has(s.id));
                const isSelected = selectedDay === day;
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`relative p-3 text-center font-body text-sm transition-colors border ${
                      isSelected ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted/20"
                    } ${isToday ? "font-bold" : ""}`}
                  >
                    {day}
                    <div className="flex justify-center gap-1 mt-1">
                      {hasAvailable && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      {hasReserved && <span className="w-1.5 h-1.5 rounded-full bg-[hsl(142,70%,45%)]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day detail panel */}
          <div className="border border-foreground/10 p-6">
            {selectedDay ? (
              <>
                <h3 className="font-heading text-lg font-bold mb-4">
                  {selectedDay} de {MONTH_NAMES[month]}
                </h3>
                {daySlots.length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground">No hay slots para este día.</p>
                ) : (
                  <div className="space-y-3">
                    {daySlots.map((slot) => (
                      <div key={slot.id} className={`p-4 border ${slot.activo ? "border-foreground/10" : "border-foreground/5 opacity-50"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-heading text-sm font-bold">{slot.hora}</span>
                          <span className={`px-2 py-0.5 font-heading text-[10px] font-semibold tracking-widest uppercase ${
                            slot.estado === "Disponible" ? "bg-primary/10 text-primary" :
                            slot.estado === "Reservado" ? "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {slot.estado}
                          </span>
                        </div>
                        <p className="font-body text-xs text-muted-foreground mb-1">{getPropName(slot.propiedad_id)}</p>
                        <p className="font-body text-xs text-muted-foreground mb-3">Agente: {slot.agente}</p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleSlotActivo(slot)} className="text-muted-foreground hover:text-primary transition-colors" title={slot.activo ? "Desactivar" : "Activar"}>
                            {slot.activo ? <ToggleRight size={18} className="text-primary" /> : <ToggleLeft size={18} />}
                          </button>
                          <a href={buildGoogleCalLink(slot)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-heading font-semibold tracking-widest uppercase text-primary hover:text-primary/70 transition-colors">
                            <ExternalLink size={14} /> Google Calendar
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="font-body text-sm text-muted-foreground">Selecciona un día para ver los slots.</p>
            )}
          </div>
        </div>
      )}

      {/* New slot dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => !o && setFormOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Nueva cita disponible</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Fecha</label>
              <input type="date" value={formFecha} onChange={e => setFormFecha(e.target.value)} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Hora</label>
              <select value={formHora} onChange={e => setFormHora(e.target.value)} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none">
                {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Inmueble</label>
              <select value={formPropiedadId || ""} onChange={e => setFormPropiedadId(e.target.value || null)} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none">
                <option value="">Disponible para cualquier inmueble</option>
                {propiedades.map(p => <option key={p.id} value={p.id}>{p.nombre_inmueble}</option>)}
              </select>
            </div>
            <div>
              <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Agente</label>
              <input type="text" value={formAgente} onChange={e => setFormAgente(e.target.value)} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
            </div>
            <button onClick={handleSaveSlot} disabled={saving} className="w-full py-3 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Guardando..." : "Guardar slot"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCitasDisponibilidad;
