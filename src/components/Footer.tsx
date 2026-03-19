import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Phone, MapPin, Mail, ChevronDown } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import logo from "@/assets/logo.png";

const WhatsAppLink = ({ size = 16 }: { size?: number }) => <WhatsAppIcon size={size} />;

const socialLinks = [
{ icon: Instagram, href: "https://instagram.com/inmobiliaria_eo", label: "Instagram" },
{ icon: Facebook, href: "https://facebook.com/inmobiliariaeo", label: "Facebook" },
// TikTok uses custom SVG below
];


const navLinks = [
{ label: "Inicio", to: "/" },
{ label: "Propiedades", to: "/propiedades" },
{ label: "Servicios", to: "/servicios" },
{ label: "Captar Inmueble", to: "/captacion" },
{ label: "Contacto", to: "/contacto" }];


const serviceLinks = [
"Venta de inmuebles",
"Alquiler",
"Asesoría jurídica",
"Acompañamiento notarial",
"Administración de arriendos"];


const AccordionSection = ({ title, children }: {title: string;children: React.ReactNode;}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 lg:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 lg:hidden">
        
        <h4 className="font-heading text-sm font-semibold tracking-widest uppercase text-primary">{title}</h4>
        <ChevronDown size={16} className={`text-primary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <h4 className="hidden lg:block font-heading text-sm font-semibold tracking-widest uppercase text-primary mb-6">{title}</h4>
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
            <img alt="Inmobiliaria Eliana Osorio" className="h-12 w-auto mb-4 brightness-0 invert" src="/lovable-uploads/6e4f0656-2af2-4a4d-8c02-cb3563d235e8.png" />
            

            
            <div className="flex items-center gap-3">
              {socialLinks.map((s) =>
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/80 transition-colors"
                aria-label={s.label}>
                
                  <s.icon size={16} />
                </a>
              )}
              {/* TikTok */}
              <a
                href="https://tiktok.com/@inmobiliaria_eo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/80 transition-colors"
                aria-label="TikTok">
                
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.8a8.18 8.18 0 004.77 1.53V6.86a4.83 4.83 0 01-1-.17z" />
                </svg>
              </a>
            </div>
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
              <li key={s}>
                  <span className="font-body text-sm text-secondary-foreground/60">{s}</span>
                </li>
              )}
            </ul>
          </AccordionSection>

          {/* Column 4 - Contact */}
          <AccordionSection title="Contáctanos">
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-primary flex-shrink-0" />
                <a href="tel:+573186531598" className="font-body text-sm text-secondary-foreground/60 hover:text-primary transition-colors">318 653 1598</a>
              </li>
              <li className="flex items-center gap-3">
                <WhatsAppIcon size={16} className="flex-shrink-0" style={{ filter: "brightness(0) saturate(100%) invert(73%) sepia(50%) saturate(500%) hue-rotate(8deg) brightness(95%) contrast(87%)" }} />
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
          </AccordionSection>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-primary/30">
          <p className="font-heading text-xs tracking-widest text-secondary-foreground/40 uppercase text-center">
            © {new Date().getFullYear()} Inmobiliaria Eliana Osorio. Todos los derechos reservados. | Desarrollado por Nikole Osorio en Cali, Colombia
          </p>
        </div>
      </div>
    </footer>);

};

export default Footer;