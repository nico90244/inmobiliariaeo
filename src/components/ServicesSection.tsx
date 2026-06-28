import { Building2, Key, Scale, FileCheck } from "lucide-react";

const services = [
  {
    number: "01",
    icon: Building2,
    title: "Venta de inmuebles",
    description:
      "Diseñamos una estrategia de venta a la medida de tu propiedad: desde la valoración inicial hasta el cierre notarial, con presencia activa en los principales portales del país.",
    bullets: [
      "Valoración comercial con análisis de mercado",
      "Fotografía profesional y recorrido virtual",
      "Publicación en Metrocuadrado y Finca Raíz",
      "Acompañamiento en negociación y cierre",
    ],
  },
  {
    number: "02",
    icon: Key,
    title: "Alquiler y administración",
    description:
      "Encontramos al arrendatario ideal mediante un riguroso proceso de selección, y administramos tu propiedad de principio a fin para que tú no te preocupes por nada.",
    bullets: [
      "Estudio socioeconómico y de referencias del arrendatario",
      "Cobro mensual y transferencia al propietario",
      "Atención de novedades y mantenimientos",
      "Gestión de renovaciones y ajustes de canon",
    ],
  },
  {
    number: "03",
    icon: Scale,
    title: "Asesoría jurídica",
    description:
      "Cada operación inmobiliaria conlleva riesgos legales. Nuestra asesoría jurídica incluida garantiza que tu inversión esté protegida desde el primer hasta el último documento.",
    bullets: [
      "Estudio de títulos y tradición y libertad",
      "Revisión y elaboración de promesas de compraventa",
      "Redacción de contratos de arrendamiento",
      "Acompañamiento ante notarías y curadurías",
    ],
  },
  {
    number: "04",
    icon: FileCheck,
    title: "Acompañamiento notarial",
    description:
      "El proceso notarial y de registro puede ser complejo. Te guiamos en cada paso para asegurar que la transferencia de propiedad quede correctamente formalizada.",
    bullets: [
      "Coordinación con notarías en Cali",
      "Seguimiento al proceso de escrituración",
      "Registro en la Oficina de Instrumentos Públicos",
      "Revisión final de documentos y certificados",
    ],
  },
];

const ServicesSection = () => {
  return (
    <section id="servicios" className="py-16 md:py-32">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="section-divider mb-10 md:mb-20" />

        <div className="reveal flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-16">
          <div className="max-w-lg">
            <p className="font-heading text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              Lo que hacemos
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              Servicios
            </h2>
          </div>
          <p className="font-body text-muted-foreground max-w-sm md:text-right leading-relaxed">
            Acompañamiento integral en cada etapa de tu operación inmobiliaria,
            con respaldo jurídico en todo momento.
          </p>
        </div>

        {/* Service list */}
        <div>
          {services.map((service, i) => (
            <div
              key={service.number}
              className={`reveal reveal-delay-${i + 1} group border-t border-foreground/10 last:border-b`}
            >
              <div className="grid md:grid-cols-12 gap-6 md:gap-12 py-10 md:py-12 items-start">
                {/* Left: number + icon + title */}
                <div className="md:col-span-4 flex gap-5 items-start">
                  <span className="font-heading text-xs font-semibold tracking-widest text-primary/50 pt-1 select-none">
                    {service.number}
                  </span>
                  <div>
                    <div className="w-11 h-11 flex items-center justify-center border border-foreground/10 group-hover:border-primary group-hover:bg-primary/5 transition-all duration-400 mb-4">
                      <service.icon
                        size={20}
                        className="text-foreground/50 group-hover:text-primary transition-colors duration-400"
                      />
                    </div>
                    <h3 className="font-heading text-lg md:text-xl font-semibold text-foreground leading-snug">
                      {service.title}
                    </h3>
                  </div>
                </div>

                {/* Right: description + bullets */}
                <div className="md:col-span-8">
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                    {service.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="font-body text-sm text-foreground/70 leading-relaxed">
                          {bullet}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
