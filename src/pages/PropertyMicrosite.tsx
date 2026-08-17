import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2, AlertCircle, Maximize2, Bed, Bath, Building2, Car, DollarSign,
  MapPin, Play, Copy, Check, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import type { Propiedad } from "@/hooks/usePropiedades";
import { formatPrice } from "@/lib/utils";

/* ─── Lightbox ─── */
const Lightbox = ({ photos, initialIndex, onClose }: { photos: string[]; initialIndex: number; onClose: () => void }) => {
  const [idx, setIdx] = useState(initialIndex);
  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx((i) => (i + 1) % photos.length);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowLeft") prev(); if (e.key === "ArrowRight") next(); }}
      tabIndex={0}
      role="dialog"
      aria-label="Galería de fotos de la propiedad"
      aria-modal="true"
    >
      <button onClick={onClose} className="absolute top-6 right-6 text-white hover:text-white/70 transition-colors" aria-label="Cerrar">
        <X size={32} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 md:left-8 text-white hover:text-white/70 transition-colors" aria-label="Anterior">
        <ChevronLeft size={40} />
      </button>
      <img
        src={photos[idx]}
        alt={`Foto ${idx + 1} de la propiedad`}
        className="max-h-[85vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 md:right-8 text-white hover:text-white/70 transition-colors" aria-label="Siguiente">
        <ChevronRight size={40} />
      </button>
      <span className="absolute bottom-6 text-white/80 text-sm tracking-widest">
        {idx + 1} / {photos.length}
      </span>
    </div>
  );
};

/* ─── Gallery ─── */
const Gallery = ({ photos, coverPosition, coverZoom }: { photos: string[]; coverPosition?: string | null; coverZoom?: number | null }) => {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [mobileIdx, setMobileIdx] = useState(0);
  const maxThumbs = 4;
  const extra = photos.length - maxThumbs - 1;

  if (photos.length === 0) return null;

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:grid grid-cols-5 gap-2 h-[440px]">
        <div className="col-span-3 cursor-pointer overflow-hidden" onClick={() => setLightboxIdx(0)}>
          <img src={photos[0]} alt="Foto principal de la propiedad" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            style={{
              objectPosition: coverPosition || "50% 50%",
              transform: `scale(${coverZoom ?? 1})`,
              transformOrigin: coverPosition || "50% 50%",
            }} />
        </div>
        <div className="col-span-2 grid grid-cols-2 grid-rows-2 gap-2">
          {photos.slice(1, maxThumbs + 1).map((p, i) => (
            <div key={i} className="relative cursor-pointer overflow-hidden" onClick={() => setLightboxIdx(i + 1)}>
              <img src={p} alt={`Foto ${i + 2} de la propiedad`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              {i === maxThumbs - 1 && extra > 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold tracking-widest">Ver todas +{extra}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile carousel */}
      <div className="md:hidden relative">
        <img src={photos[mobileIdx]} alt={`Foto ${mobileIdx + 1} de la propiedad`} className="w-full h-72 object-cover"
          style={{
            objectPosition: mobileIdx === 0 ? (coverPosition || "50% 50%") : "50% 50%",
            transform: mobileIdx === 0 ? `scale(${coverZoom ?? 1})` : "none",
            transformOrigin: mobileIdx === 0 ? (coverPosition || "50% 50%") : "50% 50%",
          }}
          onClick={() => setLightboxIdx(mobileIdx)} />
        {photos.length > 1 && (
          <>
            <button onClick={() => setMobileIdx((i) => (i - 1 + photos.length) % photos.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1" aria-label="Anterior">
              <ChevronLeft size={24} />
            </button>
            <button onClick={() => setMobileIdx((i) => (i + 1) % photos.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1" aria-label="Siguiente">
              <ChevronRight size={24} />
            </button>
            <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1">
              {mobileIdx + 1}/{photos.length}
            </span>
          </>
        )}
      </div>

      {lightboxIdx !== null && <Lightbox photos={photos} initialIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />}
    </>
  );
};

/* ─── Feature ─── */
const Feature = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) => (
  <div className="flex items-center gap-3 p-4 bg-white border border-[#E5E7EB]">
    <Icon size={20} className="text-[#C9A84C] shrink-0" />
    <div>
      <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase">{label}</p>
      <p className="text-sm font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

/* ─── Main Page ───
   Micrositio neutro pensado para que otros agentes compartan una propiedad
   con sus propios clientes: sin logo, sin teléfono ni WhatsApp del negocio. */
const PropertyMicrosite = () => {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ["propiedad-micrositio", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("propiedades").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as Propiedad;
    },
    enabled: !!id,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9F6F1]">
        <Loader2 className="animate-spin text-[#C9A84C]" size={40} />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#F9F6F1]">
        <AlertCircle className="text-destructive" size={48} />
        <p className="text-gray-500">No se encontró la propiedad.</p>
      </div>
    );
  }

  const allPhotos = [property.foto_portada, ...(property.fotos || [])].filter(Boolean) as string[];
  const mapQuery = encodeURIComponent(`${property.zona || property.barrio || property.nombre_inmueble}, ${property.ciudad || "Cali"}, Colombia`);

  const formatParqueadero = (val: string | null) => {
    if (!val) return null;
    const lower = val.toLowerCase();
    if (lower === "no" || lower === "0" || lower === "false") return "No";
    return "Sí";
  };

  const seoTitle = `${property.nombre_inmueble} en ${property.tipo_negocio} | ${property.barrio || property.ciudad || "Cali"}`.slice(0, 60);
  const seoDesc = (property.descripcion?.slice(0, 155) ||
    `${property.tipo_inmueble} en ${property.tipo_negocio.toLowerCase()} en ${property.barrio || property.ciudad || "Cali"}. ${property.area_m2 ? property.area_m2 + " m². " : ""}${property.habitaciones ? property.habitaciones + " hab. " : ""}Precio: ${formatPrice(property.precio)}.`).slice(0, 160);

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDesc}
        path={`/compartir/${property.id}`}
        image={property.foto_portada || undefined}
        type="product"
        noIndex
        siteName="Ficha de propiedad"
        imageAlt={property.nombre_inmueble}
      />
      <div className="min-h-screen bg-[#F9F6F1]">
        {/* Barra superior neutra — sin logo */}
        <div className="sticky top-0 z-40 bg-[#1E1E1E] flex items-center justify-end px-4 md:px-6 h-14">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-1.5 border border-white/15 text-xs font-semibold tracking-widest uppercase transition-colors"
            style={{ color: copied ? "#4ade80" : "rgba(255,255,255,0.7)" }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copiado" : "Copiar link"}
          </button>
        </div>

        <main className="container mx-auto px-4 md:px-8 py-8 max-w-5xl">
          {/* Header info */}
          <div className="mb-5">
            <span className="inline-block bg-[#C9A84C] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 mb-3">
              {property.tipo_negocio}
            </span>
            <p className="text-sm text-gray-500 mb-1">
              {[property.ciudad || "Cali", property.zona, property.tipo_inmueble].filter(Boolean).join(" | ")}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{property.nombre_inmueble}</h1>
            <p className="text-2xl md:text-3xl font-bold text-[#C9A84C]">{formatPrice(property.precio)}</p>
          </div>

          <div className="space-y-6">
            <Gallery photos={allPhotos} coverPosition={(property as any).foto_portada_position} coverZoom={(property as any).foto_portada_zoom} />

            {/* Features grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {property.area_m2 && <Feature icon={Maximize2} label="Área" value={`${property.area_m2} m²`} />}
              {(property.habitaciones ?? 0) > 0 && <Feature icon={Bed} label="Habitaciones" value={property.habitaciones!} />}
              {(property.banos ?? 0) > 0 && <Feature icon={Bath} label="Baños" value={property.banos!} />}
              {property.piso && <Feature icon={Building2} label="Piso" value={property.piso} />}
              {property.parqueadero != null && <Feature icon={Car} label="Parqueadero" value={formatParqueadero(property.parqueadero)!} />}
              {property.estrato && <Feature icon={Building2} label="Estrato" value={property.estrato} />}
              {(property.administracion ?? 0) > 0 && <Feature icon={DollarSign} label="Administración" value={formatPrice(property.administracion)} />}
              {property.barrio && <Feature icon={MapPin} label="Barrio" value={property.barrio} />}
            </div>

            {/* Description */}
            {property.descripcion && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Descripción</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.descripcion}</p>
              </div>
            )}

            {/* Location */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-[#C9A84C]" /> Ubicación
              </h2>
              {(property.zona || property.barrio) && (
                <p className="text-gray-600 mb-4">
                  {[property.zona, property.barrio, property.ciudad || "Cali"].filter(Boolean).join(" · ")}
                </p>
              )}
              <iframe
                title="Mapa"
                src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
                className="w-full h-[300px] border border-gray-200"
                loading="lazy"
                allowFullScreen
              />
            </div>

            {/* Video */}
            {property.link_video && (
              <div className="bg-white border border-[#C9A84C]/30 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Play size={20} className="text-[#C9A84C]" /> Video
                </h2>
                <a
                  href={property.link_video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#1E1E1E] text-white px-6 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-[#333] transition-colors"
                >
                  <Play size={18} /> Ver video
                </a>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default PropertyMicrosite;
