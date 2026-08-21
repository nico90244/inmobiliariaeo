import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tipoNegocioLabel(tipo: string | null | undefined): string {
  return tipo === "Ambos" ? "Alquiler o Venta" : (tipo || "");
}

export function formatPrice(price: number | null | undefined): string {
  if (!price) return "Consultar";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
}
