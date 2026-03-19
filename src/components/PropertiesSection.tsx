import { useState } from "react";
import { MessageCircle, Loader2, AlertCircle } from "lucide-react";
import { usePropiedades, type Propiedad } from "@/hooks/usePropiedades";
import PropertyModal from "@/components/PropertyModal";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";
import property5 from "@/assets/property-5.jpg";
import property6 from "@/assets/property-6.jpg";

// Fallback static data when DB is empty
const fallbackProperties: Propiedad[] = [
  { id: "1", foto_portada: property1, tipo_inmueble: "Apartamento", barrio: "Ciudad Jardín", precio: 450000000, area_m2: 120, habitaciones: 3, banos: 2, estado: "Disponible", tipo_negocio: "Venta", nombre_inmueble: "Apartamento Ciudad Jardín", direccion: null, zona: null, piso: null, parqueadero: null, estrato: null, administracion: null, descripcion: null, fotos: null, link_whatsapp: null, link_video: null, red_social_video: null, fecha_creacion: "", fecha_actualizacion: "" },
  { id: "2", foto_portada: property2, tipo_inmueble: "Casa", barrio: "San Fernando", precio: 850000000, area_m2: 280, habitaciones: 4, banos: 3, estado: "Disponible", tipo_negocio: "Venta", nombre_inmueble: "Casa San Fernando", direccion: null, zona: null, piso: null, parqueadero: null, estrato: null, administracion: null, descripcion: null, fotos: null, link_whatsapp: null, link_video: null, red_social_video: null, fecha_creacion: "", fecha_actualizacion: "" },
  { id: "3", foto_portada: property3, tipo_inmueble: "Apartaestudio", barrio: "El Peñón", precio: 1200000, area_m2: 45, habitaciones: 1, banos: 1, estado: "Disponible", tipo_negocio: "Alquiler", nombre_inmueble: "Apartaestudio El Peñón", direccion: null, zona: null, piso: null, parqueadero: null, estrato: null, administracion: null, descripcion: null, fotos: null, link_whatsapp: null, link_video: null, red_social_video: null, fecha_creacion: "", fecha_actualizacion: "" },
  { id: "4", foto_portada: property4, tipo_inmueble: "Apartamento", barrio: "Oeste", precio: 680000000, area_m2: 95, habitaciones: 2, banos: 2, estado: "Disponible", tipo_negocio: "Venta", nombre_inmueble: "Apartamento Oeste", direccion: null, zona: null, piso: null, parqueadero: null, estrato: null, administracion: null, descripcion: null, fotos: null, link_whatsapp: null, link_video: null, red_social_video: null, fecha_creacion: "", fecha_actualizacion: "" },
  { id: "5", foto_portada: property5, tipo_inmueble: "Finca", barrio: "Jamundí", precio: 1200000000, area_m2: 5000, habitaciones: 5, banos: 4, estado: "Disponible", tipo_negocio: "Venta", nombre_inmueble: "Finca Jamundí", direccion: null, zona: null, piso: null, parqueadero: null, estrato: null, administracion: null, descripcion: null, fotos: null, link_whatsapp: null, link_video: null, red_social_video: null, fecha_creacion: "", fecha_actualizacion: "" },
  { id: "6", foto_portada: property6, tipo_inmueble: "Local", barrio: "Granada", precio: 3500000, area_m2: 80, habitaciones: 0, banos: 1, estado: "Disponible", tipo_negocio: "Alquiler", nombre_inmueble: "Local Granada", direccion: null, zona: null, piso: null, parqueadero: null, estrato: null, administracion: null, descripcion: null, fotos: null, link_whatsapp: null, link_video: null, red_social_video: null, fecha_creacion: "", fecha_actualizacion: "" },
];

const statusStyles: Record<string, string> = {
  Disponible: "bg-primary text-primary-foreground",
  Arrendado: "bg-rented text-primary-foreground",
  Vendido: "bg-sold text-primary-foreground",
};

const PropertiesSection = () => {
  const { data, isLoading, error } = usePropiedades();
  const [selectedProperty, setSelectedProperty] = useState<Propiedad | null>(null);

  const properties = data && data.length > 0 ? data : fallbackProperties;

  return (
    <section id="propiedades" className="py-24 md:py-40">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4">
            Propiedades
          </h2>
          <p className="font-body text-lg text-muted-foreground">
            Descubre inmuebles seleccionados en las mejores zonas de Cali y el Valle del Cauca.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 py-10 text-destructive">
            <AlertCircle size={20} />
            <p className="font-body">Error al cargar propiedades. Mostrando datos de ejemplo.</p>
          </div>
        )}

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} onViewMore={() => setSelectedProperty(property)} />
          ))}
        </div>
      </div>

      <PropertyModal
        property={selectedProperty}
        open={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </section>
  );
};

const PropertyCard = ({ property, onViewMore }: { property: Propiedad; onViewMore: () => void }) => {
  const formatPrice = (price: number | null) => {
    if (!price) return "Consultar";
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);
  };

  const waLink = property.link_whatsapp ||
    `https://wa.me/573162225604?text=${encodeURIComponent(`Hola, me interesa el ${property.tipo_inmueble} en ${property.barrio} (${formatPrice(property.precio)})`)}`;

  return (
    <div className="break-inside-avoid group border border-foreground/10 bg-background overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={property.foto_portada || "/placeholder.svg"}
          alt={`${property.tipo_inmueble} en ${property.barrio}`}
          className="w-full object-cover transition-all duration-500 group-hover:grayscale"
          loading="lazy"
        />
        <span className={`absolute top-4 left-4 font-heading text-xs font-semibold tracking-widest uppercase px-3 py-1 ${statusStyles[property.estado] || statusStyles.Disponible}`}>
          {property.estado}
        </span>
      </div>

      <div className="p-6">
        <p className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-1">
          {property.tipo_inmueble} · {property.tipo_negocio}
        </p>
        <p className="font-heading text-sm font-medium text-foreground mb-3">
          {property.barrio}
        </p>

        <p className="font-heading text-2xl font-bold text-foreground transition-colors duration-500 group-hover:text-primary mb-4">
          {formatPrice(property.precio)}
        </p>

        <div className="flex gap-4 text-sm text-muted-foreground font-body mb-6 transition-colors duration-500 group-hover:text-primary">
          {property.area_m2 && <span>{property.area_m2} m²</span>}
          {(property.habitaciones ?? 0) > 0 && <span>{property.habitaciones} hab.</span>}
          <span>{property.banos} baño{(property.banos ?? 0) > 1 ? "s" : ""}</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onViewMore}
            className="flex-1 py-2.5 bg-secondary text-secondary-foreground font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Ver más
          </button>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PropertiesSection;
