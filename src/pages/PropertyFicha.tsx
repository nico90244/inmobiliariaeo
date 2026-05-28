import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, Printer, Copy, Check,
  Bed, Bath, Building2, Car, Maximize2, DollarSign, MapPin,
  Instagram, Facebook,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Propiedad } from "@/hooks/usePropiedades";
import logoGold from "@/assets/logo-gold.png";

/* ─── Helpers ─── */
const formatPrice = (price: number | null) => {
  if (!price) return "Consultar";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
};

const SMLV_2026 = 1_423_500;

/* ─── Brand tokens (inline — safe for print) ─── */
const GOLD   = "hsl(40, 47%, 50%)";
const DARK   = "#1E1E1E";
const CREAM  = "#F9F6F1";
const GRAY_L = "#F3F4F6";
const GRAY_T = "#6B7280";
const WHITE  = "#FFFFFF";

/* ─── Micro-components ─── */
const Label = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontFamily: "Josefin Sans, sans-serif", fontSize: 8, fontWeight: 600,
    letterSpacing: "0.16em", textTransform: "uppercase" as const, color: GOLD,
    marginBottom: 4, lineHeight: 1 }}>
    {children}
  </p>
);

const SpecChip = ({
  icon: Icon, label, value, dark = false,
}: { icon: React.ElementType; label: string; value: string; dark?: boolean }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8,
    padding: "9px 11px",
    backgroundColor: dark ? "rgba(255,255,255,0.06)" : GRAY_L,
    borderLeft: `2px solid ${GOLD}` }}>
    <Icon size={13} style={{ color: GOLD, flexShrink: 0 }} />
    <div>
      <p style={{ fontFamily: "Josefin Sans, sans-serif", fontSize: 8, fontWeight: 600,
        letterSpacing: "0.1em", textTransform: "uppercase" as const,
        color: dark ? "rgba(255,255,255,0.4)" : "#9CA3AF", lineHeight: 1, marginBottom: 2 }}>
        {label}
      </p>
      <p style={{ fontFamily: "Josefin Sans, sans-serif", fontSize: 12, fontWeight: 700,
        color: dark ? WHITE : DARK, lineHeight: 1 }}>
        {value}
      </p>
    </div>
  </div>
);

/* ─── Main component ─── */
const PropertyFicha = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ["propiedad-ficha", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("propiedades").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as Propiedad;
    },
    enabled: !!id,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  /* Loading */
  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", fontFamily: "DM Sans, sans-serif" }}>
        <p style={{ color: GRAY_T }}>Cargando ficha…</p>
      </div>
    );
  }

  /* Error */
  if (error || !property) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "100vh", gap: 16 }}>
        <p style={{ fontFamily: "DM Sans, sans-serif", color: GRAY_T }}>
          No se encontró la propiedad.
        </p>
        <button onClick={() => navigate("/propiedades")}
          style={{ color: GOLD, fontFamily: "Josefin Sans, sans-serif", fontSize: 11,
            letterSpacing: "0.12em", textTransform: "uppercase", background: "none",
            border: "none", cursor: "pointer" }}>
          ← Volver a propiedades
        </button>
      </div>
    );
  }

  /* Derived data */
  const allPhotos = [property.foto_portada, ...(property.fotos || [])]
    .filter(Boolean) as string[];
  const fichaUrl  = window.location.href;
  const qrUrl     = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(fichaUrl)}`;
  const isAlquiler = property.tipo_negocio === "Alquiler";
  // Ingresos mínimos: 2× el canon (para arrendatario y codeudor por separado)
  const minIngresos = property.precio ? property.precio * 2 : null;
  const smlvNeeded  = minIngresos
    ? (minIngresos / SMLV_2026).toFixed(1)
    : null;

  const specItems = [
    property.area_m2 && { icon: Maximize2, label: "Área", value: `${property.area_m2} m²` },
    (property.habitaciones ?? 0) > 0 && { icon: Bed, label: "Habitaciones", value: `${property.habitaciones}` },
    (property.banos ?? 0) > 0 && { icon: Bath, label: "Baños", value: `${property.banos}` },
    property.piso && { icon: Building2, label: "Piso", value: property.piso },
    property.estrato && { icon: Building2, label: "Estrato", value: `${property.estrato}` },
    property.parqueadero && { icon: Car, label: "Parqueadero", value: property.parqueadero },
    (property.administracion ?? 0) > 0 && {
      icon: DollarSign, label: "Administración", value: formatPrice(property.administracion),
    },
    property.barrio && { icon: MapPin, label: "Barrio", value: property.barrio },
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string; value: string }>;

  /* ─────────────────────────────── RENDER ─────────────────────────────── */
  return (
    <>
      {/* ── No-print action bar ── */}
      <div className="ficha-no-print" style={{
        position: "sticky", top: 0, zIndex: 100,
        backgroundColor: DARK,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 56, gap: 12,
      }}>
        {/* Back */}
        <button
          onClick={() => navigate(`/propiedades/${id}`)}
          style={{ display: "flex", alignItems: "center", gap: 8, color: GOLD,
            fontFamily: "Josefin Sans, sans-serif", fontSize: 11, fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase",
            background: "none", border: "none", cursor: "pointer" }}
        >
          <ArrowLeft size={15} /> Volver al detalle
        </button>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={handleCopy}
            style={{ display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px",
              border: "1px solid rgba(255,255,255,0.15)",
              backgroundColor: "transparent",
              color: copied ? "#4ade80" : "rgba(255,255,255,0.65)",
              fontFamily: "Josefin Sans, sans-serif", fontSize: 10, fontWeight: 600,
              letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: "pointer", transition: "color 0.2s" }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copiado" : "Copiar link"}
          </button>
          <button
            onClick={() => window.print()}
            style={{ display: "flex", alignItems: "center", gap: 6,
              padding: "6px 18px",
              backgroundColor: GOLD, color: CREAM,
              fontFamily: "Josefin Sans, sans-serif", fontSize: 10, fontWeight: 600,
              letterSpacing: "0.12em", textTransform: "uppercase",
              border: "none", cursor: "pointer" }}
          >
            <Printer size={14} /> Descargar PDF
          </button>
        </div>
      </div>

      {/* ── Page wrapper (gray "desk") ── */}
      <div
        data-ficha-wrapper
        style={{
          backgroundColor: "#DEDAD5",
          minHeight: "calc(100vh - 56px)",
          padding: "36px 16px 56px",
          display: "flex", justifyContent: "center",
          overflowX: "auto",
        }}
      >
        {/* ── Document (794 px = A4 @ 96 dpi) ── */}
        <div
          data-ficha-doc
          style={{
            width: "100%", maxWidth: 794,
            backgroundColor: isAlquiler ? CREAM : WHITE,
            boxShadow: "0 8px 40px rgba(0,0,0,0.22)",
            flexShrink: 0,
          }}
        >

          {/* ══════════════════════════════════════════════
              VENTA TEMPLATE
          ══════════════════════════════════════════════ */}
          {!isAlquiler && (
            <>
              {/* Top accent line */}
              <div style={{ height: 4, backgroundColor: GOLD }} />

              {/* Document header */}
              <div style={{ padding: "22px 40px 0" }}>
                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "flex-start", gap: 12, marginBottom: 14,
                }}>
                  <span style={{
                    fontFamily: "Josefin Sans, sans-serif", fontSize: 10,
                    fontWeight: 700, letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    backgroundColor: GOLD, color: CREAM,
                    padding: "4px 12px",
                  }}>
                    En Venta
                  </span>
                  <span style={{
                    fontFamily: "Josefin Sans, sans-serif", fontSize: 10,
                    fontWeight: 600, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "#9CA3AF",
                  }}>
                    {property.tipo_inmueble}
                  </span>
                </div>

                {/* Title */}
                <h1 style={{
                  fontFamily: "'Catchy Mager', serif",
                  fontSize: 30, fontWeight: 700, color: DARK,
                  lineHeight: 1.15, marginBottom: 6,
                }}>
                  {property.nombre_inmueble}
                </h1>

                {/* Location — zona y barrio únicamente (sin dirección exacta) */}
                {(property.zona || property.barrio) && (
                  <p style={{
                    fontFamily: "DM Sans, sans-serif", fontSize: 12,
                    color: GRAY_T, display: "flex", alignItems: "center",
                    gap: 4, marginBottom: 18,
                  }}>
                    <MapPin size={12} style={{ color: GOLD }} />
                    {[property.zona, property.barrio].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>

              {/* Hero photo */}
              {allPhotos[0] && (
                <div style={{
                  margin: "0 40px",
                  height: 360, overflow: "hidden", position: "relative",
                }}>
                  <img
                    src={allPhotos[0]}
                    alt={property.nombre_inmueble}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
              )}

              {/* Specs dark strip */}
              <div style={{
                backgroundColor: DARK,
                padding: "14px 40px",
                display: "flex", flexWrap: "wrap", gap: "10px 20px",
              }}>
                {specItems.map(({ icon, label, value }) => (
                  <SpecChip key={label} icon={icon} label={label} value={value} dark />
                ))}
              </div>

              {/* Price + Description + QR */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 160px",
                gap: 32,
                padding: "28px 40px",
              }}>
                <div>
                  <Label>Precio de venta</Label>
                  <p style={{
                    fontFamily: "Josefin Sans, sans-serif",
                    fontSize: 28, fontWeight: 700, color: DARK,
                    marginBottom: 24, lineHeight: 1,
                  }}>
                    {formatPrice(property.precio)}
                  </p>

                  {property.descripcion && (
                    <>
                      <Label>Descripción</Label>
                      <p style={{
                        fontFamily: "DM Sans, sans-serif",
                        fontSize: 11, color: GRAY_T,
                        lineHeight: 1.45, whiteSpace: "pre-line",
                      }}>
                        {property.descripcion}
                      </p>
                    </>
                  )}
                </div>

                {/* QR */}
                <div style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 8, paddingTop: 2,
                }}>
                  <img src={qrUrl} alt="QR ficha" style={{ width: 120, height: 120 }} />
                  <p style={{
                    fontFamily: "Josefin Sans, sans-serif",
                    fontSize: 8, fontWeight: 600,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "#C4C4C4", textAlign: "center", lineHeight: 1.5,
                  }}>
                    Escanea para ver<br />la ficha online
                  </p>
                </div>
              </div>

              {/* Photo gallery */}
              {allPhotos.length > 1 && (
                <div data-ficha-gallery style={{ padding: "0 40px 28px" }}>
                  <div style={{ height: 1, backgroundColor: "#E5E7EB", marginBottom: 20 }} />
                  <Label>Galería</Label>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 6, marginTop: 10,
                  }}>
                    {allPhotos.slice(1, 7).map((p, i) => (
                      <img key={i} src={p} alt={`Foto ${i + 2}`}
                        style={{ width: "100%", height: 135, objectFit: "cover", display: "block" }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Footer contact bar */}
              <div style={{
                backgroundColor: DARK,
                padding: "18px 40px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", gap: 28 }}>
                  <div>
                    <p style={{
                      fontFamily: "Josefin Sans, sans-serif",
                      fontSize: 8, fontWeight: 600,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      color: GOLD, marginBottom: 3,
                    }}>
                      WhatsApp
                    </p>
                    <p style={{
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: 13, color: WHITE, fontWeight: 700,
                      letterSpacing: "0.02em",
                    }}>
                      +57 318 653 1598
                    </p>
                  </div>
                </div>
                <p style={{
                  fontFamily: "Josefin Sans, sans-serif",
                  fontSize: 8, fontWeight: 600,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.25)", textAlign: "right",
                }}>
                  Cali, Colombia
                </p>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════
              ALQUILER TEMPLATE
          ══════════════════════════════════════════════ */}
          {isAlquiler && (
            <>
              {/* Branded header — compacto */}
              <div style={{
                backgroundColor: DARK,
                padding: "18px 32px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
              }}>
                <img src={logoGold} alt="Inmobiliaria Eliana Osorio"
                  style={{ height: 44, width: "auto" }} />
                <span style={{
                  fontFamily: "Josefin Sans, sans-serif",
                  fontSize: 9, fontWeight: 600,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: GOLD,
                }}>
                  Inmueble en alquiler
                </span>
              </div>

              {/* Hero photo con overlay — sin position:absolute para mejor compatibilidad print */}
              {allPhotos[0] && (
                <div style={{ position: "relative", overflow: "hidden", lineHeight: 0 }}>
                  <img
                    src={allPhotos[0]}
                    alt={property.nombre_inmueble}
                    style={{ width: "100%", height: 300, objectFit: "cover", display: "block" }}
                  />
                  {/* Overlay con info */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.05) 50%)",
                    display: "flex", flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: "24px 32px",
                  }}>
                    <p style={{
                      fontFamily: "Josefin Sans, sans-serif", fontSize: 9, fontWeight: 600,
                      letterSpacing: "0.18em", textTransform: "uppercase",
                      color: GOLD, marginBottom: 5,
                    }}>
                      {property.tipo_inmueble}
                      {(property.zona || property.barrio) && ` · ${[property.zona, property.barrio].filter(Boolean).join(" · ")}`}
                    </p>
                    <h1 style={{
                      fontFamily: "'Catchy Mager', serif", fontSize: 24, fontWeight: 700,
                      color: WHITE, lineHeight: 1.2, marginBottom: 7,
                    }}>
                      {property.nombre_inmueble}
                    </h1>
                    <p style={{
                      fontFamily: "Josefin Sans, sans-serif", fontSize: 20,
                      fontWeight: 700, color: GOLD,
                    }}>
                      {formatPrice(property.precio)}{" "}
                      <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.75 }}>/ mes</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specs + Requirements (two columns) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                {/* Specs */}
                <div style={{ padding: "22px 22px 20px 28px", borderRight: "1px solid #E5E7EB" }}>
                  <Label>Características</Label>
                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr",
                    gap: "7px 7px", marginTop: 10,
                  }}>
                    {specItems.map(({ icon, label, value }) => (
                      <SpecChip key={label} icon={icon} label={label} value={value} />
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div style={{ backgroundColor: DARK, padding: "22px 26px 20px 22px" }}>
                  <Label>Requisitos de arrendamiento</Label>

                  {/* Ingresos mínimos */}
                  {minIngresos && (
                    <div style={{
                      margin: "8px 0 12px",
                      padding: "9px 12px",
                      backgroundColor: "rgba(201,168,76,0.10)",
                      border: "1px solid rgba(201,168,76,0.22)",
                    }}>
                      <p style={{
                        fontFamily: "Josefin Sans, sans-serif", fontSize: 8, fontWeight: 600,
                        letterSpacing: "0.12em", textTransform: "uppercase",
                        color: GOLD, marginBottom: 4,
                      }}>
                        Ingresos mínimos requeridos
                      </p>
                      <p style={{
                        fontFamily: "Josefin Sans, sans-serif", fontSize: 16,
                        fontWeight: 700, color: WHITE, lineHeight: 1,
                      }}>
                        {formatPrice(minIngresos)}
                      </p>
                      {smlvNeeded && (
                        <p style={{
                          fontFamily: "DM Sans, sans-serif", fontSize: 9,
                          color: "rgba(255,255,255,0.45)", marginTop: 3,
                        }}>
                          {smlvNeeded} SMLMV · 2 veces el canon (arrendatario y codeudor)
                        </p>
                      )}
                    </div>
                  )}

                  {/* Codeudor */}
                  <p style={{
                    fontFamily: "Josefin Sans, sans-serif", fontSize: 8, fontWeight: 600,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.5)", marginBottom: 6,
                  }}>
                    Se requiere un codeudor
                  </p>

                  {/* Empleados */}
                  <p style={{
                    fontFamily: "Josefin Sans, sans-serif", fontSize: 8, fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: GOLD, marginBottom: 5,
                  }}>
                    Empleados
                  </p>
                  {[
                    "Carta laboral",
                    "Últimos 3 desprendibles de pago",
                    "Fotocopia de cédula",
                  ].map((req, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 5 }}>
                      <div style={{
                        width: 13, height: 13, backgroundColor: GOLD,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginTop: 1,
                      }}>
                        <span style={{ color: DARK, fontSize: 8, fontWeight: 700, lineHeight: 1 }}>✓</span>
                      </div>
                      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.72)", lineHeight: 1.3 }}>
                        {req}
                      </p>
                    </div>
                  ))}

                  {/* Independientes */}
                  <p style={{
                    fontFamily: "Josefin Sans, sans-serif", fontSize: 8, fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: GOLD, margin: "8px 0 5px",
                  }}>
                    Independientes
                  </p>
                  {[
                    "RUT",
                    "Extractos bancarios últimos 3 meses",
                    "Fotocopia de cédula",
                    "Declaración de renta (si aplica)",
                  ].map((req, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 5 }}>
                      <div style={{
                        width: 13, height: 13, backgroundColor: GOLD,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginTop: 1,
                      }}>
                        <span style={{ color: DARK, fontSize: 8, fontWeight: 700, lineHeight: 1 }}>✓</span>
                      </div>
                      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.72)", lineHeight: 1.3 }}>
                        {req}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              {property.descripcion && (
                <div style={{ padding: "20px 28px", borderTop: "1px solid #E5E7EB" }}>
                  <Label>Descripción</Label>
                  <p style={{
                    fontFamily: "DM Sans, sans-serif", fontSize: 11, color: GRAY_T,
                    lineHeight: 1.5, whiteSpace: "pre-line", marginTop: 7,
                  }}>
                    {property.descripcion}
                  </p>
                </div>
              )}

              {/* Photo gallery */}
              {allPhotos.length > 1 && (
                <div data-ficha-gallery style={{ padding: "0 28px 22px", breakInside: "avoid" as const }}>
                  <div style={{ height: 1, backgroundColor: "#E5E7EB", marginBottom: 14 }} />
                  <Label>Galería</Label>
                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 5, marginTop: 8,
                  }}>
                    {allPhotos.slice(1, 7).map((p, i) => (
                      <img key={i} src={p} alt={`Foto ${i + 2}`}
                        style={{ width: "100%", height: 118, objectFit: "cover", display: "block" }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Video link — clickeable con ícono de red social */}
              {property.link_video && (
                <div style={{
                  padding: "14px 28px 16px",
                  borderTop: "1px solid #E5E7EB",
                }}>
                  <Label>Video del inmueble</Label>
                  <a
                    href={property.link_video}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      marginTop: 8,
                      padding: "8px 16px",
                      backgroundColor: DARK, color: WHITE,
                      fontFamily: "Josefin Sans, sans-serif", fontSize: 11,
                      fontWeight: 600, letterSpacing: "0.08em",
                      textDecoration: "none",
                    }}
                  >
                    {property.red_social_video === "instagram" || !property.red_social_video ? (
                      <Instagram size={15} style={{ color: GOLD }} />
                    ) : property.red_social_video === "facebook" ? (
                      <Facebook size={15} style={{ color: GOLD }} />
                    ) : (
                      /* TikTok */
                      <svg viewBox="0 0 24 24" fill={GOLD} style={{ width: 15, height: 15, flexShrink: 0 }}>
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.8a8.18 8.18 0 004.77 1.53V6.86a4.83 4.83 0 01-1-.17z" />
                      </svg>
                    )}
                    {property.red_social_video === "instagram" || !property.red_social_video
                      ? "Ver reel en Instagram"
                      : property.red_social_video === "facebook"
                        ? "Ver en Facebook"
                        : "Ver en TikTok"}
                  </a>
                </div>
              )}

              {/* Footer */}
              <div style={{
                backgroundColor: DARK, padding: "20px 28px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between", gap: 16,
              }}>
                {/* Left: contacto + redes */}
                <div>
                  {/* WhatsApp */}
                  <p style={{
                    fontFamily: "Josefin Sans, sans-serif", fontSize: 8, fontWeight: 600,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: GOLD, marginBottom: 3,
                  }}>
                    WhatsApp
                  </p>
                  <p style={{
                    fontFamily: "DM Sans, sans-serif", fontSize: 13,
                    color: WHITE, fontWeight: 700, marginBottom: 12,
                  }}>
                    +57 318 653 1598
                  </p>

                  {/* Redes sociales */}
                  <p style={{
                    fontFamily: "Josefin Sans, sans-serif", fontSize: 8, fontWeight: 600,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: GOLD, marginBottom: 7,
                  }}>
                    Síguenos en nuestras redes
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {/* Instagram */}
                    <a href="https://instagram.com/inmobiliaria_eo" target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none" }}>
                      <div style={{
                        width: 24, height: 24, backgroundColor: "rgba(255,255,255,0.08)",
                        borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Instagram size={12} style={{ color: GOLD }} />
                      </div>
                      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.65)" }}>
                        @inmobiliaria_eo
                      </span>
                    </a>
                    {/* Facebook */}
                    <a href="https://facebook.com/inmobiliariaeo" target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none" }}>
                      <div style={{
                        width: 24, height: 24, backgroundColor: "rgba(255,255,255,0.08)",
                        borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Facebook size={12} style={{ color: GOLD }} />
                      </div>
                      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.65)" }}>
                        inmobiliariaeo
                      </span>
                    </a>
                    {/* TikTok */}
                    <a href="https://tiktok.com/@inmobiliaria_eo" target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none" }}>
                      <div style={{
                        width: 24, height: 24, backgroundColor: "rgba(255,255,255,0.08)",
                        borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <svg viewBox="0 0 24 24" fill={GOLD} style={{ width: 11, height: 11 }}>
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.8a8.18 8.18 0 004.77 1.53V6.86a4.83 4.83 0 01-1-.17z" />
                        </svg>
                      </div>
                      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.65)" }}>
                        @inmobiliaria_eo
                      </span>
                    </a>
                  </div>
                </div>

                {/* Right: QR */}
                <div style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 7, flexShrink: 0,
                }}>
                  <img src={qrUrl} alt="QR ficha" style={{ width: 84, height: 84 }} />
                  <p style={{
                    fontFamily: "Josefin Sans, sans-serif", fontSize: 7, fontWeight: 600,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.5,
                  }}>
                    Ver ficha<br />online
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PropertyFicha;
