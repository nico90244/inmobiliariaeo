import { Link } from "react-router-dom";
import { MapPin, Maximize2, Bed, Bath, Car } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import type { Propiedad } from "@/hooks/usePropiedades";

const formatPrice = (price: number | null) => {
  if (!price) return "Consultar";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);
};

const PropertyCard = ({ property }: { property: Propiedad }) => {
  const waLink = property.link_whatsapp ||
    `https://wa.me/573162225604?text=${encodeURIComponent(`Hola, me interesa ${property.nombre_inmueble} en ${property.barrio}`)}`;

  return (
    <div className="group bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 ease-out hover:-translate-y-1 border border-foreground/5">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={property.foto_portada || "/placeholder.svg"}
          alt={property.nombre_inmueble}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Badge */}
        <span
          className="absolute top-2.5 left-2.5 font-heading text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded text-white"
          style={{ background: "#C9A84C" }}
        >
          {property.tipo_negocio}
          {property.zona && <> | {property.zona}</>}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Tipo inmueble */}
        <p className="font-heading text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-1">
          {property.tipo_inmueble}
        </p>

        {/* Nombre */}
        <h3 className="font-heading text-base font-bold text-foreground mb-1.5 line-clamp-1">
          {property.nombre_inmueble}
        </h3>

        {/* Barrio + Estrato */}
        <div className="flex items-center gap-1 text-muted-foreground mb-3">
          <MapPin size={14} className="shrink-0" />
          <span className="font-body text-xs">
            {property.barrio}
            {property.estrato ? ` · Estrato ${property.estrato}` : ""}
          </span>
        </div>

        {/* Precio */}
        <p className="font-body text-xl font-bold text-primary mb-3">
          {formatPrice(property.precio)}
        </p>

        {/* Divider */}
        <div className="border-t border-foreground/5 mb-3" />

        {/* Features row */}
        <div className="flex items-center gap-4 text-muted-foreground mb-4">
          {property.area_m2 && (
            <div className="flex items-center gap-1">
              <Maximize2 size={14} />
              <span className="font-body text-xs">{property.area_m2} m²</span>
            </div>
          )}
          {(property.habitaciones ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <Bed size={14} />
              <span className="font-body text-xs">{property.habitaciones}</span>
            </div>
          )}
          {(property.banos ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <Bath size={14} />
              <span className="font-body text-xs">{property.banos}</span>
            </div>
          )}
          {property.parqueadero && property.parqueadero.toLowerCase() !== "no" && (
            <div className="flex items-center gap-1">
              <Car size={14} />
              <span className="font-body text-xs">Sí</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <Link
          to={`/propiedades/${property.id}`}
          className="block w-full py-2.5 bg-secondary text-secondary-foreground font-heading text-xs font-semibold tracking-widest uppercase hover:bg-foreground/80 transition-colors text-center mb-2"
        >
          Ver detalles
        </Link>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-primary-foreground font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors"
        >
          <WhatsAppIcon size={14} className="text-primary-foreground" />
          WhatsApp
        </a>
      </div>
    </div>
  );
};

export default PropertyCard;
