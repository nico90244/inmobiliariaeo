import { useRef, useState } from "react";
import { X, Heart, MapPin, Maximize2, Bed, Bath, Car, BadgeCheck, Users, PawPrint, Sofa, Building2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { TarjetaSwipe } from "@/hooks/useSwipeInventario";

type Props = {
  tarjetas: TarjetaSwipe[];
  onSwipe: (tarjeta: TarjetaSwipe, accion: "like" | "pass") => void;
  onAjustarBusqueda?: () => void;
};

const SWIPE_THRESHOLD = 100;
const EXIT_DURATION = 260;

const SwipeDeck = ({ tarjetas, onSwipe, onAjustarBusqueda }: Props) => {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState({ x: 0, active: false });
  const [exiting, setExiting] = useState<"like" | "pass" | null>(null);
  const startX = useRef(0);
  const pointerId = useRef<number | null>(null);

  const current = tarjetas[index];
  const next = tarjetas[index + 1];

  const commit = (accion: "like" | "pass") => {
    if (!current || exiting) return;
    setDrag({ x: 0, active: false });
    setExiting(accion);
    onSwipe(current, accion);
    window.setTimeout(() => {
      setIndex((i) => i + 1);
      setExiting(null);
    }, EXIT_DURATION);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (exiting) return;
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
      <div className="animate-fade-in-up flex flex-col items-center justify-center py-20 text-center">
        <p className="font-heading text-lg font-semibold text-foreground mb-2">Eso es todo por ahora</p>
        <p className="font-body text-sm text-muted-foreground max-w-xs mb-5">
          Ya viste todas las propiedades disponibles con estos filtros. Prueba ajustar tu presupuesto
          o el tipo de inmueble — publicamos novedades todos los días.
        </p>
        {onAjustarBusqueda && (
          <button
            onClick={onAjustarBusqueda}
            className="px-6 py-2.5 rounded-full border border-primary/40 text-primary font-heading text-xs font-semibold tracking-widest uppercase hover:bg-primary/5 transition-colors"
          >
            Ajustar mi búsqueda
          </button>
        )}
      </div>
    );
  }

  const exitTransform =
    exiting === "like"
      ? "translateX(140%) rotate(18deg)"
      : exiting === "pass"
      ? "translateX(-140%) rotate(-18deg)"
      : `translateX(${drag.x}px) rotate(${drag.x / 18}deg)`;

  const likeOpacity = exiting === "like" ? 1 : Math.min(Math.max(drag.x / SWIPE_THRESHOLD, 0), 1);
  const passOpacity = exiting === "pass" ? 1 : Math.min(Math.max(-drag.x / SWIPE_THRESHOLD, 0), 1);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-sm h-[520px]">
        {next && (
          <div
            className="absolute inset-0 rounded-2xl bg-background border border-foreground/10 transition-all duration-300 ease-out"
            style={{
              transform: exiting ? "scale(1) translateY(0)" : "scale(0.96) translateY(8px)",
              opacity: exiting ? 1 : 0.7,
            }}
          />
        )}
        <div
          key={`${current.fuente}-${current.id}`}
          className={`absolute inset-0 rounded-2xl bg-background border border-foreground/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] overflow-hidden touch-none select-none ${exiting ? "" : "animate-scale-in cursor-grab active:cursor-grabbing"}`}
          style={{
            transform: exitTransform,
            opacity: exiting ? 0 : 1,
            transition: drag.active
              ? "none"
              : exiting
              ? `transform ${EXIT_DURATION}ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity ${EXIT_DURATION}ms ease-out`
              : "transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1)",
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
              className="absolute top-3 left-3 font-heading text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full bg-primary text-primary-foreground pointer-events-none transition-opacity shadow-md"
              style={{ opacity: likeOpacity }}
            >
              Me interesa
            </span>
            <span
              className="absolute top-3 right-3 font-heading text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full bg-foreground/80 text-background pointer-events-none transition-opacity shadow-md"
              style={{ opacity: passOpacity }}
            >
              No es para mí
            </span>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {current.fuente === "propiedades" ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-heading text-[9px] font-bold uppercase tracking-wide">
                  <Building2 size={11} /> Inventario Inmobiliaria EO
                </span>
              ) : current.es_inmobiliaria_eo ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-heading text-[9px] font-bold uppercase tracking-wide">
                  <BadgeCheck size={11} /> Verificado por Inmobiliaria EO
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground font-heading text-[9px] font-bold uppercase tracking-wide">
                  <Users size={11} /> Publicado por la comunidad
                </span>
              )}
              {current.sin_comision && (
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 font-heading text-[9px] font-bold uppercase tracking-wide">
                  Sin comisión
                </span>
              )}
            </div>

            <p className="font-heading text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-1">
              {current.tipo_inmueble}
            </p>
            <div className="flex items-center gap-1 text-muted-foreground mb-2">
              <MapPin size={14} className="shrink-0" />
              <span className="font-body text-xs">{current.barrio}, {current.ciudad}</span>
            </div>
            <p className="font-body text-xl font-bold text-primary tabular-nums">
              {formatPrice(current.canon)}<span className="text-xs text-muted-foreground font-normal">/mes</span>
            </p>
            {!!current.administracionAparte && (
              <p className="font-body text-[11px] text-muted-foreground mb-2">
                + {formatPrice(current.administracionAparte)} administración · total {formatPrice(current.costoTotal)}/mes
              </p>
            )}
            {current.disponible_desde && (
              <p className="font-body text-[11px] text-muted-foreground mb-2">
                Disponible desde {new Date(current.disponible_desde + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground mb-3 mt-1">
              {current.acepta_mascotas && (
                <div className="flex items-center gap-1"><PawPrint size={14} /><span className="font-body text-xs">Mascotas</span></div>
              )}
              {current.amoblado && (
                <div className="flex items-center gap-1"><Sofa size={14} /><span className="font-body text-xs">Amoblado</span></div>
              )}
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

      <div className="flex items-stretch gap-4 mt-7 w-full max-w-sm">
        <button
          onClick={() => commit("pass")}
          aria-label="No me interesa"
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full border border-foreground/15 text-foreground/70 transition-all duration-200 ease-out hover:border-foreground/30 hover:bg-foreground/5 hover:-translate-y-0.5 hover:shadow-md active:scale-95 active:translate-y-0"
        >
          <X size={18} />
          <span className="font-heading text-xs font-semibold tracking-widest uppercase">No</span>
        </button>
        <button
          onClick={() => commit("like")}
          aria-label="Me interesa"
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 ease-out hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 active:scale-95 active:translate-y-0"
        >
          <Heart size={18} />
          <span className="font-heading text-xs font-semibold tracking-widest uppercase">Me interesa</span>
        </button>
      </div>
      <p className="font-body text-[11px] text-muted-foreground mt-4 text-center max-w-xs">
        Desliza la tarjeta o usa los botones{tarjetas.length - index - 1 > 0 ? ` — ${tarjetas.length - index - 1} propiedades más` : ""}
      </p>
    </div>
  );
};

export default SwipeDeck;
