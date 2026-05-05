import { useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";

const propertyTypes = ["Casa", "Apartamento", "Apartaestudio", "Local", "Finca", "Lote"];

const HeroSection = () => {
  const [tipo, setTipo] = useState("Venta");
  const [inmueble, setInmueble] = useState("");
  const [barrio, setBarrio] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");

  return (
    <section id="inicio" className="relative min-h-screen flex items-end pb-24 pt-20">
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-secondary/60" />
      </div>

      <div className="container relative z-10 mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mb-16">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground leading-tight mb-6">
            Tu hogar{" "}
            <span className="text-primary">con respaldo jurídico</span>
          </h1>
          <p className="font-body text-lg md:text-xl text-primary-foreground/80">
            Venta, alquiler y asesoría jurídica de propiedad raíz
          </p>
        </div>

        <div className="bg-background p-6 md:p-8 border border-foreground/10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">
                Tipo
              </label>
              <div className="flex border-b border-foreground/20">
                {["Venta", "Alquiler"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTipo(t)}
                    className={`flex-1 py-2 font-heading text-sm font-medium transition-colors ${
                      tipo === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">
                Inmueble
              </label>
              <select
                value={inmueble}
                onChange={(e) => setInmueble(e.target.value)}
                className="w-full bg-transparent border-b border-foreground/20 py-2 font-body text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
              >
                <option value="">Todos</option>
                {propertyTypes.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">
                Barrio
              </label>
              <input
                type="text"
                value={barrio}
                onChange={(e) => setBarrio(e.target.value)}
                placeholder="Ej: Ciudad Jardín"
                className="w-full bg-transparent border-b border-foreground/20 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">
                Precio mín.
              </label>
              <input
                type="text"
                value={precioMin}
                onChange={(e) => setPrecioMin(e.target.value)}
                placeholder="$ 0"
                className="w-full bg-transparent border-b border-foreground/20 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">
                Precio máx.
              </label>
              <input
                type="text"
                value={precioMax}
                onChange={(e) => setPrecioMax(e.target.value)}
                placeholder="$ 0"
                className="w-full bg-transparent border-b border-foreground/20 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button className="mt-6 w-full md:w-auto px-12 py-3 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors">
            Buscar
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
