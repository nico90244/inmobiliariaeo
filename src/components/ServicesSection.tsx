const services = [
  {
    number: "01",
    title: "Venta de inmuebles",
    description: "Gestionamos la venta de tu propiedad con estrategia de mercado, fotografía profesional y presencia en los principales portales inmobiliarios.",
  },
  {
    number: "02",
    title: "Alquiler y administración",
    description: "Encontramos el arrendatario ideal y administramos tu propiedad: cobro de cánones, mantenimiento y gestión integral.",
  },
  {
    number: "03",
    title: "Asesoría jurídica",
    description: "Revisión de títulos, estudio de tradición y libertad, elaboración de contratos y acompañamiento legal en cada transacción.",
  },
  {
    number: "04",
    title: "Acompañamiento notarial",
    description: "Te acompañamos en todo el proceso notarial y de registro, garantizando seguridad jurídica de principio a fin.",
  },
];

const ServicesSection = () => {
  return (
    <section id="servicios" className="py-24 md:py-40">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="section-divider mb-24" />

        <div className="reveal max-w-3xl mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Servicios
          </h2>
          <p className="font-body text-lg text-muted-foreground">
            Un acompañamiento completo para cada etapa de tu inversión inmobiliaria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/10">
          {services.map((service, i) => (
            <div key={service.number} className={`reveal reveal-delay-${i + 1} bg-background p-8 md:p-12 group relative overflow-hidden`}>
              {/* Accent line that slides in from the left on hover */}
              <span className="absolute left-0 top-0 h-full w-0.5 bg-primary origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
              <span className="font-heading text-5xl md:text-7xl font-bold text-primary/20 group-hover:text-primary transition-colors duration-500 block mb-6">
                {service.number}
              </span>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
