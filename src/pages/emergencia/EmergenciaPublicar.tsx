import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2, ChevronLeft, ChevronRight, X, Copy, ImagePlus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";
import { Switch } from "@/components/ui/switch";
import { supabase, type TablesInsert } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { trackSubmitForm } from "@/lib/pixelEvents";

const propertyTypes = ["Apartamento", "Casa", "Apartaestudio", "Local", "Habitación", "Oficina", "Bodega"];
const CIUDADES = ["Cali", "Jamundí", "Yumbo", "Palmira", "Otra"];
const TOTAL_STEPS = 5;
const MAX_FOTOS = 6;
const STEP_LABELS = ["Contacto", "Gestión", "El inmueble", "Condiciones económicas", "Fotos y confirmación"];

type FormState = {
  nombre: string;
  celular: string;
  perfil: "" | "Propietario" | "Agente" | "Inmobiliaria";
  tipo_gestion: "" | "Corretaje" | "Administración";
  sin_comision: boolean;
  condiciones_comision: string;
  desea_administracion: boolean;
  tipo_inmueble: string;
  ciudad: string;
  ciudad_otra: string;
  barrio: string;
  direccion: string;
  area_m2: string;
  habitaciones: string;
  banos: string;
  piso: string;
  parqueadero: "No" | "Carro" | "Moto" | "Carro y moto";
  amoblado: boolean;
  canon: string;
  incluye_administracion: boolean;
  valor_administracion: string;
  descripcion: string;
  acepta_politica: boolean;
  // honeypot anti-spam: campo invisible que un humano nunca llena
  sitio_web: string;
};

const emptyForm: FormState = {
  nombre: "", celular: "", perfil: "", tipo_gestion: "", sin_comision: false, condiciones_comision: "", desea_administracion: false,
  tipo_inmueble: "", ciudad: "Cali", ciudad_otra: "", barrio: "", direccion: "", area_m2: "", habitaciones: "0", banos: "0",
  piso: "", parqueadero: "No", amoblado: false, canon: "", incluye_administracion: false, valor_administracion: "",
  descripcion: "", acepta_politica: false, sitio_web: "",
};

const inputClass = "w-full bg-background border border-foreground/10 rounded-lg py-2.5 px-3 font-body text-sm text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";
const labelClass = "font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1";

const EmergenciaPublicar = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fotoFiles, setFotoFiles] = useState<File[]>([]);
  const [fotoPreviews, setFotoPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [linkGestion, setLinkGestion] = useState<string | null>(null);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const onFotosSelected = (files: FileList | null) => {
    if (!files) return;
    const nuevos = Array.from(files).slice(0, MAX_FOTOS - fotoFiles.length);
    setFotoFiles((f) => [...f, ...nuevos]);
    nuevos.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setFotoPreviews((p) => [...p, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeFoto = (idx: number) => {
    setFotoFiles((f) => f.filter((_, i) => i !== idx));
    setFotoPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const stepValid = (): boolean => {
    switch (step) {
      case 1:
        return !!(form.nombre.trim() && form.celular.trim() && form.perfil);
      case 2:
        if (form.perfil === "Agente" || form.perfil === "Inmobiliaria") return !!form.tipo_gestion;
        return true; // Propietario: la administración es opcional
      case 3:
        return !!(form.tipo_inmueble && form.barrio.trim() && (form.ciudad === "Otra" ? form.ciudad_otra.trim() : !!form.ciudad));
      case 4:
        return !!form.canon && Number(form.canon) > 0 && (form.incluye_administracion || !!form.valor_administracion);
      case 5:
        return form.acepta_politica;
      default:
        return true;
    }
  };

  const next = () => stepValid() && setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const uploadFoto = async (file: File, folder: string, i: number): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/foto-${i}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("emergencia-fotos").upload(path, file);
    if (error) throw error;
    // El bucket es privado: firmamos una URL de larga duración (10 años)
    const { data, error: signError } = await supabase.storage
      .from("emergencia-fotos")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (signError || !data) throw signError ?? new Error("No se pudo firmar la URL");
    return data.signedUrl;
  };


  const handleSubmit = async () => {
    if (form.sitio_web) return; // honeypot: bot detectado, no hacemos nada
    if (!stepValid()) return;
    setSaving(true);
    try {
      const folder = crypto.randomUUID();
      const fotos = fotoFiles.length
        ? await Promise.all(fotoFiles.map((f, i) => uploadFoto(f, folder, i)))
        : [];

      const token = crypto.randomUUID();

      const { error } = await supabase.from("emergencia_inmuebles").insert({
        nombre: form.nombre.trim(),
        celular: form.celular.trim(),
        correo: null,
        perfil: form.perfil as string,
        tipo_gestion: form.tipo_gestion || null,
        sin_comision: form.tipo_gestion ? form.sin_comision : false,
        condiciones_comision: form.tipo_gestion && !form.sin_comision ? form.condiciones_comision.trim() || null : null,
        desea_administracion: form.perfil === "Propietario" ? form.desea_administracion : false,
        tipo_inmueble: form.tipo_inmueble,
        ciudad: (form.ciudad === "Otra" ? form.ciudad_otra : form.ciudad).trim(),
        barrio: form.barrio.trim(),
        direccion: form.direccion.trim() || null,
        area_m2: form.area_m2 ? Number(form.area_m2) : null,
        habitaciones: Number(form.habitaciones) || 0,
        banos: Number(form.banos) || 0,
        piso: form.piso.trim() || null,
        parqueadero: form.parqueadero,
        amoblado: form.amoblado,
        canon: Number(form.canon),
        incluye_administracion: form.incluye_administracion,
        valor_administracion: form.incluye_administracion ? null : Number(form.valor_administracion || 0),
        descripcion: form.descripcion.trim() || null,
        foto_portada: fotos[0] || null,
        fotos,
        acepta_politica: true,
        token_gestion: token,
      } satisfies TablesInsert<"emergencia_inmuebles">);

      if (error) throw error;

      trackSubmitForm({ content_type: "emergencia_publicacion", content_name: `${form.perfil} ${form.tipo_inmueble}` });
      setLinkGestion(`${window.location.origin}/emergencia-terremoto/mi-publicacion/${token}`);
    } catch (err) {
      toast({ title: "No se pudo publicar", description: "Intenta de nuevo en unos minutos.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (linkGestion) {
    const waSelf = `https://wa.me/57${form.celular.replace(/\D/g, "")}?text=${encodeURIComponent(
      `Este es el enlace para gestionar tu publicación en la iniciativa terremoto de Inmobiliaria EO: ${linkGestion}`
    )}`;
    return (
      <>
        <SEO title="Publicación enviada | Inmobiliaria EO" description="Tu inmueble fue enviado para revisión." path="/emergencia-terremoto/publicar" />
        <Header />
        <main className="pt-20">
          <section className="py-20">
            <div className="container mx-auto px-6 max-w-lg text-center">
              <div className="animate-scale-in w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Check size={26} className="text-primary" />
              </div>
              <h1 className="animate-fade-in-up font-display text-2xl md:text-3xl font-bold text-foreground mb-3">¡Publicación enviada!</h1>
              <p className="animate-fade-in-up font-body text-sm text-muted-foreground mb-8 leading-relaxed">
                Nuestro equipo revisará tu inmueble antes de mostrarlo públicamente. Guarda este
                enlace: es el único que te permite marcar tu inmueble como <strong>alquilado</strong> o
                pausar la publicación tú mismo, sin necesidad de crear una cuenta.
              </p>
              <div className="animate-fade-in-up rounded-xl bg-muted/20 border border-foreground/10 p-4 mb-6 flex items-center gap-2">
                <input readOnly value={linkGestion} className="flex-1 bg-transparent font-body text-xs text-foreground truncate" />
                <button
                  onClick={() => { navigator.clipboard.writeText(linkGestion); toast({ title: "Enlace copiado" }); }}
                  className="shrink-0 p-2 rounded-full hover:bg-foreground/5 transition-all duration-200 hover:scale-110 active:scale-95"
                  aria-label="Copiar enlace"
                >
                  <Copy size={16} className="text-foreground" />
                </button>
              </div>
              <a
                href={waSelf}
                target="_blank"
                rel="noopener noreferrer"
                className="animate-fade-in-up inline-block w-full py-3 rounded-full bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase shadow-md shadow-primary/20 transition-all duration-300 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 mb-3"
              >
                Enviarme el enlace por WhatsApp
              </a>
              <Link to="/emergencia-terremoto" className="block font-body text-xs text-muted-foreground hover:text-primary transition-colors">
                Volver al inicio de la iniciativa
              </Link>
            </div>
          </section>
        </main>
        <Footer />
        <WhatsAppButton />
      </>
    );
  }

  return (
    <>
      <SEO
        title="Publicar Inmueble en Arriendo | Iniciativa Terremoto Colombia | Inmobiliaria EO"
        description="Propietarios, agentes e inmobiliarias: publica tu inmueble disponible para arriendo en esta iniciativa para el terremoto en Colombia."
        path="/emergencia-terremoto/publicar"
      />
      <Header />
      <main className="pt-20">
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6 max-w-xl">
            <div className="w-8 h-0.5 bg-primary mb-5" aria-hidden="true" />
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Publica tu inmueble</h1>
            <div className="flex items-center justify-between mb-2">
              <p className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                {STEP_LABELS[step - 1]}
              </p>
              <p className="font-body text-xs text-muted-foreground tabular-nums">{step}/{TOTAL_STEPS}</p>
            </div>
            <div className="flex gap-1.5 mb-8" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ease-out ${i < step ? "bg-primary" : "bg-foreground/10"}`} />
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if (step === TOTAL_STEPS) handleSubmit(); else next(); }} className="space-y-5">
              {/* honeypot invisible */}
              <input
                type="text"
                value={form.sitio_web}
                onChange={(e) => update("sitio_web", e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="absolute -left-[9999px] w-px h-px opacity-0"
                aria-hidden="true"
              />

              <div key={step} className="animate-fade-in-up">
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className={labelClass} htmlFor="nombre">Nombre completo</label>
                    <input id="nombre" required maxLength={100} value={form.nombre} onChange={(e) => update("nombre", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="celular">Celular</label>
                    <input id="celular" type="tel" required maxLength={15} value={form.celular} onChange={(e) => update("celular", e.target.value)} className={inputClass} />
                  </div>

                  <div>
                    <span className={labelClass}>¿Cuál es tu perfil?</span>
                    <div className="grid grid-cols-3 gap-3">
                      {(["Propietario", "Agente", "Inmobiliaria"] as const).map((p) => (
                        <button
                          type="button"
                          key={p}
                          onClick={() => update("perfil", p)}
                          className={`py-3 px-2 rounded-lg border font-body text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${form.perfil === p ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-foreground/10 text-foreground hover:border-primary/40"}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  {(form.perfil === "Agente" || form.perfil === "Inmobiliaria") ? (
                    <div className="space-y-5">
                      <div>
                        <span className={labelClass}>¿Cómo gestionas este inmueble?</span>
                        <div className="grid grid-cols-2 gap-3">
                          {(["Corretaje", "Administración"] as const).map((t) => (
                            <button
                              type="button"
                              key={t}
                              onClick={() => update("tipo_gestion", t)}
                              className={`py-3 px-2 rounded-lg border font-body text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${form.tipo_gestion === t ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-foreground/10 text-foreground hover:border-primary/40"}`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {form.tipo_gestion && (
                        <div className="animate-fade-in-up rounded-xl bg-muted/20 border border-foreground/10 p-5 space-y-4">
                          <label className="flex items-center justify-between gap-3 cursor-pointer">
                            <span className="font-body text-sm text-foreground">
                              Sin comisión por {form.tipo_gestion === "Corretaje" ? "el corretaje" : "la administración"}
                            </span>
                            <Switch
                              checked={form.sin_comision}
                              onCheckedChange={(checked) => update("sin_comision", checked)}
                            />
                          </label>
                          {!form.sin_comision && (
                            <div className="animate-fade-in-up">
                              <label className={labelClass} htmlFor="condiciones_comision">Condiciones de la comisión</label>
                              <textarea
                                id="condiciones_comision"
                                rows={2}
                                maxLength={300}
                                placeholder={form.tipo_gestion === "Corretaje" ? "Ej: 100% del primer canon de arriendo" : "Ej: 10% mensual del canon"}
                                value={form.condiciones_comision}
                                onChange={(e) => update("condiciones_comision", e.target.value)}
                                className={`${inputClass} resize-none`}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-muted/20 border border-foreground/10 p-5">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={form.desea_administracion} onChange={(e) => update("desea_administracion", e.target.checked)} className="mt-1 accent-[hsl(40,47%,50%)]" />
                        <span className="font-body text-sm text-foreground">
                          Quiero que Inmobiliaria EO administre mi inmueble: seleccionamos y aseguramos al
                          arrendatario, cobramos el canon y gestionamos el contrato, por una comisión del <strong>10%</strong>.
                        </span>
                      </label>
                    </div>
                  )}
                  {form.perfil === "Propietario" && !form.desea_administracion && (
                    <p className="font-body text-xs text-muted-foreground">
                      Sin problema — también puedes publicar solo para encontrar arrendatario por tu cuenta.
                    </p>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} htmlFor="tipo_inmueble">Tipo de inmueble</label>
                      <select id="tipo_inmueble" required value={form.tipo_inmueble} onChange={(e) => update("tipo_inmueble", e.target.value)} className={inputClass}>
                        <option value="">Seleccionar</option>
                        {propertyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="ciudad">Ciudad</label>
                      <select id="ciudad" required value={form.ciudad} onChange={(e) => update("ciudad", e.target.value)} className={inputClass}>
                        {CIUDADES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  {form.ciudad === "Otra" && (
                    <div className="animate-fade-in-up">
                      <label className={labelClass} htmlFor="ciudad_otra">¿Cuál ciudad?</label>
                      <input id="ciudad_otra" required value={form.ciudad_otra} onChange={(e) => update("ciudad_otra", e.target.value)} className={inputClass} />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} htmlFor="barrio">Barrio / Sector</label>
                      <input id="barrio" required value={form.barrio} onChange={(e) => update("barrio", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="direccion">Dirección (privada, opcional)</label>
                      <input id="direccion" value={form.direccion} onChange={(e) => update("direccion", e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass} htmlFor="area_m2">m²</label>
                      <input id="area_m2" type="number" min={0} value={form.area_m2} onChange={(e) => update("area_m2", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="habitaciones">Habitaciones</label>
                      <input id="habitaciones" type="number" min={0} value={form.habitaciones} onChange={(e) => update("habitaciones", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="banos">Baños</label>
                      <input id="banos" type="number" min={0} value={form.banos} onChange={(e) => update("banos", e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} htmlFor="piso">Piso</label>
                      <input id="piso" value={form.piso} onChange={(e) => update("piso", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="parqueadero">Parqueadero</label>
                      <select id="parqueadero" value={form.parqueadero} onChange={(e) => update("parqueadero", e.target.value as FormState["parqueadero"])} className={inputClass}>
                        <option value="No">No tiene</option>
                        <option value="Carro">Para carro</option>
                        <option value="Moto">Para moto</option>
                        <option value="Carro y moto">Carro y moto</option>
                      </select>
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.amoblado} onChange={(e) => update("amoblado", e.target.checked)} className="accent-[hsl(40,47%,50%)]" />
                    <span className="font-body text-sm text-foreground">Amoblado</span>
                  </label>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <label className={labelClass} htmlFor="canon">Canon de arriendo mensual (COP)</label>
                    <input id="canon" type="number" min={0} required value={form.canon} onChange={(e) => update("canon", e.target.value)} className={inputClass} />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.incluye_administracion} onChange={(e) => update("incluye_administracion", e.target.checked)} className="accent-[hsl(40,47%,50%)]" />
                    <span className="font-body text-sm text-foreground">El canon ya incluye la administración del conjunto/edificio</span>
                  </label>
                  {!form.incluye_administracion && (
                    <div>
                      <label className={labelClass} htmlFor="valor_administracion">Valor de la administración (COP)</label>
                      <input id="valor_administracion" type="number" min={0} value={form.valor_administracion} onChange={(e) => update("valor_administracion", e.target.value)} className={inputClass} />
                    </div>
                  )}
                  <div>
                    <label className={labelClass} htmlFor="descripcion">Descripción (opcional)</label>
                    <textarea id="descripcion" rows={3} maxLength={1000} value={form.descripcion} onChange={(e) => update("descripcion", e.target.value)} className={`${inputClass} resize-none`} />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-5">
                  <div>
                    <span className={labelClass}>Fotos (hasta {MAX_FOTOS})</span>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {fotoPreviews.map((src, i) => (
                        <div key={i} className="animate-scale-in relative aspect-square rounded-xl overflow-hidden">
                          <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeFoto(i)} className="absolute top-1.5 right-1.5 rounded-full bg-background/90 p-1.5 shadow-sm transition-all duration-200 hover:scale-110 hover:bg-background" aria-label="Eliminar foto">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {fotoFiles.length < MAX_FOTOS && (
                        <label className="aspect-square rounded-xl border-2 border-dashed border-foreground/15 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 hover:border-primary/40 hover:bg-primary/5">
                          <ImagePlus size={18} className="text-muted-foreground" />
                          <span className="font-body text-[10px] text-muted-foreground">Agregar</span>
                          <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => onFotosSelected(e.target.files)} />
                        </label>
                      )}
                    </div>
                    <p className="font-body text-[11px] text-muted-foreground">Máximo 8MB por foto. JPG, PNG o WebP.</p>
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" required checked={form.acepta_politica} onChange={(e) => update("acepta_politica", e.target.checked)} className="mt-1 accent-[hsl(40,47%,50%)]" />
                    <span className="font-body text-xs text-muted-foreground">
                      Autorizo a Inmobiliaria EO a tratar mis datos personales para contactarme sobre esta
                      iniciativa de arriendo por el terremoto. Mis datos de contacto no se mostrarán públicamente.
                    </span>
                  </label>
                </div>
              )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={back}
                  disabled={step === 1}
                  className="flex items-center gap-1 py-3 px-4 rounded-full border border-foreground/10 font-heading text-xs font-semibold tracking-widest uppercase transition-all duration-200 hover:bg-foreground/5 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ChevronLeft size={14} /> Atrás
                </button>
                <button
                  type="submit"
                  disabled={!stepValid() || saving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase shadow-md shadow-primary/20 transition-all duration-300 ease-out hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {step === TOTAL_STEPS ? (saving ? "Publicando..." : "Publicar inmueble") : (<>Siguiente <ChevronRight size={14} /></>)}
                </button>
              </div>

              <Link
                to="/emergencia-terremoto"
                className="block text-center font-heading text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-destructive transition-colors pt-1"
              >
                Cancelar
              </Link>

            </form>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default EmergenciaPublicar;
