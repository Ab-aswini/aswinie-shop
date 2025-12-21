import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Share2, MapPin, Calendar, CheckCircle2, MessageCircle, Store as StoreIcon, Navigation } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductCard } from "@/components/ui/ProductCard";
import { RatingStars } from "@/components/ui/RatingStars";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { WhatsAppCTA } from "@/components/ui/WhatsAppCTA";
import { useVendorById } from "@/hooks/useVendors";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const ShopProfilePage = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const { data: shop, isLoading: shopLoading } = useVendorById(shopId || "");
  const { data: products, isLoading: productsLoading } = useProducts(shopId || "");

  if (shopLoading) {
    return (
      <AppLayout showHeader={false}>
        <div className="pb-24">
          <Skeleton className="h-48 w-full" />
          <div className="px-4 -mt-8 relative">
            <div className="bg-card rounded-2xl p-4 shadow-elevated space-y-4">
              <div className="flex items-start gap-4">
                <Skeleton className="w-16 h-16 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!shop) {
    return (
      <AppLayout showHeader={false} showNav={false}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <StoreIcon className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Shop not found</h2>
          <p className="text-muted-foreground mb-4">This shop may have been removed or doesn't exist.</p>
          <Link to="/" className="text-primary font-medium">Go back home</Link>
        </div>
      </AppLayout>
    );
  }

  const yearsSince = new Date().getFullYear() - (shop.years_active || 0);

  return (
    <AppLayout showHeader={false}>
      <div className="pb-24">
        {/* Cover image with back button */}
        <div className="relative h-48">
          <img
            src={shop.shop_image_url || "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=400&fit=crop"}
            alt={shop.business_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <Link
              to="/"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-card/80 backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-card/80 backdrop-blur-sm">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Shop info */}
        <div className="px-4 -mt-8 relative">
          <div className="bg-card rounded-2xl p-4 shadow-elevated">
            <div className="flex items-start gap-4">
              {shop.logo_url ? (
                <img 
                  src={shop.logo_url} 
                  alt={shop.business_name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center text-2xl font-bold text-secondary-foreground shrink-0">
                  {shop.business_name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold truncate">{shop.business_name}</h1>
                  {shop.is_verified && (
                    <CheckCircle2 className="w-5 h-5 text-trust-verified shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <RatingStars rating={shop.avg_rating || 4.5} />
                  <span className="text-sm font-medium">{(shop.avg_rating || 4.5).toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({shop.review_count || 0} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {shop.years_active && shop.years_active > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{shop.years_active}+ years</span>
                </div>
              )}
              {(shop.city || shop.location) && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{shop.location || shop.city}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary gap-1"
                    onClick={() => {
                      const query = encodeURIComponent(shop.location || shop.city || '');
                      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                    }}
                  >
                    <Navigation className="w-3 h-3" />
                    Get Directions
                  </Button>
                </div>
              )}
            </div>

            {(shop.gst_number || shop.udyam_number) && (
              <div className="mt-3">
                <TrustBadge level="verified" label="GST/UDYAM Verified" />
              </div>
            )}

            {/* Description */}
            {shop.description && (
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                {shop.description}
              </p>
            )}

            {/* WhatsApp CTA */}
            <WhatsAppCTA
              phoneNumber={shop.whatsapp_number}
              className="w-full mt-4"
            />
          </div>
        </div>

        {/* Products */}
        <div className="px-4 mt-6">
          <h2 className="text-lg font-semibold mb-3">
            Products ({products?.length || 0})
          </h2>
          {productsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  shopId={shop.id}
                  name={product.name}
                  image={product.enhanced_image_url || product.original_image_url || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=400&fit=crop"}
                  price={product.price || 0}
                  whatsappNumber={shop.whatsapp_number}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/30 rounded-xl">
              <p className="text-muted-foreground">No products listed yet</p>
            </div>
          )}
        </div>

        {/* Rate this shop */}
        <div className="px-4 mt-6">
          <Link
            to={`/rate/vendor/${shop.id}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-primary text-primary font-medium hover:bg-primary/5 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Rate this shop
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default ShopProfilePage;
