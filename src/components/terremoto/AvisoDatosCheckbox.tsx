import { Checkbox } from "@/components/ui/checkbox";

interface AvisoDatosCheckboxProps {
  /** Texto legal a mostrar — usar una de las constantes de @/lib/terremoto/textosLegales */
  texto: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

/**
 * Checkbox de consentimiento de tratamiento de datos para los formularios de la
 * Iniciativa Terremoto Colombia. El componente padre decide qué texto legal pasar
 * (búsqueda o publicación) y debe bloquear el envío del formulario mientras
 * `checked` sea false.
 */
const AvisoDatosCheckbox = ({ texto, checked, onChange, id = "aviso-datos-terremoto" }: AvisoDatosCheckboxProps) => {
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        className="mt-0.5"
      />
      <span className="font-body text-xs text-muted-foreground leading-relaxed">{texto}</span>
    </label>
  );
};

export default AvisoDatosCheckbox;
