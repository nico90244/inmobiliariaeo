import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Phone, MapPin, Mail, ChevronDown } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import logoGold from "@/assets/logo-gold.png";

const WhatsAppLink = ({ size = 16 }: { size?: number }) => <WhatsAppIcon size={size} />;

const socialLinks = [
{ icon: Instagram, href: "https://www.instagram.com/inmobiliaria_eo?igsh=anpmd2ltY3Brdmhj", label: "Instagram" },
{ icon: Facebook, href: "https://www.facebook.com/share/1RNxRhpUUb/?mibextid=wwXIfr", label: "Facebook" },
// TikTok uses custom SVG below
];


const navLinks = [
{ label: "Inicio", to: "/" },
{ label: "Propiedades", to: "/propiedades" },
{ label: "Servicios", to: "/servicios" },
{ label: "Captar Inmueble", to: "/captacion" },
{ label: "Preguntas Frecuentes", to: "/preguntas-frecuentes" },
{ label: "Contacto", to: "/contacto" }];


const serviceLinks = [
  { label: "Venta de inmuebles", to: "/venta" },
  { label: "Alquiler", to: "/alquiler" },
  { label: "Asesoría jurídica", to: "/servicios" },
  { label: "Acompañamiento notarial", to: "/servicios" },
  { label: "Administración de arriendos", to: "/servicios" },
];


const AccordionSection = ({ title, children }: {title: string;children: React.ReactNode;}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 lg:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 lg:hidden">
        
        <h3 className="font-heading text-sm font-semibold tracking-widest uppercase text-primary">{title}</h3>
        <ChevronDown size={16} className={`text-primary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <h3 className="hidden lg:block font-heading text-sm font-semibold tracking-widest uppercase text-primary mb-6">{title}</h3>
      <div className={`${open ? "block" : "hidden"} lg:block pb-4 lg:pb-0`}>
        {children}
      </div>
    </div>);

};

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-16">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1 - Brand */}
          <div>
            <img alt="Inmobiliaria Eliana Osorio" className="h-20 w-auto mb-4" src={logoGold} />
            <p className="font-body text-sm text-secondary-foreground/60 leading-relaxed">Más de 10 años acompañando la compra, venta y arriendo de inmuebles en Cali con asesoría jurídica integral y atención personalizada dentro y fuera de Colombia.</p>
          </div>

          {/* Column 2 - Navigation */}
          <AccordionSection title="Navegación">
            <ul className="space-y-3">
              {navLinks.map((l) =>
              <li key={l.to}>
                  <Link to={l.to} className="font-body text-sm text-secondary-foreground/60 hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              )}
            </ul>
          </AccordionSection>

          {/* Column 3 - Services */}
          <AccordionSection title="Servicios">
            <ul className="space-y-3">
              {serviceLinks.map((s) =>
              <li key={s.label}>
                  <Link to={s.to} className="font-body text-sm text-secondary-foreground/60 hover:text-primary transition-colors">
                    {s.label}
                  </Link>
                </li>
              )}
            </ul>
          </AccordionSection>

          {/* Column 4 - Contact + Social */}
          <AccordionSection title="Contáctanos">
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-primary flex-shrink-0" />
                <a href="tel:+573186531598" className="font-body text-sm text-secondary-foreground/60 hover:text-primary transition-colors">318 653 1598</a>
              </li>
              <li className="flex items-center gap-3">
                <WhatsAppIcon size={16} className="flex-shrink-0 text-primary" />
                <a href="https://wa.me/573162225604" target="_blank" rel="noopener noreferrer" className="font-body text-sm text-secondary-foreground/60 hover:text-primary transition-colors">316 222 5604</a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={16} className="text-primary flex-shrink-0" />
                <span className="font-body text-sm text-secondary-foreground/60">Cali, Valle del Cauca, Colombia</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary flex-shrink-0" />
                <a href="mailto:info@inmobiliariaeo.com" className="font-body text-sm text-secondary-foreground/60 hover:text-primary transition-colors">info@inmobiliariaeo.com</a>
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((s) =>
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary-hover transition-colors"
                aria-label={s.label}>
                  <s.icon size={16} />
                </a>
              )}
              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@inmobiliaria_eo?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary-hover transition-colors"
                aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.8a8.18 8.18 0 004.77 1.53V6.86a4.83 4.83 0 01-1-.17z" />
                </svg>
              </a>
            </div>
          </AccordionSection>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-primary/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-heading text-xs tracking-widest text-secondary-foreground/40 uppercase text-center sm:text-left">
            © {new Date().getFullYear()} Inmobiliaria Eliana Osorio. Todos los derechos reservados. Diseñado por{" "}
            <a
              href="https://www.linkedin.com/in/soyvaleriaosorio"
              target="_blank"
              rel="noopener noreferrer"
              className="normal-case tracking-normal text-secondary-foreground/60 hover:text-primary transition-colors"
            >
              Nikole Valeria Osorio
            </a>
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/politica-privacidad"
              className="font-heading text-[10px] tracking-widest text-secondary-foreground/40 hover:text-primary transition-colors uppercase"
            >
              Política de Datos
            </Link>
            <Link
              to="/admin"
              className="font-heading text-[10px] tracking-widest text-secondary-foreground/20 hover:text-primary/50 transition-colors uppercase"
            >
              Acceso Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>);

};

export default Footer;