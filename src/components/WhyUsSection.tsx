const reasons = [
  { stat: "+10", label: "años de experiencia", detail: "En el mercado inmobiliario de Cali y el Valle del Cauca" },
  { stat: "100%", label: "Asesoría jurídica incluida", detail: "Revisión legal completa en cada transacción sin costo adicional" },
  { stat: "A→Z", label: "Acompañamiento total", detail: "Desde la búsqueda hasta la firma notarial, estamos contigo" },
  { stat: "2+", label: "Portales inmobiliarios", detail: "Presencia activa en Metrocuadrado y Finca Raíz" },
];

const WhyUsSection = () => {
  return (
    <section className="py-24 md:py-40 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            ¿Por qué elegirnos?
          </h2>
          <p className="font-body text-lg text-secondary-foreground/70">
            Más que una inmobiliaria, somos tu aliado con respaldo jurídico.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {reasons.map((r) => (
            <div key={r.label}>
              <span className="font-heading text-4xl md:text-5xl font-bold text-primary block mb-3">
                {r.stat}
              </span>
              <h3 className="font-heading text-base font-semibold text-secondary-foreground mb-2">
                {r.label}
              </h3>
              <p className="font-body text-sm text-secondary-foreground/60 leading-relaxed">
                {r.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
