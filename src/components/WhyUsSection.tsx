import { Link } from "react-router-dom";
import { Award, Shield, Handshake, Globe, ArrowRight } from "lucide-react";

const stats = [
  {
    icon: Award,
    stat: "+10",
    unit: "años",
    label: "de experiencia",
    detail:
      "En el mercado inmobiliario de Cali y el Valle del Cauca, construyendo relaciones de confianza.",
  },
  {
    icon: Shield,
    stat: "100%",
    unit: "",
    label: "Asesoría jurídica incluida",
    detail:
      "Revisión legal completa en cada transacción — sin costos adicionales, sin letra pequeña.",
  },
  {
    icon: Handshake,
    stat: "A → Z",
    unit: "",
    label: "Acompañamiento total",
    detail:
      "Desde la primera visita hasta la firma notarial, un solo equipo te acompaña en todo.",
  },
  {
    icon: Globe,
    stat: "2+",
    unit: "portales",
    label: "de difusión activa",
    detail:
      "Presencia en Metrocuadrado y Finca Raíz para maximizar la visibilidad de tu inmueble.",
  },
];

const WhyUsSection = () => {
  return (
    <section className="py-16 md:py-32 bg-secondary text-secondary-foreground overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24">

          {/* Left: Editorial content */}
          <div className="lg:col-span-5 reveal flex flex-col justify-center">
            <p className="font-heading text-xs font-semibold tracking-widest text-primary uppercase mb-5">
              Por qué elegirnos
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Más que una inmobiliaria, somos tu aliado
            </h2>
            <p className="font-body text-secondary-foreground/65 leading-relaxed mb-8">
              En Inmobiliaria Eliana Osorio combinamos años de experiencia en el
              mercado de Cali con asesoría jurídica especializada incluida en
              cada operación. Nuestro objetivo es que cada cliente cierre con
              tranquilidad y seguridad total.
            </p>
            <Link
              to="/servicios"
              className="inline-flex items-center gap-2 font-heading text-sm font-semibold tracking-widest uppercase text-primary hover:gap-4 transition-all duration-300"
            >
              Ver servicios <ArrowRight size={16} />
            </Link>
          </div>

          {/* Right: 2×2 stats grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/10">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`reveal reveal-delay-${i + 1} bg-secondary p-8 md:p-10 group hover:bg-white/5 transition-colors duration-300`}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 flex items-center justify-center border border-white/10 group-hover:border-primary/40 transition-colors duration-300 mb-6">
                    <s.icon size={18} className="text-primary/70 group-hover:text-primary transition-colors duration-300" />
                  </div>

                  {/* Stat */}
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="font-heading text-3xl md:text-4xl font-bold text-primary transition-transform duration-300 group-hover:-translate-y-0.5 inline-block">
                      {s.stat}
                    </span>
                    {s.unit && (
                      <span className="font-heading text-sm font-semibold text-primary/60 uppercase tracking-wide">
                        {s.unit}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <h3 className="font-heading text-sm font-semibold text-secondary-foreground mb-3 uppercase tracking-wide">
                    {s.label}
                  </h3>

                  {/* Detail */}
                  <p className="font-body text-xs text-secondary-foreground/50 leading-relaxed">
                    {s.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
