import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_max: number | null;
  original_image_url: string | null;
  enhanced_image_url: string | null;
  category: string | null;
  style: string | null;
  highlights: string[] | null;
  is_active: boolean | null;
}

export function useProducts(vendorId: string) {
  return useQuery({
    queryKey: ['products', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!vendorId,
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Product | null;
    },
    enabled: !!productId,
  });
}
