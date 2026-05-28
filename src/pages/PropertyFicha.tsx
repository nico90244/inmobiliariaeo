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
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(price);
};

const SMLV_2026 = 1_423_500;

/* ─── Brand tokens ─── */
const GOLD  = "hsl(40, 47%, 50%)";
const DARK  = "#1E1E1E";
const CREAM = "#F9F6F1";
const GRAY_L = "#F3F4F6";
const GRAY_T = "#6B7280";
const WHITE = "#FFFFFF";

/* ─── TikTok icon (no está en lucide) ─── */
const TikTokIcon = ({ size = 12, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg viewBox="0 0 24 24" fill={color} style={{ width: size, height: size, flexShrink: 0, display: "block" }}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.8a8.18 8.18 0 004.77 1.53V6.86a4.83 4.83 0 01-1-.17z" />
  </svg>
);

/* ─── Micro-components ─── */
const Label = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => (
  <p style={{
    fontFamily: "Josefin Sans, sans-serif", fontSize: 8, fontWeight: 600,
    letterSpacing: "0.16em", textTransform: "uppercase" as const,
    color: GOLD, marginBottom: 4, lineHeight: 1,
  }}>
    {children}
  </p>
);

const SpecChip = ({
  icon: Icon, label, value, dark = false,
}: { icon: React.ElementType; label: string; value: string; dark?: boolean }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 7,
    padding: "8px 10px",
    backgroundColor: dark ? "rgba(255,255,255,0.06)" : GRAY_L,
    borderLeft: `2px solid ${GOLD}`,
  }}>
    <Icon size={12} style={{ color: GOLD, flexShrink: 0 }} />
    <div>
      <p style={{
        fontFamily: "Josefin Sans, sans-serif", fontSize: 7, fontWeight: 600,
        letterSpacing: "0.1em", textTransform: "uppercase" as const,
        color: dark ? "rgba(255,255,255,0.4)" : "#9CA3AF", lineHeight: 1, marginBottom: 2,
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: "Josefin Sans, sans-serif", fontSize: 11, fontWeight: 700,
        color: dark ? WHITE : DARK, lineHeight: 1,
      }}>
        {value}
      </p>
    </div>
  </div>
);

const ReqRow = ({ text, dark = true }: { text: string; dark?: boolean }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
    <div style={{
      width: 12, height: 12, backgroundColor: GOLD,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, marginTop: 1,
    }}>
      <span style={{ color: DARK, fontSize: 8, fontWeight: 700, lineHeight: 1 }}>✓</span>
    </div>
    <p style={{
      fontFamily: "DM Sans, sans-serif", fontSize: 10,
      color: dark ? "rgba(255,255,255,0.72)" : GRAY_T, lineHeight: 1.3,
    }}>
      {text}
    </p>
  </div>
);

const SocialRow = ({
  icon, href, user,
}: { icon: React.ReactNode; href: string; user: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
    style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none" }}>
    <div style={{
      width: 22, height: 22, backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      {icon}
    </div>
    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.65)" }}>
      {user}
    </span>
  </a>
);

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
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

  /**
   * Antes de imprimir, forzamos el viewport a 794 px para que Chrome
   * renderice el documento a ancho A4 (en lugar de usar el ancho de
   * la pantalla del dispositivo).  Después de imprimir restauramos.
   */
  const handlePrint = () => {
    const vp = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    const original = vp?.content ?? "width=device-width, initial-scale=1";
    if (vp) vp.content = "width=794";
    // Dos rAF para que el reflow ocurra antes de abrir el diálogo de impresión
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
        setTimeout(() => { if (vp) vp.content = original; }, 1000);
      });
    });
  };

  /* ── Estados de carga ── */
  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p style={{ fontFamily: "DM Sans, sans-serif", color: GRAY_T }}>Cargando ficha…</p>
      </div>
    );
  }
  if (error || !property) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
        <p style={{ fontFamily: "DM Sans, sans-serif", color: GRAY_T }}>No se encontró la propiedad.</p>
        <button onClick={() => navigate("/propiedades")}
          style={{ color: GOLD, fontFamily: "Josefin Sans, sans-serif", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer" }}>
          ← Volver a propiedades
        </button>
      </div>
    );
  }

  /* ── Datos derivados ── */
  const allPhotos = [property.foto_portada, ...(property.fotos || [])].filter(Boolean) as string[];
  // Galería: fotos adicionales, mínimo 3 - máximo 6
  const galleryPhotos = allPhotos.slice(1, 7);

  const fichaUrl   = window.location.href;
  const qrUrl      = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(fichaUrl)}`;
  const isAlquiler = property.tipo_negocio === "Alquiler";

  // Ingresos mínimos: 2× el canon (arrendatario y codeudor)
  const minIngresos = property.precio ? property.precio * 2 : null;
  const smlvNeeded  = minIngresos ? (minIngresos / SMLV_2026).toFixed(1) : null;

  // Ubicación: Ciudad → Zona → Barrio
  const locationStr = [property.ciudad || "Cali", property.zona, property.barrio]
    .filter(Boolean).join(" · ");

  const specItems = [
    property.area_m2 && { icon: Maximize2, label: "Área", value: `${property.area_m2} m²` },
    (property.habitaciones ?? 0) > 0 && { icon: Bed, label: "Habitaciones", value: `${property.habitaciones}` },
    (property.banos ?? 0) > 0 && { icon: Bath, label: "Baños", value: `${property.banos}` },
    property.piso && { icon: Building2, label: "Piso", value: property.piso },
    property.estrato && { icon: Building2, label: "Estrato", value: `${property.estrato}` },
    property.parqueadero && { icon: Car, label: "Parqueadero", value: property.parqueadero },
    (property.administracion ?? 0) > 0 && { icon: DollarSign, label: "Administración", value: formatPrice(property.administracion) },
    property.barrio && { icon: MapPin, label: "Barrio", value: property.barrio },
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string; value: string }>;

  /* ─────────────────────────── RENDER ─────────────────────────── */
  return (
    <>
      {/* ── Barra de acciones (se oculta al imprimir) ── */}
      <div className="ficha-no-print" style={{
        position: "sticky", top: 0, zIndex: 100,
        backgroundColor: DARK,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 56, gap: 12,
      }}>
        <button onClick={() => navigate(`/propiedades/${id}`)} style={{
          display: "flex", alignItems: "center", gap: 8, color: GOLD,
          fontFamily: "Josefin Sans, sans-serif", fontSize: 11, fontWeight: 600,
          letterSpacing: "0.12em", textTransform: "uppercase",
          background: "none", border: "none", cursor: "pointer",
        }}>
          <ArrowLeft size={15} /> Volver al detalle
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={handleCopy} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px",
            border: "1px solid rgba(255,255,255,0.15)",
            backgroundColor: "transparent",
            color: copied ? "#4ade80" : "rgba(255,255,255,0.65)",
            fontFamily: "Josefin Sans, sans-serif", fontSize: 10, fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase",
            cursor: "pointer", transition: "color 0.2s",
          }}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copiado" : "Copiar link"}
          </button>
          <button onClick={handlePrint} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 18px",
            backgroundColor: GOLD, color: CREAM,
            fontFamily: "Josefin Sans, sans-serif", fontSize: 10, fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase",
            border: "none", cursor: "pointer",
          }}>
            <Printer size={14} /> Descargar PDF
          </button>
        </div>
      </div>

      {/* ── Escritorio gris (fondo del visor) ── */}
      <div data-ficha-wrapper style={{
        backgroundColor: "#DEDAD5",
        minHeight: "calc(100vh - 56px)",
        padding: "36px 16px 56px",
        display: "flex", justifyContent: "center",
        overflowX: "auto",
      }}>
        {/* ── Documento A4 (794 px = A4 @ 96 dpi) ── */}
        <div data-ficha-doc style={{
          width: "100%", maxWidth: 794,
          backgroundColor: isAlquiler ? CREAM : WHITE,
          boxShadow: "0 8px 40px rgba(0,0,0,0.22)",
          flexShrink: 0,
        }}>

          {/* ══════════════════ TEMPLATE VENTA ══════════════════ */}
          {!isAlquiler && (
            <>
              {/* ─── PÁGINA 1: portada + specs + descripción ─── */}
              <div data-ficha-page1>
                {/* Línea dorada superior */}
                <div style={{ height: 4, backgroundColor: GOLD }} />

                {/* Cabecera */}
                <div style={{ padding: "20px 40px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <span style={{
                      fontFamily: "Josefin Sans, sans-serif", fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.16em", textTransform: "uppercase",
                      backgroundColor: GOLD, color: CREAM, padding: "4px 12px",
                    }}>
                      En Venta
                    </span>
                    <span style={{
                      fontFamily: "Josefin Sans, sans-serif", fontSize: 10, fontWeight: 600,
                      letterSpacing: "0.1em", textTransform: "uppercase", color: "#9CA3AF",
                    }}>
                      {property.tipo_inmueble}
                    </span>
                  </div>
                  <h1 style={{
                    fontFamily: "'Catchy Mager', serif", fontSize: 28, fontWeight: 700,
                    color: DARK, lineHeight: 1.15, marginBottom: 6,
                  }}>
                    {property.nombre_inmueble}
                  </h1>
                  <p style={{
                    fontFamily: "DM Sans, sans-serif", fontSize: 12, color: GRAY_T,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <MapPin size={12} style={{ color: GOLD, flexShrink: 0 }} />
                    {locationStr}
                  </p>
                </div>

                {/* Foto portada */}
                {allPhotos[0] && (
                  <div style={{ margin: "0 40px", height: 320, overflow: "hidden" }}>
                    <img src={allPhotos[0]} alt={property.nombre_inmueble}
                      style={{
                        width: "100%", height: "100%", objectFit: "cover",
                        objectPosition: property.foto_portada_position || "50% 50%",
                        transform: `scale(${property.foto_portada_zoom ?? 1})`,
                        transformOrigin: property.foto_portada_position || "50% 50%",
                        display: "block",
                      }} />
                  </div>
                )}

                {/* Franja oscura con specs */}
                <div style={{
                  backgroundColor: DARK, padding: "12px 40px",
                  display: "flex", flexWrap: "wrap", gap: "7px 16px",
                }}>
                  {specItems.map(({ icon, label, value }) => (
                    <SpecChip key={label} icon={icon} label={label} value={value} dark />
                  ))}
                </div>

                {/* Precio + Descripción + QR */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 150px",
                  gap: 24, padding: "20px 40px 24px",
                }}>
                  <div>
                    <Label>Precio de venta</Label>
                    <p style={{
                      fontFamily: "Josefin Sans, sans-serif", fontSize: 26, fontWeight: 700,
                      color: DARK, marginBottom: 16, lineHeight: 1,
                    }}>
                      {formatPrice(property.precio)}
                    </p>
                    {property.descripcion && (
                      <>
                        <Label>Descripción</Label>
                        <p data-ficha-desc style={{
                          fontFamily: "DM Sans, sans-serif", fontSize: 11, color: GRAY_T,
                          lineHeight: 1.45, whiteSpace: "pre-line", marginTop: 5,
                        }}>
                          {property.descripcion}
                        </p>
                      </>
                    )}
                  </div>
                  {/* QR */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, paddingTop: 2 }}>
                    <img src={qrUrl} alt="QR ficha" style={{ width: 130, height: 130 }} />
                    <p style={{
                      fontFamily: "Josefin Sans, sans-serif", fontSize: 7, fontWeight: 600,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "#C4C4C4", textAlign: "center", lineHeight: 1.5,
                    }}>
                      Escanea para<br />ver la ficha
                    </p>
                  </div>
                </div>
              </div>

              {/* ─── PÁGINA 2: galería + contacto ─── */}
              <div data-ficha-page2>
                {/* Galería */}
                {galleryPhotos.length > 0 && (
                  <div style={{ padding: "28px 40px 20px" }}>
                    <Label>Galería</Label>
                    <div style={{
                      display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 6, marginTop: 10,
                    }}>
                      {galleryPhotos.map((p, i) => (
                        <img key={i} src={p} alt={`Foto ${i + 2}`}
                          style={{ width: "100%", height: 175, objectFit: "cover", display: "block" }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div style={{
                  backgroundColor: DARK, padding: "18px 40px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginTop: 12,
                }}>
                  <div>
                    <Label>Contacto</Label>
                    <p style={{
                      fontFamily: "DM Sans, sans-serif", fontSize: 14, color: WHITE,
                      fontWeight: 700, marginTop: 5, letterSpacing: "0.02em",
                    }}>
                      +57 318 653 1598
                    </p>
                  </div>
                  <p style={{
                    fontFamily: "Josefin Sans, sans-serif", fontSize: 8, fontWeight: 600,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.25)", textAlign: "right",
                  }}>
                    Cali, Colombia
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════ TEMPLATE ALQUILER ══════════════════ */}
          {isAlquiler && (
            <>
              {/* ─── PÁGINA 1: portada + specs + requisitos + descripción ─── */}
              <div data-ficha-page1>
                {/* Header de marca */}
                <div style={{
                  backgroundColor: DARK, padding: "14px 32px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <img src={logoGold} alt="Inmobiliaria Eliana Osorio"
                    style={{ height: 40, width: "auto" }} />
                  <span style={{
                    fontFamily: "Josefin Sans, sans-serif", fontSize: 9, fontWeight: 600,
                    letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD,
                  }}>
                    Inmueble en alquiler
                  </span>
                </div>

                {/* Foto portada — SIN position:relative para compatibilidad con Chrome mobile print.
                    El texto va en una banda oscura hermana, no superpuesta con position:absolute. */}
                {allPhotos[0] && (
                  <div style={{ height: 210, overflow: "hidden", lineHeight: 0 }}>
                    <img src={allPhotos[0]} alt={property.nombre_inmueble}
                      className="ficha-hero-img"
                      style={{
                        width: "100%", height: "100%", objectFit: "cover",
                        objectPosition: property.foto_portada_position || "50% 50%",
                        transform: `scale(${property.foto_portada_zoom ?? 1})`,
                        transformOrigin: property.foto_portada_position || "50% 50%",
                        display: "block",
                      }} />
                  </div>
                )}

                {/* Banda de texto — hermana de la imagen, NO superpuesta */}
                <div style={{
                  backgroundColor: DARK, padding: "12px 32px 14px",
                  display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12,
                }}>
                  <div>
                    <p style={{
                      fontFamily: "Josefin Sans, sans-serif", fontSize: 8, fontWeight: 600,
                      letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, marginBottom: 4,
                    }}>
                      {property.tipo_inmueble} · {locationStr}
                    </p>
                    <h1 style={{
                      fontFamily: "'Catchy Mager', serif", fontSize: 20, fontWeight: 700,
                      color: WHITE, lineHeight: 1.15,
                    }}>
                      {property.nombre_inmueble}
                    </h1>
                  </div>
                  <p style={{
                    fontFamily: "Josefin Sans, sans-serif", fontSize: 17, fontWeight: 700, color: GOLD,
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    {formatPrice(property.precio)}{" "}
                    <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.75 }}>/ mes</span>
                  </p>
                </div>

                {/* Specs + Requisitos en dos columnas */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                  {/* Specs */}
                  <div style={{ padding: "18px 18px 16px 28px", borderRight: "1px solid #E5E7EB" }}>
                    <Label>Características</Label>
                    <div style={{
                      display: "grid", gridTemplateColumns: "1fr 1fr",
                      gap: "6px", marginTop: 9,
                    }}>
                      {specItems.map(({ icon, label, value }) => (
                        <SpecChip key={label} icon={icon} label={label} value={value} />
                      ))}
                    </div>
                  </div>

                  {/* Requisitos */}
                  <div style={{ backgroundColor: DARK, padding: "18px 22px 16px 18px" }}>
                    <Label>Requisitos</Label>
                    {/* Ingresos mínimos */}
                    {minIngresos && (
                      <div style={{
                        margin: "7px 0 10px",
                        padding: "8px 11px",
                        backgroundColor: "rgba(201,168,76,0.10)",
                        border: "1px solid rgba(201,168,76,0.22)",
                      }}>
                        <p style={{
                          fontFamily: "Josefin Sans, sans-serif", fontSize: 7, fontWeight: 600,
                          letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD, marginBottom: 3,
                        }}>
                          Ingresos mínimos requeridos
                        </p>
                        <p style={{
                          fontFamily: "Josefin Sans, sans-serif", fontSize: 14, fontWeight: 700,
                          color: WHITE, lineHeight: 1,
                        }}>
                          {formatPrice(minIngresos)}
                        </p>
                        {smlvNeeded && (
                          <p style={{
                            fontFamily: "DM Sans, sans-serif", fontSize: 8,
                            color: "rgba(255,255,255,0.45)", marginTop: 2,
                          }}>
                            {smlvNeeded} SMLMV · 2× el canon · arrendatario y codeudor
                          </p>
                        )}
                      </div>
                    )}
                    <p style={{
                      fontFamily: "Josefin Sans, sans-serif", fontSize: 8, fontWeight: 600,
                      letterSpacing: "0.12em", textTransform: "uppercase",
                      color: "rgba(255,255,255,0.5)", marginBottom: 7,
                    }}>
                      Se requiere un codeudor
                    </p>
                    <p style={{
                      fontFamily: "Josefin Sans, sans-serif", fontSize: 8, fontWeight: 700,
                      letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD, marginBottom: 4,
                    }}>
                      Empleados
                    </p>
                    <ReqRow text="Carta laboral" />
                    <ReqRow text="Últimos 3 desprendibles de pago" />
                    <ReqRow text="Fotocopia de cédula" />
                    <p style={{
                      fontFamily: "Josefin Sans, sans-serif", fontSize: 8, fontWeight: 700,
                      letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD,
                      margin: "8px 0 4px",
                    }}>
                      Independientes
                    </p>
                    <ReqRow text="RUT" />
                    <ReqRow text="Extractos bancarios últimos 3 meses" />
                    <ReqRow text="Fotocopia de cédula" />
                    <ReqRow text="Declaración de renta (si aplica)" />
                  </div>
                </div>

                {/* Descripción + QR */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 130px",
                  gap: 20, padding: "18px 28px 22px",
                  borderTop: "1px solid #E5E7EB",
                }}>
                  <div>
                    {property.descripcion && (
                      <>
                        <Label>Descripción</Label>
                        <p data-ficha-desc style={{
                          fontFamily: "DM Sans, sans-serif", fontSize: 11, color: GRAY_T,
                          lineHeight: 1.45, whiteSpace: "pre-line", marginTop: 5,
                        }}>
                          {property.descripcion}
                        </p>
                      </>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, paddingTop: 2 }}>
                    <img src={qrUrl} alt="QR ficha" style={{ width: 110, height: 110 }} />
                    <p style={{
                      fontFamily: "Josefin Sans, sans-serif", fontSize: 7, fontWeight: 600,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "#9CA3AF", textAlign: "center", lineHeight: 1.5,
                    }}>
                      Escanea para<br />ver la ficha
                    </p>
                  </div>
                </div>
              </div>

              {/* ─── PÁGINA 2: galería + video + contacto ─── */}
              <div data-ficha-page2>
                {/* Galería */}
                {galleryPhotos.length > 0 && (
                  <div style={{ padding: "28px 28px 18px" }}>
                    <Label>Galería</Label>
                    <div style={{
                      display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 6, marginTop: 10,
                    }}>
                      {galleryPhotos.map((p, i) => (
                        <img key={i} src={p} alt={`Foto ${i + 2}`}
                          style={{ width: "100%", height: 165, objectFit: "cover", display: "block" }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Video */}
                {property.link_video && (
                  <div style={{ padding: "12px 28px 14px", borderTop: "1px solid #E5E7EB" }}>
                    <Label>Video del inmueble</Label>
                    <a href={property.link_video} target="_blank" rel="noopener noreferrer" style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      marginTop: 8, padding: "8px 16px",
                      backgroundColor: DARK, color: WHITE,
                      fontFamily: "Josefin Sans, sans-serif", fontSize: 11, fontWeight: 600,
                      letterSpacing: "0.08em", textDecoration: "none",
                    }}>
                      {(!property.red_social_video || property.red_social_video === "instagram")
                        ? <Instagram size={14} style={{ color: GOLD }} />
                        : property.red_social_video === "facebook"
                          ? <Facebook size={14} style={{ color: GOLD }} />
                          : <TikTokIcon size={13} color={GOLD} />
                      }
                      {property.red_social_video === "facebook" ? "Ver en Facebook"
                        : property.red_social_video === "tiktok" ? "Ver en TikTok"
                        : "Ver reel en Instagram"}
                    </a>
                  </div>
                )}

                {/* Footer */}
                <div style={{
                  backgroundColor: DARK, padding: "18px 28px",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                }}>
                  <div>
                    <p style={{
                      fontFamily: "Josefin Sans, sans-serif", fontSize: 8, fontWeight: 600,
                      letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD, marginBottom: 3,
                    }}>
                      WhatsApp
                    </p>
                    <p style={{
                      fontFamily: "DM Sans, sans-serif", fontSize: 14, color: WHITE,
                      fontWeight: 700, marginBottom: 14, letterSpacing: "0.02em",
                    }}>
                      +57 318 653 1598
                    </p>
                    <p style={{
                      fontFamily: "Josefin Sans, sans-serif", fontSize: 8, fontWeight: 600,
                      letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD, marginBottom: 5,
                    }}>
                      Síguenos en nuestras redes
                    </p>
                    <p style={{
                      fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 600,
                      color: WHITE, marginBottom: 8, letterSpacing: "0.01em",
                    }}>
                      @inmobiliaria_eo
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[
                        { href: "https://instagram.com/inmobiliaria_eo", icon: <Instagram size={13} style={{ color: GOLD }} /> },
                        { href: "https://facebook.com/inmobiliariaeo",    icon: <Facebook size={13} style={{ color: GOLD }} /> },
                        { href: "https://tiktok.com/@inmobiliaria_eo",    icon: <TikTokIcon size={12} color={GOLD} /> },
                      ].map(({ href, icon }) => (
                        <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                          style={{ textDecoration: "none" }}>
                          <div style={{
                            width: 30, height: 30,
                            backgroundColor: "rgba(255,255,255,0.08)",
                            borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {icon}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                  {/* QR en footer */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, flexShrink: 0 }}>
                    <img src={qrUrl} alt="QR ficha" style={{ width: 78, height: 78 }} />
                    <p style={{
                      fontFamily: "Josefin Sans, sans-serif", fontSize: 7, fontWeight: 600,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.5,
                    }}>
                      Ver ficha<br />online
                    </p>
                  </div>
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
