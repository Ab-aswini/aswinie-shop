import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  category_type: string;
  parent_id: string | null;
}

export interface CategoryWithChildren extends Category {
  children?: Category[];
}

// Get all categories (flat list)
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

// Get only parent categories (main categories)
export function useParentCategories(type?: 'product' | 'service') {
  return useQuery({
    queryKey: ['parent-categories', type],
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
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

// Get sub-categories for a parent
export function useSubCategories(parentId: string | null) {
  return useQuery({
    queryKey: ['sub-categories', parentId],
    queryFn: async () => {
      if (!parentId) return [];
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', parentId)
        .order('name');
      
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!parentId,
  });
}

// Get hierarchical categories (parents with children)
export function useCategoriesHierarchy(type?: 'product' | 'service') {
  return useQuery({
    queryKey: ['categories-hierarchy', type],
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
      
      const categories = data as Category[];
      const parents = categories.filter(c => !c.parent_id);
      
      return parents.map(parent => ({
        ...parent,
        children: categories.filter(c => c.parent_id === parent.id)
      })) as CategoryWithChildren[];
    },
  });
}
