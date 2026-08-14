import { HeartHandshake, ArrowRight } from "lucide-react";

const EmergenciaBanner = () => {
  return (
    <section
      aria-label="Iniciativa terremoto Colombia"
      className="sticky top-20 z-40 overflow-hidden bg-background/95 backdrop-blur-md border-b border-foreground/10 shadow-sm"
    >
      {/* Franja nítida con los colores de la bandera de Colombia */}
      <div className="flex h-1.5 w-full" aria-hidden="true">
        <div className="flex-[2] bg-[#FCD116]" />
        <div className="flex-1 bg-[#003893]" />
        <div className="flex-1 bg-[#CE1126]" />
      </div>

      {/* Resplandor difuminado en los mismos colores, fundido hacia blanco */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-28 -left-20 w-80 h-80 rounded-full bg-[#FCD116] opacity-[0.16] blur-[90px]" />
        <div className="absolute -top-16 left-1/3 w-72 h-72 rounded-full bg-[#003893] opacity-[0.10] blur-[90px]" />
        <div className="absolute -bottom-28 right-0 w-96 h-96 rounded-full bg-[#CE1126] opacity-[0.12] blur-[100px]" />
      </div>

      <div className="relative container mx-auto px-6 lg:px-12 py-4 md:py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-foreground/10 bg-background">
              <HeartHandshake size={19} className="text-primary" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
            </span>
          </div>
          <div>
            <p className="font-heading text-[11px] font-bold tracking-widest uppercase text-primary mb-1">
              Iniciativa · Terremoto Colombia
            </p>
            <p className="font-body text-sm text-foreground/80 max-w-md">
              Conectamos a personas que buscan arriendo con inmuebles disponibles — gratis, para propietarios y para quien busca.
            </p>
          </div>
        </div>
        <a
          href="/emergencia-terremoto"
          target="_blank"
          rel="noopener noreferrer"
          className="group shrink-0 inline-flex items-center gap-2 py-3 px-6 rounded-full bg-primary text-primary-foreground font-heading text-xs font-semibold tracking-widest uppercase shadow-md shadow-primary/20 transition-all duration-300 ease-out hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95 active:translate-y-0 whitespace-nowrap"
        >
          Ver iniciativa
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
};

export default EmergenciaBanner;
