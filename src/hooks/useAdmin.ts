import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AdminStats {
  totalVendors: number;
  pendingApprovals: number;
  totalUsers: number;
  reports: number;
}

interface PendingVendor {
  id: string;
  business_name: string;
  category: { name: string } | null;
  created_at: string;
  whatsapp_number: string;
  city: string | null;
}

interface Report {
  id: string;
  reason: string;
  description: string | null;
  status: string | null;
  created_at: string;
  reported_vendor: { business_name: string } | null;
}

export function useAdminStats() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      // Get total approved vendors
      const { count: totalVendors } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', true);

      // Get pending vendors
      const { count: pendingApprovals } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false);

      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get pending reports
      const { count: reports } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      return {
        totalVendors: totalVendors || 0,
        pendingApprovals: pendingApprovals || 0,
        totalUsers: totalUsers || 0,
        reports: reports || 0,
      };
    },
    enabled: isAdmin,
  });
}

export function usePendingVendors() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['pending-vendors'],
    queryFn: async (): Promise<PendingVendor[]> => {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, business_name, category:categories(name), created_at, whatsapp_number, city')
        .eq('is_approved', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as PendingVendor[];
    },
    enabled: isAdmin,
  });
}

export function usePendingReports() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['pending-reports'],
    queryFn: async (): Promise<Report[]> => {
      const { data, error } = await supabase
        .from('reports')
        .select('id, reason, description, status, created_at, reported_vendor:vendors(business_name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as Report[];
    },
    enabled: isAdmin,
  });
}

export function useApproveVendor() {
  return async (vendorId: string) => {
    const { error } = await supabase
      .from('vendors')
      .update({ is_approved: true, status: 'approved' })
      .eq('id', vendorId);
    
    if (error) throw error;
    return true;
  };
}

export function useRejectVendor() {
  return async (vendorId: string) => {
    const { error } = await supabase
      .from('vendors')
      .update({ status: 'rejected' })
      .eq('id', vendorId);
    
    if (error) throw error;
    return true;
  };
}

export function useResolveReport() {
  return async (reportId: string, resolution: 'resolved' | 'dismissed') => {
    const { error } = await supabase
      .from('reports')
      .update({ status: resolution })
      .eq('id', reportId);
    
    if (error) throw error;
    return true;
  };
}
