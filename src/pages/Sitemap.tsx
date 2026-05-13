import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";
import { usePropiedades } from "@/hooks/usePropiedades";

const sections: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: "Principal",
    links: [
      { to: "/", label: "Inicio" },
      { to: "/contacto", label: "Contacto" },
    ],
  },
  {
    title: "Propiedades",
    links: [
      { to: "/propiedades", label: "Todas las propiedades" },
      { to: "/venta", label: "En Venta" },
      { to: "/alquiler", label: "En Alquiler" },
    ],
  },
  {
    title: "Servicios",
    links: [
      { to: "/servicios", label: "Servicios" },
      { to: "/captacion", label: "Captar Inmueble" },
    ],
  },
  {
    title: "Acceso",
    links: [
      { to: "/admin/login", label: "Iniciar sesión (Admin)" },
    ],
  },
];

const Sitemap = () => {
  const { data: properties } = usePropiedades();

  return (
    <>
      <SEO
        title="Mapa del sitio | Inmobiliaria Eliana Osorio"
        description="Explora todas las secciones y propiedades publicadas en Inmobiliaria Eliana Osorio."
        path="/mapa-del-sitio"
      />
      <Header solid />
      <main className="pt-28 pb-24 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
              Mapa del sitio
            </h1>
            <p className="font-body text-muted-foreground">
              Encuentra rápidamente todas las páginas y propiedades disponibles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="font-heading text-sm font-semibold tracking-widest uppercase text-primary mb-4">
                  {s.title}
                </h2>
                <ul className="space-y-2">
                  {s.links.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="font-body text-sm text-foreground hover:text-primary transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {properties && properties.length > 0 && (
            <div className="mt-16">
              <h2 className="font-heading text-sm font-semibold tracking-widest uppercase text-primary mb-4">
                Propiedades publicadas
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
                {properties.map((p) => (
                  <li key={p.id}>
                    <Link to={`/propiedades/${p.id}`} className="font-body text-sm text-foreground hover:text-primary transition-colors">
                      {p.nombre_inmueble} <span className="text-muted-foreground">— {p.tipo_negocio}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default Sitemap;
