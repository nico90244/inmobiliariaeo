import { Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { usePropiedades } from "@/hooks/usePropiedades";
import PropertyCard from "@/components/PropertyCard";

const PropertiesSection = () => {
  const { data: properties, isLoading, error } = usePropiedades({ destacada: true });

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
            <p className="font-body">Error al cargar propiedades.</p>
          </div>
        )}

        {!isLoading && !error && (!properties || properties.length === 0) && (
          <div className="py-16 text-center border border-dashed border-foreground/15 rounded-lg">
            <p className="font-body text-muted-foreground mb-4">
              Aún no hay propiedades destacadas publicadas.
            </p>
            <Link to="/propiedades" className="font-heading text-xs font-semibold tracking-widest uppercase text-primary hover:underline">
              Ver todas las propiedades
            </Link>
          </div>
        )}

        {properties && properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertiesSection;
