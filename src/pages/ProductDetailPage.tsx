import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Share2, MapPin, MessageCircle, Store, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { WhatsAppCTA } from "@/components/ui/WhatsAppCTA";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ProductWithVendor {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_max: number | null;
  category: string | null;
  original_image_url: string | null;
  enhanced_image_url: string | null;
  highlights: string[] | null;
  vendors: {
    id: string;
    business_name: string;
    whatsapp_number: string;
    logo_url: string | null;
    city: string | null;
    location: string | null;
    is_verified: boolean | null;
  } | null;
}

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          vendors (
            id,
            business_name,
            whatsapp_number,
            logo_url,
            city,
            location,
            is_verified
          )
        `)
        .eq('id', productId!)
        .maybeSingle();
      
      if (error) throw error;
      return data as ProductWithVendor | null;
    },
    enabled: !!productId,
  });

  const formatPrice = (price: number | null, priceMax: number | null) => {
    if (!price) return "Price on request";
    if (priceMax && priceMax > price) return `₹${price} - ₹${priceMax}`;
    return `₹${price}`;
  };

  const shareProduct = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} from ${product.vendors?.business_name}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
      }
    }
  };

  if (isLoading) {
    return (
      <AppLayout showHeader={false}>
        <div className="pb-24">
          <Skeleton className="h-72 w-full" />
          <div className="px-4 py-4 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout showHeader={false} showNav={false}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <Store className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Product not found</h2>
          <p className="text-muted-foreground mb-4">This product may have been removed.</p>
          <Link to="/" className="text-primary font-medium">Go back home</Link>
        </div>
      </AppLayout>
    );
  }

  const imageUrl = product.enhanced_image_url || product.original_image_url || 
    "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600";

  return (
    <AppLayout showHeader={false}>
      <div className="pb-24">
        {/* Product Image */}
        <div className="relative">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
          
          {/* Navigation */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <Link
              to={-1 as any}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-card/80 backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <button 
              onClick={shareProduct}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-card/80 backdrop-blur-sm"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="px-4 py-4 space-y-4">
          {/* Category */}
          {product.category && (
            <span className="inline-block px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
              {product.category}
            </span>
          )}

          {/* Name & Price */}
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-xl font-semibold text-primary mt-1">
              {formatPrice(product.price, product.price_max)}
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Highlights */}
          {product.highlights && product.highlights.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.highlights.map((highlight, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-accent/20 text-accent-foreground rounded-full"
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}

          {/* Vendor Card */}
          {product.vendors && (
            <Link
              to={`/shop/${product.vendors.id}`}
              className="block p-4 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {product.vendors.logo_url ? (
                  <img
                    src={product.vendors.logo_url}
                    alt={product.vendors.business_name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-lg font-bold">
                    {product.vendors.business_name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{product.vendors.business_name}</h3>
                  {(product.vendors.city || product.vendors.location) && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{product.vendors.location || product.vendors.city}</span>
                    </div>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Link>
          )}

          {/* Contact CTA */}
          {product.vendors && (
            <div className="space-y-3">
              <WhatsAppCTA
                phoneNumber={product.vendors.whatsapp_number}
                message={`Hi! I'm interested in "${product.name}" listed at ${formatPrice(product.price, product.price_max)}. Is it available?`}
                className="w-full"
              />
              <p className="text-xs text-center text-muted-foreground">
                Contact the seller directly on WhatsApp
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
