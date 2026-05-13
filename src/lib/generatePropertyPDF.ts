import jsPDF from "jspdf";
import type { Propiedad } from "@/hooks/usePropiedades";

const formatPrice = (price: number | null) => {
  if (!price) return "Consultar";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);
};

// jsPDF's helvetica usa WinAnsi: reemplazamos caracteres Unicode problemáticos
// (smart quotes, em-dashes, bullets, etc.) por equivalentes seguros para evitar
// "letras raras" o glifos faltantes.
const sanitize = (input: unknown): string => {
  if (input == null) return "";
  return String(input)
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2022/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[\u00A0]/g, " ")
    // Quita cualquier char fuera del rango Latin-1 (lo que helvetica no soporta)
    .replace(/[^\x00-\xFF]/g, "")
    .trim();
};

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

const imgToDataUrl = async (url: string): Promise<{ data: string; w: number; h: number } | null> => {
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    const maxW = 1200;
    const ratio = img.width > maxW ? maxW / img.width : 1;
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { data: canvas.toDataURL("image/jpeg", 0.85), w: canvas.width, h: canvas.height };
  } catch {
    return null;
  }
};

export const generatePropertyPDF = async (property: Propiedad) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  const gold: [number, number, number] = [201, 168, 76];
  const dark: [number, number, number] = [26, 26, 26];
  const linkColor: [number, number, number] = [37, 99, 235];

  const WA_NUMBER = "573162225604";
  const TEL_NUMBER = "573186531598";
  const EMAIL = "info@inmobiliariaeo.com";
  const SITE = "inmobiliariaeo.lovable.app";
  const propertyUrl = `https://${SITE}/propiedades/${property.id}`;

  // Header band
  doc.setFillColor(...dark);
  doc.rect(0, 0, pageW, 70, "F");
  doc.setFillColor(...gold);
  doc.rect(0, 70, pageW, 4, "F");
  doc.setTextColor(...gold);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("INMOBILIARIA ELIANA OSORIO", margin, 32);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Ficha Tecnica de Propiedad", margin, 52);

  let y = 100;
  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  const title = doc.splitTextToSize(sanitize(property.nombre_inmueble), pageW - margin * 2);
  doc.text(title, margin, y);
  y += title.length * 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(102, 102, 102);
  const subtitle = sanitize(
    [property.tipo_negocio, property.tipo_inmueble, property.barrio, property.ciudad].filter(Boolean).join(" - ")
  );
  doc.text(subtitle, margin, y);
  y += 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...gold);
  doc.text(formatPrice(property.precio), margin, y);
  y += 24;

  // Cover image
  if (property.foto_portada) {
    const cover = await imgToDataUrl(property.foto_portada);
    if (cover) {
      const w = pageW - margin * 2;
      const h = (cover.h / cover.w) * w;
      const finalH = Math.min(h, 260);
      const finalW = (cover.w / cover.h) * finalH > w ? w : (cover.w / cover.h) * finalH;
      doc.addImage(cover.data, "JPEG", margin, y, finalW, finalH);
      y += finalH + 16;
    }
  }

  const ensureSpace = (need: number) => {
    if (y + need > pageH - 70) {
      doc.addPage();
      y = margin;
    }
  };

  const sectionTitle = (text: string, underlineW = 110) => {
    ensureSpace(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...dark);
    doc.text(text, margin, y);
    doc.setDrawColor(...gold);
    doc.setLineWidth(1);
    doc.line(margin, y + 4, margin + underlineW, y + 4);
    y += 18;
  };

  // Características
  sectionTitle("CARACTERISTICAS");

  const parqueaderoLabel = (() => {
    const v = property.parqueadero;
    if (!v) return null;
    const l = v.toLowerCase();
    if (l === "no") return "No";
    if (l === "si" || l === "sí") return "Si";
    return `Si - ${v}`;
  })();

  const features: [string, string | number | null | undefined][] = [
    ["Area", property.area_m2 ? `${property.area_m2} m2` : null],
    ["Habitaciones", property.habitaciones || null],
    ["Banos", property.banos || null],
    ["Piso", property.piso],
    ["Parqueadero", parqueaderoLabel],
    ["Estrato", property.estrato],
    ["Administracion", property.administracion === -1 ? "Incluida en el arriendo" : property.administracion ? formatPrice(property.administracion) : null],
    ["Estado", property.estado],
  ].filter(([, v]) => v !== null && v !== undefined && v !== "") as [string, string | number][];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const colW = (pageW - margin * 2) / 2;
  features.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * colW;
    const yy = y + row * 20;
    doc.setTextColor(102, 102, 102);
    doc.text(`${sanitize(f[0])}:`, x, yy);
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.text(sanitize(f[1]), x + 110, yy);
    doc.setFont("helvetica", "normal");
  });
  y += Math.ceil(features.length / 2) * 20 + 16;

  // Ubicación
  if (property.direccion || property.barrio || property.zona) {
    ensureSpace(60);
    sectionTitle("UBICACION", 80);
    const ubic = sanitize([property.direccion, property.barrio, property.zona, property.ciudad].filter(Boolean).join(", "));
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...dark);
    const lines = doc.splitTextToSize(ubic, pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 6;

    // Link a Google Maps
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      [property.direccion, property.barrio, property.ciudad || "Cali", "Colombia"].filter(Boolean).join(", ")
    )}`;
    doc.setTextColor(...linkColor);
    doc.setFont("helvetica", "bold");
    doc.textWithLink("Ver ubicacion en Google Maps", margin, y, { url: mapsUrl });
    y += 18;
  }

  // Descripción
  if (property.descripcion) {
    ensureSpace(60);
    sectionTitle("DESCRIPCION", 95);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...dark);
    const cleanDesc = sanitize(property.descripcion);
    const lines = doc.splitTextToSize(cleanDesc, pageW - margin * 2);
    lines.forEach((line: string) => {
      ensureSpace(16);
      doc.text(line, margin, y);
      y += 14;
    });
    y += 10;
  }

  // Video
  if (property.link_video) {
    ensureSpace(50);
    sectionTitle("VIDEO", 60);
    const red = property.red_social_video
      ? property.red_social_video.charAt(0).toUpperCase() + property.red_social_video.slice(1)
      : "Video";
    doc.setTextColor(...linkColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.textWithLink(`Ver video en ${red}`, margin, y, { url: property.link_video });
    y += 18;
  }

  // Contacto destacado (clickeable)
  ensureSpace(80);
  sectionTitle("CONTACTO", 90);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const waText = sanitize(
    `Hola, me interesa la propiedad ${property.nombre_inmueble} (${propertyUrl}).`
  );
  const waLink = property.link_whatsapp || `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`;

  doc.setTextColor(...dark);
  doc.text("WhatsApp:", margin, y);
  doc.setTextColor(...linkColor);
  doc.setFont("helvetica", "bold");
  doc.textWithLink("+57 316 222 5604 (escribir por WhatsApp)", margin + 70, y, { url: waLink });
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...dark);
  doc.text("Telefono:", margin, y);
  doc.setTextColor(...linkColor);
  doc.setFont("helvetica", "bold");
  doc.textWithLink("+57 318 653 1598", margin + 70, y, { url: `tel:+${TEL_NUMBER}` });
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...dark);
  doc.text("Email:", margin, y);
  doc.setTextColor(...linkColor);
  doc.setFont("helvetica", "bold");
  doc.textWithLink(EMAIL, margin + 70, y, { url: `mailto:${EMAIL}` });
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...dark);
  doc.text("Ver online:", margin, y);
  doc.setTextColor(...linkColor);
  doc.setFont("helvetica", "bold");
  doc.textWithLink(propertyUrl, margin + 70, y, { url: propertyUrl });
  y += 18;

  // Galería
  const fotos = (property.fotos || []).filter(Boolean).slice(0, 6);
  if (fotos.length > 0) {
    doc.addPage();
    y = margin;
    sectionTitle("GALERIA DE FOTOS", 130);

    const cellW = (pageW - margin * 2 - 10) / 2;
    const cellH = 160;
    let cellY = y;
    for (let i = 0; i < fotos.length; i++) {
      const img = await imgToDataUrl(fotos[i]);
      if (!img) continue;
      const col = i % 2;
      if (col === 0 && i > 0) cellY += cellH + 10;
      if (cellY + cellH > pageH - 70) {
        doc.addPage();
        cellY = margin;
      }
      const x = margin + col * (cellW + 10);
      doc.addImage(img.data, "JPEG", x, cellY, cellW, cellH);
    }
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(...dark);
    doc.rect(0, pageH - 50, pageW, 50, "F");
    doc.setFillColor(...gold);
    doc.rect(0, pageH - 53, pageW, 3, "F");
    doc.setTextColor(...gold);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("CONTACTO", margin, pageH - 32);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    // WhatsApp clickeable también en footer
    doc.textWithLink("WhatsApp: +57 316 222 5604", margin, pageH - 18, { url: waLink });
    doc.text(`  -  Tel: +57 318 653 1598  -  ${EMAIL}  -  ${SITE}`, margin + 150, pageH - 18);
    doc.setTextColor(...gold);
    doc.text(`${p} / ${totalPages}`, pageW - margin - 30, pageH - 6);
  }

  const safeName = property.nombre_inmueble.replace(/[^a-z0-9]/gi, "_").slice(0, 40);
  doc.save(`Ficha-${safeName}.pdf`);
};
