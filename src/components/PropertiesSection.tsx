import { MessageCircle } from "lucide-react";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";
import property5 from "@/assets/property-5.jpg";
import property6 from "@/assets/property-6.jpg";

interface Property {
  id: number;
  image: string;
  type: string;
  neighborhood: string;
  price: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  status: "Disponible" | "Arrendado" | "Vendido";
  listingType: "Venta" | "Alquiler";
}

const properties: Property[] = [
  { id: 1, image: property1, type: "Apartamento", neighborhood: "Ciudad Jardín", price: "$450.000.000", area: "120 m²", bedrooms: 3, bathrooms: 2, status: "Disponible", listingType: "Venta" },
  { id: 2, image: property2, type: "Casa", neighborhood: "San Fernando", price: "$850.000.000", area: "280 m²", bedrooms: 4, bathrooms: 3, status: "Disponible", listingType: "Venta" },
  { id: 3, image: property3, type: "Apartaestudio", neighborhood: "El Peñón", price: "$1.200.000/mes", area: "45 m²", bedrooms: 1, bathrooms: 1, status: "Disponible", listingType: "Alquiler" },
  { id: 4, image: property4, type: "Apartamento", neighborhood: "Oeste", price: "$680.000.000", area: "95 m²", bedrooms: 2, bathrooms: 2, status: "Arrendado", listingType: "Venta" },
  { id: 5, image: property5, type: "Finca", neighborhood: "Jamundí", price: "$1.200.000.000", area: "5000 m²", bedrooms: 5, bathrooms: 4, status: "Disponible", listingType: "Venta" },
  { id: 6, image: property6, type: "Local", neighborhood: "Granada", price: "$3.500.000/mes", area: "80 m²", bedrooms: 0, bathrooms: 1, status: "Vendido", listingType: "Alquiler" },
];

const statusStyles: Record<string, string> = {
  Disponible: "bg-primary text-primary-foreground",
  Arrendado: "bg-rented text-primary-foreground",
  Vendido: "bg-sold text-primary-foreground",
};

const PropertiesSection = () => {
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

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
};

const PropertyCard = ({ property }: { property: Property }) => {
  return (
    <div className="break-inside-avoid group border border-foreground/10 bg-background overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={property.image}
          alt={`${property.type} en ${property.neighborhood}`}
          className="w-full object-cover transition-all duration-500 group-hover:grayscale"
          loading="lazy"
        />
        <span className={`absolute top-4 left-4 font-heading text-xs font-semibold tracking-widest uppercase px-3 py-1 ${statusStyles[property.status]}`}>
          {property.status}
        </span>
      </div>

      <div className="p-6">
        <p className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-1">
          {property.type} · {property.listingType}
        </p>
        <p className="font-heading text-sm font-medium text-foreground mb-3">
          {property.neighborhood}
        </p>

        <p className="font-heading text-2xl font-bold text-foreground transition-colors duration-500 group-hover:text-primary mb-4">
          {property.price}
        </p>

        <div className="flex gap-4 text-sm text-muted-foreground font-body mb-6 transition-colors duration-500 group-hover:text-primary">
          <span>{property.area}</span>
          {property.bedrooms > 0 && <span>{property.bedrooms} hab.</span>}
          <span>{property.bathrooms} baño{property.bathrooms > 1 ? "s" : ""}</span>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 py-2.5 bg-secondary text-secondary-foreground font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-colors">
            Ver más
          </button>
          <a
            href={`https://wa.me/573162225604?text=Hola, me interesa el ${property.type} en ${property.neighborhood} (${property.price})`}
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
