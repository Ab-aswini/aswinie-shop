import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  shopId: string;
  name: string;
  image: string;
  price: number;
  description?: string;
  whatsappNumber?: string;
}

export function ProductCard({ 
  id, 
  shopId, 
  name, 
  image, 
  price, 
  description,
  whatsappNumber 
}: ProductCardProps) {
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (whatsappNumber) {
      const message = encodeURIComponent(
        `Hi! I'm interested in "${name}" (₹${price}) I saw on your uShop profile.`
      );
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
    }
  };

  return (
    <Link to={`/product/${id}`} className="product-card block">
      <div className="aspect-square overflow-hidden bg-muted">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h4 className="font-medium text-sm text-foreground line-clamp-1">{name}</h4>
        <p className="text-primary font-semibold mt-0.5">₹{price.toLocaleString()}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
        )}
        {whatsappNumber && (
          <button
            onClick={handleWhatsApp}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-whatsapp text-whatsapp-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
        )}
      </div>
    </Link>
  );
}
