import { AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { usePropiedades } from "@/hooks/usePropiedades";
import PropertyCard from "@/components/PropertyCard";

const PropertySkeleton = () => (
  <div className="bg-background border border-foreground/5 overflow-hidden">
    <div className="aspect-video bg-muted animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="h-2.5 w-1/4 bg-muted animate-pulse" />
      <div className="h-5 w-3/4 bg-muted animate-pulse" />
      <div className="h-2.5 w-1/2 bg-muted animate-pulse" />
      <div className="h-6 w-1/3 bg-muted animate-pulse" />
      <div className="border-t border-foreground/5 pt-3 flex gap-4">
        <div className="h-2.5 w-16 bg-muted animate-pulse" />
        <div className="h-2.5 w-12 bg-muted animate-pulse" />
      </div>
      <div className="mt-2 space-y-2">
        <div className="h-10 bg-muted animate-pulse" />
        <div className="h-10 bg-muted animate-pulse" />
      </div>
    </div>
  </div>
);

const VerTodasCard = () => (
  <Link
    to="/propiedades"
    className="group flex flex-col items-center justify-center min-h-[260px] h-full bg-background border border-foreground/10 hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-300 text-center p-8"
  >
    <div className="w-8 h-0.5 bg-primary mb-6 transition-all duration-300 group-hover:w-12" />
    <p className="font-heading text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground mb-2">
      Portafolio completo
    </p>
    <p className="font-display text-xl md:text-2xl font-bold text-foreground mb-6 leading-snug">
      Ver todas las propiedades
    </p>
    <div className="flex items-center gap-2 font-heading text-[10px] font-semibold tracking-[0.18em] uppercase text-primary">
      Explorar catálogo
      <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
    </div>
  </Link>
);

const PropertiesSection = () => {
  const { data, isLoading, error } = usePropiedades({ destacada: true });
  const properties = data ?? [];

  return (
    <section id="propiedades" className="py-16 md:py-32">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="animate-fade-in-up max-w-3xl mb-10 md:mb-16">
          <div className="w-8 h-0.5 bg-primary mb-6" aria-hidden="true" />
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Propiedades Destacadas
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            Descubre inmuebles seleccionados en las mejores zonas de Cali y el Valle del Cauca.
          </p>
        </div>

        {isLoading && (
          <div className="properties-grid">
            {Array.from({ length: 6 }).map((_, i) => <PropertySkeleton key={i} />)}
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

        {!isLoading && !error && properties.length > 0 && (
          <div className="properties-grid">
            {properties.map((property, i) => (
              <div
                key={property.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
              >
                <PropertyCard property={property} />
              </div>
            ))}
            <VerTodasCard />
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertiesSection;
