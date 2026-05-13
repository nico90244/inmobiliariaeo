import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2, AlertCircle, ArrowLeft, Maximize2, Bed, Bath, Building2, Car,
  DollarSign, MapPin, Play, Video, Phone, Share2, Copy, X, ChevronLeft,
  ChevronRight, FileText,
} from "lucide-react";
import { generatePropertyPDF } from "@/lib/generatePropertyPDF";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AppointmentBooking from "@/components/AppointmentBooking";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import type { Propiedad } from "@/hooks/usePropiedades";
import { usePropiedades } from "@/hooks/usePropiedades";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const formatPrice = (price: number | null) => {
  if (!price) return "Consultar";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);
};

/* ─── Lightbox ─── */
const Lightbox = ({ photos, initialIndex, onClose }: { photos: string[]; initialIndex: number; onClose: () => void }) => {
  const [idx, setIdx] = useState(initialIndex);
  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx((i) => (i + 1) % photos.length);

  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowLeft") prev(); if (e.key === "ArrowRight") next(); }}
      tabIndex={0}
      role="dialog"
    >
      <button onClick={onClose} className="absolute top-6 right-6 text-primary-foreground hover:text-primary transition-colors" aria-label="Cerrar">
        <X size={32} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 md:left-8 text-primary-foreground hover:text-primary transition-colors" aria-label="Anterior">
        <ChevronLeft size={40} />
      </button>
      <img
        src={photos[idx]}
        alt={`Foto ${idx + 1} de la propiedad`}
        className="max-h-[85vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 md:right-8 text-primary-foreground hover:text-primary transition-colors" aria-label="Siguiente">
        <ChevronRight size={40} />
      </button>
      <span className="absolute bottom-6 text-primary-foreground font-heading text-sm tracking-widest">
        {idx + 1} / {photos.length}
      </span>
    </div>
  );
};

/* ─── Gallery ─── */
const Gallery = ({ photos }: { photos: string[] }) => {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [mobileIdx, setMobileIdx] = useState(0);
  const maxThumbs = 4;
  const extra = photos.length - maxThumbs - 1;

  if (photos.length === 0) return null;

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:grid grid-cols-5 gap-2 h-[480px]">
        <div className="col-span-3 cursor-pointer overflow-hidden" onClick={() => setLightboxIdx(0)}>
          <img src={photos[0]} alt="Foto principal de la propiedad" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="col-span-2 grid grid-cols-2 grid-rows-2 gap-2">
          {photos.slice(1, maxThumbs + 1).map((p, i) => (
            <div key={i} className="relative cursor-pointer overflow-hidden" onClick={() => setLightboxIdx(i + 1)}>
              <img src={p} alt={`Foto ${i + 2} de la propiedad`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              {i === maxThumbs - 1 && extra > 0 && (
                <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                  <span className="text-primary-foreground font-heading text-sm font-semibold tracking-widest">Ver todas +{extra}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile carousel */}
      <div className="md:hidden relative">
        <img src={photos[mobileIdx]} alt={`Foto ${mobileIdx + 1} de la propiedad`} className="w-full h-72 object-cover" onClick={() => setLightboxIdx(mobileIdx)} />
        {photos.length > 1 && (
          <>
            <button onClick={() => setMobileIdx((i) => (i - 1 + photos.length) % photos.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-foreground/50 text-primary-foreground p-1" aria-label="Anterior">
              <ChevronLeft size={24} />
            </button>
            <button onClick={() => setMobileIdx((i) => (i + 1) % photos.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-foreground/50 text-primary-foreground p-1" aria-label="Siguiente">
              <ChevronRight size={24} />
            </button>
            <span className="absolute bottom-3 right-3 bg-foreground/60 text-primary-foreground font-heading text-xs px-2 py-1">
              {mobileIdx + 1}/{photos.length}
            </span>
          </>
        )}
      </div>

      {lightboxIdx !== null && <Lightbox photos={photos} initialIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />}
    </>
  );
};

/* ─── Contact Card ─── */
const ContactCard = ({ property }: { property: Propiedad }) => {
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [mensaje, setMensaje] = useState(
    `Hola, me interesa la propiedad ${property.nombre_inmueble} en ${property.barrio || ""}. ¿Podría obtener más información?`
  );
  const { toast } = useToast();

  const handleWhatsApp = () => {
    const text = `Nombre: ${nombre}\nCelular: ${celular}\n\n${mensaje}`;
    window.open(`https://wa.me/573162225604?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copiado", description: "El enlace fue copiado al portapapeles." });
  };

  const shareWA = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Mira esta propiedad: ${window.location.href}`)}`, "_blank");
  };

  const shareFB = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank");
  };

  return (
    <div className="bg-background border border-primary/20 shadow-lg p-6 sticky top-24">
      <h3 className="font-heading text-lg font-bold text-foreground mb-1">¿Te interesa esta propiedad?</h3>
      <p className="font-body text-sm text-muted-foreground mb-6">Contáctanos y te asesoramos sin costo</p>

      <div className="space-y-3 mb-4">
        <input
          type="text" placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)}
          className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
        />
        <input
          type="tel" placeholder="Celular" value={celular} onChange={(e) => setCelular(e.target.value)}
          className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
        />
        <textarea
          rows={5} value={mensaje} onChange={(e) => setMensaje(e.target.value)}
          className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none resize-none"
        />
      </div>

      <button onClick={handleWhatsApp} className="w-full py-3 bg-primary text-primary-foreground font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
        <WhatsAppIcon size={16} className="filter-white" /> Enviar por WhatsApp
      </button>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-foreground/10" />
        <span className="font-body text-xs text-muted-foreground">o</span>
        <div className="flex-1 h-px bg-foreground/10" />
      </div>

      <a href="tel:3186531598" className="w-full py-3 border border-primary text-primary font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-2">
        <Phone size={16} /> Llamar ahora
      </a>
      <p className="font-body text-xs text-muted-foreground text-center mt-2">Respuesta inmediata en horario laboral</p>

      <button
        onClick={() => generatePropertyPDF(property).catch(() => toast({ title: "Error", description: "No se pudo generar el PDF.", variant: "destructive" }))}
        className="mt-4 w-full py-3 bg-foreground text-background font-heading text-xs font-semibold tracking-widest uppercase hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
      >
        <FileText size={16} /> Descargar Ficha Técnica (PDF)
      </button>

      <div className="mt-6 pt-4 border-t border-foreground/10 flex items-center gap-3">
        <span className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">Compartir:</span>
        <button onClick={handleCopyLink} className="text-primary hover:text-primary/70 transition-colors" aria-label="Copiar link"><Copy size={18} /></button>
        <button onClick={shareWA} className="text-primary hover:text-primary/70 transition-colors" aria-label="Compartir WhatsApp">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </button>
        <button onClick={shareFB} className="text-primary hover:text-primary/70 transition-colors" aria-label="Compartir Facebook"><Share2 size={18} /></button>
      </div>
    </div>
  );
};

/* ─── Feature Item ─── */
const Feature = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) => (
  <div className="flex items-center gap-3 p-4 bg-background border border-[#E5E7EB]">
    <Icon size={20} className="text-primary shrink-0" />
    <div>
      <p className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">{label}</p>
      <p className="font-body text-sm font-bold text-foreground">{value}</p>
    </div>
  </div>
);

/* ─── Related Properties Card ─── */
const RelatedCard = ({ property }: { property: Propiedad }) => (
  <Link to={`/propiedades/${property.id}`} className="group border border-foreground/10 bg-background overflow-hidden block">
    <div className="relative overflow-hidden">
      <img src={property.foto_portada || "/placeholder.svg"} alt={property.nombre_inmueble} className="w-full h-56 object-cover transition-all duration-500 group-hover:grayscale" loading="lazy" />
      <span className="absolute top-4 left-4 font-heading text-xs font-semibold tracking-widest uppercase px-3 py-1 bg-primary text-primary-foreground">{property.tipo_negocio}</span>
    </div>
    <div className="p-6">
      <p className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-1">{property.tipo_inmueble} · {property.barrio}</p>
      <p className="font-heading text-sm font-medium text-foreground mb-2">{property.nombre_inmueble}</p>
      <p className="font-heading text-xl font-bold text-primary">{formatPrice(property.precio)}</p>
    </div>
  </Link>
);

/* ─── Main Page ─── */
const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: property, isLoading, error } = useQuery({
    queryKey: ["propiedad", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("propiedades").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as Propiedad;
    },
    enabled: !!id,
  });

  // Related properties
  const { data: allProps } = usePropiedades();
  const related = useMemo(() => {
    if (!property || !allProps) return [];
    return allProps
      .filter((p) => p.id !== property.id && (p.tipo_negocio === property.tipo_negocio || p.barrio === property.barrio))
      .slice(0, 3);
  }, [property, allProps]);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-primary" size={40} /></div>
        <Footer />
      </>
    );
  }

  if (error || !property) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <AlertCircle className="text-destructive" size={48} />
          <p className="font-body text-muted-foreground">No se encontró la propiedad.</p>
          <button onClick={() => navigate("/propiedades")} className="font-heading text-xs font-semibold tracking-widest uppercase text-primary hover:underline">Volver a propiedades</button>
        </div>
        <Footer />
      </>
    );
  }

  const allPhotos = [property.foto_portada, ...(property.fotos || [])].filter(Boolean) as string[];
  const mapQuery = encodeURIComponent(`${property.direccion || property.barrio || property.nombre_inmueble}, Cali, Colombia`);

  const formatParqueadero = (val: string | null) => {
    if (!val) return null;
    const lower = val.toLowerCase();
    if (lower === "no" || lower === "0" || lower === "false") return "No";
    return "Sí";
  };

  const seoTitle = `${property.nombre_inmueble} en ${property.tipo_negocio} | ${property.barrio || property.ciudad || "Cali"}`.slice(0, 60);
  const seoDesc = (property.descripcion?.slice(0, 155) ||
    `${property.tipo_inmueble} en ${property.tipo_negocio.toLowerCase()} en ${property.barrio || property.ciudad || "Cali"}. ${property.area_m2 ? property.area_m2 + " m². " : ""}${property.habitaciones ? property.habitaciones + " hab. " : ""}Precio: ${formatPrice(property.precio)}.`).slice(0, 160);
  const propertyJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: property.nombre_inmueble,
    description: property.descripcion || seoDesc,
    image: allPhotos,
    offers: property.precio
      ? {
          "@type": "Offer",
          price: property.precio,
          priceCurrency: "COP",
          availability: "https://schema.org/InStock",
          url: `https://inmobiliariaeo.lovable.app/propiedades/${property.id}`,
        }
      : undefined,
    brand: { "@type": "Organization", name: "Inmobiliaria Eliana Osorio" },
  };

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDesc}
        path={`/propiedades/${property.id}`}
        image={property.foto_portada || undefined}
        type="product"
        jsonLd={propertyJsonLd}
      />
      <Header solid />
      <main className="pt-20">
        <div className="container mx-auto px-6 lg:px-10 pt-4 pb-2">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Inicio</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/propiedades">Propiedades</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>{property.nombre_inmueble}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <button onClick={() => navigate("/propiedades")} className="flex items-center gap-2 font-heading text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors mt-2 mb-3 ml-auto">
            <ArrowLeft size={16} /> Volver a propiedades
          </button>

          {/* Header info – left aligned */}
          <div className="mb-5">
            <Badge className="bg-primary text-primary-foreground font-heading text-[10px] font-bold tracking-widest uppercase px-3 py-1 mb-2">
              {property.tipo_negocio}
            </Badge>
            <p className="font-body text-sm text-muted-foreground mb-1">
              {[property.ciudad || "Cali", property.zona, property.tipo_inmueble].filter(Boolean).join(" | ")}
            </p>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-2">{property.nombre_inmueble}</h1>
            <p className="font-body text-2xl md:text-3xl font-bold text-primary">{formatPrice(property.precio)}</p>
          </div>
        </div>

        {/* Two-column layout: gallery+content left, contact right */}
        <div className="container mx-auto px-6 lg:px-10 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
            {/* Left column */}
            <div className="space-y-6">
              {/* Gallery */}
              <Gallery photos={allPhotos} />

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
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4">Descripción</h2>
                  <p className="font-body text-muted-foreground leading-relaxed whitespace-pre-line">{property.descripcion}</p>
                  <div className="h-px bg-primary/30 mt-8" />
                </div>
              )}

              {/* Location */}
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-primary" /> Ubicación
                </h2>
                {property.direccion && <p className="font-body text-muted-foreground mb-4">{property.direccion}</p>}
                <iframe
                  title="Mapa"
                  src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
                  className="w-full h-[300px] rounded-lg border border-foreground/10"
                  loading="lazy"
                  allowFullScreen
                />
              </div>

              {/* Video */}
              {property.link_video && (
                <div className="bg-muted/30 border border-primary/20 p-6">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Play size={20} className="text-primary" /> Video
                  </h2>
                  <a
                    href={property.link_video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-6 py-3 font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors"
                  >
                    {property.red_social_video === "instagram" && <><Video size={18} /> Ver Reel en Instagram</>}
                    {property.red_social_video === "tiktok" && <><Video size={18} /> Ver en TikTok</>}
                    {property.red_social_video === "facebook" && <><Video size={18} /> Ver en Facebook</>}
                    {!property.red_social_video && <><Play size={18} /> Ver video</>}
                  </a>
                </div>
              )}
            </div>

            {/* Right column – sticky contact */}
            <div>
              <div className="hidden lg:flex flex-col gap-4 sticky top-24">
                <ContactCard property={property} />
                <AppointmentBooking property={property} />
              </div>
              {/* Mobile */}
              <div className="lg:hidden space-y-4">
                <ContactCard property={property} />
                <AppointmentBooking property={property} />
              </div>
            </div>
          </div>

          {/* Related properties */}
          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-8">También te puede interesar</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((p) => <RelatedCard key={p.id} property={p} />)}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default PropertyDetail;
