import { Loader2, AlertCircle } from "lucide-react";
import { usePropiedades, type Propiedad } from "@/hooks/usePropiedades";
import PropertyCard from "@/components/PropertyCard";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";
import property5 from "@/assets/property-5.jpg";
import property6 from "@/assets/property-6.jpg";

// Fallback static data when DB is empty
const fallbackProperties: Propiedad[] = [
  { id: "1", foto_portada: property1, tipo_inmueble: "Apartamento", barrio: "Ciudad Jardín", precio: 450000000, area_m2: 120, habitaciones: 3, banos: 2, estado: "Disponible", tipo_negocio: "Venta", nombre_inmueble: "Apartamento Ciudad Jardín", direccion: null, zona: null, piso: null, parqueadero: null, estrato: null, administracion: null, descripcion: null, fotos: null, link_whatsapp: null, link_video: null, red_social_video: null, fecha_creacion: "", fecha_actualizacion: "", ciudad: "Cali", destacada: true },
  { id: "2", foto_portada: property2, tipo_inmueble: "Casa", barrio: "San Fernando", precio: 850000000, area_m2: 280, habitaciones: 4, banos: 3, estado: "Disponible", tipo_negocio: "Venta", nombre_inmueble: "Casa San Fernando", direccion: null, zona: null, piso: null, parqueadero: null, estrato: null, administracion: null, descripcion: null, fotos: null, link_whatsapp: null, link_video: null, red_social_video: null, fecha_creacion: "", fecha_actualizacion: "", ciudad: "Cali", destacada: true },
  { id: "3", foto_portada: property3, tipo_inmueble: "Apartaestudio", barrio: "El Peñón", precio: 1200000, area_m2: 45, habitaciones: 1, banos: 1, estado: "Disponible", tipo_negocio: "Alquiler", nombre_inmueble: "Apartaestudio El Peñón", direccion: null, zona: null, piso: null, parqueadero: null, estrato: null, administracion: null, descripcion: null, fotos: null, link_whatsapp: null, link_video: null, red_social_video: null, fecha_creacion: "", fecha_actualizacion: "", ciudad: "Cali", destacada: true },
  { id: "4", foto_portada: property4, tipo_inmueble: "Apartamento", barrio: "Oeste", precio: 680000000, area_m2: 95, habitaciones: 2, banos: 2, estado: "Disponible", tipo_negocio: "Venta", nombre_inmueble: "Apartamento Oeste", direccion: null, zona: null, piso: null, parqueadero: null, estrato: null, administracion: null, descripcion: null, fotos: null, link_whatsapp: null, link_video: null, red_social_video: null, fecha_creacion: "", fecha_actualizacion: "", ciudad: "Cali", destacada: true },
  { id: "5", foto_portada: property5, tipo_inmueble: "Finca", barrio: "Jamundí", precio: 1200000000, area_m2: 5000, habitaciones: 5, banos: 4, estado: "Disponible", tipo_negocio: "Venta", nombre_inmueble: "Finca Jamundí", direccion: null, zona: null, piso: null, parqueadero: null, estrato: null, administracion: null, descripcion: null, fotos: null, link_whatsapp: null, link_video: null, red_social_video: null, fecha_creacion: "", fecha_actualizacion: "", ciudad: "Cali", destacada: true },
  { id: "6", foto_portada: property6, tipo_inmueble: "Local", barrio: "Granada", precio: 3500000, area_m2: 80, habitaciones: 0, banos: 1, estado: "Disponible", tipo_negocio: "Alquiler", nombre_inmueble: "Local Granada", direccion: null, zona: null, piso: null, parqueadero: null, estrato: null, administracion: null, descripcion: null, fotos: null, link_whatsapp: null, link_video: null, red_social_video: null, fecha_creacion: "", fecha_actualizacion: "", ciudad: "Cali", destacada: true },
];

const PropertiesSection = () => {
  const { data, isLoading, error } = usePropiedades({ destacada: true });
  const properties = data && data.length > 0 ? data : fallbackProperties;

  return (
    <section id="propiedades" className="py-24 md:py-40">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Propiedades Destacadas
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertiesSection;
