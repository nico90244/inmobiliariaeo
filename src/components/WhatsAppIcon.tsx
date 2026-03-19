import whatsappIcon from "@/assets/whatsapp-icon.png";

const WhatsAppIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <img src={whatsappIcon} alt="WhatsApp" width={size} height={size} className={`inline-block ${className}`} />
);

export default WhatsAppIcon;
