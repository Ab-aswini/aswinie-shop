import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Share2, MapPin, Store, ChevronRight, Sparkles, BadgeCheck } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { WhatsAppCTA } from "@/components/ui/WhatsAppCTA";
import { ProductImageGallery } from "@/components/ui/ProductImageGallery";
import { RelatedProducts } from "@/components/ui/RelatedProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
}

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
  vendor_id: string;
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
  const navigate = useNavigate();

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

  // Fetch additional images
  const { data: productImages } = useQuery({
    queryKey: ['product-images', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId!)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as ProductImage[];
    },
    enabled: !!productId,
  });

  // Track product view
  useEffect(() => {
    if (product && product.vendor_id) {
      supabase.from('product_views').insert({
        product_id: product.id,
        vendor_id: product.vendor_id,
      }).then(() => {});
    }
  }, [product]);

  const formatPrice = (price: number | null, priceMax: number | null) => {
    if (!price) return "Price on request";
    if (priceMax && priceMax > price) return `₹${price.toLocaleString()} - ₹${priceMax.toLocaleString()}`;
    return `₹${price.toLocaleString()}`;
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
          <Skeleton className="w-full aspect-[4/5]" />
          <div className="px-5 py-6 space-y-5">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout showHeader={false} showNav={false}>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <Store className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Product not found</h2>
          <p className="text-muted-foreground text-center mb-6">This product may have been removed or is no longer available.</p>
          <Link to="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors">
            Go back home
          </Link>
        </div>
      </AppLayout>
    );
  }

  // Build images array from product_images table + fallback to original/enhanced
  const allImages: string[] = [];
  if (productImages && productImages.length > 0) {
    allImages.push(...productImages.map(img => img.image_url));
  } else {
    // Fallback to legacy single image fields
    const fallbackImage = product.enhanced_image_url || product.original_image_url;
    if (fallbackImage) {
      allImages.push(fallbackImage);
    } else {
      allImages.push("https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600");
    }
  }

  return (
    <AppLayout showHeader={false}>
      <div className="pb-28">
        {/* Product Image Gallery */}
        <div className="relative">
          <ProductImageGallery 
            images={allImages} 
            productName={product.name} 
          />
          
          {/* Premium Navigation Header */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-xl border border-border/20"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareProduct}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-xl border border-border/20"
            >
              <Share2 className="w-5 h-5 text-foreground" />
            </motion.button>
          </div>
        </div>

        {/* Product Info - Premium Design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="px-5 py-6 space-y-5"
        >
          {/* Category Badge */}
          {product.category && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-secondary text-secondary-foreground rounded-full"
            >
              {product.category}
            </motion.span>
          )}

          {/* Name & Price Section */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-foreground">
              {product.name}
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-primary">
              {formatPrice(product.price, product.price_max)}
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-muted-foreground text-base leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Highlights */}
          {product.highlights && product.highlights.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {product.highlights.map((highlight, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full"
                >
                  <Sparkles className="w-3 h-3" />
                  {highlight}
                </motion.span>
              ))}
            </div>
          )}

          {/* Premium Vendor Card */}
          {product.vendors && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Link
                to={`/shop/${product.vendors.id}`}
                className="block p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  {/* Vendor Logo */}
                  <div className="relative">
                    {product.vendors.logo_url ? (
                      <img
                        src={product.vendors.logo_url}
                        alt={product.vendors.business_name}
                        className="w-14 h-14 rounded-xl object-cover ring-2 ring-border/30 group-hover:ring-primary/30 transition-all"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xl font-bold text-primary ring-2 ring-border/30 group-hover:ring-primary/30 transition-all">
                        {product.vendors.business_name.charAt(0)}
                      </div>
                    )}
                    {product.vendors.is_verified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <BadgeCheck className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* Vendor Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {product.vendors.business_name}
                    </h3>
                    {(product.vendors.city || product.vendors.location) && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{product.vendors.location || product.vendors.city}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Arrow */}
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Premium Contact CTA */}
          {product.vendors && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="pt-2 space-y-3"
            >
              <WhatsAppCTA
                phoneNumber={product.vendors.whatsapp_number}
                message={`Hi! I'm interested in "${product.name}" listed at ${formatPrice(product.price, product.price_max)}. Is it available?`}
                className="w-full py-4 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              />
              <p className="text-xs text-center text-muted-foreground">
                Contact the seller directly on WhatsApp
              </p>
            </motion.div>
          )}

          {/* Related Products Section */}
          {product.vendors && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="pt-6 border-t border-border/50"
            >
              <RelatedProducts
                currentProductId={product.id}
                vendorId={product.vendor_id}
                category={product.category}
                vendorName={product.vendors.business_name}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
