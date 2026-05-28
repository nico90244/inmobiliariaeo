import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, Printer, Copy, Check,
  Bed, Bath, Building2, Car, Maximize2, DollarSign, MapPin,
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
  const minIngresos = property.precio ? property.precio * 3 : null;
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
                <div style={{ padding: "0 40px 28px" }}>
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
                      +57 318 353 1598
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
              {/* Branded header */}
              <div style={{
                backgroundColor: DARK,
                padding: "24px 36px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
              }}>
                <img src={logoGold} alt="Inmobiliaria Eliana Osorio"
                  style={{ height: 52, width: "auto" }} />
                <div style={{ textAlign: "right" }}>
                  <p style={{
                    fontFamily: "Josefin Sans, sans-serif",
                    fontSize: 9, fontWeight: 600,
                    letterSpacing: "0.18em", textTransform: "uppercase",
                    color: GOLD, marginBottom: 5,
                  }}>
                    Inmueble en alquiler
                  </p>
                  <p style={{
                    fontFamily: "Josefin Sans, sans-serif",
                    fontSize: 10, color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.06em",
                  }}>
                    inmobiliariaeo.com
                  </p>
                </div>
              </div>

              {/* Hero photo with text overlay */}
              {allPhotos[0] && (
                <div style={{
                  position: "relative", height: 330, overflow: "hidden",
                }}>
                  <img
                    src={allPhotos[0]}
                    alt={property.nombre_inmueble}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.08) 55%)",
                  }} />
                  <div style={{ position: "absolute", bottom: 26, left: 32, right: 32 }}>
                    <p style={{
                      fontFamily: "Josefin Sans, sans-serif",
                      fontSize: 9, fontWeight: 600,
                      letterSpacing: "0.18em", textTransform: "uppercase",
                      color: GOLD, marginBottom: 6,
                    }}>
                      {property.tipo_inmueble}
                      {(property.barrio || property.ciudad) && ` · ${property.barrio || property.ciudad}`}
                    </p>
                    <h1 style={{
                      fontFamily: "'Catchy Mager', serif",
                      fontSize: 26, fontWeight: 700,
                      color: WHITE, lineHeight: 1.2, marginBottom: 8,
                    }}>
                      {property.nombre_inmueble}
                    </h1>
                    <p style={{
                      fontFamily: "Josefin Sans, sans-serif",
                      fontSize: 22, fontWeight: 700, color: GOLD,
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
                <div style={{
                  padding: "26px 26px 24px 32px",
                  borderRight: "1px solid #E5E7EB",
                }}>
                  <Label>Características</Label>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px 8px", marginTop: 12,
                  }}>
                    {specItems.map(({ icon, label, value }) => (
                      <SpecChip key={label} icon={icon} label={label} value={value} />
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div style={{ backgroundColor: DARK, padding: "26px 30px 24px 26px" }}>
                  <Label>Requisitos de arrendamiento</Label>

                  {minIngresos && (
                    <div style={{
                      marginBottom: 14, marginTop: 10,
                      padding: "10px 14px",
                      backgroundColor: "rgba(201,168,76,0.10)",
                      border: "1px solid rgba(201,168,76,0.22)",
                    }}>
                      <p style={{
                        fontFamily: "Josefin Sans, sans-serif",
                        fontSize: 8, fontWeight: 600,
                        letterSpacing: "0.12em", textTransform: "uppercase",
                        color: GOLD, marginBottom: 5,
                      }}>
                        Ingresos mínimos requeridos
                      </p>
                      <p style={{
                        fontFamily: "Josefin Sans, sans-serif",
                        fontSize: 18, fontWeight: 700, color: WHITE, lineHeight: 1,
                      }}>
                        {formatPrice(minIngresos)}
                      </p>
                      {smlvNeeded && (
                        <p style={{
                          fontFamily: "DM Sans, sans-serif",
                          fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 3,
                        }}>
                          {smlvNeeded} SMLMV · 3 veces el canon
                        </p>
                      )}
                    </div>
                  )}

                  {[
                    "Codeudor con propiedad raíz en Cali",
                    "Extractos bancarios (últimos 3 meses)",
                    "Certificado laboral o cámara de comercio",
                    "Contrato de trabajo o RUT",
                    "Fotocopia de cédula ampliada al 150%",
                    "Paz y salvo del arrendamiento anterior",
                  ].map((req, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "flex-start",
                      gap: 8, marginBottom: 7,
                    }}>
                      <div style={{
                        width: 15, height: 15,
                        backgroundColor: GOLD,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginTop: 1,
                      }}>
                        <span style={{ color: DARK, fontSize: 9, fontWeight: 700, lineHeight: 1 }}>✓</span>
                      </div>
                      <p style={{
                        fontFamily: "DM Sans, sans-serif",
                        fontSize: 11, color: "rgba(255,255,255,0.72)", lineHeight: 1.4,
                      }}>
                        {req}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              {property.descripcion && (
                <div style={{ padding: "24px 32px", borderTop: "1px solid #E5E7EB" }}>
                  <Label>Descripción</Label>
                  <p style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 12, color: GRAY_T,
                    lineHeight: 1.75, whiteSpace: "pre-line", marginTop: 8,
                  }}>
                    {property.descripcion}
                  </p>
                </div>
              )}

              {/* Photo gallery */}
              {allPhotos.length > 1 && (
                <div style={{ padding: "0 32px 26px" }}>
                  <div style={{ height: 1, backgroundColor: "#E5E7EB", marginBottom: 18 }} />
                  <Label>Galería</Label>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 6, marginTop: 10,
                  }}>
                    {allPhotos.slice(1, 7).map((p, i) => (
                      <img key={i} src={p} alt={`Foto ${i + 2}`}
                        style={{ width: "100%", height: 128, objectFit: "cover", display: "block" }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Video / social link */}
              {property.link_video && (
                <div style={{
                  padding: "16px 32px 20px",
                  borderTop: "1px solid #E5E7EB",
                }}>
                  <Label>Video del inmueble</Label>
                  <p style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 11, color: GRAY_T, marginTop: 6,
                  }}>
                    {property.red_social_video
                      ? `Ver en ${property.red_social_video.charAt(0).toUpperCase() + property.red_social_video.slice(1)}: `
                      : "Ver video: "}
                    <span style={{ color: GOLD, fontWeight: 600 }}>{property.link_video}</span>
                  </p>
                </div>
              )}

              {/* Footer */}
              <div style={{
                backgroundColor: DARK,
                padding: "22px 32px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between", gap: 16,
              }}>
                <div>
                  <p style={{
                    fontFamily: "Josefin Sans, sans-serif",
                    fontSize: 9, fontWeight: 600,
                    letterSpacing: "0.16em", textTransform: "uppercase",
                    color: GOLD, marginBottom: 10,
                  }}>
                    Contáctanos
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {[
                      { label: "Teléfono", value: "318 653 1598" },
                      { label: "WhatsApp", value: "316 222 5604" },
                      { label: "Correo", value: "info@inmobiliariaeo.com" },
                    ].map(({ label, value }) => (
                      <p key={label} style={{
                        fontFamily: "DM Sans, sans-serif",
                        fontSize: 11, color: "rgba(255,255,255,0.70)",
                      }}>
                        <span style={{
                          fontFamily: "Josefin Sans, sans-serif",
                          fontSize: 8, fontWeight: 600,
                          letterSpacing: "0.12em", textTransform: "uppercase",
                          color: GOLD, marginRight: 6,
                        }}>
                          {label}
                        </span>
                        {value}
                      </p>
                    ))}
                    <p style={{
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: 10, color: "rgba(255,255,255,0.35)",
                      marginTop: 4,
                    }}>
                      @inmobiliaria_eo en Instagram, Facebook y TikTok
                    </p>
                  </div>
                </div>
                <div style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 8, flexShrink: 0,
                }}>
                  <img src={qrUrl} alt="QR ficha" style={{ width: 90, height: 90 }} />
                  <p style={{
                    fontFamily: "Josefin Sans, sans-serif",
                    fontSize: 8, fontWeight: 600,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)", textAlign: "center", lineHeight: 1.5,
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
