import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PropertyCard from "@/components/PropertyCard";
import { usePropiedades, type Propiedad } from "@/hooks/usePropiedades";

const propertyTypes = ["Casa", "Apartamento", "Apartaestudio", "Local", "Finca", "Lote"];

const Propiedades = () => {
  const location = useLocation();
  const defaultTipoNegocio = location.pathname === "/venta" ? "Venta" : location.pathname === "/alquiler" ? "Alquiler" : "";

  const [tipoNegocio, setTipoNegocio] = useState(defaultTipoNegocio);
  const [tipoInmueble, setTipoInmueble] = useState("");
  const [barrio, setBarrio] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");

  const { data, isLoading, error } = usePropiedades({
    tipo_negocio: tipoNegocio || undefined,
    tipo_inmueble: tipoInmueble || undefined,
    barrio: barrio || undefined,
    precioMin: precioMin ? Number(precioMin) : undefined,
    precioMax: precioMax ? Number(precioMax) : undefined,
  });

  const formatPrice = (price: number | null) => {
    if (!price) return "Consultar";
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);
  };

  const title = tipoNegocio === "Venta" ? "Propiedades en Venta" : tipoNegocio === "Alquiler" ? "Propiedades en Alquiler" : "Todas las Propiedades";

  return (
    <>
      <Header />
      <main className="pt-20">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4">{title}</h1>
            <p className="font-body text-lg text-muted-foreground mb-12">
              Encuentra el inmueble ideal en las mejores zonas de Cali y el Valle del Cauca.
            </p>

            {/* Filters */}
            <div className="bg-muted/30 p-6 mb-12 border border-foreground/10">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Tipo negocio</label>
                  <select value={tipoNegocio} onChange={(e) => setTipoNegocio(e.target.value)} className="w-full bg-background border border-foreground/10 py-2 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none">
                    <option value="">Todos</option>
                    <option value="Venta">Venta</option>
                    <option value="Alquiler">Alquiler</option>
                  </select>
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Inmueble</label>
                  <select value={tipoInmueble} onChange={(e) => setTipoInmueble(e.target.value)} className="w-full bg-background border border-foreground/10 py-2 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none">
                    <option value="">Todos</option>
                    {propertyTypes.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Barrio</label>
                  <input type="text" value={barrio} onChange={(e) => setBarrio(e.target.value)} placeholder="Ej: Ciudad Jardín" className="w-full bg-background border border-foreground/10 py-2 px-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Precio mín.</label>
                  <input type="number" value={precioMin} onChange={(e) => setPrecioMin(e.target.value)} placeholder="$ 0" className="w-full bg-background border border-foreground/10 py-2 px-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Precio máx.</label>
                  <input type="number" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} placeholder="$ 0" className="w-full bg-background border border-foreground/10 py-2 px-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
                </div>
              </div>
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

            {data && data.length === 0 && (
              <p className="font-body text-muted-foreground text-center py-20">No se encontraron propiedades con los filtros seleccionados.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default Propiedades;
