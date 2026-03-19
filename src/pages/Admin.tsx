import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";
import {
  Home, FileText, LogOut, Plus, Pencil, Trash2, Loader2, X, Image as ImageIcon, Video,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import logo from "@/assets/logo.png";

type Propiedad = Tables<"propiedades">;
type Captacion = Tables<"captaciones">;

const propertyTypes = ["Casa", "Apartamento", "Apartaestudio", "Local", "Finca", "Lote", "Bodega", "Oficina"];

const emptyForm: Partial<Propiedad> = {
  tipo_negocio: "Venta", nombre_inmueble: "", tipo_inmueble: "", direccion: "", barrio: "", zona: "", precio: 0,
  area_m2: 0, habitaciones: 0, banos: 0, piso: "", parqueadero: "", estrato: 0, administracion: 0, descripcion: "",
  estado: "Disponible", foto_portada: "", fotos: [], link_whatsapp: "", red_social_video: "", link_video: "",
};

const Admin = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [section, setSection] = useState<"propiedades" | "captaciones">("propiedades");
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

  // Captacion detail
  const [selectedCaptacion, setSelectedCaptacion] = useState<Captacion | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/admin/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadData();
  }, [user, section]);

  const loadData = async () => {
    setLoadingData(true);
    if (section === "propiedades") {
      const { data } = await supabase.from("propiedades").select("*").order("fecha_creacion", { ascending: false });
      setPropiedades(data || []);
    } else {
      const { data } = await supabase.from("captaciones").select("*").order("fecha_creacion", { ascending: false });
      setCaptaciones(data || []);
    }
    setLoadingData(false);
  };

  const updateField = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const openNewForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setCoverPreview(null);
    setCoverFile(null);
    setGalleryPreviews([]);
    setGalleryFiles([]);
    setFormOpen(true);
  };

  const openEditForm = (p: Propiedad) => {
    setForm(p);
    setEditingId(p.id);
    setCoverPreview(p.foto_portada || null);
    setCoverFile(null);
    setGalleryPreviews(p.fotos || []);
    setGalleryFiles([]);
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
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-secondary-foreground flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-secondary-foreground/10">
          <img src={logo} alt="EO" className="h-10 w-auto brightness-0 invert" />
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => setSection("propiedades")} className={`w-full flex items-center gap-3 px-4 py-3 font-heading text-sm font-medium transition-colors ${section === "propiedades" ? "bg-primary text-primary-foreground" : "text-secondary-foreground/60 hover:text-secondary-foreground"}`}>
            <Home size={18} /> Propiedades
          </button>
          <button onClick={() => setSection("captaciones")} className={`w-full flex items-center gap-3 px-4 py-3 font-heading text-sm font-medium transition-colors ${section === "captaciones" ? "bg-primary text-primary-foreground" : "text-secondary-foreground/60 hover:text-secondary-foreground"}`}>
            <FileText size={18} /> Captaciones
          </button>
        </nav>
        <div className="p-4 border-t border-secondary-foreground/10">
          <button onClick={() => signOut().then(() => navigate("/"))} className="w-full flex items-center gap-3 px-4 py-3 font-heading text-sm font-medium text-secondary-foreground/60 hover:text-destructive transition-colors">
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-background p-8 overflow-auto">
        {section === "propiedades" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-heading text-2xl font-bold text-foreground">Propiedades</h1>
              <button onClick={openNewForm} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors">
                <Plus size={16} /> Nueva propiedad
              </button>
            </div>

            {loadingData ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
            ) : (
              <div className="overflow-x-auto border border-foreground/10">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Nombre</th>
                      <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Tipo</th>
                      <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Barrio</th>
                      <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Precio</th>
                      <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Video</th>
                      <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Estado</th>
                      <th className="text-left p-4 font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propiedades.map((p) => (
                      <tr key={p.id} className="border-t border-foreground/5 hover:bg-muted/20">
                        <td className="p-4 font-body">{p.nombre_inmueble}</td>
                        <td className="p-4 font-body">{p.tipo_inmueble}</td>
                        <td className="p-4 font-body">{p.barrio}</td>
                        <td className="p-4 font-body">{p.precio ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p.precio) : "-"}</td>
                        <td className="p-4">{p.link_video ? <Video size={16} className="text-primary" /> : <span className="text-muted-foreground">—</span>}</td>
                        <td className="p-4"><span className={`px-2 py-1 text-xs font-heading font-semibold ${p.estado === "Disponible" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{p.estado}</span></td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => openEditForm(p)} className="p-2 text-muted-foreground hover:text-primary transition-colors"><Pencil size={16} /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {propiedades.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center font-body text-muted-foreground">No hay propiedades registradas.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {section === "captaciones" && (
          <>
            <h1 className="font-heading text-2xl font-bold text-foreground mb-8">Captaciones</h1>
            {loadingData ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
            ) : (
              <div className="overflow-x-auto border border-foreground/10">
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
                              c.estado === "Pendiente" ? "text-primary" : c.estado === "Contactado" ? "text-[hsl(142,70%,45%)]" : "text-muted-foreground"
                            }`}
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Contactado">Contactado</option>
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
            )}
          </>
        )}

        {/* Property form modal */}
        <Dialog open={formOpen} onOpenChange={(o) => !o && setFormOpen(false)}>
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
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <input type="number" value={form.precio || 0} onChange={(e) => updateField("precio", Number(e.target.value))} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Área m²</label>
                  <input type="number" value={form.area_m2 || 0} onChange={(e) => updateField("area_m2", Number(e.target.value))} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Estrato</label>
                  <input type="number" value={form.estrato || 0} onChange={(e) => updateField("estrato", Number(e.target.value))} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Habitaciones</label>
                  <input type="number" value={form.habitaciones || 0} onChange={(e) => updateField("habitaciones", Number(e.target.value))} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Baños</label>
                  <input type="number" value={form.banos || 0} onChange={(e) => updateField("banos", Number(e.target.value))} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Piso</label>
                  <input type="text" value={form.piso || ""} onChange={(e) => updateField("piso", e.target.value)} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Parqueadero</label>
                  <input type="text" value={form.parqueadero || ""} onChange={(e) => updateField("parqueadero", e.target.value)} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Administración</label>
                  <input type="number" value={form.administracion || 0} onChange={(e) => updateField("administracion", Number(e.target.value))} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Zona</label>
                  <input type="text" value={form.zona || ""} onChange={(e) => updateField("zona", e.target.value)} className="w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none" />
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

              {/* Cover photo */}
              <div>
                <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-2">Foto portada</label>
                <div className="flex items-center gap-4">
                  {coverPreview && (
                    <div className="relative w-24 h-16 border border-foreground/10 overflow-hidden">
                      <img src={coverPreview} alt="Portada" className="w-full h-full object-cover" />
                      <button onClick={() => { setCoverPreview(null); setCoverFile(null); updateField("foto_portada", ""); }} className="absolute top-0 right-0 bg-destructive text-white p-0.5"><X size={12} /></button>
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 border border-foreground/10 cursor-pointer hover:bg-muted/30 transition-colors font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    <ImageIcon size={14} /> Seleccionar
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Gallery */}
              <div>
                <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-2">Galería de fotos</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {galleryPreviews.map((url, i) => (
                    <div key={i} className="relative w-20 h-14 border border-foreground/10 overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover" />
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
                <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
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
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Admin;
