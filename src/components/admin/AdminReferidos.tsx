import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Handshake, Trash2, Phone, Building2 } from "lucide-react";

type Referido = {
  id: string;
  propiedad_id: string;
  tipo_negocio: string;
  modalidad: string;
  nombre_agente: string | null;
  inmobiliaria: string | null;
  celular: string | null;
  comision_tipo: string | null;
  comision_valor: number | null;
  created_at: string;
};

type Prop = { id: string; nombre_inmueble: string; tipo_negocio: string | null; precio: number | null; estado: string | null };

const fmt = (n: number | null | undefined) =>
  n == null ? "—" : new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

const modalidadBadge = (modalidad: string) => {
  const map: Record<string, string> = {
    Corretaje: "bg-blue-100 text-blue-800",
    Administracion: "bg-purple-100 text-purple-800",
    Compartida: "bg-amber-100 text-amber-800",
  };
  return map[modalidad] ?? "bg-gray-100 text-gray-700";
};

const modalidadLabel = (modalidad: string) =>
  modalidad === "Administracion" ? "Administración" : modalidad;

const comisionLabel = (r: Referido) => {
  if (r.comision_valor == null) return "—";
  return r.comision_tipo === "valor" ? fmt(r.comision_valor) : `${r.comision_valor}%`;
};

const AdminReferidos = () => {
  const { toast } = useToast();
  const [referidos, setReferidos] = useState<Referido[]>([]);
  const [props, setProps] = useState<Record<string, Prop>>({});
  const [loading, setLoading] = useState(true);
  const [filtroModalidad, setFiltroModalidad] = useState("");

  const loadData = async () => {
    setLoading(true);
    const [rRes, pRes] = await Promise.all([
      (supabase as any).from("referidos").select("*").order("created_at", { ascending: false }),
      supabase.from("propiedades").select("id, nombre_inmueble, tipo_negocio, precio, estado"),
    ]);
    setReferidos((rRes.data || []) as Referido[]);
    const pm: Record<string, Prop> = {};
    ((pRes.data || []) as Prop[]).forEach((p) => { pm[p.id] = p; });
    setProps(pm);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtrados = useMemo(() => {
    if (!filtroModalidad) return referidos;
    return referidos.filter((r) => r.modalidad === filtroModalidad);
  }, [referidos, filtroModalidad]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este registro de referido? La propiedad no se elimina, solo se desvincula esta comisión.")) return;
    const { error } = await (supabase as any).from("referidos").delete().eq("id", id);
    if (error) {
      toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Referido eliminado" });
    loadData();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
            <Handshake size={20} className="text-primary" /> Referidos
          </h2>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Negocios de corretaje, administración o venta compartida — separados de la base de propietarios, pólizas y canon de arrendamiento. Solo para control interno.
          </p>
        </div>
        <select
          value={filtroModalidad}
          onChange={(e) => setFiltroModalidad(e.target.value)}
          className="eo-select border border-foreground/10 py-2 px-3 font-body text-sm bg-background focus:border-primary focus:outline-none"
        >
          <option value="">Todas las modalidades</option>
          <option value="Corretaje">Corretaje</option>
          <option value="Administracion">Administración</option>
          <option value="Compartida">Compartida</option>
        </select>
      </div>

      {filtrados.length === 0 ? (
        <p className="font-body text-sm text-muted-foreground py-10 text-center">No hay referidos registrados.</p>
      ) : (
        <div className="border border-foreground/10 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 border-b border-foreground/10">
              <tr>
                <th className="p-3 font-heading text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Propiedad</th>
                <th className="p-3 font-heading text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Modalidad</th>
                <th className="p-3 font-heading text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Agente / Inmobiliaria</th>
                <th className="p-3 font-heading text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Celular</th>
                <th className="p-3 font-heading text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Comisión</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {filtrados.map((r) => {
                const prop = props[r.propiedad_id];
                return (
                  <tr key={r.id}>
                    <td className="p-3 font-body text-sm">
                      <p className="font-semibold text-foreground">{prop?.nombre_inmueble || "Propiedad eliminada"}</p>
                      {prop && <p className="text-xs text-muted-foreground">{prop.tipo_negocio} · {fmt(prop.precio)} · {prop.estado}</p>}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs font-heading font-semibold ${modalidadBadge(r.modalidad)}`}>{modalidadLabel(r.modalidad)}</span>
                    </td>
                    <td className="p-3 font-body text-sm">
                      <p>{r.nombre_agente || "—"}</p>
                      {r.inmobiliaria && <p className="text-xs text-muted-foreground flex items-center gap-1"><Building2 size={11} /> {r.inmobiliaria}</p>}
                    </td>
                    <td className="p-3 font-body text-sm">
                      {r.celular ? <span className="flex items-center gap-1"><Phone size={12} /> {r.celular}</span> : "—"}
                    </td>
                    <td className="p-3 font-body text-sm font-semibold text-primary">{comisionLabel(r)}</td>
                    <td className="p-3">
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 text-muted-foreground hover:text-destructive" aria-label="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReferidos;
