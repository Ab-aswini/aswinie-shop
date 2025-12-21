import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface VendorStats {
  id: string;
  business_name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  shop_image_url: string | null;
  location: string | null;
  gst_number: string | null;
  udyam_number: string | null;
  totalProducts: number;
  totalViews: number;
  avgRating: number;
  reviewCount: number;
  isApproved: boolean;
  isVerified: boolean;
}

export function useCurrentVendor() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['current-vendor', user?.id],
    queryFn: async (): Promise<VendorStats | null> => {
      if (!user?.id) return null;

      // Get vendor profile
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('id, business_name, slug, description, logo_url, shop_image_url, location, gst_number, udyam_number, is_approved, is_verified')
        .eq('user_id', user.id)
        .maybeSingle();

      if (vendorError || !vendor) return null;

      // Get product count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendor.id);

      // Get total views (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: viewCount } = await supabase
        .from('product_views')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendor.id)
        .gte('viewed_at', thirtyDaysAgo.toISOString());

      // Get ratings
      const { data: ratings } = await supabase
        .from('vendor_ratings')
        .select('product_quality, behavior_score')
        .eq('vendor_id', vendor.id);

      let avgRating = 0;
      if (ratings && ratings.length > 0) {
        const total = ratings.reduce((sum, r) => 
          sum + ((r.product_quality || 0) + (r.behavior_score || 0)) / 2, 0
        );
        avgRating = total / ratings.length;
      }

      return {
        id: vendor.id,
        business_name: vendor.business_name,
        slug: vendor.slug,
        description: vendor.description,
        logo_url: vendor.logo_url,
        shop_image_url: vendor.shop_image_url,
        location: vendor.location,
        gst_number: vendor.gst_number,
        udyam_number: vendor.udyam_number,
        totalProducts: productCount || 0,
        totalViews: viewCount || 0,
        avgRating: avgRating,
        reviewCount: ratings?.length || 0,
        isApproved: vendor.is_approved || false,
        isVerified: vendor.is_verified || false,
      };
    },
    enabled: !!user?.id,
  });
}
