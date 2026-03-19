import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import logoGold from "@/assets/logo-gold.png";

const Header = ({ solid = false }: { solid?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [propDropdown, setPropDropdown] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navTextClass = "text-white/80 hover:text-primary";
  const navActiveClass = "text-primary";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#1A1A1A]`}
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-24">
          <Link to="/" className="flex-shrink-0">
            <img src={logo} alt="Inmobiliaria Eliana Osorio" className="h-16 w-auto brightness-0 invert" />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className={`font-heading text-base font-medium tracking-wide transition-colors duration-300 ${isActive("/") ? navActiveClass : navTextClass}`}>Inicio</Link>

            <div
              className="relative"
              onMouseEnter={() => setPropDropdown(true)}
              onMouseLeave={() => setPropDropdown(false)}
            >
              <button className={`flex items-center gap-1 font-heading text-base font-medium tracking-wide transition-colors duration-300 ${
                ["/propiedades", "/venta", "/alquiler"].includes(location.pathname)
                  ? navActiveClass
                  : navTextClass
              }`}>
                Propiedades <ChevronDown size={14} />
              </button>
              {propDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-[#1A1A1A] border border-white/10 shadow-lg min-w-[180px] z-50">
                  <Link to="/propiedades" onClick={() => setPropDropdown(false)} className="block px-5 py-3 font-heading text-sm text-white/70 hover:text-primary hover:bg-white/5 transition-colors">
                    Ver todas
                  </Link>
                  <Link to="/venta" onClick={() => setPropDropdown(false)} className="block px-5 py-3 font-heading text-sm text-white/70 hover:text-primary hover:bg-white/5 transition-colors">
                    En Venta
                  </Link>
                  <Link to="/alquiler" onClick={() => setPropDropdown(false)} className="block px-5 py-3 font-heading text-sm text-white/70 hover:text-primary hover:bg-white/5 transition-colors">
                    En Alquiler
                  </Link>
                </div>
              )}
            </div>

            <Link to="/servicios" className={`font-heading text-base font-medium tracking-wide transition-colors duration-300 ${isActive("/servicios") ? navActiveClass : navTextClass}`}>Servicios</Link>
            <Link to="/captacion" className={`font-heading text-base font-medium tracking-wide transition-colors duration-300 ${isActive("/captacion") ? navActiveClass : navTextClass}`}>Captar Inmueble</Link>
            <Link to="/contacto" className={`font-heading text-base font-medium tracking-wide transition-colors duration-300 ${isActive("/contacto") ? navActiveClass : navTextClass}`}>Contacto</Link>
          </nav>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white"
            aria-label="Menú"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-[#1A1A1A] border-t border-white/10">
          <nav className="container mx-auto px-6 py-6 flex flex-col gap-4">
            <Link to="/" onClick={() => setIsOpen(false)} className="font-heading text-sm font-medium tracking-wide text-white/70 hover:text-primary transition-colors py-2">
              Inicio
            </Link>
            <Link to="/propiedades" onClick={() => setIsOpen(false)} className="font-heading text-sm font-medium tracking-wide text-white/70 hover:text-primary transition-colors py-2">
              Todas las propiedades
            </Link>
            <Link to="/venta" onClick={() => setIsOpen(false)} className="font-heading text-sm font-medium tracking-wide text-white/70 hover:text-primary transition-colors py-2 pl-4">
              En Venta
            </Link>
            <Link to="/alquiler" onClick={() => setIsOpen(false)} className="font-heading text-sm font-medium tracking-wide text-white/70 hover:text-primary transition-colors py-2 pl-4">
              En Alquiler
            </Link>
            <Link to="/servicios" onClick={() => setIsOpen(false)} className="font-heading text-sm font-medium tracking-wide text-white/70 hover:text-primary transition-colors py-2">
              Servicios
            </Link>
            <Link to="/captacion" onClick={() => setIsOpen(false)} className="font-heading text-sm font-medium tracking-wide text-white/70 hover:text-primary transition-colors py-2">
              Captar Inmueble
            </Link>
            <Link to="/contacto" onClick={() => setIsOpen(false)} className="font-heading text-sm font-medium tracking-wide text-white/70 hover:text-primary transition-colors py-2">
              Contacto
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
