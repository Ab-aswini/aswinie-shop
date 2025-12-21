import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Vendor {
  id: string;
  business_name: string;
  slug: string;
  description: string | null;
  shop_image_url: string | null;
  logo_url: string | null;
  location: string | null;
  city: string | null;
  whatsapp_number: string;
  years_active: number | null;
  is_verified: boolean | null;
  is_approved: boolean | null;
  category_id: string | null;
  gst_number: string | null;
  udyam_number: string | null;
  user_id: string;
  created_at: string;
  category?: {
    name: string;
    slug: string;
  } | null;
  avg_rating?: number;
  review_count?: number;
}

export function useVendors(options?: { 
  limit?: number; 
  categorySlug?: string;
  city?: string;
  featured?: boolean;
}) {
  return useQuery({
    queryKey: ['vendors', options],
    queryFn: async () => {
      let query = supabase
        .from('vendors')
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.city) {
        query = query.eq('city', options.city);
      }

      const { data: vendors, error } = await query;
      
      if (error) throw error;

      // Fetch ratings for each vendor
      const vendorIds = vendors?.map(v => v.id) || [];
      
      if (vendorIds.length > 0) {
        const { data: ratings } = await supabase
          .from('vendor_ratings')
          .select('vendor_id, product_quality, behavior_score')
          .in('vendor_id', vendorIds);

        // Calculate average ratings
        const ratingMap = new Map<string, { total: number; count: number }>();
        ratings?.forEach(r => {
          const existing = ratingMap.get(r.vendor_id) || { total: 0, count: 0 };
          const avgScore = ((r.product_quality || 0) + (r.behavior_score || 0)) / 2;
          ratingMap.set(r.vendor_id, {
            total: existing.total + avgScore,
            count: existing.count + 1
          });
        });

        return vendors?.map(vendor => ({
          ...vendor,
          avg_rating: ratingMap.get(vendor.id)?.total 
            ? ratingMap.get(vendor.id)!.total / ratingMap.get(vendor.id)!.count 
            : 4.5,
          review_count: ratingMap.get(vendor.id)?.count || 0
        })) as Vendor[];
      }

      return vendors as Vendor[];
    },
  });
}

export function useVendorBySlug(slug: string) {
  return useQuery({
    queryKey: ['vendor', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data as Vendor | null;
    },
    enabled: !!slug,
  });
}

export function useVendorById(id: string) {
  return useQuery({
    queryKey: ['vendor-id', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      
      // Get ratings
      if (data) {
        const { data: ratings } = await supabase
          .from('vendor_ratings')
          .select('product_quality, behavior_score')
          .eq('vendor_id', data.id);

        let avgRating = 4.5;
        if (ratings && ratings.length > 0) {
          const total = ratings.reduce((sum, r) => 
            sum + ((r.product_quality || 0) + (r.behavior_score || 0)) / 2, 0
          );
          avgRating = total / ratings.length;
        }

        return {
          ...data,
          avg_rating: avgRating,
          review_count: ratings?.length || 0
        } as Vendor;
      }
      
      return null;
    },
    enabled: !!id,
  });
}
