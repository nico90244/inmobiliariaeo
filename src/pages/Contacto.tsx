import { useState } from "react";
import { Phone, MapPin, Mail } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Inmobiliaria Eliana Osorio",
  image: "https://inmobiliariaeo.com/logo.png",
  telephone: "+57 318 653 1598",
  email: "info@inmobiliariaeo.com",
  url: "https://inmobiliariaeo.com/contacto",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cali",
    addressRegion: "Valle del Cauca",
    addressCountry: "CO",
  },
};

const Contacto = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hola, soy ${name}. Mi teléfono es ${phone}. ${message}`;
    window.open(`https://wa.me/573162225604?text=${encodeURIComponent(text)}`, "_blank");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      <SEO
        title="Contacto | Inmobiliaria Eliana Osorio"
        description="Contáctanos por WhatsApp, teléfono o correo. Asesoría inmobiliaria y jurídica en Cali y el Valle del Cauca."
        path="/contacto"
        jsonLd={localBusinessJsonLd}
      />
      <Header />
      <main className="pt-20">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-7">
                <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">Contáctanos</h1>
                <p className="font-body text-lg text-muted-foreground mb-12">Cuéntanos qué buscas y te asesoramos sin compromiso.</p>
                <form onSubmit={handleSubmit} className="space-y-8 max-w-lg">
                  <div>
                    <label htmlFor="cto-nombre" className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Nombre</label>
                    <input id="cto-nombre" type="text" required value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className="w-full bg-transparent border-b border-foreground/20 py-3 font-body text-foreground focus:border-primary focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label htmlFor="cto-telefono" className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Teléfono</label>
                    <input id="cto-telefono" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={15} className="w-full bg-transparent border-b border-foreground/20 py-3 font-body text-foreground focus:border-primary focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label htmlFor="cto-mensaje" className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Mensaje</label>
                    <textarea id="cto-mensaje" required value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={1000} className="w-full bg-transparent border-b border-foreground/20 py-3 font-body text-foreground focus:border-primary focus:outline-none transition-colors resize-none" />
                  </div>
                  <button type="submit" className="px-12 py-3 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors">
                    {submitted ? "¡Enviado!" : "Enviar"}
                  </button>
                </form>
              </div>
              <div className="lg:col-span-4 lg:col-start-9 space-y-8 pt-4">
                <div className="flex items-start gap-4">
                  <MapPin size={20} className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-heading text-sm font-semibold text-foreground">Dirección</p>
                    <p className="font-body text-muted-foreground">Cali, Valle del Cauca</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <WhatsAppIcon size={20} className="mt-1 flex-shrink-0 filter-gold" />
                  <div>
                    <p className="font-heading text-sm font-semibold text-foreground">WhatsApp</p>
                    <a href="https://wa.me/573162225604" target="_blank" rel="noopener noreferrer" className="font-body text-muted-foreground hover:text-primary transition-colors">316 222 5604</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-heading text-sm font-semibold text-foreground">Teléfono</p>
                    <a href="tel:+573186531598" className="font-body text-muted-foreground hover:text-primary transition-colors">318 653 1598</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail size={20} className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-heading text-sm font-semibold text-foreground">Correo</p>
                    <a href="mailto:info@inmobiliariaeo.com" className="font-body text-muted-foreground hover:text-primary transition-colors">info@inmobiliariaeo.com</a>
                  </div>
                </div>
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

export default Contacto;
