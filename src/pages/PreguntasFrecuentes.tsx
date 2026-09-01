import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import SEO from "@/components/SEO";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FaqItem {
  question: string;
  answer?: string;
  intro?: string;
  bullets?: string[];
  outro?: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "¿Cobran algo por mostrarme un apartamento o hacer el estudio de arrendatario?",
    answer:
      "No, no cobramos nada por mostrarte el inmueble. Lo único que tiene costo es el estudio de arrendamiento, que se hace a través de una afianzadora — trabajamos con Fianzacrédito, Sura, Bolívar y El Libertador — y corresponde a un porcentaje del canon, entre el 5,95% y el 10%, según la entidad con la que se radique tu solicitud.",
  },
  {
    question: "¿Qué garantía tengo de que el precio de arriendo no fue inflado tras la emergencia?",
    answer:
      "El valor del canon suele ser impuesto por el propietario del inmueble; sin embargo, hacemos un estudio de mercado para analizar precios de referencia y sugerir un valor según las condiciones del inmueble y los detalles que le agregan valor. Y hay algo que la ley ya protege: según la Ley 820 de 2003, el aumento del canon de un contrato vigente solo puede hacerse una vez al año y como máximo según el IPC — nunca por encima, sin importar la coyuntura. Si tienes dudas sobre un precio específico, con gusto te mostramos cómo llegamos a ese valor.",
  },
  {
    question: "¿Qué requisitos necesito para arrendar un apartamento con Inmobiliaria EO?",
    answer:
      "En general pedimos cédula, soporte de ingresos y, casi siempre, un codeudor — aunque hay casos donde no se requiere. El arrendatario y/o el codeudor deben certificar ingresos equivalentes al doble del canon. Cuando el canon supera cierto valor, se exige que el codeudor tenga finca raíz; este umbral varía según la afianzadora con la que se radique la solicitud.",
  },
  {
    question: "¿Cómo protegen mi inmueble si decido arrendarlo con ustedes?",
    intro: "Nos encargamos de todo el proceso para que tú no tengas que preocuparte por nada:",
    bullets: [
      "Tomamos fotos y video profesional del inmueble",
      "Hacemos un estudio de mercado para fijar el precio correcto",
      "Revisamos las condiciones del inmueble",
      "Gestionamos las citas y visitas",
      "Elaboramos el contrato de arrendamiento y el inventario",
      "Realizamos el estudio de arrendamiento a través de más de 3 aliados",
      "Aseguramos el arrendamiento, garantizando el pago oportuno del canon aunque el arrendatario incurra en mora",
      "Te acompañamos jurídicamente, tanto en procesos de alquiler como de venta",
    ],
    outro:
      "También ofrecemos coberturas adicionales: fianza de servicios públicos (cubre consumos no pagados al momento de la entrega), fianza integral (protege frente a deterioros o faltantes en el inventario), y acompañamiento legal para procesos de restitución si hay incumplimiento grave del contrato.",
  },
  {
    question: "¿Puedo comprar una propiedad en Cali si vivo en el exterior y no tengo crédito colombiano?",
    answer:
      "Sí, es completamente posible. Varios bancos colombianos (Bancolombia, BBVA, Banco de Bogotá, Davivienda) tienen líneas de crédito hipotecario diseñadas específicamente para colombianos en el exterior, con financiación de hasta el 70-90% del valor según el banco, y sin exigir historial crediticio en Colombia — validan tu comportamiento financiero en el país donde vives. Todo el proceso puede hacerse virtualmente, sin viajar, y con un poder notarial autorizas a alguien de confianza a firmar los documentos físicos que se requieran acá. Las condiciones exactas (tasa, porcentaje, plazos) siempre las confirma directamente el banco según el perfil de cada persona.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cobran algo por mostrarme un apartamento o hacer el estudio de arrendatario?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, no cobramos nada por mostrarte el inmueble. Lo único que tiene costo es el estudio de arrendamiento, que se hace a través de una afianzadora (trabajamos con Fianzacrédito, Sura, Bolívar y El Libertador) y corresponde a un porcentaje del canon, entre el 5,95% y el 10%, según la entidad con la que se radique la solicitud.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué garantía tengo de que el precio de arriendo no fue inflado tras la emergencia?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El valor del canon suele ser impuesto por el propietario del inmueble; sin embargo, hacemos un estudio de mercado para analizar precios de referencia y sugerir un valor según las condiciones del inmueble. Además, según la Ley 820 de 2003, el aumento del canon de un contrato vigente solo puede hacerse una vez al año y como máximo según el IPC, nunca por encima.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué requisitos necesito para arrendar un apartamento con Inmobiliaria EO?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "En general se piden cédula, soporte de ingresos y, casi siempre, un codeudor que certifique ingresos equivalentes al doble del canon. Cuando el canon supera cierto valor, se exige que el codeudor cuente con finca raíz, según la política de cada afianzadora.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo protegen mi inmueble si decido arrendarlo con Inmobiliaria EO?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tomamos fotos y video profesional, hacemos estudio de mercado, revisamos las condiciones del inmueble, gestionamos citas y visitas, elaboramos el contrato de arrendamiento y el inventario, realizamos el estudio de arrendamiento a través de más de 3 aliados, y aseguramos el arrendamiento garantizando el pago oportuno del canon aunque el arrendatario incurra en mora. También ofrecemos acompañamiento jurídico en procesos de alquiler y venta, fianza de servicios públicos, fianza integral y acompañamiento legal en procesos de restitución.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo comprar una propiedad en Cali si vivo en el exterior y no tengo crédito colombiano?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, es completamente posible. Varios bancos colombianos (Bancolombia, BBVA, Banco de Bogotá, Davivienda) tienen líneas de crédito hipotecario diseñadas para colombianos en el exterior, con financiación de hasta el 70-90% del valor según el banco, y sin exigir historial crediticio en Colombia. Todo el proceso puede hacerse virtualmente, y con un poder notarial autorizas a alguien de confianza a firmar los documentos físicos que se requieran.",
      },
    },
  ],
};

const WHATSAPP_LINK = `https://wa.me/573186531598?text=${encodeURIComponent(
  "Hola, tengo una pregunta que no vi en el FAQ de la página web"
)}`;

const PreguntasFrecuentes = () => {
  return (
    <>
      <SEO
        title="Preguntas Frecuentes | Inmobiliaria Eliana Osorio | Cali, Colombia"
        description="Resolvemos tus dudas sobre arriendo, compra, requisitos, protección de tu inmueble y crédito hipotecario desde el exterior. Todo lo que necesitas saber antes de contactarnos."
        path="/preguntas-frecuentes"
        jsonLd={faqJsonLd}
      />
      <Header />
      <main className="pt-20">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-3xl">
              <div className="w-8 h-0.5 bg-primary mb-6" aria-hidden="true" />
              <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                Preguntas Frecuentes
              </h1>
              <p className="font-body text-lg text-muted-foreground mb-12 leading-relaxed">
                Resolvemos las dudas más comunes sobre arrendar, comprar o consignar tu propiedad con nosotros.
              </p>

              <Accordion type="single" collapsible className="w-full">
                {FAQ_ITEMS.map((item, i) => (
                  <AccordionItem key={item.question} value={`item-${i}`} className="border-b border-foreground/10">
                    <AccordionTrigger className="font-heading text-base md:text-lg font-semibold text-foreground text-left hover:text-primary hover:no-underline py-5">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="font-body text-muted-foreground leading-relaxed">
                      {item.answer && <p>{item.answer}</p>}
                      {item.intro && (
                        <>
                          <p className="mb-3">{item.intro}</p>
                          <ul className="space-y-2 mb-3">
                            {item.bullets!.map((b) => (
                              <li key={b} className="flex items-start gap-2.5">
                                <span className="w-1.5 h-1.5 bg-primary flex-shrink-0 mt-2" aria-hidden="true" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                          <p>{item.outro}</p>
                        </>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="mt-16 pt-10 border-t border-foreground/10 text-center">
                <p className="font-heading text-lg font-semibold text-foreground mb-4">
                  ¿Tienes otra pregunta? Escríbenos
                </p>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary-hover transition-colors"
                >
                  <WhatsAppIcon size={16} className="text-primary-foreground" />
                  Escribir por WhatsApp
                </a>
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

export default PreguntasFrecuentes;
