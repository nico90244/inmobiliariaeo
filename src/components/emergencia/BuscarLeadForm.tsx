import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase, type TablesInsert } from "@/lib/supabase";
import { getSwipeSessionId } from "@/lib/emergenciaSession";
import AvisoDatosCheckbox from "@/components/terremoto/AvisoDatosCheckbox";
import { AVISO_TRATAMIENTO_DATOS_BUSQUEDA } from "@/lib/terremoto/textosLegales";
import { useToast } from "@/hooks/use-toast";

const CIUDADES = ["Cali", "Jamundí", "Yumbo", "Palmira", "Otra"];
const TIPOS_INMUEBLE = ["Apartamento", "Casa", "Apartaestudio", "Local", "Habitación", "Oficina", "Bodega"];

const inputClass = "w-full bg-background border border-foreground/10 rounded-lg py-2.5 px-3 font-body text-sm text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";
const labelClass = "font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1";

const CELULAR_CO_REGEX = /^3\d{9}$/;

export type BuscarLeadData = {
  buscadorId: string;
  nombre: string;
  ciudad: string;
  tipoInmueble: string;
  presupuesto: number | null;
};

const BuscarLeadForm = ({ onSubmit }: { onSubmit: (data: BuscarLeadData) => void }) => {
  const { toast } = useToast();
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [ciudad, setCiudad] = useState("Cali");
  const [ciudadOtra, setCiudadOtra] = useState("");
  const [tipoInmueble, setTipoInmueble] = useState("");
  const [presupuestoDisplay, setPresupuestoDisplay] = useState("");
  const [presupuesto, setPresupuesto] = useState<number | null>(null);
  const [aceptaPolitica, setAceptaPolitica] = useState(false);
  const [celularError, setCelularError] = useState("");
  const [saving, setSaving] = useState(false);

  const celularLimpio = celular.replace(/\D/g, "");
  const celularValido = CELULAR_CO_REGEX.test(celularLimpio);

  const handlePresupuestoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (!digits) {
      setPresupuestoDisplay("");
      setPresupuesto(null);
      return;
    }
    const num = parseInt(digits, 10);
    setPresupuesto(num);
    setPresupuestoDisplay(`$ ${new Intl.NumberFormat("es-CO").format(num)}`);
  };

  const ciudadFinal = ciudad === "Otra" ? ciudadOtra.trim() : ciudad;

  const formValido =
    nombre.trim().length > 0 &&
    celularValido &&
    (ciudad !== "Otra" || ciudadOtra.trim().length > 0) &&
    aceptaPolitica;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!celularValido) {
      setCelularError("Ingresa un celular colombiano válido (10 dígitos, empieza en 3). Ej: 3001234567");
      return;
    }
    if (!formValido) return;

    setSaving(true);
    const buscadorId = crypto.randomUUID();

    const { error } = await supabase.from("emergencia_buscadores").insert({
      id: buscadorId,
      nombre: nombre.trim(),
      celular: celularLimpio,
      presupuesto,
      ciudad: ciudadFinal || "Cali",
      tipo_inmueble: tipoInmueble || null,
      acepta_politica: true,
      origen: "swipe",
    } satisfies TablesInsert<"emergencia_buscadores">);

    setSaving(false);

    if (error) {
      toast({ title: "No se pudo guardar", description: "Intenta de nuevo en unos segundos.", variant: "destructive" });
      return;
    }

    getSwipeSessionId(); // asegura que exista un session_id antes de swipear

    onSubmit({ buscadorId, nombre: nombre.trim(), ciudad: ciudadFinal, tipoInmueble, presupuesto });
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass} htmlFor="busco-nombre">Nombre completo</label>
          <input
            id="busco-nombre"
            required
            maxLength={100}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="busco-celular">Celular</label>
          <input
            id="busco-celular"
            type="tel"
            required
            maxLength={15}
            value={celular}
            onChange={(e) => { setCelular(e.target.value); setCelularError(""); }}
            onBlur={() => { if (celular && !celularValido) setCelularError("Ingresa un celular colombiano válido (10 dígitos, empieza en 3). Ej: 3001234567"); }}
            placeholder="Ej: 300 123 4567"
            className={inputClass}
          />
          {celularError && <p className="font-body text-[11px] text-destructive mt-1">{celularError}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="busco-ciudad">Ciudad</label>
            <select id="busco-ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} className={inputClass}>
              {CIUDADES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="busco-presupuesto">Presupuesto mensual</label>
            <input
              id="busco-presupuesto"
              type="text"
              inputMode="numeric"
              value={presupuestoDisplay}
              onChange={handlePresupuestoChange}
              placeholder="$ 1.200.000"
              className={inputClass}
            />
          </div>
        </div>

        {ciudad === "Otra" && (
          <div className="animate-fade-in-up">
            <label className={labelClass} htmlFor="busco-ciudad-otra">¿Cuál ciudad?</label>
            <input
              id="busco-ciudad-otra"
              required
              value={ciudadOtra}
              onChange={(e) => setCiudadOtra(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        <div>
          <span className={labelClass}>¿Qué tipo de inmueble buscas?</span>
          <div className="grid grid-cols-3 gap-2">
            {TIPOS_INMUEBLE.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTipoInmueble(tipoInmueble === t ? "" : t)}
                className={`py-2.5 px-2 rounded-lg border font-body text-xs transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  tipoInmueble === t ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-foreground/10 text-foreground hover:border-primary/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="font-body text-[11px] text-muted-foreground mt-2">
            {tipoInmueble ? "Toca de nuevo para quitar el filtro." : "Opcional — deja sin marcar para ver cualquier tipo."}
          </p>
        </div>

        <AvisoDatosCheckbox
          id="busco-aviso-datos"
          texto={AVISO_TRATAMIENTO_DATOS_BUSQUEDA}
          checked={aceptaPolitica}
          onChange={setAceptaPolitica}
        />

        <button
          type="submit"
          disabled={!formValido || saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase shadow-md shadow-primary/20 transition-all duration-300 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? "Guardando..." : "Empezar a buscar"}
        </button>
      </form>
    </div>
  );
};

export default BuscarLeadForm;
