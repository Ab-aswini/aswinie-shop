import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  category_type: string;
}

export function useCategories(type?: 'product' | 'service') {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (type) {
        query = query.eq('category_type', type);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Category[];
    },
  });
}
