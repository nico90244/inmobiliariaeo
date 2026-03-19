import { useState } from "react";
import { Phone, MessageCircle, MapPin } from "lucide-react";

const ContactSection = () => {
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
    <section id="contacto" className="py-24 md:py-40">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="section-divider mb-24" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Contáctanos
            </h2>
            <p className="font-body text-lg text-muted-foreground mb-12">
              Cuéntanos qué buscas y te asesoramos sin compromiso.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8 max-w-lg">
              <div>
                <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-b border-foreground/20 py-3 font-body text-foreground focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent border-b border-foreground/20 py-3 font-body text-foreground focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">
                  Mensaje
                </label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-transparent border-b border-foreground/20 py-3 font-body text-foreground focus:border-primary focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-12 py-3 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors"
              >
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
              <MessageCircle size={20} className="text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="font-heading text-sm font-semibold text-foreground">WhatsApp</p>
                <a href="https://wa.me/573162225604" target="_blank" rel="noopener noreferrer" className="font-body text-muted-foreground hover:text-primary transition-colors">
                  316 222 5604
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone size={20} className="text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="font-heading text-sm font-semibold text-foreground">Teléfono</p>
                <a href="tel:+573186531598" className="font-body text-muted-foreground hover:text-primary transition-colors">
                  318 653 1598
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary mt-1 flex-shrink-0">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <div>
                <p className="font-heading text-sm font-semibold text-foreground">Instagram</p>
                <a href="https://instagram.com/inmobiliaria_eo" target="_blank" rel="noopener noreferrer" className="font-body text-muted-foreground hover:text-primary transition-colors">
                  @inmobiliaria_eo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
