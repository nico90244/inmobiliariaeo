import { HeartHandshake, ArrowRight } from "lucide-react";

const EmergenciaBanner = () => {
  return (
    <section
      aria-label="Programa de apoyo terremoto Colombia"
      className="relative overflow-hidden bg-background border-y border-foreground/10"
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

      <div className="relative container mx-auto px-6 lg:px-12 py-7 md:py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-11 h-11 shrink-0 flex items-center justify-center border border-foreground/10 bg-background" aria-hidden="true">
            <HeartHandshake size={19} className="text-primary" />
          </div>
          <div>
            <p className="font-heading text-[11px] font-bold tracking-widest uppercase text-primary mb-1">
              Programa de apoyo · Terremoto Colombia
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
          className="group shrink-0 inline-flex items-center gap-2 py-3 px-6 bg-primary text-primary-foreground font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary-hover transition-colors whitespace-nowrap"
        >
          Ver programa de apoyo
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
};

export default EmergenciaBanner;
