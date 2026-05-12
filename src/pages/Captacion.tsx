import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const benefits = [
  "Publicidad en Metrocuadrado y Finca Raíz",
  "Asesoría jurídica incluida",
  "Gestión completa de contratos",
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

    /*
    Ejecutar en Supabase SQL Editor:
    CREATE TABLE captaciones (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      nombre TEXT, celular TEXT, correo TEXT,
      tipo_negocio TEXT, tipo_inmueble TEXT,
      barrio TEXT, valor_aproximado TEXT,
      observaciones TEXT, estado TEXT
      DEFAULT 'Pendiente',
      fecha_creacion TIMESTAMP DEFAULT NOW()
    );
    ALTER TABLE captaciones ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Insert público" ON captaciones
      FOR INSERT WITH CHECK (true);
    CREATE POLICY "Solo admin lee" ON captaciones
      FOR SELECT USING (auth.role() = 'authenticated');
    */
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

    // Open WhatsApp with formatted message
    const waText = `Nueva captación: ${form.nombre} - ${form.celular} - ${form.tipo_negocio} ${form.tipo_inmueble} - ${form.barrio}`;
    window.open(`https://wa.me/573162225604?text=${encodeURIComponent(waText)}`, "_blank");

    setForm({ nombre: "", celular: "", correo: "", tipo_negocio: "", tipo_inmueble: "", barrio: "", valor_aproximado: "", observaciones: "", acepta_politica: false });
  };

  return (
    <>
      <Header />
      <main className="pt-20">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Left - Benefits */}
              <div className="flex flex-col justify-start pt-0">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Consigna tu inmueble con nosotros
                </h1>
                <p className="font-body text-lg text-muted-foreground mb-8">
                  Te ayudamos a vender o arrendar tu propiedad con asesoría jurídica y gestión completa sin costos ocultos
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
                    <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Nombre completo</label>
                    <input type="text" required value={form.nombre} onChange={(e) => update("nombre", e.target.value)} maxLength={100} className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Celular</label>
                      <input type="tel" required value={form.celular} onChange={(e) => update("celular", e.target.value)} maxLength={15} className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Correo</label>
                      <input type="email" value={form.correo} onChange={(e) => update("correo", e.target.value)} maxLength={255} className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Tipo negocio</label>
                      <select required value={form.tipo_negocio} onChange={(e) => update("tipo_negocio", e.target.value)} className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none">
                        <option value="">Seleccionar</option>
                        <option value="Venta">Venta</option>
                        <option value="Alquiler">Alquiler</option>
                        <option value="Ambos">Ambos</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Tipo inmueble</label>
                      <select required value={form.tipo_inmueble} onChange={(e) => update("tipo_inmueble", e.target.value)} className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none">
                        <option value="">Seleccionar</option>
                        {propertyTypes.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Barrio / Sector</label>
                      <input type="text" required value={form.barrio} onChange={(e) => update("barrio", e.target.value)} maxLength={100} className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Valor aproximado</label>
                      <input type="text" value={form.valor_aproximado} onChange={(e) => update("valor_aproximado", e.target.value)} maxLength={50} placeholder="$ 0" className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Observaciones</label>
                    <textarea value={form.observaciones} onChange={(e) => update("observaciones", e.target.value)} rows={3} maxLength={1000} className="w-full bg-background border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none resize-none" />
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.acepta_politica} onChange={(e) => update("acepta_politica", e.target.checked)} className="mt-1 accent-[hsl(40,47%,50%)]" />
                    <span className="font-body text-xs text-muted-foreground">Acepto la política de tratamiento de datos personales</span>
                  </label>
                  <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? "Enviando..." : "Enviar"}
                  </button>
                </form>
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
