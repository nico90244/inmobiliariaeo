import { Link } from "react-router-dom";
import { Home, Search, ShieldCheck, MessageCircle, HeartHandshake, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Publicaciones revisadas",
    detail: "Cada inmueble pasa por nuestro equipo antes de mostrarse públicamente, para reducir el riesgo de anuncios falsos.",
  },
  {
    icon: MessageCircle,
    title: "Contacto por WhatsApp",
    detail: "El primer contacto siempre pasa por nuestro WhatsApp — los datos del oferente no se muestran públicamente.",
  },
  {
    icon: HeartHandshake,
    title: "Gratuito para ambas partes",
    detail: "Publicar y buscar no tiene costo. La administración con comisión del 10% es opcional, solo si el propietario la solicita.",
  },
];

const EmergenciaLanding = () => {
  useScrollReveal();

  return (
    <>
      <SEO
        title="Afectados por el Terremoto en Colombia | Conectamos Inmuebles en Arriendo | Inmobiliaria EO"
        description="Iniciativa para conectar a personas afectadas por el terremoto con propietarios, agentes e inmobiliarias que tienen inmuebles disponibles para arrendar en Cali y el Valle del Cauca."
        path="/emergencia-terremoto"
      />
      <Header />
      <main className="pt-20">
        <section className="bg-secondary text-secondary-foreground">
          <div className="flex h-1.5 w-full" aria-hidden="true">
            <div className="flex-[2] bg-[#FCD116]" />
            <div className="flex-1 bg-[#003893]" />
            <div className="flex-1 bg-[#CE1126]" />
          </div>
          <div className="py-16 md:py-24 container mx-auto px-6 lg:px-12 text-center max-w-2xl reveal">
            <span className="inline-flex items-center gap-2 font-heading text-[11px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full border border-primary/40 text-primary mb-6">
              Iniciativa · Terremoto Colombia
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-5 leading-tight">
              Conectamos inmuebles con quienes los necesitan
            </h1>
            <p className="font-body text-base md:text-lg text-secondary-foreground/70 leading-relaxed">
              Una iniciativa para conectar a personas afectadas por el terremoto que necesitan
              un lugar para vivir con propietarios, agentes e inmobiliarias que tienen inmuebles
              disponibles para arrendar en Cali y el Valle del Cauca.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              <Link
                to="/emergencia-terremoto/publicar"
                className="reveal reveal-delay-1 group flex flex-col items-start p-8 md:p-10 rounded-2xl bg-background border border-foreground/10 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-primary/30"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 mb-6 transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
                  <Home size={20} className="text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
                </div>
                <h2 className="font-heading text-lg font-bold text-foreground mb-2">
                  Tengo un inmueble para arrendar
                </h2>
                <p className="font-body text-sm text-muted-foreground mb-6 leading-relaxed">
                  Propietarios, agentes e inmobiliarias pueden publicar en minutos. Cada
                  publicación pasa por revisión antes de mostrarse públicamente.
                </p>
                <span className="mt-auto inline-flex items-center gap-2 font-heading text-xs font-semibold tracking-widest uppercase text-primary group-hover:gap-3 transition-all duration-300">
                  Publicar inmueble <ArrowRight size={14} />
                </span>
              </Link>

              <Link
                to="/emergencia-terremoto/buscar"
                className="reveal reveal-delay-2 group flex flex-col items-start p-8 md:p-10 rounded-2xl bg-background border border-foreground/10 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-primary/30"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 mb-6 transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
                  <Search size={20} className="text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
                </div>
                <h2 className="font-heading text-lg font-bold text-foreground mb-2">
                  Estoy buscando arriendo
                </h2>
                <p className="font-body text-sm text-muted-foreground mb-6 leading-relaxed">
                  Desliza entre las opciones disponibles: te interesa o no. Cuando algo te
                  guste, te conectamos por WhatsApp para el siguiente paso.
                </p>
                <span className="mt-auto inline-flex items-center gap-2 font-heading text-xs font-semibold tracking-widest uppercase text-primary group-hover:gap-3 transition-all duration-300">
                  Empezar a buscar <ArrowRight size={14} />
                </span>
              </Link>
            </div>

            <div className="max-w-4xl mx-auto mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
              {trustPoints.map((t, i) => (
                <div
                  key={t.title}
                  className={`reveal reveal-delay-${i + 3} rounded-2xl bg-muted/20 border border-foreground/5 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:bg-muted/30`}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10 mb-3">
                    <t.icon size={16} className="text-primary" />
                  </div>
                  <h3 className="font-heading text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                    {t.title}
                  </h3>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">
                    {t.detail}
                  </p>
                </div>
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

export default EmergenciaLanding;
