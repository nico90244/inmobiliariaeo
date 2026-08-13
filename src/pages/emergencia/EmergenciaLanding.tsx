import { Link } from "react-router-dom";
import { Home, Search, ShieldCheck, HeartHandshake, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";

const EmergenciaLanding = () => {
  return (
    <>
      <SEO
        title="Afectados por el Terremoto en Colombia | Red de Apoyo para Arriendo | Inmobiliaria EO"
        description="Conectamos a personas afectadas por el terremoto con propietarios, agentes e inmobiliarias que tienen inmuebles disponibles para arrendar en Cali y el Valle del Cauca."
        path="/emergencia-terremoto"
      />
      <Header />
      <main className="pt-20">
        <section className="py-14 md:py-20 bg-muted/20 border-b border-foreground/10">
          <div className="container mx-auto px-6 lg:px-12 text-center max-w-3xl">
            <span className="inline-block font-heading text-[11px] font-bold tracking-widest uppercase px-3 py-1 bg-primary text-primary-foreground mb-5">
              Programa de apoyo · Terremoto Colombia
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Red de apoyo para arriendo
            </h1>
            <p className="font-body text-base md:text-lg text-muted-foreground leading-relaxed">
              Ayudamos a conectar a personas afectadas por el terremoto que necesitan un lugar
              para vivir, con propietarios, agentes e inmobiliarias que tienen inmuebles
              disponibles para arrendar. Sin costo por publicar ni por buscar.
            </p>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Link
                to="/emergencia-terremoto/publicar"
                className="group flex flex-col items-start p-8 bg-background border border-foreground/10 hover:border-primary/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-primary/10 mb-5 group-hover:bg-primary/20 transition-colors">
                  <Home size={22} className="text-primary" />
                </div>
                <h2 className="font-heading text-xl font-bold text-foreground mb-2">
                  Tengo un inmueble para arrendar
                </h2>
                <p className="font-body text-sm text-muted-foreground mb-5 leading-relaxed">
                  Propietarios, agentes e inmobiliarias pueden publicar en minutos. Cada
                  publicación pasa por revisión antes de mostrarse públicamente.
                </p>
                <span className="font-heading text-xs font-semibold tracking-widest uppercase text-primary group-hover:underline">
                  Publicar inmueble →
                </span>
              </Link>

              <Link
                to="/emergencia-terremoto/buscar"
                className="group flex flex-col items-start p-8 bg-background border border-foreground/10 hover:border-primary/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-primary/10 mb-5 group-hover:bg-primary/20 transition-colors">
                  <Search size={22} className="text-primary" />
                </div>
                <h2 className="font-heading text-xl font-bold text-foreground mb-2">
                  Estoy buscando arriendo
                </h2>
                <p className="font-body text-sm text-muted-foreground mb-5 leading-relaxed">
                  Desliza entre las opciones disponibles como en una app de citas: te
                  interesa o no. Cuando algo te guste, te conectamos por WhatsApp.
                </p>
                <span className="font-heading text-xs font-semibold tracking-widest uppercase text-primary group-hover:underline">
                  Empezar a buscar →
                </span>
              </Link>
            </div>

            <div className="max-w-4xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="text-primary shrink-0 mt-0.5" />
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
                  Cada inmueble es revisado por nuestro equipo antes de publicarse, para
                  reducir el riesgo de anuncios falsos.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle size={20} className="text-primary shrink-0 mt-0.5" />
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
                  El contacto se hace siempre a través de nuestro WhatsApp — tus datos de
                  contacto no se muestran públicamente.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <HeartHandshake size={20} className="text-primary shrink-0 mt-0.5" />
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
                  Publicar y buscar es gratuito. Si quieres que administremos tu inmueble,
                  aplica una comisión del 10%, solo si así lo eliges.
                </p>
              </div>
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
