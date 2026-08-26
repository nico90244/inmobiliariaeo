import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { trackSubmitForm } from "@/lib/pixelEvents";

const benefits = [
  "Promoción en portales inmobiliarios y difusión en redes sociales",
  "Asesoría jurídica incluida",
  "Elegimos el inquilino por ti",
  "Gestión de contratos",
  "Cobro y administración del canon",
  "Acompañamiento notarial",
  "Sin costos ocultos",
];

const propertyTypes = ["Casa", "Apartamento", "Apartaestudio", "Local", "Finca", "Lote", "Bodega", "Oficina"];

const Captacion = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    celular: "",
    correo: "",
    tipo_negocio: "",
    tipo_inmueble: "",
    barrio: "",
    valor_aproximado: "",
    observaciones: "",
    acepta_politica: false,
  });

  const update = (field: string, value: string | boolean) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.acepta_politica) {
      toast({ title: "Debes aceptar la política de datos", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("captaciones").insert({
      nombre: form.nombre.trim(),
      celular: form.celular.trim(),
      correo: form.correo.trim(),
      tipo_negocio: form.tipo_negocio,
      tipo_inmueble: form.tipo_inmueble,
      barrio: form.barrio.trim(),
      valor_aproximado: form.valor_aproximado.trim(),
      observaciones: form.observaciones.trim(),
    });

    setLoading(false);

    if (error) {
      toast({ title: "Error al enviar", description: "Intenta de nuevo más tarde.", variant: "destructive" });
      return;
    }

    toast({ title: "¡Enviado con éxito!", description: "Nos pondremos en contacto contigo pronto." });

    trackSubmitForm({
      content_type: "captacion",
      content_name: `${form.tipo_negocio} ${form.tipo_inmueble}`.trim(),
    });

    // Open WhatsApp with formatted message
    const waText = `Nueva captación: ${form.nombre} - ${form.celular} - ${form.tipo_negocio} ${form.tipo_inmueble} - ${form.barrio}`;
    window.open(`https://wa.me/573162225604?text=${encodeURIComponent(waText)}`, "_blank");

    setForm({ nombre: "", celular: "", correo: "", tipo_negocio: "", tipo_inmueble: "", barrio: "", valor_aproximado: "", observaciones: "", acepta_politica: false });
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Cómo vendo mi casa en Cali con Inmobiliaria Eliana Osorio?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Consigna tu inmueble con el formulario de esta página o por WhatsApp. Publicamos la propiedad en Metrocuadrado y Finca Raíz, gestionamos las visitas, la negociación y toda la documentación jurídica hasta la firma de escritura, sin costos ocultos.",
        },
      },
      {
        "@type": "Question",
        name: "¿Administran mi propiedad si la quiero arrendar?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. Nos encargamos de la administración completa del arriendo: selección del arrendatario, contrato, cobro del canon mensual y transferencia a tu cuenta, incluso si vives fuera de Cali o de Colombia.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cuánto cobran por consignar o administrar mi inmueble?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "La asesoría jurídica está incluida sin costo adicional. Cuéntanos los datos de tu propiedad en el formulario y te explicamos la comisión aplicable según si es venta o administración de arriendo.",
        },
      },
    ],
  };

  return (
    <>
      <SEO
        title="Vende o Arrienda tu Propiedad en Cali | Administramos tu Inmueble | Inmobiliaria EO"
        description="¿Quieres vender tu casa en Cali o necesitas quien administre el arriendo de tu apartamento? Publicamos tu inmueble en Metrocuadrado y Finca Raíz, gestionamos contratos y te damos asesoría jurídica gratuita. También para propietarios desde el exterior."
        path="/captacion"
        jsonLd={faqJsonLd}
      />
      <Header />
      <main className="pt-20">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Left - Benefits */}
              <div className="flex flex-col justify-start pt-0">
                <div className="w-8 h-0.5 bg-primary mb-6" aria-hidden="true" />
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  ¿Quieres vender o arrendar tu propiedad en Cali? Nosotros la administramos por ti
                </h1>
                <p className="font-body text-lg text-muted-foreground mb-8 leading-relaxed">
                  Consigna tu inmueble con nosotros: nos encargamos de la venta o de la administración completa del arriendo, con asesoría jurídica y gestión sin costos ocultos.
                </p>
                <ul className="space-y-4">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check size={14} className="text-primary" />
                      </div>
                      <span className="font-body text-foreground">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right - Form */}
              <div className="bg-muted/20 border border-foreground/10 p-8">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6">Datos del inmueble</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="cap-nombre" className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Nombre completo</label>
                    <input id="cap-nombre" type="text" required value={form.nombre} onChange={(e) => update("nombre", e.target.value)} maxLength={100} className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cap-celular" className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Celular</label>
                      <input id="cap-celular" type="tel" required value={form.celular} onChange={(e) => update("celular", e.target.value)} maxLength={15} className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label htmlFor="cap-correo" className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Correo</label>
                      <input id="cap-correo" type="email" value={form.correo} onChange={(e) => update("correo", e.target.value)} maxLength={255} className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cap-negocio" className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Tipo negocio</label>
                      <select id="cap-negocio" required value={form.tipo_negocio} onChange={(e) => update("tipo_negocio", e.target.value)} className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none">
                        <option value="">Seleccionar</option>
                        <option value="Venta">Venta</option>
                        <option value="Alquiler">Alquiler</option>
                        <option value="Ambos">Ambos</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="cap-tipo" className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Tipo inmueble</label>
                      <select id="cap-tipo" required value={form.tipo_inmueble} onChange={(e) => update("tipo_inmueble", e.target.value)} className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none">
                        <option value="">Seleccionar</option>
                        {propertyTypes.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cap-barrio" className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Barrio / Sector</label>
                      <input id="cap-barrio" type="text" required value={form.barrio} onChange={(e) => update("barrio", e.target.value)} maxLength={100} className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label htmlFor="cap-valor" className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Valor aproximado</label>
                      <input
                        id="cap-valor"
                        type="text"
                        inputMode="numeric"
                        value={form.valor_aproximado}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          // Permite solo dígitos, puntos y comas
                          const raw = e.target.value.replace(/[^0-9.,]/g, "");
                          update("valor_aproximado", raw);
                        }}
                        onBlur={(e) => {
                          // Formatea con separadores de miles al salir
                          const num = parseFloat(e.target.value.replace(/\./g, "").replace(",", "."));
                          if (!isNaN(num) && num > 0) {
                            update("valor_aproximado", new Intl.NumberFormat("es-CO").format(num));
                          }
                        }}
                        maxLength={20}
                        placeholder="Ej: 1.200.000"
                        className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cap-obs" className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Observaciones</label>
                    <textarea id="cap-obs" value={form.observaciones} onChange={(e) => update("observaciones", e.target.value)} rows={3} maxLength={1000} className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none resize-none" />
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.acepta_politica} onChange={(e) => update("acepta_politica", e.target.checked)} className="mt-1 accent-[hsl(40,47%,50%)]" />
                    <span className="font-body text-xs text-muted-foreground">
                      Acepto la{" "}
                      <Link to="/politica-privacidad" target="_blank" className="text-primary hover:underline">
                        política de tratamiento de datos personales
                      </Link>
                    </span>
                  </label>
                  <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? "Enviando..." : "Enviar"}
                  </button>
                </form>
              </div>
            </div>

            {/* FAQ — visible además de su JSON-LD, para usuarios y para IA generativa */}
            <div className="max-w-3xl mt-16 pt-10 border-t border-foreground/10">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-6">Preguntas frecuentes</h2>
              <div className="space-y-6">
                {faqJsonLd.mainEntity.map((f) => (
                  <div key={f.name}>
                    <h3 className="font-heading text-sm font-semibold text-foreground mb-1">{f.name}</h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{f.acceptedAnswer.text}</p>
                  </div>
                ))}
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

export default Captacion;
