import { useState } from "react";
import { useParams, useLocation, Navigate, Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PropertyCard from "@/components/PropertyCard";
import SEO from "@/components/SEO";
import { usePropiedades } from "@/hooks/usePropiedades";
import { resolveBarrio } from "@/data/barrios";

const SITE_URL = "https://inmobiliariaeo.com";

/**
 * Página de aterrizaje por barrio + tipo de negocio (ej. /venta/ciudad-jardin,
 * /alquiler/el-penon). Existe para que búsquedas como "casa en venta en
 * ciudad jardín" tengan una URL específica y relevante a la que apuntar —
 * el catálogo general con filtros por JavaScript no puede competir por esas
 * frases porque no tiene una página propia para cada combinación.
 */
const PropiedadesBarrio = () => {
  const { barrio: barrioSlug } = useParams<{ barrio: string }>();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const tipoNegocio = location.pathname.startsWith("/alquiler") ? "Alquiler" : "Venta";
  const barrio = resolveBarrio(barrioSlug);

  const { data, isLoading, error } = usePropiedades({
    tipo_negocio: tipoNegocio,
    barrio: barrio?.nombre,
  });

  if (!barrio) {
    return <Navigate to={tipoNegocio === "Venta" ? "/venta" : "/alquiler"} replace />;
  }

  const verbo = tipoNegocio === "Venta" ? "venta" : "arriendo";
  const seoTitle = `Casas y Apartamentos en ${tipoNegocio} en ${barrio.nombre}, Cali | Inmobiliaria Eliana Osorio`;
  const seoDesc =
    tipoNegocio === "Venta"
      ? `Compra casa o apartamento en ${barrio.nombre}, Cali con asesoría jurídica incluida. Catálogo actualizado y acompañamiento para compradores en Colombia y en el exterior.`
      : `Arrienda casa o apartamento en ${barrio.nombre}, Cali con contrato y administración incluida. Catálogo actualizado y acompañamiento para propietarios e inquilinos.`;

  const faqs =
    tipoNegocio === "Venta"
      ? [
          {
            q: `¿Cómo comprar una casa o apartamento en ${barrio.nombre}, Cali?`,
            a: `Te acompañamos en todo el proceso: selección del inmueble, estudio de títulos, promesa de compraventa y firma de escritura, con asesoría jurídica incluida sin costo adicional. Atendemos compradores en Colombia y colombianos residentes en el exterior.`,
          },
          {
            q: `¿Qué documentos necesito para comprar una propiedad en Cali?`,
            a: `Generalmente cédula o pasaporte, certificado de ingresos si vas a solicitar crédito hipotecario, y los documentos del inmueble (certificado de tradición y libertad, paz y salvo de impuesto predial). Te asesoramos en cada paso.`,
          },
          {
            q: `¿La asesoría jurídica tiene costo adicional?`,
            a: `No. La asesoría jurídica para el comprador está incluida. Escríbenos por WhatsApp para conocer el catálogo disponible en ${barrio.nombre}.`,
          },
        ]
      : [
          {
            q: `¿Cómo arrendar un apartamento o casa en ${barrio.nombre}, Cali?`,
            a: `Publicamos tu solicitud, agendamos visitas y gestionamos el contrato de arrendamiento con las garantías legales correspondientes. Escríbenos por WhatsApp para conocer la disponibilidad actual en ${barrio.nombre}.`,
          },
          {
            q: `¿Qué necesito para arrendar una propiedad en Cali?`,
            a: `Normalmente cédula, certificado de ingresos o codeudor, y referencias. Te guiamos en los requisitos exactos según cada propietario.`,
          },
          {
            q: `¿Administran el arriendo si el propietario vive en otro país?`,
            a: `Sí. Gestionamos cobro del canon, mantenimiento y administración completa del contrato, aunque el propietario o el arrendatario estén fuera de Cali o de Colombia.`,
          },
        ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: tipoNegocio === "Venta" ? "Venta" : "Alquiler", item: `${SITE_URL}/${tipoNegocio === "Venta" ? "venta" : "alquiler"}` },
      { "@type": "ListItem", position: 3, name: barrio.nombre, item: `${SITE_URL}${location.pathname}` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const totalPages = data ? Math.ceil(data.length / PAGE_SIZE) : 0;
  const paged = data ? data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : [];

  return (
    <>
      <SEO title={seoTitle} description={seoDesc} path={location.pathname} jsonLd={[breadcrumbJsonLd, faqJsonLd]} />
      <Header />
      <main className="pt-20">
        <div className="py-10 bg-muted/40 border-b border-foreground/5">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <div className="w-8 h-0.5 bg-primary mb-5 mx-auto" aria-hidden="true" />
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-2">
              Casas y Apartamentos en {tipoNegocio} en {barrio.nombre}
            </h1>
            <p className="font-body text-sm md:text-base text-muted-foreground mb-3 max-w-2xl mx-auto">
              {tipoNegocio === "Venta"
                ? `Compra tu próxima casa o apartamento en ${barrio.nombre}, Cali, con asesoría jurídica incluida en todo el proceso.`
                : `Arrienda casa o apartamento en ${barrio.nombre}, Cali, con contrato y administración incluida.`}
            </p>
            <nav className="flex items-center justify-center gap-2 font-body text-xs text-muted-foreground/60" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
              <span aria-hidden="true">/</span>
              <Link to={tipoNegocio === "Venta" ? "/venta" : "/alquiler"} className="hover:text-foreground transition-colors">{tipoNegocio}</Link>
              <span aria-hidden="true">/</span>
              <span className="text-muted-foreground">{barrio.nombre}</span>
            </nav>
          </div>
        </div>

        <section className="py-6 md:py-10">
          <div className="container mx-auto px-6 lg:px-12">
            {isLoading && (
              <div className="properties-grid">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-background border border-foreground/5 overflow-hidden">
                    <div className="aspect-video bg-muted animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-2.5 w-1/4 bg-muted animate-pulse" />
                      <div className="h-5 w-3/4 bg-muted animate-pulse" />
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
              <div className="text-center py-16 max-w-xl mx-auto">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
                  Por ahora no hay inventario publicado en {barrio.nombre}
                </h2>
                <p className="font-body text-muted-foreground mb-6">
                  Nuestro catálogo cambia constantemente. Escríbenos por WhatsApp y te avisamos apenas tengamos disponibilidad en {barrio.nombre}, o mira el catálogo completo de {tipoNegocio.toLowerCase()} en Cali.
                </p>
                <Link
                  to={tipoNegocio === "Venta" ? "/venta" : "/alquiler"}
                  className="inline-block px-6 py-2.5 bg-primary text-primary-foreground font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary-hover transition-colors"
                >
                  Ver todo en {tipoNegocio}
                </Link>
              </div>
            )}

            {paged.length > 0 && (
              <>
                <div className="properties-grid mb-8">
                  {paged.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-4 mb-8">
                    <button
                      onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={page === 1}
                      className="px-6 py-2.5 border border-foreground/20 font-heading text-xs font-semibold tracking-widest uppercase text-foreground/60 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <span className="font-heading text-xs text-muted-foreground tracking-widest">{page} / {totalPages}</span>
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
            )}

            {/* FAQ — visible además de su JSON-LD, para usuarios y para IA generativa */}
            <div className="max-w-3xl mx-auto mt-8 border-t border-foreground/10 pt-10">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-6">Preguntas frecuentes</h2>
              <div className="space-y-6">
                {faqs.map((f) => (
                  <div key={f.q}>
                    <h3 className="font-heading text-sm font-semibold text-foreground mb-1">{f.q}</h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="max-w-3xl mx-auto mt-10 text-center border-t border-foreground/10 pt-8">
              <p className="font-body text-sm text-muted-foreground mb-3">
                ¿Tienes una propiedad en {barrio.nombre} y quieres venderla o arrendarla?
              </p>
              <Link to="/captacion" className="font-heading text-xs font-semibold tracking-widest uppercase text-primary hover:underline">
                Nosotros la administramos por ti →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default PropiedadesBarrio;
