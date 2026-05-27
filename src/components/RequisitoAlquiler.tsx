import { useState } from "react";
import { FileText, AlertTriangle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

// Salario mínimo mensual legal vigente Colombia 2026
const SMLV = 1_423_500;

const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);

const RequisitoAlquiler = ({ canon }: { canon: number }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"empleado" | "independiente">("empleado");

  const ingresoMinimo = canon * 2;
  const tresSMLV = SMLV * 3;
  const requiereRenta = ingresoMinimo > tresSMLV;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 border border-primary/40 text-primary font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
      >
        <FileText size={15} /> Requisitos de arrendamiento
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Requisitos de arrendamiento</DialogTitle>
          </DialogHeader>

          {/* Capacidad económica */}
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-none space-y-1.5 text-sm font-body mt-2">
            <p className="font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">
              Capacidad económica requerida
            </p>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Canon mensual</span>
              <strong>{formatCOP(canon)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ingresos mínimos <span className="text-[10px]">(2× canon)</span></span>
              <strong className="text-primary">{formatCOP(ingresoMinimo)}</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">3 SMLV referencia 2026</span>
              <span>{formatCOP(tresSMLV)}</span>
            </div>
            {requiereRenta && (
              <div className="flex items-start gap-2 mt-2 pt-2 border-t border-primary/10 text-amber-700 dark:text-amber-400 text-xs">
                <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                <span>
                  Los ingresos requeridos superan 3 SMLV — se solicitará <strong>declaración de renta</strong> al arrendatario independiente.
                </span>
              </div>
            )}
          </div>

          {/* Tabs empleado / independiente */}
          <div className="flex border-b border-foreground/10">
            {(["empleado", "independiente"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 font-heading text-xs font-semibold tracking-widest uppercase transition-colors ${
                  tab === t
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "empleado" ? "Empleado" : "Independiente"}
              </button>
            ))}
          </div>

          {/* Empleado */}
          {tab === "empleado" && (
            <div className="space-y-3 pt-2 font-body text-sm">
              <p className="text-muted-foreground text-xs">Documentos requeridos del arrendatario:</p>
              <ul className="space-y-2.5">
                {[
                  "Carta laboral vigente (con salario, cargo y tipo de contrato)",
                  "Últimos 3 desprendibles de pago",
                  "Fotocopia de la cédula de ciudadanía",
                ].map((d) => (
                  <li key={d} className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5 shrink-0">✓</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground pt-1 border-t border-foreground/5">
                El salario demostrado debe ser mínimo{" "}
                <strong className="text-foreground">{formatCOP(ingresoMinimo)}/mes</strong>.
              </p>
            </div>
          )}

          {/* Independiente */}
          {tab === "independiente" && (
            <div className="space-y-3 pt-2 font-body text-sm">
              <p className="text-muted-foreground text-xs">Documentos requeridos del arrendatario:</p>
              <ul className="space-y-2.5">
                {[
                  "RUT actualizado",
                  "Fotocopia de la cédula de ciudadanía",
                  "Últimos 3 extractos bancarios",
                  ...(requiereRenta
                    ? ["Declaración de renta (ingresos superan 3 SMLV)"]
                    : []),
                ].map((d) => (
                  <li key={d} className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5 shrink-0">✓</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground pt-1 border-t border-foreground/5">
                Los ingresos promedio demostrados en extractos deben ser mínimo{" "}
                <strong className="text-foreground">{formatCOP(ingresoMinimo)}/mes</strong>.
              </p>
            </div>
          )}

          {/* Codeudor */}
          <div className="border border-foreground/10 p-4 space-y-2 font-body text-sm">
            <p className="font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              Codeudor (obligatorio)
            </p>
            <p className="text-muted-foreground">
              Debe presentar los mismos documentos según su tipo de vinculación (empleado o independiente).
              El codeudor debe cumplir los mismos requisitos de ingresos.
            </p>
          </div>

          {/* Restricciones */}
          <div className="bg-destructive/5 border border-destructive/20 p-4 space-y-2 font-body text-sm">
            <p className="font-heading text-[10px] font-semibold tracking-widest text-destructive uppercase mb-2">
              No aplica si:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-destructive font-bold shrink-0 mt-0.5">✗</span>
                <span>Presenta reportes negativos en centrales de riesgo (DataCrédito, TransUnion u otras).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive font-bold shrink-0 mt-0.5">✗</span>
                <span>Sus ingresos son pagados en efectivo (sin soporte bancario formal ni nómina verificable).</span>
              </li>
            </ul>
          </div>

          <p className="font-body text-xs text-muted-foreground text-center pb-1">
            ¿Tienes dudas? Comunícate al{" "}
            <a href="tel:3186531598" className="text-primary font-semibold hover:underline">
              318 653 1598
            </a>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RequisitoAlquiler;
