// Agentes disponibles para citas
export const AGENTES = ["Eliana Osorio", "Valeria Osorio", "Guido Alvear"] as const;

// Horarios cada 30 min entre 8:00 y 17:00 (8am a 5pm)
export const HOURS: string[] = (() => {
  const out: string[] = [];
  for (let h = 8; h <= 17; h++) {
    out.push(`${h}:00`);
    if (h < 17) out.push(`${h}:30`);
  }
  return out;
})();

// Convierte "14:30" -> "2:30 PM"
export const formatHora12 = (hora: string): string => {
  if (!hora) return "";
  const [hStr, mStr = "00"] = hora.split(":");
  const h = parseInt(hStr, 10);
  if (isNaN(h)) return hora;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${mStr.padStart(2, "0")} ${period}`;
};
