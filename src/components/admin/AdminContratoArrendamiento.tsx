import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, FileText, Building2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type Propiedad = {
  id: string;
  nombre_inmueble: string;
  precio: number | null;
  direccion?: string | null;
  barrio?: string | null;
};

type Contrato = {
  id?: string;
  propiedad_id: string;
  inquilino_nombre: string;
  inquilino_cedula: string;
  inquilino_celular: string;
  inquilino_correo: string;
  docs_inquilino: string[];
  docs_codeudor: string[];
  valor_canon: number | string;
  dia_pago_inquilino: number | string;
  fecha_inicio: string;
  propietario_nombre: string;
  propietario_cedula: string;
  propietario_banco: string;
  propietario_tipo_cuenta: string;
  propietario_num_cuenta: string;
  valor_pago_propietario: number | string;
  dia_pago_propietario: number | string;
  notas: string;
};

const emptyContrato = (propiedadId: string, canon: number): Contrato => ({
  propiedad_id: propiedadId,
  inquilino_nombre: "",
  inquilino_cedula: "",
  inquilino_celular: "",
  inquilino_correo: "",
  docs_inquilino: [],
  docs_codeudor: [],
  valor_canon: canon,
  dia_pago_inquilino: 5,
  fecha_inicio: new Date().toISOString().split("T")[0],
  propietario_nombre: "",
  propietario_cedula: "",
  propietario_banco: "",
  propietario_tipo_cuenta: "Ahorros",
  propietario_num_cuenta: "",
  valor_pago_propietario: Math.round(canon * 0.9),
  dia_pago_propietario: 10,
  notas: "",
});

const formatCOP = (n: number | string) => {
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(num);
};

const inputCls = "w-full border border-foreground/10 py-2 px-3 font-body text-sm focus:border-primary focus:outline-none bg-background";
const labelCls = "font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase block mb-1";

interface Props {
  open: boolean;
  onClose: () => void;
  propiedad: Propiedad;
  existingId?: string | null;
}

const AdminContratoArrendamiento = ({ open, onClose, propiedad, existingId }: Props) => {
  const { toast } = useToast();
  const canon = propiedad.precio ?? 0;
  const [form, setForm] = useState<Contrato>(emptyContrato(propiedad.id, canon));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"inquilino" | "codeudor" | null>(null);

  // Load existing contract if editing
  useEffect(() => {
    if (!open) return;
    if (existingId) {
      (supabase as any).from("contratos_arrendamiento").select("*").eq("id", existingId).single().then(({ data }: any) => {
        if (data) setForm({ ...emptyContrato(propiedad.id, canon), ...data });
      });
    } else {
      setForm(emptyContrato(propiedad.id, canon));
    }
  }, [open, existingId, propiedad.id, canon]);

  const set = (field: keyof Contrato, value: any) => setForm((f) => ({ ...f, [field]: value }));

  // Auto-recalculate owner payment when canon changes
  const setCanon = (val: string) => {
    const num = parseFloat(val);
    setForm((f) => ({
      ...f,
      valor_canon: val,
      valor_pago_propietario: isNaN(num) ? "" : Math.round(num * 0.9),
    }));
  };

  const uploadDocs = async (files: FileList, tipo: "inquilino" | "codeudor") => {
    setUploading(tipo);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const path = `${propiedad.id}/${tipo}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("contratos-docs").upload(path, file, { upsert: true });
      if (error) {
        toast({ title: `Error subiendo ${file.name}`, variant: "destructive" });
        continue;
      }
      // Store the storage path; we'll generate signed URLs on demand
      urls.push(path);
    }
    if (tipo === "inquilino") {
      set("docs_inquilino", [...form.docs_inquilino, ...urls]);
    } else {
      set("docs_codeudor", [...form.docs_codeudor, ...urls]);
    }
    setUploading(null);
  };

  const removeDoc = (tipo: "inquilino" | "codeudor", idx: number) => {
    if (tipo === "inquilino") {
      set("docs_inquilino", form.docs_inquilino.filter((_, i) => i !== idx));
    } else {
      set("docs_codeudor", form.docs_codeudor.filter((_, i) => i !== idx));
    }
  };

  const handleSave = async () => {
    if (!form.inquilino_nombre || !form.inquilino_cedula || !form.inquilino_celular) {
      toast({ title: "Nombre, cédula y celular del inquilino son obligatorios", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const record = {
        propiedad_id: form.propiedad_id,
        inquilino_nombre: form.inquilino_nombre.trim(),
        inquilino_cedula: form.inquilino_cedula.trim(),
        inquilino_celular: form.inquilino_celular.trim(),
        inquilino_correo: form.inquilino_correo.trim(),
        docs_inquilino: form.docs_inquilino,
        docs_codeudor: form.docs_codeudor,
        valor_canon: Number(form.valor_canon) || null,
        dia_pago_inquilino: Number(form.dia_pago_inquilino) || null,
        fecha_inicio: form.fecha_inicio || null,
        propietario_nombre: form.propietario_nombre.trim(),
        propietario_cedula: form.propietario_cedula.trim(),
        propietario_banco: form.propietario_banco.trim(),
        propietario_tipo_cuenta: form.propietario_tipo_cuenta,
        propietario_num_cuenta: form.propietario_num_cuenta.trim(),
        valor_pago_propietario: Number(form.valor_pago_propietario) || null,
        dia_pago_propietario: Number(form.dia_pago_propietario) || null,
        notas: form.notas.trim(),
      };

      if (existingId) {
        const { error } = await (supabase as any).from("contratos_arrendamiento").update(record).eq("id", existingId);
        if (error) throw error;
        toast({ title: "Contrato actualizado" });
      } else {
        const { error } = await (supabase as any).from("contratos_arrendamiento").insert(record);
        if (error) throw error;
        toast({ title: "Contrato guardado exitosamente" });
      }
      onClose();
    } catch (err: any) {
      toast({ title: "Error al guardar contrato", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const DocList = ({ docs, tipo }: { docs: string[]; tipo: "inquilino" | "codeudor" }) => (
    <ul className="space-y-1 mt-2">
      {docs.map((url, i) => {
        const name = url.split("/").pop()?.replace(/^\d+-/, "") ?? "documento";
        return (
          <li key={i} className="flex items-center gap-2 text-xs font-body text-muted-foreground">
            <FileText size={12} className="text-primary shrink-0" />
            <span className="truncate flex-1">{name}</span>
            <button onClick={() => removeDoc(tipo, i)} className="text-destructive hover:text-destructive/70">
              <X size={12} />
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Contrato de arrendamiento
          </DialogTitle>
          <p className="font-body text-sm text-muted-foreground">
            {propiedad.nombre_inmueble} · Canon: <strong>{formatCOP(canon)}</strong>
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-2">

          {/* ── Inquilino ── */}
          <section>
            <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2 mb-4 pb-2 border-b border-foreground/10">
              <FileText size={15} className="text-primary" /> Datos del inquilino
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nombre completo *</label>
                <input type="text" value={form.inquilino_nombre} onChange={(e) => set("inquilino_nombre", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Cédula *</label>
                <input type="text" value={form.inquilino_cedula} onFocus={(e) => e.target.select()} onChange={(e) => set("inquilino_cedula", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Celular *</label>
                <input type="tel" value={form.inquilino_celular} onChange={(e) => set("inquilino_celular", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Correo</label>
                <input type="email" value={form.inquilino_correo} onChange={(e) => set("inquilino_correo", e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Documentos inquilino */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className={labelCls}>Documentos del inquilino</label>
                <label className="flex items-center gap-2 px-3 py-2 border border-foreground/10 cursor-pointer hover:bg-muted/30 transition-colors font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground w-fit mt-1">
                  {uploading === "inquilino" ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {uploading === "inquilino" ? "Subiendo…" : "Cargar documentos"}
                  <input
                    type="file" multiple accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => e.target.files && uploadDocs(e.target.files, "inquilino")}
                  />
                </label>
                <DocList docs={form.docs_inquilino} tipo="inquilino" />
              </div>
              <div>
                <label className={labelCls}>Documentos del codeudor</label>
                <label className="flex items-center gap-2 px-3 py-2 border border-foreground/10 cursor-pointer hover:bg-muted/30 transition-colors font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground w-fit mt-1">
                  {uploading === "codeudor" ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {uploading === "codeudor" ? "Subiendo…" : "Cargar documentos"}
                  <input
                    type="file" multiple accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => e.target.files && uploadDocs(e.target.files, "codeudor")}
                  />
                </label>
                <DocList docs={form.docs_codeudor} tipo="codeudor" />
              </div>
            </div>
          </section>

          {/* ── Condiciones del contrato ── */}
          <section>
            <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2 mb-4 pb-2 border-b border-foreground/10">
              <FileText size={15} className="text-primary" /> Condiciones del contrato
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Valor del canon</label>
                <input
                  type="number" value={form.valor_canon}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setCanon(e.target.value)}
                  className={inputCls}
                />
                <p className="font-body text-xs text-muted-foreground mt-1">{formatCOP(form.valor_canon as number)}</p>
              </div>
              <div>
                <label className={labelCls}>Día de pago (inquilino)</label>
                <input
                  type="number" min={1} max={31}
                  value={form.dia_pago_inquilino}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => set("dia_pago_inquilino", e.target.value)}
                  className={inputCls}
                />
                <p className="font-body text-xs text-muted-foreground mt-1">Día del mes en que paga</p>
              </div>
              <div>
                <label className={labelCls}>Fecha inicio contrato</label>
                <input type="date" value={form.fecha_inicio} onChange={(e) => set("fecha_inicio", e.target.value)} className={inputCls} />
              </div>
            </div>
          </section>

          {/* ── Propietario ── */}
          <section>
            <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2 mb-4 pb-2 border-b border-foreground/10">
              <Building2 size={15} className="text-primary" /> Datos del propietario
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nombre completo</label>
                <input type="text" value={form.propietario_nombre} onChange={(e) => set("propietario_nombre", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Cédula</label>
                <input type="text" value={form.propietario_cedula} onFocus={(e) => e.target.select()} onChange={(e) => set("propietario_cedula", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Banco</label>
                <input type="text" value={form.propietario_banco} onChange={(e) => set("propietario_banco", e.target.value)} placeholder="Ej: Bancolombia" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Tipo de cuenta</label>
                <select value={form.propietario_tipo_cuenta} onChange={(e) => set("propietario_tipo_cuenta", e.target.value)} className={inputCls}>
                  <option value="Ahorros">Ahorros</option>
                  <option value="Corriente">Corriente</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Número de cuenta</label>
                <input type="text" value={form.propietario_num_cuenta} onFocus={(e) => e.target.select()} onChange={(e) => set("propietario_num_cuenta", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Día de pago (propietario)</label>
                <input
                  type="number" min={1} max={31}
                  value={form.dia_pago_propietario}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => set("dia_pago_propietario", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Valor propietario */}
            <div className="mt-4 bg-primary/5 border border-primary/20 p-4">
              <div className="flex items-end justify-between gap-4">
                <div className="flex-1">
                  <label className={labelCls}>Valor a pagar al propietario</label>
                  <input
                    type="number"
                    value={form.valor_pago_propietario}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => set("valor_pago_propietario", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="text-right shrink-0">
                  <p className="font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Cálculo automático</p>
                  <p className="font-body text-sm text-muted-foreground">
                    {formatCOP(form.valor_canon as number)} − 10%
                  </p>
                  <p className="font-heading text-lg font-bold text-primary">{formatCOP(form.valor_pago_propietario as number)}</p>
                </div>
              </div>
              <p className="font-body text-xs text-muted-foreground mt-2">
                El valor se calcula automáticamente como 90% del canon. Puedes ajustarlo manualmente.
              </p>
            </div>
          </section>

          {/* Notas */}
          <div>
            <label className={labelCls}>Notas internas</label>
            <textarea value={form.notas} onChange={(e) => set("notas", e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Observaciones, acuerdos especiales, etc." />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Guardando…" : existingId ? "Actualizar contrato" : "Guardar contrato"}
            </button>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-muted text-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-muted/80 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminContratoArrendamiento;
