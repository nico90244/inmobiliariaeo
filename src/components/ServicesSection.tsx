import type { CSSProperties } from "react";
import { Building2, Key, Scale, FileCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Service = {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
};

const services: Service[] = [
  {
    number: "01",
    icon: Building2,
    title: "Venta de inmuebles",
    description:
      "Diseñamos una estrategia de venta a la medida de tu propiedad: desde la valoración inicial hasta el cierre notarial, con presencia activa en los principales portales del país.",
    bullets: [
      "Valoración comercial con análisis de mercado",
      "Fotografía profesional y recorrido virtual",
      "Publicación en Metrocuadrado y Finca Raíz",
      "Acompañamiento en negociación y cierre",
    ],
  },
  {
    number: "02",
    icon: Key,
    title: "Alquiler y administración",
    description:
      "Encontramos al arrendatario ideal mediante un riguroso proceso de selección, y administramos tu propiedad de principio a fin para que tú no te preocupes por nada.",
    bullets: [
      "Estudio socioeconómico y de referencias del arrendatario",
      "Cobro mensual y transferencia al propietario",
      "Atención de novedades y mantenimientos",
      "Gestión de renovaciones y ajustes de canon",
    ],
  },
  {
    number: "03",
    icon: Scale,
    title: "Asesoría jurídica",
    description:
      "Cada operación inmobiliaria conlleva riesgos legales. Nuestra asesoría jurídica incluida garantiza que tu inversión esté protegida desde el primer hasta el último documento.",
    bullets: [
      "Estudio de títulos y tradición y libertad",
      "Revisión y elaboración de promesas de compraventa",
      "Redacción de contratos de arrendamiento",
      "Acompañamiento ante notarías y curadurías",
    ],
  },
  {
    number: "04",
    icon: FileCheck,
    title: "Acompañamiento notarial",
    description:
      "El proceso notarial y de registro puede ser complejo. Te guiamos en cada paso para asegurar que la transferencia de propiedad quede correctamente formalizada.",
    bullets: [
      "Coordinación con notarías en Cali",
      "Seguimiento al proceso de escrituración",
      "Registro en la Oficina de Instrumentos Públicos",
      "Revisión final de documentos y certificados",
    ],
  },
];

const sd = (delay: string): CSSProperties => ({ "--sd": delay } as CSSProperties);
const bd = (delay: string): CSSProperties => ({ "--bd": delay } as CSSProperties);

const ServicesSection = () => {
  const [feat, ...secondary] = services;

  return (
    <section id="servicios" className="py-16 md:py-32">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="section-divider mb-10 md:mb-20" />

        {/* Header */}
        <div className="reveal flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-16">
          <div>
            <p className="font-heading text-[10px] font-semibold tracking-[0.18em] text-primary uppercase mb-4">
              Lo que hacemos
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-[.95]">
              Servicios
            </h2>
          </div>
          <p className="font-body text-[13px] text-muted-foreground max-w-[260px] md:text-right leading-relaxed">
            Acompañamiento integral en cada etapa de tu operación inmobiliaria,
            con respaldo jurídico en todo momento.
          </p>
        </div>

        {/* ── 01 FEATURED (dark block) ────────────────────────── */}
        <article className="reveal">
          <div className="relative bg-secondary overflow-hidden px-8 md:px-14 py-12 md:py-[72px]">

            {/* Animated gold left strip — paints downward */}
            <div className="svc-strip absolute left-0 top-0 bottom-0 w-[3px] bg-primary" />

            {/* Watermark "01" — bleeds out top-right edge */}
            <span
              className="absolute font-display font-bold leading-none text-secondary-foreground/[0.04] select-none pointer-events-none"
              style={{ top: "-28px", right: "-8px", fontSize: "clamp(160px,24vw,280px)" } as CSSProperties}
              aria-hidden="true"
            >
              01
            </span>

            {/* Building2 as large icon watermark bottom-right */}
            <div
              className="absolute bottom-5 right-9 text-secondary-foreground/[0.05] pointer-events-none"
              aria-hidden="true"
            >
              <feat.icon size={200} strokeWidth={0.5} />
            </div>

            {/* Meta row: faint badge numeral + eyebrow label */}
            <div className="relative z-10 flex items-center gap-5 mb-10">
              <span
                className="svc-fade font-display font-bold leading-none text-secondary-foreground/[0.18]"
                style={{ fontSize: "52px", ...sd("0.2s") }}
              >
                01
              </span>
              <span
                className="svc-fade font-heading text-[10px] font-semibold tracking-[0.18em] uppercase text-primary"
                style={sd("0.28s")}
              >
                Servicio principal
              </span>
            </div>

            {/* Two-col body: title left / desc+bullets right */}
            <div className="relative z-10 grid md:grid-cols-2 gap-10 md:gap-14 items-end">
              <div>
                <h3
                  className="svc-fade font-display font-bold leading-[1.15] text-secondary-foreground mb-6"
                  style={{ fontSize: "clamp(30px,4.5vw,52px)", ...sd("0.32s") }}
                >
                  {feat.title}
                </h3>
                {/* Gold rule — animated width expand */}
                <div
                  className="svc-rule h-0.5 bg-primary"
                  style={{ "--svc-rule-delay": "0.65s" } as CSSProperties}
                />
              </div>
              <div>
                <p
                  className="svc-fade font-body text-[13px] leading-[1.75] text-secondary-foreground/55 mb-6"
                  style={sd("0.45s")}
                >
                  {feat.description}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {feat.bullets.map((b, i) => (
                    <li
                      key={b}
                      className="svc-bullet flex items-start gap-2.5"
                      style={bd(`${0.55 + i * 0.08}s`)}
                    >
                      <span className="w-[5px] h-[5px] bg-primary flex-shrink-0 mt-[7px]" />
                      <span className="font-body text-[12.5px] leading-[1.55] text-secondary-foreground/45">
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </article>

        {/* ── 02–04 SECONDARY ROWS (alternating numeral side) ─── */}
        {secondary.map((svc, idx) => {
          const reversed = idx === 1; // service 03 flips numeral to left
          return (
            <article
              key={svc.number}
              className="reveal border-t border-foreground/10 last:border-b"
            >
              <div
                className={[
                  "grid gap-8 md:gap-12 py-12 md:py-14 items-start",
                  reversed ? "md:grid-cols-[140px_1fr]" : "md:grid-cols-[1fr_160px]",
                ].join(" ")}
              >
                {/* Content */}
                <div className={reversed ? "md:order-2" : ""}>
                  {/* Icon + separator line */}
                  <div className="flex items-center gap-3 mb-3.5">
                    <svc.icon
                      size={20}
                      strokeWidth={1.5}
                      className="svc-icon text-primary/65 flex-shrink-0"
                    />
                    <div className="h-px w-6 bg-foreground/10" />
                  </div>

                  <h3
                    className="svc-fade font-display font-bold leading-[1.2] text-foreground mb-3"
                    style={{ fontSize: "clamp(20px,3vw,30px)", ...sd("0.12s") }}
                  >
                    {svc.title}
                  </h3>

                  {/* Gold rule — animated width expand */}
                  <div className="svc-rule h-0.5 bg-primary" />

                  <p
                    className="svc-fade font-body text-[13px] leading-[1.72] text-muted-foreground mt-4 mb-5"
                    style={sd("0.28s")}
                  >
                    {svc.description}
                  </p>

                  <ul className="grid sm:grid-cols-2 gap-y-2 gap-x-8">
                    {svc.bullets.map((b, i) => (
                      <li
                        key={b}
                        className="svc-bullet flex items-start gap-2.5"
                        style={bd(`${0.38 + i * 0.07}s`)}
                      >
                        <span className="w-[5px] h-[5px] bg-primary flex-shrink-0 mt-[6px]" />
                        <span className="font-body text-[13px] leading-[1.5] text-foreground/60">
                          {b}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Large muted numeral — scale-fades in */}
                <div
                  className={[
                    "svc-num flex pt-1",
                    reversed ? "md:order-1 justify-start" : "justify-end",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <span
                    className="font-display font-bold leading-none text-foreground/[0.045]"
                    style={{ fontSize: "clamp(80px,12vw,130px)" } as CSSProperties}
                  >
                    {svc.number}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ServicesSection;
