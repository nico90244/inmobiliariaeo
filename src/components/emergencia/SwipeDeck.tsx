import { useRef, useState } from "react";
import { X, Heart, MapPin, Maximize2, Bed, Bath, Car } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { EmergenciaInmueblePublico } from "@/hooks/useEmergenciaInmuebles";

type Props = {
  inmuebles: EmergenciaInmueblePublico[];
  onSwipe: (inmueble: EmergenciaInmueblePublico, accion: "like" | "pass") => void;
};

const SWIPE_THRESHOLD = 100;

const SwipeDeck = ({ inmuebles, onSwipe }: Props) => {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState({ x: 0, active: false });
  const startX = useRef(0);
  const pointerId = useRef<number | null>(null);

  const current = inmuebles[index];
  const next = inmuebles[index + 1];

  const commit = (accion: "like" | "pass") => {
    if (!current) return;
    onSwipe(current, accion);
    setDrag({ x: 0, active: false });
    setIndex((i) => i + 1);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pointerId.current = e.pointerId;
    startX.current = e.clientX;
    setDrag({ x: 0, active: true });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.active || pointerId.current !== e.pointerId) return;
    setDrag({ x: e.clientX - startX.current, active: true });
  };

  const endDrag = () => {
    if (!drag.active) return;
    if (drag.x > SWIPE_THRESHOLD) commit("like");
    else if (drag.x < -SWIPE_THRESHOLD) commit("pass");
    else setDrag({ x: 0, active: false });
    pointerId.current = null;
  };

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-heading text-lg font-semibold text-foreground mb-2">Eso es todo por ahora</p>
        <p className="font-body text-sm text-muted-foreground max-w-xs">
          Ya viste todas las propiedades disponibles con estos filtros. Vuelve pronto, publicamos
          inmuebles nuevos todos los días.
        </p>
      </div>
    );
  }

  const rotation = drag.x / 18;
  const likeOpacity = Math.min(Math.max(drag.x / SWIPE_THRESHOLD, 0), 1);
  const passOpacity = Math.min(Math.max(-drag.x / SWIPE_THRESHOLD, 0), 1);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-sm h-[520px]">
        {next && (
          <div className="absolute inset-0 bg-background border border-foreground/10 scale-[0.96] translate-y-2 opacity-70" />
        )}
        <div
          className="absolute inset-0 bg-background border border-foreground/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(${drag.x}px) rotate(${rotation}deg)`,
            transition: drag.active ? "none" : "transform 0.25s ease-out",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className="relative aspect-video">
            <img
              src={current.foto_portada || "/placeholder.svg"}
              alt={`${current.tipo_inmueble} en ${current.barrio || current.ciudad}`}
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
            <span
              className="absolute top-3 left-3 font-heading text-xs font-bold tracking-widest uppercase px-3 py-1 bg-primary text-primary-foreground pointer-events-none transition-opacity"
              style={{ opacity: likeOpacity }}
            >
              Me interesa
            </span>
            <span
              className="absolute top-3 right-3 font-heading text-xs font-bold tracking-widest uppercase px-3 py-1 bg-foreground/80 text-background pointer-events-none transition-opacity"
              style={{ opacity: passOpacity }}
            >
              No es para mí
            </span>
          </div>
          <div className="p-5">
            <p className="font-heading text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-1">
              {current.tipo_inmueble}
            </p>
            <div className="flex items-center gap-1 text-muted-foreground mb-2">
              <MapPin size={14} className="shrink-0" />
              <span className="font-body text-xs">{current.barrio}, {current.ciudad}</span>
            </div>
            <p className="font-body text-xl font-bold text-primary mb-3 tabular-nums">
              {formatPrice(current.canon)}<span className="text-xs text-muted-foreground font-normal">/mes</span>
            </p>
            <div className="flex items-center gap-4 text-muted-foreground mb-3">
              {current.area_m2 && (
                <div className="flex items-center gap-1"><Maximize2 size={14} /><span className="font-body text-xs">{current.area_m2} m²</span></div>
              )}
              {(current.habitaciones ?? 0) > 0 && (
                <div className="flex items-center gap-1"><Bed size={14} /><span className="font-body text-xs">{current.habitaciones}</span></div>
              )}
              {(current.banos ?? 0) > 0 && (
                <div className="flex items-center gap-1"><Bath size={14} /><span className="font-body text-xs">{current.banos}</span></div>
              )}
              {current.parqueadero && current.parqueadero !== "No" && (
                <div className="flex items-center gap-1"><Car size={14} /><span className="font-body text-xs">{current.parqueadero}</span></div>
              )}
            </div>
            {current.descripcion && (
              <p className="font-body text-xs text-muted-foreground line-clamp-3">{current.descripcion}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mt-6">
        <button
          onClick={() => commit("pass")}
          aria-label="No me interesa"
          className="w-16 h-16 rounded-full border-2 border-foreground/15 flex items-center justify-center hover:border-foreground/40 hover:bg-foreground/5 transition-colors"
        >
          <X size={26} className="text-foreground/70" />
        </button>
        <button
          onClick={() => commit("like")}
          aria-label="Me interesa"
          className="w-16 h-16 rounded-full bg-primary flex items-center justify-center hover:bg-primary-hover transition-colors"
        >
          <Heart size={26} className="text-primary-foreground" />
        </button>
      </div>
      <p className="font-body text-[11px] text-muted-foreground mt-4 text-center max-w-xs">
        Desliza la tarjeta o usa los botones. {inmuebles.length - index - 1 > 0 ? `${inmuebles.length - index - 1} propiedades más` : ""}
      </p>
    </div>
  );
};

export default SwipeDeck;
