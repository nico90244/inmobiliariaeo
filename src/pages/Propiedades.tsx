import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PropertyCard from "@/components/PropertyCard";
import SEO from "@/components/SEO";
import { usePropiedades, type Propiedad } from "@/hooks/usePropiedades";

const propertyTypes = ["Casa", "Apartamento", "Apartaestudio", "Local", "Finca", "Lote"];

const Propiedades = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const defaultTipoNegocio =
    location.pathname === "/venta"
      ? "Venta"
      : location.pathname === "/alquiler"
      ? "Alquiler"
      : searchParams.get("negocio")
      ? searchParams.get("negocio")!.charAt(0).toUpperCase() + searchParams.get("negocio")!.slice(1)
      : "";

  const [tipoNegocio, setTipoNegocio] = useState(defaultTipoNegocio);
  const [tipoInmueble, setTipoInmueble] = useState(searchParams.get("tipo") ?? "");
  const [barrio, setBarrio] = useState(searchParams.get("barrio") ?? "");
  const [ciudad, setCiudad] = useState("");
  const [precioMin, setPrecioMin] = useState(searchParams.get("precioMin") ?? "");
  const [precioMax, setPrecioMax] = useState(searchParams.get("precioMax") ?? "");

  const { data, isLoading, error } = usePropiedades({
    tipo_negocio: tipoNegocio || undefined,
    tipo_inmueble: tipoInmueble || undefined,
    barrio: barrio || undefined,
    ciudad: ciudad || undefined,
    precioMin: precioMin ? Number(precioMin) : undefined,
    precioMax: precioMax ? Number(precioMax) : undefined,
  });

  const formatPrice = (price: number | null) => {
    if (!price) return "Consultar";
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);
  };

  const title = tipoNegocio === "Venta" ? "Propiedades en Venta" : tipoNegocio === "Alquiler" ? "Propiedades en Alquiler" : "Todas las Propiedades";
  const seoTitle = tipoNegocio === "Venta" ? "Casas y apartamentos en venta en Cali | Inmobiliaria EO" : tipoNegocio === "Alquiler" ? "Inmuebles en alquiler en Cali | Inmobiliaria EO" : "Catálogo de propiedades en Cali y Valle | Inmobiliaria EO";
  const seoDesc = tipoNegocio === "Venta" ? "Explora casas, apartamentos y locales en venta en Cali y el Valle del Cauca con asesoría jurídica integral." : tipoNegocio === "Alquiler" ? "Apartamentos, casas y locales en alquiler en Cali y el Valle del Cauca. Filtra por barrio, tipo y precio." : "Encuentra tu inmueble ideal en Cali y el Valle del Cauca. Filtra por barrio, tipo de inmueble y precio.";

  return (
    <>
      <SEO title={seoTitle} description={seoDesc} path={location.pathname} />
      <Header />
      <main className="pt-20">
        {/* Banner */}
        <div className="py-10" style={{ background: "#F5F5F5" }}>
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-2" style={{ color: "#1A1A1A" }}>{title}</h1>
            <p className="font-body text-sm md:text-base mb-3" style={{ color: "#666666" }}>
              Encuentra tu inmueble ideal en Cali y el Valle del Cauca
            </p>
            <nav className="flex items-center justify-center gap-2 font-body text-xs" style={{ color: "#999999" }}>
              <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
              <span>&gt;</span>
              <span style={{ color: "#666666" }}>Propiedades</span>
            </nav>
          </div>
        </div>

        <section className="py-6 md:py-10">
          <div className="container mx-auto px-6 lg:px-12">

            {/* Filters */}
            <div className="bg-muted/30 p-4 md:p-6 mb-8 md:mb-12 border border-foreground/10">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                <div>
                  <label htmlFor="f-negocio" className="font-heading text-[10px] sm:text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Tipo</label>
                  <select id="f-negocio" value={tipoNegocio} onChange={(e) => setTipoNegocio(e.target.value)} className="w-full min-h-[44px] bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none">
                    <option value="">Todos</option>
                    <option value="Venta">Venta</option>
                    <option value="Alquiler">Alquiler</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="f-tipo" className="font-heading text-[10px] sm:text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Inmueble</label>
                  <select id="f-tipo" value={tipoInmueble} onChange={(e) => setTipoInmueble(e.target.value)} className="w-full min-h-[44px] bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none">
                    <option value="">Todos</option>
                    {propertyTypes.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="f-barrio" className="font-heading text-[10px] sm:text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Barrio</label>
                  <input id="f-barrio" type="text" value={barrio} onChange={(e) => setBarrio(e.target.value)} placeholder="Ej: Ciudad Jardín" className="w-full min-h-[44px] bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="f-ciudad" className="font-heading text-[10px] sm:text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Ciudad</label>
                  <input id="f-ciudad" type="text" value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Ej: Cali" className="w-full min-h-[44px] bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="f-precio-min" className="font-heading text-[10px] sm:text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Precio mín.</label>
                  <input id="f-precio-min" type="number" value={precioMin} onChange={(e) => setPrecioMin(e.target.value)} placeholder="$ 0" className="w-full min-h-[44px] bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="f-precio-max" className="font-heading text-[10px] sm:text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Precio máx.</label>
                  <input id="f-precio-max" type="number" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} placeholder="$ 0" className="w-full min-h-[44px] bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
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
