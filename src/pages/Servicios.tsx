import { Home, Key, Scale, FileCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";

const services = [
  { icon: Home, number: "01", title: "Venta de inmuebles", description: "Gestionamos la venta de tu propiedad con estrategia de mercado, fotografía profesional y presencia en los principales portales inmobiliarios como Metrocuadrado y Finca Raíz." },
  { icon: Key, number: "02", title: "Alquiler y administración", description: "Encontramos el arrendatario ideal y administramos tu propiedad: cobro de cánones, mantenimiento y gestión integral del contrato de arrendamiento." },
  { icon: Scale, number: "03", title: "Asesoría jurídica", description: "Revisión de títulos, estudio de tradición y libertad, elaboración de contratos y acompañamiento legal en cada transacción inmobiliaria." },
  { icon: FileCheck, number: "04", title: "Acompañamiento notarial", description: "Te acompañamos en todo el proceso notarial y de registro, garantizando seguridad jurídica de principio a fin en compraventa y arrendamiento." },
];

const Servicios = () => {
  return (
    <>
      <Header />
      <main className="pt-20">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Nuestros Servicios
            </h1>
            <p className="font-body text-lg text-muted-foreground mb-16 max-w-2xl">
              Un acompañamiento completo para cada etapa de tu inversión inmobiliaria en Cali y el Valle del Cauca.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/10">
              {services.map((service) => (
                <div key={service.number} className="bg-background p-8 md:p-12 group">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <service.icon size={28} className="text-primary" />
                    </div>
                    <div>
                      <span className="font-heading text-4xl font-bold text-primary/20 group-hover:text-primary transition-colors duration-500 block mb-3">{service.number}</span>
                      <h2 className="font-heading text-xl font-semibold text-foreground mb-3">{service.title}</h2>
                      <p className="font-body text-muted-foreground leading-relaxed">{service.description}</p>
                    </div>
                  </div>
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

export default Servicios;
