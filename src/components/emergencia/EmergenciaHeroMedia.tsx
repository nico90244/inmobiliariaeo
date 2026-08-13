import { useEffect, useState } from "react";
import img1 from "@/assets/emergencia/sismo-1.jpg.asset.json";
import img2 from "@/assets/emergencia/sismo-2.jpg.asset.json";
import video from "@/assets/emergencia/sismo-video.mp4.asset.json";

type Slide = { type: "image" | "video"; url: string };

const slides: Slide[] = [
  { type: "image", url: img1.url },
  { type: "video", url: video.url },
  { type: "image", url: img2.url },
];

const DURATION = 5000;

/**
 * Fondo de medios con transiciones suaves cada 5 segundos.
 * Se muestra con alta transparencia detrás del contenido del banner.
 */
const EmergenciaHeroMedia = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
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
