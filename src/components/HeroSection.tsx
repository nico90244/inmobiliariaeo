import { useState } from "react";
import { useNavigate } from "react-router-dom";

const heroBg = "/hero-bg.jpg";

const propertyTypes = ["Casa", "Apartamento", "Apartaestudio", "Local", "Finca", "Lote"];

const HeroSection = () => {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState("Venta");
  const [inmueble, setInmueble] = useState("");
  const [barrio, setBarrio] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (tipo) params.set("negocio", tipo.toLowerCase());
    if (inmueble) params.set("tipo", inmueble);
    if (barrio) params.set("barrio", barrio);
    if (precioMin) params.set("precioMin", precioMin);
    if (precioMax) params.set("precioMax", precioMax);
    navigate(`/propiedades?${params.toString()}`);
  };

  return (
    <section id="inicio" className="relative flex items-end pb-20 pt-20 sm:pb-24" style={{ minHeight: '100dvh' }}>
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="" width={1920} height={1080} fetchPriority="high" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-secondary/60" />
      </div>

      <div className="container relative z-10 mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mb-10 md:mb-16">
          <h1 className="hero-animate-1 font-display text-5xl sm:text-6xl md:text-7xl font-bold text-primary-foreground leading-tight mb-4 md:mb-6">
            Tu hogar{" "}
            <span className="shimmer-gold">con respaldo jurídico</span>
          </h1>
          <p className="hero-animate-2 font-body text-base sm:text-lg md:text-xl text-primary-foreground/80">
            Venta, alquiler y asesoría jurídica de propiedad raíz
          </p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="hero-animate-3 backdrop-blur-md p-5 sm:p-6 md:p-8 border border-white/20"
          style={{ backgroundColor: "hsl(43, 33%, 97%, 0.72)" }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">
                Tipo
              </label>
              <div className="flex border-b border-foreground/20" role="group" aria-label="Tipo de negocio">
                {["Venta", "Alquiler"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTipo(t)}
                    aria-pressed={tipo === t}
                    className={`flex-1 min-h-[44px] font-heading text-sm font-medium transition-colors ${
                      tipo === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="hero-inmueble" className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">
                Inmueble
              </label>
              <select
                id="hero-inmueble"
                value={inmueble}
                onChange={(e) => setInmueble(e.target.value)}
                className="w-full min-h-[44px] bg-transparent border-b border-foreground/20 py-2 font-body text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
              >
                <option value="">Todos</option>
                {propertyTypes.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="hero-barrio" className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">
                Barrio
              </label>
              <input
                id="hero-barrio"
                type="text"
                value={barrio}
                onChange={(e) => setBarrio(e.target.value)}
                placeholder="Ej: Ciudad Jardín"
                className="w-full min-h-[44px] bg-transparent border-b border-foreground/20 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="hero-precio-min" className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">
                Precio mín.
              </label>
              <input
                id="hero-precio-min"
                type="number"
                min="0"
                value={precioMin}
                onChange={(e) => setPrecioMin(e.target.value)}
                placeholder="$ 0"
                className="w-full min-h-[44px] bg-transparent border-b border-foreground/20 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="hero-precio-max" className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">
                Precio máx.
              </label>
              <input
                id="hero-precio-max"
                type="number"
                min="0"
                value={precioMax}
                onChange={(e) => setPrecioMax(e.target.value)}
                placeholder="$ 0"
                className="w-full min-h-[44px] bg-transparent border-b border-foreground/20 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-5 md:mt-6 w-full md:w-auto min-h-[48px] px-10 md:px-12 py-3 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary-hover transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>
    </section>
  );
};

export default HeroSection;
