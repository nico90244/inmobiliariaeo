import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";
import {
  Home, FileText, LogOut, Plus, Pencil, Trash2, Loader2, X, Image as ImageIcon, Video, Calendar, Search, FilterX,
  TrendingDown, CheckCircle2, XCircle, BarChart3, ClipboardList, Wallet, ShieldCheck,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Crosshair, Menu, User, ChevronDown,
} from "lucide-react";
import AdminCitasDisponibilidad from "@/components/admin/AdminCitasDisponibilidad";
import AdminCitasReservas from "@/components/admin/AdminCitasReservas";
import AdminContratoArrendamiento from "@/components/admin/AdminContratoArrendamiento";
import AdminReportes from "@/components/admin/AdminReportes";
import AdminAlquileres from "@/components/admin/AdminAlquileres";
import AdminPolizas from "@/components/admin/AdminPolizas";
import AdminPropietarios from "@/components/admin/AdminPropietarios";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import logo from "@/assets/logo.png";

type Propiedad = Tables<"propiedades">;
type Captacion = Tables<"captaciones">;

const propertyTypes = ["Casa", "Apartamento", "Apartaestudio", "Local", "Finca", "Lote", "Bodega", "Oficina"];

const ZONAS = ["Sur", "Norte", "Oeste", "Oriente", "Nororiente", "Suroriente"];

const emptyForm: Partial<Propiedad> & Record<string, any> = {
  tipo_negocio: "Venta", nombre_inmueble: "", tipo_inmueble: "", direccion: "", barrio: "", zona: "", precio: 0,
  area_m2: 0, habitaciones: 0, banos: 0, piso: "", parqueadero: "No", estrato: 0, administracion: 0, descripcion: "",
  estado: "Disponible", foto_portada: "", foto_portada_position: "50% 50%", foto_portada_zoom: 1.0,
  fotos: [], link_whatsapp: "", red_social_video: "", link_video: "", destacada: false,
};

const Admin = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [section, setSection] = useState<"propiedades" | "captaciones" | "citas-disponibilidad" | "citas-reservas" | "alquileres" | "propietarios" | "polizas" | "reportes">("propiedades");
  const [alquileresExpanded, setAlquileresExpanded] = useState(false);
  const [pendingReservas, setPendingReservas] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [captaciones, setCaptaciones] = useState<Captacion[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Property form
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<Partial<Propiedad>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Photo uploads
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  // Cover position + zoom editor
  const [coverPosX, setCoverPosX] = useState(50);
  const [coverPosY, setCoverPosY] = useState(50);
  const [coverZoom, setCoverZoom] = useState(1.0);
  const coverPosStr = `${coverPosX}% ${coverPosY}%`;

  const nudgePos = (dx: number, dy: number) => {
    setCoverPosX((v) => Math.max(0, Math.min(100, v + dx)));
    setCoverPosY((v) => Math.max(0, Math.min(100, v + dy)));
  };

  // Captacion detail
  const [selectedCaptacion, setSelectedCaptacion] = useState<Captacion | null>(null);

  // Contrato arrendamiento
  const [contratoOpen, setContratoOpen] = useState(false);
  const [contratoPropiedad, setContratoPropiedad] = useState<Propiedad | null>(null);
  const [contratoExistingId, setContratoExistingId] = useState<string | null>(null);

  // Captación → propiedad: registra de qué captación provino el form abierto
  const [captacionSource, setCaptacionSource] = useState<Captacion | null>(null);

  const openFormFromCaptacion = (c: Captacion) => {
    const precioNum = c.valor_aproximado
      ? (Number(c.valor_aproximado.replace(/[^0-9]/g, "")) || 0)
      : 0;
    setForm({
      ...emptyForm,
      tipo_negocio: c.tipo_negocio || "Venta",
      tipo_inmueble: c.tipo_inmueble || "",
      barrio: c.barrio || "",
      precio: precioNum,
      descripcion: c.observaciones || "",
      captacion_id: c.id,
    });
    setEditingId(null);
    setCoverPreview(null);
    setCoverFile(null);
    setGalleryPreviews([]);
    setGalleryFiles([]);
    setCoverPosX(50);
    setCoverPosY(50);
    setCoverZoom(1.0);
    setCaptacionSource(c);
    setSelectedCaptacion(null);
    setFormOpen(true);
  };

  const openContrato = async (p: Propiedad) => {
    // Buscar contrato activo existente (si no hay, maybeSingle devuelve data=null sin error)
    const { data, error } = await (supabase as any)
      .from("contratos_arrendamiento")
      .select("id")
      .eq("propiedad_id", p.id)
      .eq("estado_contrato", "Activo")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      toast({ title: "Error al abrir contrato", description: error.message, variant: "destructive" });
      return;
    }
    setContratoExistingId(data?.id ?? null);
    setContratoPropiedad(p);
    setContratoOpen(true);
  };

  // Quick status change from table
  const handleEstadoRapido = async (p: Propiedad, nuevoEstado: string) => {
    const { error } = await supabase.from("propiedades").update({ estado: nuevoEstado }).eq("id", p.id);
    if (error) {
      toast({ title: "Error al cambiar estado", variant: "destructive" });
      return;
    }
    toast({ title: `Estado → ${nuevoEstado}` });
    loadData();
    queryClient.invalidateQueries({ queryKey: ["propiedades"] });
    // If marking as Arrendado on an Alquiler property, open contract form
    // (reusa openContrato para detectar si ya existe un contrato activo y no crear uno duplicado)
    if (nuevoEstado === "Arrendado" && p.tipo_negocio === "Alquiler") {
      openContrato({ ...p, estado: nuevoEstado });
    }
  };

  // Metrics by status
  const metricas = useMemo(() => ({
    disponible: propiedades.filter((p) => p.estado === "Disponible").length,
    arrendado:  propiedades.filter((p) => p.estado === "Arrendado").length,
    vendido:    propiedades.filter((p) => p.estado === "Vendido").length,
    descartado: propiedades.filter((p) => p.estado === "Descartado").length,
  }), [propiedades]);

  // Propiedades filters
  const [filterNegocio, setFilterNegocio] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterZona, setFilterZona] = useState("");
  const [filterPrecioMin, setFilterPrecioMin] = useState("");
  const [filterPrecioMax, setFilterPrecioMax] = useState("");

  const clearFilters = () => {
    setFilterNegocio(""); setFilterTipo(""); setFilterZona("");
    setFilterPrecioMin(""); setFilterPrecioMax("");
  };

  const hasActiveFilters = !!(filterNegocio || filterTipo || filterZona || filterPrecioMin || filterPrecioMax);

  const propiedadesFiltradas = useMemo(() => {
    return propiedades.filter((p) => {
      if (filterNegocio && p.tipo_negocio !== filterNegocio) return false;
      if (filterTipo && p.tipo_inmueble !== filterTipo) return false;
      if (filterZona && !`${p.barrio ?? ""} ${p.zona ?? ""}`.toLowerCase().includes(filterZona.toLowerCase())) return false;
      if (filterPrecioMin && (p.precio ?? 0) < Number(filterPrecioMin)) return false;
      if (filterPrecioMax && (p.precio ?? 0) > Number(filterPrecioMax)) return false;
      return true;
    });
  }, [propiedades, filterNegocio, filterTipo, filterZona, filterPrecioMin, filterPrecioMax]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/admin/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadData();
  }, [user, section]);

  // Auto-expand Alquileres group when navigating to its sub-sections
  useEffect(() => {
    if (section === "alquileres" || section === "propietarios") {
      setAlquileresExpanded(true);
    }
  }, [section]);

  // Load pending reservas count
  useEffect(() => {
    if (!user) return;
    const loadPending = async () => {
      const { count } = await supabase.from("citas_reservas").select("*", { count: "exact", head: true }).eq("estado", "Pendiente");
      setPendingReservas(count || 0);
    };
    loadPending();
  }, [user, section]);

  const loadData = async () => {
    setLoadingData(true);
    if (section === "propiedades") {
      const { data } = await supabase.from("propiedades").select("*").order("fecha_creacion", { ascending: false });
      setPropiedades(data || []);
    } else if (section === "captaciones") {
      const { data } = await supabase.from("captaciones").select("*").order("fecha_creacion", { ascending: false });
      setCaptaciones(data || []);
    }
    setLoadingData(false);
  };

  const updateField = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const parseCoverPos = (posStr: string | null) => {
    const str = posStr || "50% 50%";
    const parts = str.split(" ");
    const x = parseFloat(parts[0]) || 50;
    const y = parseFloat(parts[1]) || 50;
    return { x, y };
  };

  const openNewForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setCoverPreview(null);
    setCoverFile(null);
    setGalleryPreviews([]);
    setGalleryFiles([]);
    setCoverPosX(50);
    setCoverPosY(50);
    setCoverZoom(1.0);
    setFormOpen(true);
  };

  const openEditForm = (p: Propiedad) => {
    setForm(p);
    setEditingId(p.id);
    setCoverPreview(p.foto_portada || null);
    setCoverFile(null);
    setGalleryPreviews(p.fotos || []);
    setGalleryFiles([]);
    const { x, y } = parseCoverPos((p as any).foto_portada_position);
    setCoverPosX(x);
    setCoverPosY(y);
    setCoverZoom((p as any).foto_portada_zoom ?? 1.0);
    setFormOpen(true);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGalleryFiles((f) => [...f, ...files]);
    setGalleryPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryPreviews((p) => p.filter((_, i) => i !== index));
    setGalleryFiles((f) => f.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { error } = await supabase.storage.from("propiedades-fotos").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("propiedades-fotos").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!form.nombre_inmueble || !form.tipo_inmueble) {
      toast({ title: "Nombre y tipo de inmueble son requeridos", variant: "destructive" });
      return;
    }
    if (form.red_social_video && form.link_video && !form.link_video.startsWith("https://")) {
      toast({ title: "El link del video debe empezar con https://", variant: "destructive" });
      return;
    }
    setSaving(true);

    try {
      const propId = editingId || crypto.randomUUID();
      let fotoPortadaUrl = form.foto_portada || "";
      let fotosUrls: string[] = [];

      // Upload cover
      if (coverFile) {
        fotoPortadaUrl = await uploadFile(coverFile, `${propId}/portada-${Date.now()}.${coverFile.name.split('.').pop()}`);
      }

      // Upload gallery - keep existing URLs that aren't blob URLs
      const existingUrls = galleryPreviews.filter((u) => !u.startsWith("blob:"));
      const newFiles = galleryFiles;
      const newUrls = await Promise.all(
        newFiles.map((f, i) => uploadFile(f, `${propId}/gallery-${Date.now()}-${i}.${f.name.split('.').pop()}`))
      );
      fotosUrls = [...existingUrls, ...newUrls];

      const record = {
        ...form,
        foto_portada: fotoPortadaUrl,
        foto_portada_position: coverPosStr,
        foto_portada_zoom: coverZoom,
        fotos: fotosUrls,
      };

      // Remove readonly fields
      delete (record as any).fecha_creacion;
      delete (record as any).fecha_actualizacion;

      if (editingId) {
        delete (record as any).id;
        const { error } = await supabase.from("propiedades").update(record).eq("id", editingId);
        if (error) throw error;
      } else {
        (record as any).id = propId;
        const { error } = await supabase.from("propiedades").insert(record as any);
        if (error) throw error;
      }

      toast({ title: editingId ? "Propiedad actualizada" : "Propiedad creada" });
      if (!editingId && captacionSource) {
        await supabase.from("captaciones").update({ estado: "Convertida" }).eq("id", captacionSource.id);
        setCaptacionSource(null);
      }
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["propiedades"] });
      loadData();
    } catch (err: any) {
      toast({ title: "Error al guardar", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta propiedad?")) return;
    const { error } = await supabase.from("propiedades").delete().eq("id", id);
    if (error) {
      toast({ title: "Error al eliminar", variant: "destructive" });
    } else {
      toast({ title: "Propiedad eliminada" });
      loadData();
      queryClient.invalidateQueries({ queryKey: ["propiedades"] });
    }
  };

  const updateCaptacionEstado = async (id: string, estado: string) => {
    await supabase.from("captaciones").update({ estado }).eq("id", id);
    loadData();
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-secondary text-secondary-foreground px-4 py-3 border-b border-secondary-foreground/10">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
          className="p-2 -ml-2 text-secondary-foreground hover:text-primary transition-colors"
        >
          <Menu size={22} />
        </button>
        <img src={logo} alt="Logo Inmobiliaria EO" className="h-8 w-auto brightness-0 invert" />
        <button
          onClick={() => signOut().then(() => navigate("/"))}
          aria-label="Cerrar sesión"
          className="p-2 -mr-2 text-secondary-foreground/70 hover:text-destructive transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-secondary text-secondary-foreground flex flex-col flex-shrink-0 z-50
          fixed lg:static inset-y-0 left-0 w-64 transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="p-6 border-b border-secondary-foreground/10 flex items-center justify-between">
          <img src={logo} alt="Logo Inmobiliaria EO" className="h-10 w-auto brightness-0 invert" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-secondary-foreground/70 hover:text-secondary-foreground"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button onClick={() => { setSection("propiedades"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 font-heading text-sm font-medium transition-colors ${section === "propiedades" ? "bg-primary text-primary-foreground" : "text-secondary-foreground/60 hover:text-secondary-foreground"}`}>
            <Home size={18} /> Propiedades
          </button>
          <button onClick={() => { setSection("captaciones"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 font-heading text-sm font-medium transition-colors ${section === "captaciones" ? "bg-primary text-primary-foreground" : "text-secondary-foreground/60 hover:text-secondary-foreground"}`}>
            <FileText size={18} /> Captaciones
          </button>
          <div className="pt-2 pb-1 px-4">
            <span className="font-heading text-[10px] font-semibold tracking-widest text-secondary-foreground/40 uppercase">Citas</span>
          </div>
          <button onClick={() => { setSection("citas-disponibilidad"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 font-heading text-sm font-medium transition-colors ${section === "citas-disponibilidad" ? "bg-primary text-primary-foreground" : "text-secondary-foreground/60 hover:text-secondary-foreground"}`}>
            <Calendar size={18} /> Disponibilidad
          </button>
          <button onClick={() => { setSection("citas-reservas"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 font-heading text-sm font-medium transition-colors relative ${section === "citas-reservas" ? "bg-primary text-primary-foreground" : "text-secondary-foreground/60 hover:text-secondary-foreground"}`}>
            <Calendar size={18} /> Reservas
            {pendingReservas > 0 && (
              <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{pendingReservas}</span>
            )}
          </button>
          <div className="pt-2 pb-1 px-4">
            <span className="font-heading text-[10px] font-semibold tracking-widest text-secondary-foreground/40 uppercase">Gestión</span>
          </div>
          {/* Alquileres accordion group */}
          <div>
            <div className="flex items-center">
              <button
                onClick={() => { setSection("alquileres"); setSidebarOpen(false); setAlquileresExpanded(true); }}
                className={`flex-1 flex items-center gap-3 px-4 py-3 font-heading text-sm font-medium transition-colors ${section === "alquileres" ? "bg-primary text-primary-foreground" : section === "propietarios" ? "bg-primary/10 text-primary" : "text-secondary-foreground/60 hover:text-secondary-foreground"}`}
              >
                <Wallet size={18} /> Alquileres
              </button>
              <button
                onClick={() => setAlquileresExpanded(v => !v)}
                className={`px-3 py-3 transition-colors ${section === "alquileres" ? "bg-primary text-primary-foreground" : section === "propietarios" ? "text-primary" : "text-secondary-foreground/40 hover:text-secondary-foreground"}`}
                aria-label="Expandir Alquileres"
              >
                <ChevronDown size={14} className={`transition-transform duration-200 ${alquileresExpanded ? "rotate-180" : ""}`} />
              </button>
            </div>
            {alquileresExpanded && (
              <button
                onClick={() => { setSection("propietarios"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 pl-11 pr-4 py-2.5 font-heading text-xs font-medium transition-colors border-l-2 ml-4 ${section === "propietarios" ? "border-primary text-primary bg-primary/10" : "border-secondary-foreground/10 text-secondary-foreground/50 hover:text-secondary-foreground hover:border-secondary-foreground/30"}`}
              >
                <User size={14} /> Propietarios
              </button>
            )}
          </div>
          <button onClick={() => { setSection("polizas"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 font-heading text-sm font-medium transition-colors ${section === "polizas" ? "bg-primary text-primary-foreground" : "text-secondary-foreground/60 hover:text-secondary-foreground"}`}>
            <ShieldCheck size={18} /> Pólizas
          </button>
          <button onClick={() => { setSection("reportes"); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 font-heading text-sm font-medium transition-colors ${section === "reportes" ? "bg-primary text-primary-foreground" : "text-secondary-foreground/60 hover:text-secondary-foreground"}`}>
            <BarChart3 size={18} /> Reportes
          </button>
        </nav>
        <div className="p-4 border-t border-secondary-foreground/10">
          <button onClick={() => signOut().then(() => navigate("/"))} className="w-full flex items-center gap-3 px-4 py-3 font-heading text-sm font-medium text-secondary-foreground/60 hover:text-destructive transition-colors">
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-background p-4 md:p-8 overflow-auto min-w-0">
        {section === "propiedades" && (
          <>
            <div className="flex items-center justify-between gap-3 mb-5 md:mb-8">
              <h1 className="font-heading text-lg md:text-2xl font-bold text-foreground">Propiedades</h1>
              <button onClick={openNewForm} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 bg-primary text-primary-foreground font-heading text-[11px] md:text-sm font-semibold tracking-widest uppercase hover:bg-primary-hover transition-colors whitespace-nowrap">
                <Plus size={14} className="md:hidden" /><Plus size={16} className="hidden md:block" />
                <span className="hidden sm:inline">Nueva propiedad</span><span className="sm:hidden">Nueva</span>
              </button>
            </div>

            {/* Métricas de estado */}
            {!loadingData && propiedades.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-5 md:mb-6">
                {[
                  { label: "Disponibles",  value: metricas.disponible, icon: BarChart3,     color: "text-primary",      bg: "bg-primary/10" },
                  { label: "Arrendadas",   value: metricas.arrendado,  icon: CheckCircle2,  color: "text-green-600",    bg: "bg-green-50 dark:bg-green-950/30" },
                  { label: "Vendidas",     value: metricas.vendido,    icon: TrendingDown,  color: "text-blue-600",     bg: "bg-blue-50 dark:bg-blue-950/30" },
                  { label: "Descartadas",  value: metricas.descartado, icon: XCircle,       color: "text-muted-foreground", bg: "bg-muted/30" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className={`${bg} border border-foreground/5 p-2.5 md:p-4 flex items-center gap-2 md:gap-3`}>
                    <Icon size={16} className={`md:hidden ${color}`} />
                    <Icon size={20} className={`hidden md:block ${color}`} />
                    <div className="min-w-0">
                      <p className="font-heading text-[9px] md:text-[10px] font-semibold tracking-widest text-muted-foreground uppercase truncate">{label}</p>
                      <p className={`font-heading text-lg md:text-2xl font-bold ${color}`}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Filtros */}
            <div className="bg-muted/20 border border-foreground/10 p-3 md:p-4 mb-4">
              <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3 md:items-end">
                {/* Tipo negocio */}
                <div className="flex flex-col gap-1 md:min-w-[130px]">
                  <label className="font-heading text-[9px] md:text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Negocio</label>
                  <select
                    value={filterNegocio}
                    onChange={(e) => setFilterNegocio(e.target.value)}
                    className="border border-foreground/10 py-1.5 md:py-2 px-2 md:px-3 font-body text-xs md:text-sm focus:border-primary focus:outline-none bg-background"
                  >
                    <option value="">Todos</option>
                    <option value="Venta">Venta</option>
                    <option value="Alquiler">Alquiler</option>
                  </select>
                </div>

                {/* Tipo inmueble */}
                <div className="flex flex-col gap-1 md:min-w-[150px]">
                  <label className="font-heading text-[9px] md:text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Tipo inmueble</label>
                  <select
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                    className="border border-foreground/10 py-1.5 md:py-2 px-2 md:px-3 font-body text-xs md:text-sm focus:border-primary focus:outline-none bg-background"
                  >
                    <option value="">Todos</option>
                    {propertyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Zona / Barrio */}
                <div className="flex flex-col gap-1 col-span-2 md:min-w-[160px]">
                  <label className="font-heading text-[9px] md:text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Zona / Barrio</label>
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      value={filterZona}
                      onChange={(e) => setFilterZona(e.target.value)}
                      placeholder="Buscar…"
                      className="border border-foreground/10 py-1.5 md:py-2 pl-8 pr-3 font-body text-xs md:text-sm focus:border-primary focus:outline-none bg-background w-full"
                    />
                  </div>
                </div>

                {/* Precio mín */}
                <div className="flex flex-col gap-1 md:min-w-[130px]">
                  <label className="font-heading text-[9px] md:text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Precio mín</label>
                  <input
                    type="number"
                    value={filterPrecioMin}
                    onChange={(e) => setFilterPrecioMin(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    className="border border-foreground/10 py-1.5 md:py-2 px-2 md:px-3 font-body text-xs md:text-sm focus:border-primary focus:outline-none bg-background w-full"
                  />
                </div>

                {/* Precio máx */}
                <div className="flex flex-col gap-1 md:min-w-[130px]">
                  <label className="font-heading text-[9px] md:text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Precio máx</label>
                  <input
                    type="number"
                    value={filterPrecioMax}
                    onChange={(e) => setFilterPrecioMax(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="Sin límite"
                    className="border border-foreground/10 py-1.5 md:py-2 px-2 md:px-3 font-body text-xs md:text-sm focus:border-primary focus:outline-none bg-background w-full"
                  />
                </div>

                {/* Limpiar */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="col-span-2 md:col-span-1 flex items-center justify-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 text-muted-foreground hover:text-destructive font-heading text-[11px] md:text-xs font-semibold tracking-widest uppercase transition-colors md:self-end"
                  >
                    <FilterX size={14} /> Limpiar
                  </button>
                )}
              </div>
              {hasActiveFilters && (
                <p className="font-body text-[11px] md:text-xs text-muted-foreground mt-2">
                  Mostrando <strong>{propiedadesFiltradas.length}</strong> de <strong>{propiedades.length}</strong> propiedades
                </p>
              )}
            </div>

            {loadingData ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
            ) : (
              <>
                {/* Mobile card list */}
                <div className="md:hidden space-y-2.5">
                  {propiedadesFiltradas.map((p) => (
                    <div key={p.id} className="border border-foreground/10 bg-background p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-heading text-sm font-bold text-foreground truncate">{p.nombre_inmueble}</p>
                          <p className="font-body text-[11px] text-muted-foreground truncate">
                            {p.tipo_inmueble}{[p.barrio, p.zona].filter(Boolean).length ? ` · ${[p.barrio, p.zona].filter(Boolean).join(" · ")}` : ""}
                          </p>
                        </div>
                        <span className={`shrink-0 px-1.5 py-0.5 text-[10px] font-heading font-semibold ${p.tipo_negocio === "Venta" ? "bg-blue-500/10 text-blue-700 dark:text-blue-400" : "bg-primary/10 text-primary"}`}>
                          {p.tipo_negocio}
                        </span>
                      </div>
                      <p className="font-body text-sm font-semibold text-foreground mb-2">
                        {p.precio ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p.precio) : "-"}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <select
                          value={p.estado || "Disponible"}
                          onChange={(e) => handleEstadoRapido(p, e.target.value)}
                          className={`px-2 py-1 text-[11px] font-heading font-semibold border-0 focus:outline-none rounded-sm ${
                            p.estado === "Disponible"  ? "bg-primary/10 text-primary" :
                            p.estado === "Arrendado"   ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400" :
                            p.estado === "Vendido"     ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" :
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          <option value="Disponible">Disponible</option>
                          <option value="Arrendado">Arrendado</option>
                          <option value="Vendido">Vendido</option>
                          <option value="Descartado">Descartado</option>
                        </select>
                        <div className="flex items-center gap-1">
                          {p.tipo_negocio === "Alquiler" && p.estado === "Arrendado" && (
                            <button onClick={() => openContrato(p)} className="p-1.5 text-muted-foreground hover:text-primary" aria-label="Contrato"><ClipboardList size={16} /></button>
                          )}
                          <button onClick={() => openEditForm(p)} className="p-1.5 text-muted-foreground hover:text-primary" aria-label="Editar"><Pencil size={16} /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 text-muted-foreground hover:text-destructive" aria-label="Eliminar"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {propiedadesFiltradas.length === 0 && (
                    <p className="p-6 text-center font-body text-sm text-muted-foreground border border-foreground/10">
                      {propiedades.length === 0 ? "No hay propiedades registradas." : "Ninguna propiedad coincide con los filtros."}
                    </p>
                  )}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto border border-foreground/10">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Nombre</th>
                        <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Tipo</th>
                        <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Negocio</th>
                        <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Barrio / Zona</th>
                        <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Precio</th>
                        <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Estado</th>
                        <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Contrato</th>
                        <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propiedadesFiltradas.map((p) => (
                        <tr key={p.id} className="border-t border-foreground/5 hover:bg-muted/20">
                          <td className="p-4 font-body max-w-[200px] truncate" title={p.nombre_inmueble}>{p.nombre_inmueble}</td>
                          <td className="p-4 font-body">{p.tipo_inmueble}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 text-xs font-heading font-semibold ${p.tipo_negocio === "Venta" ? "bg-blue-500/10 text-blue-700 dark:text-blue-400" : "bg-primary/10 text-primary"}`}>
                              {p.tipo_negocio}
                            </span>
                          </td>
                          <td className="p-4 font-body text-muted-foreground">
                            {[p.barrio, p.zona].filter(Boolean).join(" · ") || "—"}
                          </td>
                          <td className="p-4 font-body">{p.precio ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p.precio) : "-"}</td>
                          <td className="p-4">
                            <select
                              value={p.estado || "Disponible"}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleEstadoRapido(p, e.target.value)}
                              className={`px-2 py-1 text-xs font-heading font-semibold border-0 focus:outline-none cursor-pointer rounded-sm ${
                                p.estado === "Disponible"  ? "bg-primary/10 text-primary" :
                                p.estado === "Arrendado"   ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400" :
                                p.estado === "Vendido"     ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" :
                                "bg-muted text-muted-foreground"
                              }`}
                            >
                              <option value="Disponible">Disponible</option>
                              <option value="Arrendado">Arrendado</option>
                              <option value="Vendido">Vendido</option>
                              <option value="Descartado">Descartado</option>
                            </select>
                          </td>
                          <td className="p-4">
                            {p.tipo_negocio === "Alquiler" && p.estado === "Arrendado" && (
                              <button
                                onClick={() => openContrato(p)}
                                title="Ver / crear contrato"
                                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                              >
                                <ClipboardList size={16} />
                              </button>
                            )}
                          </td>
                          <td className="p-4 flex gap-2">
                            <button onClick={() => openEditForm(p)} className="p-2 text-muted-foreground hover:text-primary transition-colors"><Pencil size={16} /></button>
                            <button onClick={() => handleDelete(p.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                      {propiedadesFiltradas.length === 0 && (
                        <tr>
                          <td colSpan={9} className="p-8 text-center font-body text-muted-foreground">
                            {propiedades.length === 0 ? "No hay propiedades registradas." : "Ninguna propiedad coincide con los filtros."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {section === "captaciones" && (
          <>
            <h1 className="font-heading text-lg md:text-2xl font-bold text-foreground mb-5 md:mb-8">Captaciones</h1>
            {loadingData ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
            ) : (
              <>
                {/* Mobile card list */}
                <div className="md:hidden space-y-2.5">
                  {captaciones.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCaptacion(c)}
                      className="w-full text-left border border-foreground/10 bg-background p-3"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="font-heading text-sm font-bold text-foreground truncate flex-1">{c.nombre}</p>
                        <span className="text-[10px] font-body text-muted-foreground shrink-0">{new Date(c.fecha_creacion).toLocaleDateString("es-CO")}</span>
                      </div>
                      <p className="font-body text-[11px] text-muted-foreground mb-1">{c.tipo_negocio} · {c.tipo_inmueble} · {c.barrio}</p>
                      <p className="font-body text-xs text-foreground mb-2">{c.celular} {c.valor_aproximado ? `· ${c.valor_aproximado}` : ""}</p>
                      <select
                        value={c.estado || "Pendiente"}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => { e.stopPropagation(); updateCaptacionEstado(c.id, e.target.value); }}
                        className={`px-2 py-1 text-[11px] font-heading font-semibold border-0 bg-muted/40 focus:outline-none rounded-sm ${
                          c.estado === "Pendiente" ? "text-primary" :
                          c.estado === "Contactado" ? "text-[hsl(142,70%,45%)]" :
                          c.estado === "Convertida" ? "text-[hsl(142,70%,45%)]" :
                          "text-muted-foreground"
                        }`}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Contactado">Contactado</option>
                        <option value="Convertida">Convertida</option>
                        <option value="Descartado">Descartado</option>
                      </select>
                    </button>
                  ))}
                  {captaciones.length === 0 && (
                    <p className="p-6 text-center font-body text-sm text-muted-foreground border border-foreground/10">No hay captaciones.</p>
                  )}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto border border-foreground/10">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Fecha</th>
                        <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Nombre</th>
                        <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Celular</th>
                        <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Tipo</th>
                        <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Barrio</th>
                        <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Valor</th>
                        <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {captaciones.map((c) => (
                        <tr key={c.id} className="border-t border-foreground/5 hover:bg-muted/20 cursor-pointer" onClick={() => setSelectedCaptacion(c)}>
                          <td className="p-4 font-body">{new Date(c.fecha_creacion).toLocaleDateString("es-CO")}</td>
                          <td className="p-4 font-body">{c.nombre}</td>
                          <td className="p-4 font-body">{c.celular}</td>
                          <td className="p-4 font-body">{c.tipo_negocio} - {c.tipo_inmueble}</td>
                          <td className="p-4 font-body">{c.barrio}</td>
                          <td className="p-4 font-body">{c.valor_aproximado}</td>
                          <td className="p-4">
                            <select
                              value={c.estado || "Pendiente"}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => updateCaptacionEstado(c.id, e.target.value)}
                              className={`px-2 py-1 text-xs font-heading font-semibold border-0 bg-transparent focus:outline-none ${
                                c.estado === "Pendiente" ? "text-primary" :
                                c.estado === "Contactado" ? "text-[hsl(142,70%,45%)]" :
                                c.estado === "Convertida" ? "text-[hsl(142,70%,45%)]" :
                                "text-muted-foreground"
                              }`}
                            >
                              <option value="Pendiente">Pendiente</option>
                              <option value="Contactado">Contactado</option>
                              <option value="Convertida">Convertida</option>
                              <option value="Descartado">Descartado</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {captaciones.length === 0 && (
                        <tr><td colSpan={7} className="p-8 text-center font-body text-muted-foreground">No hay captaciones.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {section === "citas-disponibilidad" && <AdminCitasDisponibilidad />}
        {section === "citas-reservas" && <AdminCitasReservas />}
        {section === "alquileres" && <AdminAlquileres />}
        {section === "propietarios" && <AdminPropietarios />}
        {section === "polizas" && <AdminPolizas />}
        {section === "reportes" && <AdminReportes />}

        {/* Property form modal */}
        <Dialog open={formOpen} onOpenChange={(o) => { if (!o) { setFormOpen(false); setCaptacionSource(null); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">{editingId ? "Editar propiedad" : "Nueva propiedad"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Nombre inmueble *</label>
                  <input type="text" value={form.nombre_inmueble || ""} onChange={(e) => updateField("nombre_inmueble", e.target.value)} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Tipo inmueble *</label>
                  <select value={form.tipo_inmueble || ""} onChange={(e) => updateField("tipo_inmueble", e.target.value)} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none">
                    <option value="">Seleccionar</option>
                    {propertyTypes.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Tipo negocio</label>
                  <select value={form.tipo_negocio || "Venta"} onChange={(e) => updateField("tipo_negocio", e.target.value)} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none">
                    <option value="Venta">Venta</option>
                    <option value="Alquiler">Alquiler</option>
                  </select>
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Estado</label>
                  <select value={form.estado || "Disponible"} onChange={(e) => updateField("estado", e.target.value)} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none">
                    <option value="Disponible">Disponible</option>
                    <option value="Arrendado">Arrendado</option>
                    <option value="Vendido">Vendido</option>
                    <option value="Descartado">Descartado</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 border border-foreground/10 py-2 px-3 cursor-pointer hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={!!form.destacada}
                    onChange={(e) => updateField("destacada" as any, e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    Propiedad destacada (se muestra en inicio)
                  </span>
                </label>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Ciudad</label>
                  <input type="text" value={(form as any).ciudad || "Cali"} onChange={(e) => updateField("ciudad" as any, e.target.value)} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Dirección</label>
                  <input type="text" value={form.direccion || ""} onChange={(e) => updateField("direccion", e.target.value)} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Barrio</label>
                  <input type="text" value={form.barrio || ""} onChange={(e) => updateField("barrio", e.target.value)} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Precio</label>
                  <input type="number" value={form.precio ?? ""} onFocus={(e) => e.target.select()} onChange={(e) => updateField("precio", e.target.value === "" ? null : Number(e.target.value))} placeholder="0" className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Área m²</label>
                  <input type="number" value={form.area_m2 ?? ""} onFocus={(e) => e.target.select()} onChange={(e) => updateField("area_m2", e.target.value === "" ? null : Number(e.target.value))} placeholder="0" className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Estrato</label>
                  <input type="number" value={form.estrato ?? ""} onFocus={(e) => e.target.select()} onChange={(e) => updateField("estrato", e.target.value === "" ? null : Number(e.target.value))} placeholder="0" className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Habitaciones</label>
                  <input type="number" value={form.habitaciones ?? ""} onFocus={(e) => e.target.select()} onChange={(e) => updateField("habitaciones", e.target.value === "" ? null : Number(e.target.value))} placeholder="0" className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Baños</label>
                  <input type="number" value={form.banos ?? ""} onFocus={(e) => e.target.select()} onChange={(e) => updateField("banos", e.target.value === "" ? null : Number(e.target.value))} placeholder="0" className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Piso</label>
                  <input type="text" value={form.piso || ""} onChange={(e) => updateField("piso", e.target.value)} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Parqueadero</label>
                  <select
                    value={form.parqueadero && form.parqueadero !== "No" ? "Si" : "No"}
                    onChange={(e) => updateField("parqueadero", e.target.value === "No" ? "No" : "Carro")}
                    className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="No">No</option>
                    <option value="Si">Sí</option>
                  </select>
                  {form.parqueadero && form.parqueadero !== "No" && (
                    <select
                      value={form.parqueadero}
                      onChange={(e) => updateField("parqueadero", e.target.value)}
                      className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none mt-1.5"
                    >
                      <option value="Carro">Carro</option>
                      <option value="Moto">Moto</option>
                      <option value="Carro y Moto">Carro y Moto</option>
                    </select>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">¿Incluye administración?</label>
                  <select
                    value={(form.administracion ?? 0) > 0 ? "si" : "no"}
                    onChange={(e) => updateField("administracion", e.target.value === "si" ? (form.administracion && form.administracion > 0 ? form.administracion : 1) : 0)}
                    className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                  {(form.administracion ?? 0) > 0 && (
                    <div className="mt-2">
                      <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Valor administración</label>
                      <input type="number" value={form.administracion ?? ""} onFocus={(e) => e.target.select()} onChange={(e) => updateField("administracion", e.target.value === "" ? 0 : Number(e.target.value))} placeholder="0" className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Zona</label>
                  <select value={form.zona || ""} onChange={(e) => updateField("zona", e.target.value)} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none">
                    <option value="">Seleccionar</option>
                    {ZONAS.map((z) => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Descripción</label>
                <textarea value={form.descripcion || ""} onChange={(e) => updateField("descripcion", e.target.value)} rows={3} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none resize-none" />
              </div>
              <div>
                <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Link WhatsApp</label>
                <input type="text" value={form.link_whatsapp || ""} onChange={(e) => updateField("link_whatsapp", e.target.value)} placeholder="https://wa.me/573162225604?text=..." className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
              </div>

              {/*
                Ejecutar en Supabase SQL Editor:
                ALTER TABLE propiedades 
                ADD COLUMN IF NOT EXISTS red_social_video TEXT,
                ADD COLUMN IF NOT EXISTS link_video TEXT;
              */}
              {/* Video section */}
              <div className="border-t border-foreground/10 pt-4">
                <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2 mb-4">
                  <Video size={16} className="text-primary" /> Video de la propiedad
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Red social del video</label>
                    <select value={form.red_social_video || ""} onChange={(e) => { updateField("red_social_video", e.target.value || null); if (!e.target.value) updateField("link_video", null); }} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none">
                      <option value="">(ninguno)</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="facebook">Facebook</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Link del video (Reel/TikTok/Post)</label>
                    <input type="url" value={form.link_video || ""} onChange={(e) => updateField("link_video", e.target.value || null)} placeholder="https://www.instagram.com/reel/..." disabled={!form.red_social_video} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed" />
                  </div>
                </div>
              </div>

              {/* Cover photo + position editor */}
              <div className="border border-foreground/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Foto portada</label>
                  <label className="flex items-center gap-2 px-3 py-1.5 border border-foreground/10 cursor-pointer hover:bg-muted/30 transition-colors font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    <ImageIcon size={13} /> {coverPreview ? "Cambiar" : "Seleccionar"}
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                </div>

                {coverPreview ? (
                  <div className="space-y-3">
                    {/* Preview with current object-position + zoom */}
                    <div className="relative">
                      <div className="relative w-full h-48 border border-foreground/10 overflow-hidden bg-muted/20">
                        <img
                          src={coverPreview}
                          alt="Previsualización portada"
                          className="w-full h-full object-cover"
                          style={{
                            objectPosition: coverPosStr,
                            transform: `scale(${coverZoom})`,
                            transformOrigin: coverPosStr,
                          }}
                        />
                        {/* Crosshair overlay */}
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
                          <div className="w-px h-full bg-white" />
                          <div className="h-px w-full bg-white absolute" />
                        </div>
                      </div>
                      <button
                        onClick={() => { setCoverPreview(null); setCoverFile(null); updateField("foto_portada", ""); setCoverPosX(50); setCoverPosY(50); setCoverZoom(1.0); }}
                        className="absolute top-1 right-1 bg-destructive text-white p-0.5 rounded-sm"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    {/* Position controls */}
                    <div>
                      <p className="font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">
                        Encuadre · <span className="text-primary">{coverPosX}% {coverPosY}%</span>
                        <span className="ml-2">· Zoom <span className="text-primary">{Math.round(coverZoom * 100)}%</span></span>
                      </p>
                      <div className="flex items-center gap-4">
                        {/* D-pad */}
                        <div className="grid grid-cols-3 gap-1 w-fit">
                          <div />
                          <button onClick={() => nudgePos(0, -10)} className="p-1.5 border border-foreground/10 hover:border-primary hover:text-primary transition-colors flex items-center justify-center"><ArrowUp size={14} /></button>
                          <div />
                          <button onClick={() => nudgePos(-10, 0)} className="p-1.5 border border-foreground/10 hover:border-primary hover:text-primary transition-colors flex items-center justify-center"><ArrowLeft size={14} /></button>
                          <button onClick={() => { setCoverPosX(50); setCoverPosY(50); setCoverZoom(1.0); }} title="Centrar y resetear zoom" className="p-1.5 border border-foreground/10 hover:border-primary hover:text-primary transition-colors flex items-center justify-center"><Crosshair size={14} /></button>
                          <button onClick={() => nudgePos(10, 0)} className="p-1.5 border border-foreground/10 hover:border-primary hover:text-primary transition-colors flex items-center justify-center"><ArrowRight size={14} /></button>
                          <div />
                          <button onClick={() => nudgePos(0, 10)} className="p-1.5 border border-foreground/10 hover:border-primary hover:text-primary transition-colors flex items-center justify-center"><ArrowDown size={14} /></button>
                          <div />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <p className="font-heading text-[9px] font-semibold tracking-widest text-muted-foreground uppercase mb-1">Horizontal</p>
                            <input type="range" min={0} max={100} value={coverPosX} onChange={(e) => setCoverPosX(Number(e.target.value))} className="w-full accent-primary h-1.5 cursor-pointer" />
                          </div>
                          <div>
                            <p className="font-heading text-[9px] font-semibold tracking-widest text-muted-foreground uppercase mb-1">Vertical</p>
                            <input type="range" min={0} max={100} value={coverPosY} onChange={(e) => setCoverPosY(Number(e.target.value))} className="w-full accent-primary h-1.5 cursor-pointer" />
                          </div>
                          <div>
                            <p className="font-heading text-[9px] font-semibold tracking-widest text-muted-foreground uppercase mb-1">Zoom ({Math.round(coverZoom * 100)}%)</p>
                            <input type="range" min={100} max={200} step={5} value={Math.round(coverZoom * 100)} onChange={(e) => setCoverZoom(Number(e.target.value) / 100)} className="w-full accent-primary h-1.5 cursor-pointer" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-28 border border-dashed border-foreground/15 flex items-center justify-center text-muted-foreground/40">
                    <ImageIcon size={32} />
                  </div>
                )}
              </div>

              {/* Gallery */}
              <div>
                <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-2">Galería de fotos</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {galleryPreviews.map((url, i) => (
                    <div key={i} className="relative w-20 h-14 border border-foreground/10 overflow-hidden">
                      <img src={url} alt={`Foto ${i + 1} de la galería`} className="w-full h-full object-cover" />
                      <button onClick={() => removeGalleryImage(i)} className="absolute top-0 right-0 bg-destructive text-white p-0.5"><X size={12} /></button>
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 px-4 py-2 border border-foreground/10 cursor-pointer hover:bg-muted/30 transition-colors font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground w-fit">
                  <Plus size={14} /> Agregar fotos
                  <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="hidden" />
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <button onClick={() => setFormOpen(false)} className="px-8 py-3 bg-muted text-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-muted/80 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Contrato arrendamiento modal */}
        {contratoPropiedad && (
          <AdminContratoArrendamiento
            open={contratoOpen}
            onClose={() => { setContratoOpen(false); setContratoPropiedad(null); }}
            propiedad={contratoPropiedad}
            existingId={contratoExistingId}
          />
        )}

        {/* Captacion detail modal */}
        <Dialog open={!!selectedCaptacion} onOpenChange={(o) => !o && setSelectedCaptacion(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Detalle de Captación</DialogTitle>
            </DialogHeader>
            {selectedCaptacion && (
              <div className="space-y-3 mt-4">
                {[
                  ["Nombre", selectedCaptacion.nombre],
                  ["Celular", selectedCaptacion.celular],
                  ["Correo", selectedCaptacion.correo],
                  ["Tipo negocio", selectedCaptacion.tipo_negocio],
                  ["Tipo inmueble", selectedCaptacion.tipo_inmueble],
                  ["Barrio", selectedCaptacion.barrio],
                  ["Valor aprox.", selectedCaptacion.valor_aproximado],
                  ["Observaciones", selectedCaptacion.observaciones],
                  ["Estado", selectedCaptacion.estado],
                  ["Fecha", new Date(selectedCaptacion.fecha_creacion).toLocaleString("es-CO")],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <p className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">{label}</p>
                    <p className="font-body text-foreground">{value || "-"}</p>
                  </div>
                ))}
                {selectedCaptacion.estado !== "Convertida" && (
                  <div className="pt-3 border-t border-foreground/10">
                    <button
                      onClick={() => openFormFromCaptacion(selectedCaptacion)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary-hover transition-colors"
                    >
                      <Plus size={14} /> Crear inmueble desde esta captación
                    </button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Admin;
