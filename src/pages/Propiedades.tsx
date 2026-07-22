import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { AlertCircle, Search, FilterX } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PropertyCard from "@/components/PropertyCard";
import SEO from "@/components/SEO";
import { usePropiedades } from "@/hooks/usePropiedades";
import { useDebounce } from "@/hooks/useDebounce";
import { formatPrice } from "@/lib/utils";

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

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const dBarrio = useDebounce(barrio);
  const dCiudad = useDebounce(ciudad);
  const dPrecioMin = useDebounce(precioMin);
  const dPrecioMax = useDebounce(precioMax);

  useEffect(() => { setPage(1); }, [tipoNegocio, tipoInmueble, dBarrio, dCiudad, dPrecioMin, dPrecioMax]);

  const { data, isLoading, error } = usePropiedades({
    tipo_negocio: tipoNegocio || undefined,
    tipo_inmueble: tipoInmueble || undefined,
    barrio: dBarrio || undefined,
    ciudad: dCiudad || undefined,
    precioMin: dPrecioMin ? Number(dPrecioMin) : undefined,
    precioMax: dPrecioMax ? Number(dPrecioMax) : undefined,
  });

  const title = tipoNegocio === "Venta" ? "Propiedades en Venta" : tipoNegocio === "Alquiler" ? "Propiedades en Alquiler" : "Todas las Propiedades";
  const seoTitle = tipoNegocio === "Venta"
    ? "Casas y Apartamentos en Venta en Cali, Colombia | Inmobiliaria Eliana Osorio"
    : tipoNegocio === "Alquiler"
    ? "Apartamentos y Casas en Arriendo en Cali, Colombia | Inmobiliaria Eliana Osorio"
    : "Propiedades en Cali, Colombia | Casas, Apartamentos y Locales | Inmobiliaria EO";
  const seoDesc = tipoNegocio === "Venta"
    ? "Encuentra casas, apartamentos, apartaestudios y locales en venta en Cali y el Valle del Cauca. Asesoría jurídica incluida. Ideal para comprar desde Colombia o desde el exterior."
    : tipoNegocio === "Alquiler"
    ? "Alquila casa, apartamento o local en Cali con contratos seguros y administración de arriendos. Filtra por barrio, tipo y precio."
    : "Catálogo completo de propiedades en venta y arriendo en Cali y el Valle del Cauca. Casas, apartamentos, locales y más. Filtra por barrio, tipo y precio.";

  return (
    <>
      <SEO title={seoTitle} description={seoDesc} path={location.pathname} />
      <Header />
      <main className="pt-20">
        {/* Banner */}
        <div className="py-10 bg-muted/40 border-b border-foreground/5">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <div className="w-8 h-0.5 bg-primary mb-5 mx-auto" aria-hidden="true" />
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-2">{title}</h1>
            <p className="font-body text-sm md:text-base text-muted-foreground mb-3">
              Encuentra tu inmueble ideal en Cali y el Valle del Cauca
            </p>
            <nav className="flex items-center justify-center gap-2 font-body text-xs text-muted-foreground/60" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
              <span aria-hidden="true">/</span>
              <span className="text-muted-foreground">Propiedades</span>
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
              <div className="properties-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-background border border-foreground/5 overflow-hidden">
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
                ))}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 py-10 text-destructive">
                <AlertCircle size={20} />
                <p className="font-body">Error al cargar propiedades.</p>
              </div>
            )}

            {data && data.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-muted flex items-center justify-center mb-6">
                  <Search size={28} className="text-muted-foreground" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">Sin resultados</h3>
                <p className="font-body text-muted-foreground max-w-sm mb-6">
                  Ninguna propiedad coincide con los filtros actuales. Intenta ampliar la búsqueda.
                </p>
                <button
                  onClick={() => { setTipoNegocio(""); setTipoInmueble(""); setBarrio(""); setCiudad(""); setPrecioMin(""); setPrecioMax(""); }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary-hover transition-colors"
                >
                  <FilterX size={14} /> Limpiar filtros
                </button>
              </div>
            )}

            {data && data.length > 0 && (() => {
              const totalPages = Math.ceil(data.length / PAGE_SIZE);
              const paged = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
              return (
                <>
                  <div className="properties-grid">
                    {paged.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-12">
                      <button
                        onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        disabled={page === 1}
                        className="px-6 py-2.5 border border-foreground/20 font-heading text-xs font-semibold tracking-widest uppercase text-foreground/60 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <span className="font-heading text-xs text-muted-foreground tracking-widest">
                        {page} / {totalPages}
                      </span>
                      <button
                        onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        disabled={page === totalPages}
                        className="px-6 py-2.5 border border-foreground/20 font-heading text-xs font-semibold tracking-widest uppercase text-foreground/60 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default Propiedades;
