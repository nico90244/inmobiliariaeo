import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, ExternalLink, MoreVertical, Calendar as CalendarIcon, Pencil, Trash2, Repeat } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { AGENTES, HOURS, formatHora12 } from "@/lib/horarios";

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

type Slot = { id: string; fecha: string; hora: string; agente: string; propiedad_id: string | null; estado?: string };
type Prop = { id: string; nombre_inmueble: string; direccion: string | null };

const AdminCitasReservas = () => {
  const { toast } = useToast();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [slots, setSlots] = useState<Record<string, Slot>>({});
  const [props, setProps] = useState<Record<string, Prop>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Reserva | null>(null);

  // Reprogramar / Modificar dialog
  const [editTarget, setEditTarget] = useState<Reserva | null>(null);
  const [editMode, setEditMode] = useState<"reprogramar" | "modificar">("reprogramar");
  const [editForm, setEditForm] = useState({ fecha: "", hora: "8:00", agente: AGENTES[0] as string, nombre: "", celular: "", correo: "", propiedadId: "" });
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Reserva | null>(null);
  const [deleting, setDeleting] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  const loadData = async () => {
    setLoading(true);
    const [resR, resS, resP] = await Promise.all([
      supabase.from("citas_reservas").select("*").neq("estado", "Eliminada").order("fecha_creacion", { ascending: false }),
      supabase.from("citas_disponibles").select("id, fecha, hora, agente, propiedad_id, estado"),
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
    const [hStr, mStr = "00"] = slot.hora.split(":");
    const h = parseInt(hStr, 10);
    const start = `${dateStr}T${String(h).padStart(2, "0")}${mStr.padStart(2, "0")}00`;
    const end = `${dateStr}T${String(h + 1).padStart(2, "0")}${mStr.padStart(2, "0")}00`;
    const prop = getProp(r);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Visita ${prop?.nombre_inmueble || "inmueble"}`)}&dates=${start}/${end}&details=${encodeURIComponent("Cita agendada Inmobiliaria EO")}&location=${encodeURIComponent(prop?.direccion || "Cali, Colombia")}`;
  };

  const openReprogramar = (r: Reserva) => {
    setEditTarget(r);
    setEditMode("reprogramar");
    const slot = getSlot(r);
    setEditForm({
      fecha: slot?.fecha || todayStr,
      hora: slot?.hora || "8:00",
      agente: slot?.agente || AGENTES[0],
      nombre: r.nombre_cliente,
      celular: r.celular_cliente,
      correo: r.correo_cliente || "",
      propiedadId: (r as any).propiedad_id || "",
    });
  };

  const openModificar = (r: Reserva) => {
    setEditTarget(r);
    setEditMode("modificar");
    const slot = getSlot(r);
    setEditForm({
      fecha: slot?.fecha || todayStr,
      hora: slot?.hora || "8:00",
      agente: slot?.agente || AGENTES[0],
      nombre: r.nombre_cliente,
      celular: r.celular_cliente,
      correo: r.correo_cliente || "",
      propiedadId: r.propiedad_id || slot?.propiedad_id || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      // Update reserva basic fields
      await supabase.from("citas_reservas").update({
        nombre_cliente: editForm.nombre,
        celular_cliente: editForm.celular,
        correo_cliente: editForm.correo || null,
        ...(editMode === "modificar" ? { propiedad_id: editForm.propiedadId || null } : {}),
      }).eq("id", editTarget.id);

      // For reprogramar, also update slot date/time/agent
      if (editMode === "reprogramar" && editTarget.slot_id) {
        await supabase.from("citas_disponibles").update({
          fecha: editForm.fecha,
          hora: editForm.hora,
          agente: editForm.agente,
        }).eq("id", editTarget.slot_id);
      }
      toast({ title: editMode === "reprogramar" ? "Cita reprogramada" : "Reserva actualizada" });
      setEditTarget(null);
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    // Soft delete: marcar como Eliminada (no altera estadísticas porque las filtramos)
    await supabase.from("citas_reservas").update({ estado: "Eliminada" }).eq("id", deleteTarget.id);
    // Liberar slot si estaba reservado
    if (deleteTarget.slot_id) {
      await supabase.from("citas_disponibles").update({ estado: "Disponible" }).eq("id", deleteTarget.slot_id);
    }
    toast({ title: "Reserva eliminada" });
    setDeleteTarget(null);
    loadData();
    setDeleting(false);
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
                <tr key={r.id} className="border-t border-foreground/5 hover:bg-muted/20">
                  <td className="p-4 font-body cursor-pointer" onClick={() => setSelected(r)}>{slot ? new Date(slot.fecha + "T12:00:00").toLocaleDateString("es-CO") : "-"}</td>
                  <td className="p-4 font-body cursor-pointer" onClick={() => setSelected(r)}>{slot ? formatHora12(slot.hora) : "-"}</td>
                  <td className="p-4 font-body cursor-pointer" onClick={() => setSelected(r)}>{prop?.nombre_inmueble || "Cualquier inmueble"}</td>
                  <td className="p-4 font-body cursor-pointer" onClick={() => setSelected(r)}>{r.nombre_cliente}</td>
                  <td className="p-4 font-body">{r.celular_cliente}</td>
                  <td className="p-4">
                    <select
                      value={r.estado}
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
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <a href={buildGCalLink(r)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-heading font-semibold text-primary hover:text-primary/70">
                        <ExternalLink size={14} /> Cal
                      </a>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 text-muted-foreground hover:text-foreground" aria-label="Más opciones">
                            <MoreVertical size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openReprogramar(r)}>
                            <Repeat size={14} className="mr-2" /> Reprogramar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openModificar(r)}>
                            <Pencil size={14} className="mr-2" /> Modificar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteTarget(r)} className="text-destructive focus:text-destructive">
                            <Trash2 size={14} className="mr-2" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
                  ["Hora", slot ? formatHora12(slot.hora) : "-"],
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

      {/* Reprogramar / Modificar dialog */}
      <Dialog open={!!editTarget} onOpenChange={o => !o && setEditTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl flex items-center gap-2">
              {editMode === "reprogramar" ? <><Repeat size={18} /> Reprogramar cita</> : <><Pencil size={18} /> Modificar reserva</>}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {editMode === "reprogramar" && (
              <>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Nueva fecha</label>
                  <input type="date" min={todayStr} value={editForm.fecha} onChange={e => setEditForm(f => ({ ...f, fecha: e.target.value }))}
                    className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Nueva hora</label>
                  <select value={editForm.hora} onChange={e => setEditForm(f => ({ ...f, hora: e.target.value }))}
                    className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none">
                    {HOURS.map(h => <option key={h} value={h}>{formatHora12(h)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Agente</label>
                  <select value={editForm.agente} onChange={e => setEditForm(f => ({ ...f, agente: e.target.value }))}
                    className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none">
                    {AGENTES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </>
            )}
            {editMode === "modificar" && (
              <div>
                <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Inmueble</label>
                <select
                  value={editForm.propiedadId}
                  onChange={e => setEditForm(f => ({ ...f, propiedadId: e.target.value }))}
                  className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none"
                >
                  <option value="">— Cualquier inmueble —</option>
                  {Object.values(props)
                    .sort((a, b) => a.nombre_inmueble.localeCompare(b.nombre_inmueble))
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.nombre_inmueble}</option>
                    ))}
                </select>
              </div>
            )}
            <div>
              <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Nombre</label>
              <input type="text" value={editForm.nombre} onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Celular</label>
              <input type="tel" value={editForm.celular} onChange={e => setEditForm(f => ({ ...f, celular: e.target.value }))}
                className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Correo (opcional)</label>
              <input type="email" value={editForm.correo} onChange={e => setEditForm(f => ({ ...f, correo: e.target.value }))}
                className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditTarget(null)} className="flex-1 py-2.5 border border-foreground/20 font-heading text-sm font-semibold tracking-widest uppercase hover:bg-muted/20 transition-colors">Cancelar</button>
              <button onClick={handleSaveEdit} disabled={saving} className="flex-1 py-2.5 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-heading text-lg">Eliminar reserva</DialogTitle></DialogHeader>
          <div className="mt-4 space-y-4">
            <p className="font-body text-sm text-muted-foreground">
              Esta reserva se marcará como <strong>eliminada</strong> y no afectará tus estadísticas. ¿Confirmas?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-foreground/20 font-heading text-sm font-semibold tracking-widest uppercase hover:bg-muted/20 transition-colors">Volver</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 bg-destructive text-white font-heading text-sm font-semibold tracking-widest uppercase hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {deleting && <Loader2 size={16} className="animate-spin" />}
                Sí, eliminar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCitasReservas;
