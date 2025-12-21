import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Share2, MapPin, Calendar, CheckCircle2, MessageCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductCard } from "@/components/ui/ProductCard";
import { RatingStars } from "@/components/ui/RatingStars";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { WhatsAppCTA } from "@/components/ui/WhatsAppCTA";
import { getShopById, getProductsByShopId } from "@/data/mockData";

const ShopProfilePage = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const shop = getShopById(shopId || "");
  const products = getProductsByShopId(shopId || "");

  if (!shop) {
    return (
      <AppLayout showHeader={false} showNav={false}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-xl font-bold mb-2">Shop not found</h2>
          <Link to="/" className="text-primary">Go back home</Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showHeader={false}>
      <div className="pb-24">
        {/* Cover image with back button */}
        <div className="relative h-48">
          <img
            src={shop.coverImage || shop.image}
            alt={shop.name}
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
              <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center text-2xl font-bold text-secondary-foreground shrink-0">
                {shop.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold truncate">{shop.name}</h1>
                  {shop.isVerified && (
                    <CheckCircle2 className="w-5 h-5 text-trust-verified shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <RatingStars rating={shop.rating} />
                  <span className="text-sm font-medium">{shop.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({shop.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Since {shop.since}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{shop.location}</span>
              </div>
            </div>

            {shop.gstVerified && (
              <div className="mt-3">
                <TrustBadge level="verified" label="GST/UDYAM Verified" />
              </div>
            )}

            {/* Story */}
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              {shop.story}
            </p>

            {/* WhatsApp CTA */}
            <WhatsAppCTA
              phoneNumber={shop.whatsappNumber}
              className="w-full mt-4"
            />
          </div>
        </div>

        {/* Products */}
        <div className="px-4 mt-6">
          <h2 className="text-lg font-semibold mb-3">
            Products ({products.length})
          </h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  shopId={shop.id}
                  name={product.name}
                  image={product.image}
                  price={product.price}
                  whatsappNumber={shop.whatsappNumber}
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
