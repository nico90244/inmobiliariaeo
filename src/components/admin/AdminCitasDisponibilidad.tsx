import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar as CalendarIcon, Plus, Loader2, X, ChevronLeft, ChevronRight,
  ExternalLink, ToggleLeft, ToggleRight, Pencil, Trash2,
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

// ✅ Horarios completos incluyendo 12:00 y 13:00
const HOURS = [
  "8:00", "9:00", "10:00", "11:00",
  "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00",
];

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfWeek = (year: number, month: number) => {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
};

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const EMPTY_FORM = {
  fecha: "",
  hora: "9:00",
  propiedadId: null as string | null,
  agente: "Eliana Osorio",
};

const AdminCitasDisponibilidad = () => {
  const { toast } = useToast();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [reservas, setReservas] = useState<{ slot_id: string }[]>([]);
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null); // null = nuevo
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Slot | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ─── Load data ─── */
  const loadData = async () => {
    setLoading(true);
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${getDaysInMonth(year, month)}`;

    const [slotsRes, reservasRes, propsRes] = await Promise.all([
      supabase
        .from("citas_disponibles")
        .select("*")
        .gte("fecha", startDate)
        .lte("fecha", endDate)
        .order("fecha")
        .order("hora"),
      supabase
        .from("citas_reservas")
        .select("slot_id, estado"),
      supabase
        .from("propiedades")
        .select("id, nombre_inmueble, direccion")
        .eq("estado", "Disponible"),
    ]);

    setSlots((slotsRes.data || []) as Slot[]);
    setReservas((reservasRes.data || []) as { slot_id: string }[]);
    setPropiedades((propsRes.data || []) as Propiedad[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [year, month]);

  /* ─── Derived ─── */
  const slotsByDay = useMemo(() => {
    const map: Record<number, Slot[]> = {};
    slots.forEach((s) => {
      const day = parseInt(s.fecha.split("-")[2], 10);
      if (!map[day]) map[day] = [];
      map[day].push(s);
    });
    return map;
  }, [slots]);

  const reservedSlotIds = useMemo(
    () => new Set(reservas.map((r) => r.slot_id)),
    [reservas]
  );

  const daySlots = selectedDay ? (slotsByDay[selectedDay] || []) : [];

  /* ─── Navigation ─── */
  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  /* ─── Helpers ─── */
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

  const isReserved = (slot: Slot) =>
    slot.estado === "Reservado" || reservedSlotIds.has(slot.id);

  /* ─── Open forms ─── */
  const openNew = () => {
    const d = selectedDay || today.getDate();
    setEditingSlot(null);
    setForm({
      fecha: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      hora: "9:00",
      propiedadId: null,
      agente: "Eliana Osorio",
    });
    setFormOpen(true);
  };

  const openEdit = (slot: Slot) => {
    setEditingSlot(slot);
    setForm({
      fecha: slot.fecha,
      hora: slot.hora,
      propiedadId: slot.propiedad_id,
      agente: slot.agente,
    });
    setFormOpen(true);
  };

  /* ─── Save (create or update) ─── */
  const handleSave = async () => {
    if (!form.fecha || !form.hora || !form.agente) {
      toast({ title: "Completa todos los campos", variant: "destructive" });
      return;
    }
    setSaving(true);

    if (editingSlot) {
      // UPDATE
      const { error } = await supabase
        .from("citas_disponibles")
        .update({
          fecha: form.fecha,
          hora: form.hora,
          propiedad_id: form.propiedadId,
          agente: form.agente,
        })
        .eq("id", editingSlot.id);

      if (error) {
        toast({ title: "Error al actualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Cita actualizada correctamente" });
        setFormOpen(false);
        loadData();
      }
    } else {
      // INSERT
      const { error } = await supabase.from("citas_disponibles").insert({
        fecha: form.fecha,
        hora: form.hora,
        propiedad_id: form.propiedadId,
        agente: form.agente,
      });

      if (error) {
        toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Cita creada correctamente" });
        setFormOpen(false);
        loadData();
      }
    }
    setSaving(false);
  };

  /* ─── Toggle activo ─── */
  const toggleActivo = async (slot: Slot) => {
    await supabase
      .from("citas_disponibles")
      .update({ activo: !slot.activo })
      .eq("id", slot.id);
    loadData();
  };

  /* ─── Delete ─── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    // If reserved, mark as Cancelado instead of deleting
    if (isReserved(deleteTarget)) {
      const { error } = await supabase
        .from("citas_disponibles")
        .update({ estado: "Cancelado", activo: false })
        .eq("id", deleteTarget.id);
      if (error) {
        toast({ title: "Error al cancelar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Cita cancelada", description: "El cliente fue marcado como cancelado." });
        setDeleteTarget(null);
        loadData();
      }
    } else {
      // Safe to delete completely
      const { error } = await supabase
        .from("citas_disponibles")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) {
        toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Cita eliminada" });
        setDeleteTarget(null);
        loadData();
      }
    }
    setDeleting(false);
  };

  /* ─── Render ─── */
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-bold text-foreground">Disponibilidad de Citas</h2>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} /> Nueva cita disponible
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* ── Calendar ── */}
          <div className="border border-foreground/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="p-2 hover:bg-muted/30 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <h3 className="font-heading text-lg font-bold">
                {MONTH_NAMES[month]} {year}
              </h3>
              <button onClick={nextMonth} className="p-2 hover:bg-muted/30 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => (
                <div key={d} className="text-center font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase py-2">
                  {d}
                </div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayS = slotsByDay[day] || [];
                const hasAvailable = dayS.some(s => s.activo && s.estado === "Disponible");
                const hasReserved = dayS.some(s => isReserved(s));
                const hasCancelled = dayS.some(s => s.estado === "Cancelado");
                const isSelected = selectedDay === day;
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`relative p-3 text-center font-body text-sm transition-colors border ${
                      isSelected ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted/20"
                    } ${isToday ? "font-bold ring-1 ring-primary/40" : ""}`}
                  >
                    {day}
                    <div className="flex justify-center gap-1 mt-1">
                      {hasAvailable && <span className="w-1.5 h-1.5 rounded-full bg-primary" title="Disponible" />}
                      {hasReserved && <span className="w-1.5 h-1.5 rounded-full bg-[hsl(142,70%,45%)]" title="Reservado" />}
                      {hasCancelled && <span className="w-1.5 h-1.5 rounded-full bg-destructive/50" title="Cancelado" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-foreground/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="font-body text-xs text-muted-foreground">Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[hsl(142,70%,45%)]" />
                <span className="font-body text-xs text-muted-foreground">Reservado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
                <span className="font-body text-xs text-muted-foreground">Cancelado</span>
              </div>
            </div>
          </div>

          {/* ── Day detail ── */}
          <div className="border border-foreground/10 p-6 max-h-[600px] overflow-y-auto">
            {selectedDay ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-lg font-bold">
                    {selectedDay} de {MONTH_NAMES[month]}
                  </h3>
                  <button
                    onClick={openNew}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary/20 transition-colors"
                  >
                    <Plus size={12} /> Agregar
                  </button>
                </div>

                {daySlots.length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground">
                    No hay citas para este día.{" "}
                    <button onClick={openNew} className="text-primary underline hover:text-primary/70">
                      Crear una
                    </button>
                  </p>
                ) : (
                  <div className="space-y-3">
                    {daySlots
                      .sort((a, b) => a.hora.localeCompare(b.hora))
                      .map((slot) => {
                        const reserved = isReserved(slot);
                        return (
                          <div
                            key={slot.id}
                            className={`p-4 border rounded-sm ${
                              slot.estado === "Cancelado"
                                ? "border-destructive/20 bg-destructive/5 opacity-60"
                                : slot.activo
                                ? "border-foreground/10"
                                : "border-foreground/5 opacity-50"
                            }`}
                          >
                            {/* Header row */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-heading text-base font-bold">{slot.hora}</span>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 font-heading text-[10px] font-semibold tracking-widest uppercase ${
                                  slot.estado === "Disponible" ? "bg-primary/10 text-primary" :
                                  slot.estado === "Reservado" ? "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]" :
                                  "bg-destructive/10 text-destructive"
                                }`}>
                                  {slot.estado}
                                </span>
                                {reserved && (
                                  <span className="font-heading text-[10px] tracking-widest text-[hsl(142,70%,45%)] uppercase">
                                    · Con cliente
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Info */}
                            <p className="font-body text-xs text-muted-foreground mb-0.5">
                              📍 {getPropName(slot.propiedad_id)}
                            </p>
                            <p className="font-body text-xs text-muted-foreground mb-3">
                              👤 Agente: {slot.agente}
                            </p>

                            {/* Actions */}
                            <div className="flex items-center gap-3 flex-wrap">
                              {/* Toggle active */}
                              {slot.estado !== "Cancelado" && (
                                <button
                                  onClick={() => toggleActivo(slot)}
                                  className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                                  title={slot.activo ? "Desactivar" : "Activar"}
                                >
                                  {slot.activo
                                    ? <ToggleRight size={18} className="text-primary" />
                                    : <ToggleLeft size={18} />}
                                  <span className="font-heading text-[10px] tracking-widest uppercase">
                                    {slot.activo ? "Activo" : "Inactivo"}
                                  </span>
                                </button>
                              )}

                              {/* Edit — only if not reserved */}
                              {!reserved && slot.estado !== "Cancelado" && (
                                <button
                                  onClick={() => openEdit(slot)}
                                  className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                                  title="Editar cita"
                                >
                                  <Pencil size={14} />
                                  <span className="font-heading text-[10px] tracking-widest uppercase">Editar</span>
                                </button>
                              )}

                              {/* Delete / Cancel */}
                              {slot.estado !== "Cancelado" && (
                                <button
                                  onClick={() => setDeleteTarget(slot)}
                                  className="flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors"
                                  title={reserved ? "Cancelar cita (tiene cliente)" : "Eliminar cita"}
                                >
                                  <Trash2 size={14} />
                                  <span className="font-heading text-[10px] tracking-widest uppercase">
                                    {reserved ? "Cancelar" : "Eliminar"}
                                  </span>
                                </button>
                              )}

                              {/* Google Calendar */}
                              <a
                                href={buildGoogleCalLink(slot)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:text-primary/70 transition-colors ml-auto"
                                title="Ver en Google Calendar"
                              >
                                <ExternalLink size={14} />
                                <span className="font-heading text-[10px] tracking-widest uppercase">Cal</span>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center gap-3">
                <CalendarIcon size={32} className="text-muted-foreground/30" />
                <p className="font-body text-sm text-muted-foreground">
                  Selecciona un día para ver las citas
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={formOpen} onOpenChange={(o) => !o && setFormOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {editingSlot ? "Editar cita" : "Nueva cita disponible"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="cf-fecha" className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">
                Fecha
              </label>
              <input
                id="cf-fecha"
                type="date"
                min={todayStr}
                value={form.fecha}
                onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="cf-hora" className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">
                Hora
              </label>
              <select
                id="cf-hora"
                value={form.hora}
                onChange={e => setForm(f => ({ ...f, hora: e.target.value }))}
                className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none"
              >
                {HOURS.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cf-prop" className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">
                Inmueble
              </label>
              <select
                id="cf-prop"
                value={form.propiedadId || ""}
                onChange={e => setForm(f => ({ ...f, propiedadId: e.target.value || null }))}
                className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none"
              >
                <option value="">Disponible para cualquier inmueble</option>
                {propiedades.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre_inmueble}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cf-agente" className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">
                Agente
              </label>
              <input
                id="cf-agente"
                type="text"
                value={form.agente}
                onChange={e => setForm(f => ({ ...f, agente: e.target.value }))}
                className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setFormOpen(false)}
                className="flex-1 py-2.5 border border-foreground/20 text-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-muted/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? "Guardando..." : editingSlot ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete / Cancel Confirm Dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              {deleteTarget && isReserved(deleteTarget) ? "Cancelar cita reservada" : "Eliminar cita"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {deleteTarget && isReserved(deleteTarget) ? (
              <p className="font-body text-sm text-muted-foreground">
                Esta cita <strong>tiene un cliente asignado</strong>. Se marcará como{" "}
                <span className="text-destructive font-semibold">Cancelada</span> y quedará registrada.
                ¿Deseas continuar?
              </p>
            ) : (
              <p className="font-body text-sm text-muted-foreground">
                La cita del{" "}
                <strong>{deleteTarget?.fecha} a las {deleteTarget?.hora}</strong>{" "}
                será eliminada permanentemente. ¿Confirmas?
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-foreground/20 text-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-muted/20 transition-colors"
              >
                Volver
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-destructive text-white font-heading text-sm font-semibold tracking-widest uppercase hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                {deleting
                  ? "Procesando..."
                  : deleteTarget && isReserved(deleteTarget)
                  ? "Sí, cancelar"
                  : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCitasDisponibilidad;
