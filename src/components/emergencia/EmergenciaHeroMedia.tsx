import { useEffect, useState } from "react";

type Slide = { type: "image" | "video"; url: string };

// NOTA: las fotos sismo-1.jpg / sismo-2.jpg subidas desde Lovable apuntaban
// a /__l5e/assets-v1/... — una ruta interna de la vista previa de Lovable
// que no existe en este despliegue de Vercel. Ahí, cualquier ruta desconocida
// cae en el rewrite de SPA de vercel.json y devuelve el HTML de la app en vez
// de la imagen, por eso se veía un ícono roto (el "?") en el celular.
// Mientras llegan las fotos como archivo real, el fondo usa solo el video
// (que sí está servido desde /public, funciona en producción). Para sumar
// las fotos: colócalas en /public (ej. /emergencia-sismo-1.jpg) y agrégalas
// de nuevo al arreglo `slides` de abajo.
const slides: Slide[] = [{ type: "video", url: "/emergencia-hero.mp4" }];

const DURATION = 5000;

/**
 * Fondo de medios con transiciones suaves cada 5 segundos.
 * Se muestra con alta transparencia detrás del contenido del banner.
 */
const EmergenciaHeroMedia = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), DURATION);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {slides.map((s, i) => (
        <div
          key={s.url}
          className={`absolute inset-0 transition-opacity duration-[1800ms] ease-in-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        >
          {s.type === "image" ? (
            <img
              src={s.url}
              alt=""
              loading="lazy"
              className={`w-full h-full object-cover opacity-[0.22] transition-transform duration-[9000ms] ease-linear ${
                i === active ? "scale-125" : "scale-100"
              }`}
            />
          ) : (
            <video
              src={s.url}
              muted
              loop
              playsInline
              autoPlay
              className={`w-full h-full object-cover opacity-[0.22] transition-transform duration-[9000ms] ease-linear ${
                i === active ? "scale-125" : "scale-100"
              }`}
            />
          )}
        </div>
      ))}
      {/* Velo para mantener legible el texto */}
      <div className="absolute inset-0 bg-secondary/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-secondary via-transparent to-secondary opacity-80" />
    </div>
  );
};

export default EmergenciaHeroMedia;
