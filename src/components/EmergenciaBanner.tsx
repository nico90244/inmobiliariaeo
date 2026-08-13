import { HeartHandshake } from "lucide-react";

const EmergenciaBanner = () => {
  return (
    <section aria-label="Programa de apoyo terremoto Colombia" className="bg-secondary text-secondary-foreground border-b border-primary/20">
      <div className="container mx-auto px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-9 h-9 shrink-0 flex items-center justify-center border border-primary/30" aria-hidden="true">
            <HeartHandshake size={17} className="text-primary" />
          </div>
          <p className="font-body text-sm text-secondary-foreground/80">
            <strong className="font-heading font-semibold text-secondary-foreground">Afectados por el terremoto en Colombia:</strong>{" "}
            conectamos personas que buscan arriendo con inmuebles disponibles, gratis.
          </p>
        </div>
        <a
          href="/emergencia-terremoto"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 py-2.5 px-6 bg-primary text-primary-foreground font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary-hover transition-colors whitespace-nowrap"
        >
          Ver programa de apoyo
        </a>
      </div>
    </section>
  );
};

export default EmergenciaBanner;
