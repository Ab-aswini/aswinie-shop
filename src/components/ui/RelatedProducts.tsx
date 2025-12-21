import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface RelatedProductsProps {
  currentProductId: string;
  vendorId: string;
  category: string | null;
  vendorName: string;
}

interface Product {
  id: string;
  name: string;
  price: number | null;
  price_max: number | null;
  original_image_url: string | null;
  enhanced_image_url: string | null;
}

export function RelatedProducts({ currentProductId, vendorId, category, vendorName }: RelatedProductsProps) {
  // Fetch products from same vendor
  const { data: vendorProducts, isLoading: loadingVendor } = useQuery({
    queryKey: ['related-vendor-products', vendorId, currentProductId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, price_max, original_image_url, enhanced_image_url')
        .eq('vendor_id', vendorId)
        .neq('id', currentProductId)
        .eq('is_active', true)
        .limit(6);
      
      if (error) throw error;
      return data as Product[];
    },
  });

  // Fetch products from same category (different vendors)
  const { data: categoryProducts, isLoading: loadingCategory } = useQuery({
    queryKey: ['related-category-products', category, currentProductId, vendorId],
    queryFn: async () => {
      if (!category) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, price_max, original_image_url, enhanced_image_url')
        .eq('category', category)
        .neq('id', currentProductId)
        .neq('vendor_id', vendorId)
        .eq('is_active', true)
        .limit(6);
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!category,
  });

  const formatPrice = (price: number | null, priceMax: number | null) => {
    if (!price) return "Price on request";
    if (priceMax && priceMax > price) return `₹${price.toLocaleString()}+`;
    return `₹${price.toLocaleString()}`;
  };

  const getImageUrl = (product: Product) => {
    return product.enhanced_image_url || product.original_image_url || 
      "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=300";
  };

  const ProductCard = ({ product, index }: { product: Product; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        to={`/product/${product.id}`}
        className="block group"
      >
        <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-2">
          <img
            src={getImageUrl(product)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <h4 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {product.name}
        </h4>
        <p className="text-sm font-semibold text-primary">
          {formatPrice(product.price, product.price_max)}
        </p>
      </Link>
    </motion.div>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i}>
          <Skeleton className="aspect-square rounded-xl mb-2" />
          <Skeleton className="h-4 w-3/4 mb-1" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );

  const hasVendorProducts = vendorProducts && vendorProducts.length > 0;
  const hasCategoryProducts = categoryProducts && categoryProducts.length > 0;

  if (!hasVendorProducts && !hasCategoryProducts && !loadingVendor && !loadingCategory) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* More from this vendor */}
      {(loadingVendor || hasVendorProducts) && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">
              More from {vendorName}
            </h3>
            <Link 
              to={`/shop/${vendorId}`}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loadingVendor ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {vendorProducts?.slice(0, 6).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Similar products */}
      {(loadingCategory || hasCategoryProducts) && category && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">
              Similar in {category}
            </h3>
            <Link 
              to={`/explore?category=${encodeURIComponent(category)}`}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Explore
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loadingCategory ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categoryProducts?.slice(0, 6).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
