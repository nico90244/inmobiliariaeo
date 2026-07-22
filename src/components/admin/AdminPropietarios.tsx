import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Plus, Pencil, Trash2, Search, User, Phone, Mail,
  MapPin, FileText, Building2, X, ChevronRight, Globe, Landmark,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Propietario = {
  id: string;
  nombre: string;
  apellido: string | null;
  tipo_documento: string | null;
  numero_documento: string | null;
  telefono: string | null;
  email: string | null;
  ciudad: string | null;
  pais: string | null;
  banco: string | null;
  numero_cuenta: string | null;
  tipo_cuenta: string | null;
  notas: string | null;
  created_at: string;
};

type PropiedadResumen = {
  id: string;
  nombre_inmueble: string;
  tipo_inmueble: string | null;
  tipo_negocio: string | null;
  barrio: string | null;
  estado: string | null;
  precio: number | null;
};

type PropiedadParaForm = {
  id: string;
  nombre_inmueble: string;
  tipo_inmueble: string | null;
  tipo_negocio: string | null;
  barrio: string | null;
  propietario_id: string | null;
};

const TIPOS_DOC    = ["CC", "CE", "Pasaporte", "NIT", "PPT"];
const TIPOS_CUENTA = ["Ahorros", "Corriente"];

const emptyForm = {
  nombre: "",
  apellido: "",
  tipo_documento: "CC",
  numero_documento: "",
  telefono: "",
  email: "",
  ciudad: "Cali",
  pais: "Colombia",
  banco: "",
  numero_cuenta: "",
  tipo_cuenta: "Ahorros",
  notas: "",
};

const fmt = (n: number | null | undefined) =>
  n == null
    ? "Consultar"
    : new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

const estadoBadge = (estado: string | null) => {
  const map: Record<string, string> = {
    Disponible: "bg-emerald-100 text-emerald-800",
    Arrendado:  "bg-blue-100 text-blue-800",
    Vendido:    "bg-gray-100 text-gray-700",
    Descartado: "bg-red-100 text-red-700",
  };
  return map[estado ?? ""] ?? "bg-gray-100 text-gray-600";
};

const AdminPropietarios = () => {
  const { toast } = useToast();

  const [propietarios, setPropietarios]     = useState<Propietario[]>([]);
  const [propiedadesMap, setPropiedadesMap] = useState<Record<string, PropiedadResumen[]>>({});
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState("");

  const [selected, setSelected]             = useState<Propietario | null>(null);
  const [detailOpen, setDetailOpen]         = useState(false);

  const [formOpen, setFormOpen]             = useState(false);
  const [form, setForm]                     = useState<typeof emptyForm>(emptyForm);
  const [editingId, setEditingId]           = useState<string | null>(null);
  const [saving, setSaving]                 = useState(false);

  // Property selection inside the form
  const [formProps, setFormProps]           = useState<PropiedadParaForm[]>([]);
  const [selectedPropIds, setSelectedPropIds] = useState<Set<string>>(new Set());
  const [propSearch, setPropSearch]         = useState("");

  // Quick link from detail view
  const [linkOpen, setLinkOpen]             = useState(false);
  const [unlinkedProps, setUnlinkedProps]   = useState<PropiedadResumen[]>([]);
  const [linkSearch, setLinkSearch]         = useState("");
  const [linking, setLinking]               = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [pRes, prRes] = await Promise.all([
      (supabase as any).from("propietarios").select("*").order("nombre"),
      (supabase as any).from("propiedades").select("id, nombre_inmueble, tipo_inmueble, tipo_negocio, barrio, estado, precio, propietario_id"),
    ]);
    const propietariosList: Propietario[] = pRes.data || [];
    const propiedadesList: (PropiedadResumen & { propietario_id: string | null })[] = (prRes.data as any) || [];

    const map: Record<string, PropiedadResumen[]> = {};
    propietariosList.forEach(p => { map[p.id] = []; });
    propiedadesList.forEach(pr => {
      if (pr.propietario_id && map[pr.propietario_id]) {
        map[pr.propietario_id].push(pr);
      }
    });

    setPropietarios(propietariosList);
    setPropiedadesMap(map);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return propietarios;
    return propietarios.filter(p =>
      `${p.nombre} ${p.apellido ?? ""} ${p.numero_documento ?? ""} ${p.telefono ?? ""} ${p.email ?? ""}`.toLowerCase().includes(q)
    );
  }, [propietarios, search]);

  // Load properties available for form (unlinked + already owned by this propietario)
  const loadFormProps = async (ownerId: string | null) => {
    const query = supabase
      .from("propiedades")
      .select("id, nombre_inmueble, tipo_inmueble, tipo_negocio, barrio, propietario_id")
      .order("nombre_inmueble");

    if (ownerId) {
      // unlinked OR already owned by this propietario
      (query as any).or(`propietario_id.is.null,propietario_id.eq.${ownerId}`);
    } else {
      // only unlinked
      query.is("propietario_id", null);
    }

    const { data } = await query;
    setFormProps((data as any) || []);
  };

  const openNew = async () => {
    setForm(emptyForm);
    setEditingId(null);
    setSelectedPropIds(new Set());
    setPropSearch("");
    await loadFormProps(null);
    setFormOpen(true);
  };

  const openEdit = async (p: Propietario) => {
    setForm({
      nombre:           p.nombre,
      apellido:         p.apellido ?? "",
      tipo_documento:   p.tipo_documento ?? "CC",
      numero_documento: p.numero_documento ?? "",
      telefono:         p.telefono ?? "",
      email:            p.email ?? "",
      ciudad:           p.ciudad ?? "Cali",
      pais:             p.pais ?? "Colombia",
      banco:            p.banco ?? "",
      numero_cuenta:    p.numero_cuenta ?? "",
      tipo_cuenta:      p.tipo_cuenta ?? "Ahorros",
      notas:            p.notas ?? "",
    });
    setEditingId(p.id);
    // Pre-select current properties
    const current = new Set((propiedadesMap[p.id] ?? []).map(pr => pr.id));
    setSelectedPropIds(current);
    setPropSearch("");
    await loadFormProps(p.id);
    setFormOpen(true);
  };

  const toggleProp = (id: string) => {
    setSelectedPropIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredFormProps = useMemo(() => {
    const q = propSearch.toLowerCase();
    if (!q) return formProps;
    return formProps.filter(p =>
      `${p.nombre_inmueble} ${p.barrio ?? ""} ${p.tipo_inmueble ?? ""}`.toLowerCase().includes(q)
    );
  }, [formProps, propSearch]);

  const savePropietario = async () => {
    if (!form.nombre.trim()) {
      toast({ title: "El nombre es obligatorio", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      nombre:           form.nombre.trim(),
      apellido:         form.apellido?.trim() || null,
      tipo_documento:   form.tipo_documento || null,
      numero_documento: form.numero_documento?.trim() || null,
      telefono:         form.telefono?.trim() || null,
      email:            form.email?.trim() || null,
      ciudad:           form.ciudad?.trim() || null,
      pais:             form.pais?.trim() || null,
      banco:            form.banco?.trim() || null,
      numero_cuenta:    form.numero_cuenta?.trim() || null,
      tipo_cuenta:      form.tipo_cuenta || null,
      notas:            form.notas?.trim() || null,
    };

    let propietarioId: string;
    if (editingId) {
      const { error } = await (supabase as any).from("propietarios").update(payload).eq("id", editingId);
      if (error) {
        toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      propietarioId = editingId;
    } else {
      const { data, error } = await (supabase as any).from("propietarios").insert(payload).select("id").single();
      if (error) {
        toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      propietarioId = data.id;
    }

    // Sync property assignments
    const prevOwnedIds = new Set((propiedadesMap[propietarioId] ?? []).map(p => p.id));
    const toClear  = [...prevOwnedIds].filter(id => !selectedPropIds.has(id));
    const toAssign = [...selectedPropIds].filter(id => !prevOwnedIds.has(id));

    await Promise.all([
      ...toClear.map(id  => supabase.from("propiedades").update({ propietario_id: null } as any).eq("id", id)),
      ...toAssign.map(id => supabase.from("propiedades").update({ propietario_id: propietarioId } as any).eq("id", id)),
    ]);

    setSaving(false);
    toast({ title: editingId ? "Propietario actualizado" : "Propietario creado" });
    setFormOpen(false);
    await loadData();

    if (editingId && selected?.id === editingId) {
      const { data } = await (supabase as any).from("propietarios").select("*").eq("id", editingId).single();
      if (data) setSelected(data);
    }
  };

  const deletePropietario = async (p: Propietario) => {
    if (!confirm(`¿Eliminar a ${p.nombre} ${p.apellido ?? ""}? Las propiedades vinculadas quedarán sin propietario.`)) return;
    const { error } = await (supabase as any).from("propietarios").delete().eq("id", p.id);
    if (error) {
      toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Propietario eliminado" });
    if (detailOpen && selected?.id === p.id) setDetailOpen(false);
    loadData();
  };

  const openDetail = (p: Propietario) => {
    setSelected(p);
    setDetailOpen(true);
  };

  const openLinkModal = async () => {
    const { data } = await supabase
      .from("propiedades")
      .select("id, nombre_inmueble, tipo_inmueble, tipo_negocio, barrio, estado, precio")
      .is("propietario_id", null)
      .order("nombre_inmueble");
    setUnlinkedProps((data as any) || []);
    setLinkSearch("");
    setLinkOpen(true);
  };

  const linkProperty = async (propId: string) => {
    if (!selected) return;
    setLinking(true);
    await supabase.from("propiedades").update({ propietario_id: selected.id } as any).eq("id", propId);
    setLinking(false);
    toast({ title: "Propiedad vinculada" });
    setLinkOpen(false);
    await loadData();
  };

  const unlinkProperty = async (propId: string) => {
    await supabase.from("propiedades").update({ propietario_id: null } as any).eq("id", propId);
    toast({ title: "Propiedad desvinculada" });
    await loadData();
  };

  const filteredUnlinked = useMemo(() => {
    const q = linkSearch.toLowerCase();
    if (!q) return unlinkedProps;
    return unlinkedProps.filter(p =>
      `${p.nombre_inmueble} ${p.barrio ?? ""} ${p.tipo_inmueble ?? ""}`.toLowerCase().includes(q)
    );
  }, [unlinkedProps, linkSearch]);

  const selectedProps = selected ? (propiedadesMap[selected.id] ?? []) : [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="font-heading text-lg md:text-2xl font-bold text-foreground">Propietarios</h1>
          <p className="font-body text-xs text-muted-foreground mt-0.5">Clientes con inmuebles en administración</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary-hover transition-colors whitespace-nowrap"
        >
          <Plus size={14} /> Nuevo
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, documento, teléfono…"
          className="w-full border border-foreground/10 pl-9 pr-3 py-2 font-body text-sm focus:border-primary focus:outline-none bg-background"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-foreground/8 bg-background p-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-muted animate-pulse flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-2/3 bg-muted animate-pulse" />
                  <div className="h-2.5 w-1/3 bg-muted animate-pulse" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-2.5 w-1/2 bg-muted animate-pulse" />
                <div className="h-2.5 w-3/4 bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <User size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-body text-sm">{search ? "Sin resultados" : "Aún no hay propietarios registrados"}</p>
          {!search && (
            <button onClick={openNew} className="mt-4 font-heading text-xs font-semibold text-primary uppercase tracking-widest hover:underline">
              Crear el primero
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(p => {
            const numProps = (propiedadesMap[p.id] ?? []).length;
            return (
              <div key={p.id} className="border border-foreground/8 bg-background hover:border-primary/30 hover:shadow-sm transition-all duration-150 group">
                <div className="p-4 cursor-pointer" onClick={() => openDetail(p)}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-heading text-sm font-bold text-foreground leading-tight">
                          {p.nombre} {p.apellido ?? ""}
                        </p>
                        {p.tipo_documento && p.numero_documento && (
                          <p className="font-body text-[11px] text-muted-foreground">
                            {p.tipo_documento} {p.numero_documento}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground/40 group-hover:text-primary transition-colors mt-0.5 flex-shrink-0" />
                  </div>

                  <div className="space-y-1.5">
                    {p.telefono && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone size={12} className="flex-shrink-0" />
                        <span className="font-body text-xs">{p.telefono}</span>
                      </div>
                    )}
                    {p.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail size={12} className="flex-shrink-0" />
                        <span className="font-body text-xs truncate">{p.email}</span>
                      </div>
                    )}
                    {(p.ciudad || p.pais) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe size={12} className="flex-shrink-0" />
                        <span className="font-body text-xs">{[p.ciudad, p.pais].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                    {p.banco && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Landmark size={12} className="flex-shrink-0" />
                        <span className="font-body text-xs">{p.banco} · {p.tipo_cuenta}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-foreground/6 px-4 py-2.5">
                  <span className="font-body text-xs text-muted-foreground flex items-center gap-1.5">
                    <Building2 size={12} />
                    {numProps === 0 ? "Sin inmuebles" : `${numProps} inmueble${numProps > 1 ? "s" : ""}`}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={e => { e.stopPropagation(); openEdit(p); }} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Editar">
                      <Pencil size={13} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); deletePropietario(p); }} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors" title="Eliminar">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      <Dialog open={detailOpen} onOpenChange={o => !o && setDetailOpen(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl flex items-center gap-2">
                  <User size={20} className="text-primary" />
                  {selected.nombre} {selected.apellido ?? ""}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4 text-sm">
                {selected.tipo_documento && selected.numero_documento && (
                  <InfoRow icon={FileText} label="Documento" value={`${selected.tipo_documento} ${selected.numero_documento}`} />
                )}
                {selected.telefono && <InfoRow icon={Phone} label="Teléfono" value={selected.telefono} />}
                {selected.email && <InfoRow icon={Mail} label="Correo" value={selected.email} />}
                {(selected.ciudad || selected.pais) && (
                  <InfoRow icon={MapPin} label="Ubicación" value={[selected.ciudad, selected.pais].filter(Boolean).join(", ")} />
                )}
                {selected.banco && (
                  <InfoRow icon={Landmark} label="Banco" value={`${selected.banco} · ${selected.tipo_cuenta ?? ""}`} />
                )}
                {selected.numero_cuenta && (
                  <InfoRow icon={FileText} label="Nº cuenta" value={selected.numero_cuenta} />
                )}
                {selected.notas && (
                  <div className="col-span-2">
                    <p className="font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-1">Notas</p>
                    <p className="font-body text-sm text-foreground/80 bg-muted/30 p-3 rounded">{selected.notas}</p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    Inmuebles vinculados
                  </h3>
                  <button
                    onClick={openLinkModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-primary text-primary font-heading text-[11px] font-semibold tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Plus size={12} /> Vincular
                  </button>
                </div>

                {selectedProps.length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground py-4 text-center border border-dashed border-foreground/10">
                    Sin inmuebles vinculados
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedProps.map(pr => (
                      <div key={pr.id} className="flex items-center justify-between p-3 border border-foreground/8 bg-background">
                        <div className="min-w-0">
                          <p className="font-heading text-sm font-semibold text-foreground truncate">{pr.nombre_inmueble}</p>
                          <p className="font-body text-xs text-muted-foreground">
                            {[pr.tipo_inmueble, pr.barrio].filter(Boolean).join(" · ")}
                            {pr.tipo_negocio && <span className="ml-1 text-primary">· {pr.tipo_negocio}</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                          <div className="text-right hidden sm:block">
                            <p className="font-body text-xs font-semibold text-foreground">{fmt(pr.precio)}</p>
                            {pr.estado && (
                              <span className={`inline-block font-heading text-[10px] font-bold px-2 py-0.5 rounded-full ${estadoBadge(pr.estado)}`}>
                                {pr.estado}
                              </span>
                            )}
                          </div>
                          <button onClick={() => unlinkProperty(pr.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors" title="Desvincular">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-foreground/8">
                <button
                  onClick={() => { setDetailOpen(false); openEdit(selected); }}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground font-heading text-xs font-semibold tracking-widest uppercase hover:bg-foreground/80 transition-colors"
                >
                  <Pencil size={13} /> Editar
                </button>
                <button
                  onClick={() => { setDetailOpen(false); deletePropietario(selected); }}
                  className="flex items-center gap-2 px-4 py-2 border border-destructive text-destructive font-heading text-xs font-semibold tracking-widest uppercase hover:bg-destructive hover:text-white transition-colors"
                >
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create / Edit form modal */}
      <Dialog open={formOpen} onOpenChange={o => !o && setFormOpen(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {editingId ? "Editar propietario" : "Nuevo propietario"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            {/* Datos personales */}
            <Section label="Datos personales">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nombre *">
                  <input type="text" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className={inp} maxLength={80} />
                </Field>
                <Field label="Apellido">
                  <input type="text" value={form.apellido} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} className={inp} maxLength={80} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tipo documento">
                  <select value={form.tipo_documento} onChange={e => setForm(f => ({ ...f, tipo_documento: e.target.value }))} className={inp}>
                    {TIPOS_DOC.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Número documento">
                  <input type="text" value={form.numero_documento} onChange={e => setForm(f => ({ ...f, numero_documento: e.target.value }))} className={inp} maxLength={20} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Teléfono">
                  <input type="tel" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} className={inp} maxLength={20} />
                </Field>
                <Field label="Correo electrónico">
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inp} maxLength={120} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ciudad">
                  <input type="text" value={form.ciudad} onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))} className={inp} maxLength={60} />
                </Field>
                <Field label="País">
                  <input type="text" value={form.pais} onChange={e => setForm(f => ({ ...f, pais: e.target.value }))} className={inp} maxLength={60} />
                </Field>
              </div>
            </Section>

            {/* Datos bancarios */}
            <Section label="Datos bancarios">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Banco">
                  <input type="text" value={form.banco} onChange={e => setForm(f => ({ ...f, banco: e.target.value }))} className={inp} placeholder="Ej. Bancolombia, Davivienda…" maxLength={80} />
                </Field>
                <Field label="Tipo de cuenta">
                  <select value={form.tipo_cuenta} onChange={e => setForm(f => ({ ...f, tipo_cuenta: e.target.value }))} className={inp}>
                    {TIPOS_CUENTA.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Número de cuenta">
                <input type="text" value={form.numero_cuenta} onChange={e => setForm(f => ({ ...f, numero_cuenta: e.target.value }))} className={inp} maxLength={30} />
              </Field>
            </Section>

            {/* Inmuebles */}
            <Section label={`Inmuebles del propietario${selectedPropIds.size > 0 ? ` (${selectedPropIds.size} seleccionado${selectedPropIds.size > 1 ? "s" : ""})` : ""}`}>
              {formProps.length === 0 ? (
                <p className="font-body text-sm text-muted-foreground py-3 text-center border border-dashed border-foreground/10">
                  No hay propiedades disponibles para asignar
                </p>
              ) : (
                <>
                  <div className="relative mb-2">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      value={propSearch}
                      onChange={e => setPropSearch(e.target.value)}
                      placeholder="Buscar propiedad…"
                      className="w-full border border-foreground/10 pl-9 pr-3 py-1.5 font-body text-xs focus:border-primary focus:outline-none bg-background"
                    />
                  </div>
                  <div className="border border-foreground/10 max-h-44 overflow-y-auto">
                    {filteredFormProps.length === 0 ? (
                      <p className="px-3 py-3 text-center font-body text-xs text-muted-foreground">Sin resultados</p>
                    ) : filteredFormProps.map(p => (
                      <label key={p.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40 cursor-pointer border-b border-foreground/5 last:border-0">
                        <input
                          type="checkbox"
                          checked={selectedPropIds.has(p.id)}
                          onChange={() => toggleProp(p.id)}
                          className="accent-primary w-3.5 h-3.5 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-body text-sm text-foreground truncate">{p.nombre_inmueble}</p>
                          <p className="font-body text-[11px] text-muted-foreground">
                            {[p.tipo_inmueble, p.barrio, p.tipo_negocio].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </Section>

            {/* Notas */}
            <Section label="Notas internas">
              <textarea
                value={form.notas}
                onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                rows={2}
                className={`${inp} resize-none`}
                maxLength={500}
                placeholder="Observaciones, preferencias, acuerdos especiales…"
              />
            </Section>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-foreground/8">
            <button onClick={() => setFormOpen(false)} className="px-4 py-2 font-heading text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors">
              Cancelar
            </button>
            <button
              onClick={savePropietario}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary-hover transition-colors disabled:opacity-60"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              {editingId ? "Guardar cambios" : "Crear propietario"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick link modal (from detail view) */}
      <Dialog open={linkOpen} onOpenChange={o => !o && setLinkOpen(false)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Vincular propiedad</DialogTitle>
          </DialogHeader>
          <p className="font-body text-sm text-muted-foreground -mt-1 mb-3">Solo se muestran propiedades sin propietario asignado.</p>

          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input type="text" value={linkSearch} onChange={e => setLinkSearch(e.target.value)} placeholder="Buscar propiedad…" className="w-full border border-foreground/10 pl-9 pr-3 py-2 font-body text-sm focus:border-primary focus:outline-none bg-background" />
          </div>

          {filteredUnlinked.length === 0 ? (
            <p className="text-center font-body text-sm text-muted-foreground py-8">
              {linkSearch ? "Sin resultados" : "Todas las propiedades ya tienen propietario"}
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredUnlinked.map(pr => (
                <button key={pr.id} onClick={() => linkProperty(pr.id)} disabled={linking} className="w-full text-left flex items-center justify-between p-3 border border-foreground/8 hover:border-primary/40 hover:bg-primary/5 transition-all group">
                  <div>
                    <p className="font-heading text-sm font-semibold text-foreground">{pr.nombre_inmueble}</p>
                    <p className="font-body text-xs text-muted-foreground">{[pr.tipo_inmueble, pr.barrio, pr.tipo_negocio].filter(Boolean).join(" · ")}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Tailwind class for form inputs (avoids repetition)
const inp = "w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none bg-background";

const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-start gap-2">
    <Icon size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
    <div>
      <p className="font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">{label}</p>
      <p className="font-body text-sm text-foreground">{value}</p>
    </div>
  </div>
);

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2.5 border-b border-foreground/8 pb-1">{label}</p>
    <div className="space-y-3">{children}</div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase block mb-1">{label}</label>
    {children}
  </div>
);

export default AdminPropietarios;
