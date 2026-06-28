import { Loader2, AlertCircle } from "lucide-react";
import { usePropiedades } from "@/hooks/usePropiedades";
import PropertyCard from "@/components/PropertyCard";

const PropertiesSection = () => {
  const { data, isLoading, error } = usePropiedades({ destacada: true });
  const properties = data ?? [];

  return (
    <section id="propiedades" className="py-16 md:py-32">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="reveal max-w-3xl mb-10 md:mb-16">
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

        {!isLoading && !error && properties.length === 0 && (
          <p className="font-body text-muted-foreground py-10">
            Próximamente publicaremos propiedades destacadas. Contáctanos para más información.
          </p>
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
