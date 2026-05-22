import { useState, useEffect, useMemo } from "react";
import { CalendarCheck, ChevronLeft, ChevronRight, Loader2, ExternalLink } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { Propiedad } from "@/hooks/usePropiedades";

type Slot = {
  id: string;
  fecha: string;
  hora: string;
  propiedad_id: string | null;
  agente: string;
  activo: boolean;
  estado: string;
};

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfWeek = (y: number, m: number) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };

const AppointmentBooking = ({ property }: { property: Propiedad }) => {
  const { toast } = useToast();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Form
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [correo, setCorreo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const loadSlots = async () => {
    setLoading(true);
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${getDaysInMonth(year, month)}`;

    const { data } = await supabase
      .from("citas_disponibles")
      .select("*")
      .eq("activo", true)
      .eq("estado", "Disponible")
      .gte("fecha", todayStr)
      .gte("fecha", startDate)
      .lte("fecha", endDate)
      .or(`propiedad_id.eq.${property.id},propiedad_id.is.null`)
      .order("fecha")
      .order("hora");

    setSlots((data || []) as Slot[]);
    setLoading(false);
  };

  useEffect(() => {
    loadSlots();
    setSelectedDay(null);
    setSelectedSlot(null);
    setConfirmed(false);
  }, [year, month]);

  const slotsByDay = useMemo(() => {
    const map: Record<number, Slot[]> = {};
    slots.forEach(s => {
      const day = parseInt(s.fecha.split("-")[2], 10);
      if (!map[day]) map[day] = [];
      map[day].push(s);
    });
    return map;
  }, [slots]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const daySlots = selectedDay ? (slotsByDay[selectedDay] || []) : [];

  const handleConfirm = async () => {
    if (!nombre || !celular || !selectedSlot) return;
    setSubmitting(true);

    try {
      // Insert reservation
      const { error: insertErr } = await supabase.from("citas_reservas").insert({
        slot_id: selectedSlot.id,
        propiedad_id: property.id,
        nombre_cliente: nombre,
        celular_cliente: celular,
        correo_cliente: correo || null,
      });
      if (insertErr) throw insertErr;

      // Update slot status
      await supabase.from("citas_disponibles").update({ estado: "Reservado" }).eq("id", selectedSlot.id);

      // Build WhatsApp message
      const fechaFormatted = selectedSlot.fecha.split("-").reverse().join("/");
      const shortId = property.id.slice(0, 8);
      const text = `*Nueva solicitud de visita*\nInmueble: ${property.nombre_inmueble}\nID: ${shortId}\nDirección: ${property.direccion || "Sin dirección"}\nFecha: ${fechaFormatted}\nHora: ${selectedSlot.hora}\nAgente: ${selectedSlot.agente}\n---\n*Datos del interesado:*\nNombre: ${nombre}\nCelular: ${celular}`;
      window.open(`https://wa.me/573162225604?text=${encodeURIComponent(text)}`, "_blank");

      setConfirmed(true);
      toast({ title: "¡Visita agendada!", description: "Te contactaremos para confirmar." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const buildClientGCalLink = () => {
    if (!selectedSlot) return "#";
    const dateStr = selectedSlot.fecha.replace(/-/g, "");
    const [h] = selectedSlot.hora.split(":");
    const start = `${dateStr}T${h.padStart(2, "0")}0000`;
    const end = `${dateStr}T${String(parseInt(h) + 1).padStart(2, "0")}0000`;
    const location = [property.direccion, property.barrio, "Cali", "Colombia"].filter(Boolean).join(", ");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Visita inmueble ${property.nombre_inmueble}`)}&dates=${start}/${end}&details=${encodeURIComponent(`Inmobiliaria Eliana Osorio - Agente: ${selectedSlot.agente} - Tel: 3186531598`)}&location=${encodeURIComponent(location)}`;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  return (
    <div className="bg-background border border-primary/20 shadow-lg p-6">
      <h3 className="font-heading text-lg font-bold text-foreground mb-1 flex items-center gap-2">
        <CalendarCheck size={20} className="text-primary" /> Agendar visita
      </h3>
      <p className="font-body text-sm text-muted-foreground mb-4">Selecciona un horario disponible</p>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={24} /></div>
      ) : confirmed ? (
        <div className="text-center py-6 space-y-4">
          <p className="font-heading text-sm font-bold text-[hsl(142,70%,45%)]">✓ Visita agendada exitosamente</p>
          <a
            href={buildClientGCalLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors"
          >
            <ExternalLink size={14} /> Agregar a mi calendario
          </a>
        </div>
      ) : (
        <>
          {/* STEP 1: Calendar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="p-1 hover:bg-muted/30 transition-colors"><ChevronLeft size={16} /></button>
              <span className="font-heading text-sm font-bold">{MONTH_NAMES[month]} {year}</span>
              <button onClick={nextMonth} className="p-1 hover:bg-muted/30 transition-colors"><ChevronRight size={16} /></button>
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {["L", "M", "X", "J", "V", "S", "D"].map(d => (
                <div key={d} className="text-center font-heading text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isPast = dateStr < todayStr;
                const hasSlots = !!slotsByDay[day]?.length;
                const isSelected = selectedDay === day;

                return (
                  <button
                    key={day}
                    disabled={isPast || !hasSlots}
                    onClick={() => { setSelectedDay(day); setSelectedSlot(null); }}
                    className={`p-2 text-center font-body text-xs transition-colors ${
                      isPast ? "text-muted-foreground/30 cursor-not-allowed" :
                      !hasSlots ? "text-muted-foreground/50 cursor-not-allowed" :
                      isSelected ? "bg-primary text-primary-foreground font-bold" :
                      "bg-primary/10 text-foreground cursor-pointer hover:bg-primary/20"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Time slots */}
          {selectedDay && daySlots.length > 0 && (
            <div className="mb-4">
              <p className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2">Horarios disponibles</p>
              <div className="flex flex-wrap gap-2">
                {daySlots.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-4 py-2 font-body text-sm border transition-colors ${
                      selectedSlot?.id === slot.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-primary/30 hover:border-primary"
                    }`}
                  >
                    {slot.hora}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Contact form */}
          {selectedSlot && (
            <div className="space-y-3 border-t border-foreground/10 pt-4">
              <input
                type="text" placeholder="Nombre completo *" value={nombre} onChange={e => setNombre(e.target.value)}
                className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
              />
              <input
                type="tel" placeholder="Celular *" value={celular} onChange={e => setCelular(e.target.value)}
                className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
              />
              <input
                type="email" placeholder="Correo (opcional)" value={correo} onChange={e => setCorreo(e.target.value)}
                className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
              />
              <button
                onClick={handleConfirm}
                disabled={submitting || !nombre || !celular}
                className="w-full py-3 bg-primary text-primary-foreground font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Confirmando..." : "Confirmar visita"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AppointmentBooking;
