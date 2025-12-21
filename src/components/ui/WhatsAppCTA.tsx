import { MessageCircle } from "lucide-react";

interface WhatsAppCTAProps {
  phoneNumber: string;
  message?: string;
  productName?: string;
  className?: string;
}

export function WhatsAppCTA({ 
  phoneNumber, 
  message, 
  productName,
  className = "" 
}: WhatsAppCTAProps) {
  const defaultMessage = productName
    ? `Hi! I'm interested in "${productName}" I saw on your uShop profile.`
    : "Hi! I found your shop on uShop and would like to know more.";

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message || defaultMessage);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className={`btn-whatsapp flex items-center justify-center gap-2 ${className}`}
    >
      <MessageCircle className="w-5 h-5" />
      <span>Chat on WhatsApp</span>
    </button>
  );
}
