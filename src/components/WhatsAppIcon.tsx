import whatsappIcon from "@/assets/whatsapp-icon.png";

const WhatsAppIcon = ({ size = 16, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) => (
  <img src={whatsappIcon} alt="Icono WhatsApp" width={size} height={size} className={`inline-block ${className}`} style={style} />
);

export default WhatsAppIcon;
