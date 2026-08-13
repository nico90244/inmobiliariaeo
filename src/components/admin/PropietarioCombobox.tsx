import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Plus, X, User, Loader2, CreditCard } from "lucide-react";
import { Popover, PopoverContent } from "@/components/ui/popover";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

export type PropietarioSeleccionado = {
  id: string;
  nombre: string;
  apellido: string | null;
  tipo_documento: string | null;
  numero_documento: string | null;
  telefono: string | null;
  banco: string | null;
  tipo_cuenta: string | null;
  numero_cuenta: string | null;
};

type ResultItem = PropietarioSeleccionado & { inmuebles_count: number };

interface Props {
  value: string | null;
  onSelect: (p: PropietarioSeleccionado | null) => void;
  onCreateNuevo: (nombreTexto: string) => void;
  onUsarBanco?: (data: { banco: string; tipo_cuenta: string; numero_cuenta: string }) => void;
}

const PropietarioCombobox = ({ value, onSelect, onCreateNuevo, onUsarBanco }: Props) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ResultItem | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load propietario when value is set externally
  useEffect(() => {
    if (!value) { setSelected(null); return; }
    if (selected?.id === value) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("propietarios")
        .select("id, nombre, apellido, tipo_documento, numero_documento, telefono, banco, tipo_cuenta, numero_cuenta")
        .eq("id", value)
        .single();
      if (!data) return;
      const { count } = await supabase
        .from("propiedades")
        .select("*", { count: "exact", head: true })
        .eq("propietario_id" as any, value);
      setSelected({ ...data, inmuebles_count: count ?? 0 });
    })();
  }, [value]);

  // Debounced search
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const { data } = await (supabase as any)
        .from("propietarios")
        .select("id, nombre, apellido, tipo_documento, numero_documento, telefono, banco, tipo_cuenta, numero_cuenta")
        .or(`nombre.ilike.%${q}%,apellido.ilike.%${q}%,numero_documento.ilike.%${q}%`)
        .limit(6);

      const items: PropietarioSeleccionado[] = (data as any) || [];

      if (items.length > 0) {
        const ids = items.map((i) => i.id);
        const { data: propsData } = await supabase
          .from("propiedades")
          .select("propietario_id" as any)
          .in("propietario_id" as any, ids);
        const counts: Record<string, number> = {};
        (propsData || []).forEach((p: any) => {
          counts[p.propietario_id] = (counts[p.propietario_id] || 0) + 1;
        });
        setResults(items.map((i) => ({ ...i, inmuebles_count: counts[i.id] || 0 })));
      } else {
        setResults([]);
      }

      setLoading(false);
      setOpen(true);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (p: ResultItem) => {
    setSelected(p);
    setQuery("");
    setResults([]);
    setOpen(false);
    setFocusedIndex(-1);
    onSelect(p);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery("");
    setResults([]);
    onSelect(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleCreateNuevo = () => {
    const text = query.trim();
    setQuery("");
    setResults([]);
    setOpen(false);
    setFocusedIndex(-1);
    if (text) onCreateNuevo(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const total = results.length + (query.trim() ? 1 : 0);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, total - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      if (focusedIndex < results.length) handleSelect(results[focusedIndex]);
      else handleCreateNuevo();
    } else if (e.key === "Escape") {
      setOpen(false);
      setFocusedIndex(-1);
    }
  };

  // Selected card
  if (selected) {
    const n = selected.inmuebles_count;
    const hasBanco = !!(selected.banco && selected.tipo_cuenta && selected.numero_cuenta);
    return (
      <div className="animate-scale-in border border-primary/30 bg-primary/5 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-heading text-sm font-bold text-foreground">
                {selected.nombre} {selected.apellido || ""}
              </p>
              {selected.tipo_documento && selected.numero_documento && (
                <p className="font-body text-xs text-muted-foreground">
                  {selected.tipo_documento} {selected.numero_documento}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-heading text-[10px] font-semibold uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5">
              {n === 0 ? "0 INMUEBLES" : `${n} INMUEBLE${n > 1 ? "S" : ""}`}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Cambiar propietario"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        {hasBanco && onUsarBanco && (
          <button
            type="button"
            onClick={() =>
              onUsarBanco!({
                banco: selected.banco!,
                tipo_cuenta: selected.tipo_cuenta!,
                numero_cuenta: selected.numero_cuenta!,
              })
            }
            className="mt-2 flex items-center gap-1.5 font-heading text-[10px] font-semibold uppercase tracking-widest text-primary hover:underline transition-colors"
          >
            <CreditCard size={11} /> Usar datos bancarios guardados
          </button>
        )}
      </div>
    );
  }

  const showDropdown = open && (results.length > 0 || (query.trim().length > 0 && !loading));

  return (
    <Popover open={showDropdown} onOpenChange={setOpen}>
      <PopoverPrimitive.Anchor asChild>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (e.target.value.trim()) setOpen(true); }}
            onFocus={() => { if (query.trim()) setOpen(true); }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por nombre, apellido o cédula…"
            className="w-full border border-foreground/10 pl-9 pr-8 py-2 font-body text-sm focus:border-primary focus:outline-none bg-background"
            autoComplete="off"
          />
          {loading && (
            <Loader2
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin"
            />
          )}
        </div>
      </PopoverPrimitive.Anchor>

      <PopoverContent
        align="start"
        sideOffset={2}
        className="w-[--radix-popover-anchor-width] p-0 rounded-none border-foreground/15 shadow-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div role="listbox" className="py-1 max-h-56 overflow-y-auto">
          {results.map((p, i) => {
            const n = p.inmuebles_count;
            return (
              <div
                key={p.id}
                role="option"
                aria-selected={focusedIndex === i}
                onClick={() => handleSelect(p)}
                onMouseEnter={() => setFocusedIndex(i)}
                className={cn(
                  "px-3 py-2.5 cursor-pointer transition-colors",
                  focusedIndex === i ? "bg-primary/5" : "hover:bg-muted/40"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-heading text-sm font-semibold text-foreground">
                      {p.nombre} {p.apellido || ""}
                    </p>
                    {(p.tipo_documento || p.numero_documento || p.telefono) && (
                      <p className="font-body text-[11px] text-muted-foreground">
                        {p.tipo_documento && p.numero_documento
                          ? `${p.tipo_documento} ${p.numero_documento}`
                          : ""}
                        {p.telefono
                          ? (p.numero_documento ? ` · ${p.telefono}` : p.telefono)
                          : ""}
                      </p>
                    )}
                  </div>
                  {n > 0 && (
                    <span className="font-heading text-[10px] font-semibold uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 flex-shrink-0">
                      {n} INMUEBLE{n > 1 ? "S" : ""}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {query.trim() && (
            <div
              role="option"
              aria-selected={focusedIndex === results.length}
              onClick={handleCreateNuevo}
              onMouseEnter={() => setFocusedIndex(results.length)}
              className={cn(
                "px-3 py-2.5 cursor-pointer flex items-center gap-2 text-primary transition-colors",
                results.length > 0 ? "border-t border-foreground/8" : "",
                focusedIndex === results.length ? "bg-primary/5" : "hover:bg-primary/5"
              )}
            >
              <Plus size={13} className="flex-shrink-0" />
              <span className="font-heading text-[11px] font-semibold tracking-wide">
                Crear propietario nuevo:{" "}
                <span className="font-body text-foreground">"{query}"</span>
              </span>
            </div>
          )}

          {results.length === 0 && query.trim() && !loading && (
            <p className="px-3 py-2 font-body text-xs text-muted-foreground text-center">
              Sin resultados para "{query}"
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PropietarioCombobox;
