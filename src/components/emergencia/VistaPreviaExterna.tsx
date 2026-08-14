import { useState } from "react";
import { Link2, Loader2, ImagePlus, X, RefreshCw, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const inputClass = "w-full bg-background border border-foreground/10 rounded-lg py-2.5 px-3 font-body text-sm text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";
const labelClass = "font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1";

type FuentePreview = "manual" | "automatica" | null;

type Props = {
  linkPortalExterno: string;
  onLinkChange: (value: string) => void;
  imagenPreviewUrl: string | null;
  imagenPreviewFuente: FuentePreview;
  onImagenChange: (url: string | null, fuente: FuentePreview) => void;
};

const VistaPreviaExterna = ({
  linkPortalExterno,
  onLinkChange,
  imagenPreviewUrl,
  imagenPreviewFuente,
  onImagenChange,
}: Props) => {
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const generarVistaPrevia = async () => {
    const link = linkPortalExterno.trim();
    if (!link) return;
    setBuscando(true);
    setErrorBusqueda(null);
    try {
      const res = await fetch("/api/link-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link }),
      });
      const data = await res.json();
      if (!res.ok || !data.image) {
        setErrorBusqueda(data.error || "No se encontró una imagen en ese link. Puedes subir una foto manualmente.");
        return;
      }
      onImagenChange(data.image, "automatica");
    } catch {
      setErrorBusqueda("No se pudo conectar con el portal. Puedes subir una foto manualmente.");
    } finally {
      setBuscando(false);
    }
  };

  const subirManual = async (file: File) => {
    setSubiendo(true);
    setErrorBusqueda(null);
    try {
      const ext = file.name.split(".").pop();
      const path = `preview-manual/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("emergencia-fotos").upload(path, file);
      if (uploadError) throw uploadError;
      const { data, error: signError } = await supabase.storage
        .from("emergencia-fotos")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (signError || !data) throw signError ?? new Error("No se pudo obtener la URL de la imagen");
      onImagenChange(data.signedUrl, "manual");
    } catch {
      setErrorBusqueda("No se pudo subir la imagen. Intenta de nuevo.");
    } finally {
      setSubiendo(false);
    }
  };

  const quitarImagen = () => {
    onImagenChange(null, null);
    setErrorBusqueda(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass} htmlFor="link-portal-externo">
          Link a tu publicación en otro portal (opcional)
        </label>
        <div className="flex gap-2">
          <input
            id="link-portal-externo"
            type="url"
            value={linkPortalExterno}
            onChange={(e) => onLinkChange(e.target.value)}
            onBlur={generarVistaPrevia}
            placeholder="Ej: tu link de Fincaraíz, Metrocuadrado o Facebook Marketplace, si ya la tienes publicada ahí"
            className={inputClass}
          />
        </div>
        <button
          type="button"
          onClick={generarVistaPrevia}
          disabled={!linkPortalExterno.trim() || buscando}
          className="mt-2 flex items-center gap-2 py-2 px-4 rounded-full border border-primary/40 text-primary font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {buscando ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
          {buscando ? "Buscando imagen..." : "Generar vista previa"}
        </button>
      </div>

      {errorBusqueda && (
        <div className="flex items-start gap-2 rounded-xl bg-muted/20 border border-foreground/10 p-3">
          <AlertTriangle size={14} className="text-muted-foreground shrink-0 mt-0.5" />
          <p className="font-body text-xs text-muted-foreground">{errorBusqueda}</p>
        </div>
      )}

      {imagenPreviewUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-foreground/10">
          <img src={imagenPreviewUrl} alt="Vista previa del inmueble" className="w-full h-48 object-cover" />
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-background/90 font-heading text-[9px] font-bold uppercase tracking-wide text-foreground">
            {imagenPreviewFuente === "automatica" ? "Encontrada automáticamente" : "Subida manualmente"}
          </span>
          <button
            type="button"
            onClick={quitarImagen}
            className="absolute top-2 right-2 rounded-full bg-background/90 p-1.5 shadow-sm hover:bg-background transition-colors"
            aria-label="Quitar imagen"
          >
            <X size={14} />
          </button>
          <label className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 font-heading text-[10px] font-semibold uppercase tracking-wide cursor-pointer hover:bg-background transition-colors">
            <RefreshCw size={12} /> Reemplazar
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && subirManual(e.target.files[0])}
            />
          </label>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-foreground/15 py-8 cursor-pointer transition-all duration-200 hover:border-primary/40 hover:bg-primary/5">
          {subiendo ? (
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          ) : (
            <ImagePlus size={20} className="text-muted-foreground" />
          )}
          <span className="font-body text-xs text-muted-foreground">
            {subiendo ? "Subiendo..." : "O sube una foto manualmente"}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={subiendo}
            onChange={(e) => e.target.files?.[0] && subirManual(e.target.files[0])}
          />
        </label>
      )}

      <p className="font-body text-[11px] text-muted-foreground">
        Este paso es opcional — puedes continuar sin link ni imagen.
      </p>
    </div>
  );
};

export default VistaPreviaExterna;
