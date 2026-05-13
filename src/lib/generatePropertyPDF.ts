import jsPDF from "jspdf";
import type { Propiedad } from "@/hooks/usePropiedades";

const formatPrice = (price: number | null) => {
  if (!price) return "Consultar";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);
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
  doc.text("Ficha Técnica de Propiedad", margin, 52);

  let y = 100;
  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  const title = doc.splitTextToSize(property.nombre_inmueble, pageW - margin * 2);
  doc.text(title, margin, y);
  y += title.length * 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(102, 102, 102);
  const subtitle = [property.tipo_negocio, property.tipo_inmueble, property.barrio, property.ciudad].filter(Boolean).join(" · ");
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

  // Características
  const ensureSpace = (need: number) => {
    if (y + need > pageH - 60) {
      doc.addPage();
      y = margin;
    }
  };

  ensureSpace(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...dark);
  doc.text("CARACTERÍSTICAS", margin, y);
  doc.setDrawColor(...gold);
  doc.setLineWidth(1);
  doc.line(margin, y + 4, margin + 110, y + 4);
  y += 18;

  const features: [string, string | number | null | undefined][] = [
    ["Área", property.area_m2 ? `${property.area_m2} m²` : null],
    ["Habitaciones", property.habitaciones || null],
    ["Baños", property.banos || null],
    ["Piso", property.piso],
    ["Parqueadero", property.parqueadero],
    ["Estrato", property.estrato],
    ["Administración", property.administracion ? formatPrice(property.administracion) : null],
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
    doc.text(`${f[0]}:`, x, yy);
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.text(String(f[1]), x + 90, yy);
    doc.setFont("helvetica", "normal");
  });
  y += Math.ceil(features.length / 2) * 20 + 16;

  // Ubicación
  if (property.direccion || property.barrio || property.zona) {
    ensureSpace(60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("UBICACIÓN", margin, y);
    doc.line(margin, y + 4, margin + 80, y + 4);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const ubic = [property.direccion, property.barrio, property.zona, property.ciudad].filter(Boolean).join(", ");
    const lines = doc.splitTextToSize(ubic, pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 14;
  }

  // Descripción
  if (property.descripcion) {
    ensureSpace(60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...dark);
    doc.text("DESCRIPCIÓN", margin, y);
    doc.line(margin, y + 4, margin + 95, y + 4);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(property.descripcion, pageW - margin * 2);
    lines.forEach((line: string) => {
      ensureSpace(16);
      doc.text(line, margin, y);
      y += 14;
    });
    y += 10;
  }

  // Galería
  const fotos = (property.fotos || []).filter(Boolean).slice(0, 6);
  if (fotos.length > 0) {
    doc.addPage();
    y = margin;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...dark);
    doc.text("GALERÍA DE FOTOS", margin, y);
    doc.setDrawColor(...gold);
    doc.line(margin, y + 4, margin + 130, y + 4);
    y += 18;

    const cellW = (pageW - margin * 2 - 10) / 2;
    const cellH = 160;
    for (let i = 0; i < fotos.length; i++) {
      const img = await imgToDataUrl(fotos[i]);
      if (!img) continue;
      const col = i % 2;
      const row = Math.floor(i / 2);
      if (row > 0 && col === 0 && y + cellH > pageH - 60) {
        doc.addPage();
        y = margin;
      }
      const x = margin + col * (cellW + 10);
      const yy = y + Math.floor((i % 6) / 2) * (cellH + 10);
      doc.addImage(img.data, "JPEG", x, yy, cellW, cellH);
    }
  }

  // Footer / contacto
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
    doc.text("WhatsApp: +57 316 222 5604  ·  Tel: 318 653 1598", margin, pageH - 18);
    doc.text("info@inmobiliariaeo.com  ·  inmobiliariaeo.lovable.app", margin, pageH - 6);
    doc.setTextColor(...gold);
    doc.text(`${p} / ${totalPages}`, pageW - margin - 30, pageH - 6);
  }

  const safeName = property.nombre_inmueble.replace(/[^a-z0-9]/gi, "_").slice(0, 40);
  doc.save(`Ficha-${safeName}.pdf`);
};
