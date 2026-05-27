import { useState } from "react";
import { X, ChevronLeft, ChevronRight, MapPin, Building2, Zap, Ruler, BedDouble, ShowerHead, Building, Car, DollarSign, Phone } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Propiedad } from "@/hooks/usePropiedades";

interface PropertyModalProps {
  property: Propiedad | null;
  open: boolean;
  onClose: () => void;
}

const PropertyModal = ({ property, open, onClose }: PropertyModalProps) => {
  const [currentImage, setCurrentImage] = useState(0);

  if (!property) return null;

  const allImages = [
    property.foto_portada,
    ...(property.fotos || []),
  ].filter(Boolean) as string[];

  const prevImage = () => setCurrentImage((i) => (i === 0 ? allImages.length - 1 : i - 1));
  const nextImage = () => setCurrentImage((i) => (i === allImages.length - 1 ? 0 : i + 1));

  const whatsappLink = property.link_whatsapp || 
    `https://wa.me/573162225604?text=${encodeURIComponent(`Hola, me interesa ${property.nombre_inmueble} en ${property.barrio}`)}`;

  const formatPrice = (price: number | null) => {
    if (!price) return "Consultar";
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);
  };

  const characteristics = [
    { icon: MapPin, label: "Dirección", value: property.direccion },
    { icon: Building2, label: "Barrio", value: property.barrio },
    { icon: Zap, label: "Estrato", value: property.estrato },
    { icon: Ruler, label: "Área", value: property.area_m2 ? `${property.area_m2} m²` : null },
    { icon: BedDouble, label: "Habitaciones", value: property.habitaciones },
    { icon: ShowerHead, label: "Baños", value: property.banos },
    { icon: Building, label: "Piso", value: property.piso },
    { icon: Car, label: "Parqueadero", value: property.parqueadero },
    { icon: DollarSign, label: "Admón/mes", value: property.administracion ? formatPrice(property.administracion) : null },
  ].filter((c) => c.value != null && c.value !== "" && c.value !== 0);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Gallery */}
        {allImages.length > 0 && (
          <div className="relative">
            <img
              src={allImages[currentImage]}
              alt={property.nombre_inmueble}
              className="w-full h-72 md:h-96 object-cover"
            />
            {allImages.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-secondary/80 text-secondary-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-secondary/80 text-secondary-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-12 h-8 border-2 overflow-hidden transition-all ${
                      i === currentImage ? "border-primary" : "border-transparent opacity-70"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* Badges */}
          <div className="flex gap-2 mb-3">
            <span className="font-heading text-xs font-semibold tracking-widest uppercase px-3 py-1 bg-primary text-primary-foreground">
              {property.tipo_negocio}
            </span>
            <span className="font-heading text-xs font-semibold tracking-widest uppercase px-3 py-1 bg-muted text-foreground">
              {property.tipo_inmueble}
            </span>
          </div>

          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
            {property.nombre_inmueble}
          </h1>
          <p className="font-heading text-2xl font-bold text-primary mb-6">
            {formatPrice(property.precio)}
          </p>

          {/* Characteristics grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {characteristics.map((c) => (
              <div key={c.label} className="flex items-center gap-3 p-3 bg-muted/30">
                <c.icon size={18} className="text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-heading text-xs text-muted-foreground uppercase">{c.label}</p>
                  <p className="font-body text-sm font-medium text-foreground">{String(c.value)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          {property.descripcion && (
            <div className="mb-8">
              <h3 className="font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-2">Descripción</h3>
              <p className="font-body text-foreground/80 leading-relaxed">{property.descripcion}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[hsl(142,70%,45%)] text-white font-heading text-sm font-semibold tracking-widest uppercase hover:bg-[hsl(142,70%,40%)] transition-colors"
            >
              <WhatsAppIcon size={18} className="text-white" />
              Solicitar información por WhatsApp
            </a>
            <a
              href="tel:+573186531598"
              className="flex items-center justify-center gap-2 py-3 px-6 bg-secondary text-secondary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Phone size={18} />
              Llamar 318 653 1598
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyModal;
