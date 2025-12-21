import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Users, 
  Store, 
  Shield, 
  AlertTriangle,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminStats, usePendingVendors, useApproveVendor, useRejectVendor } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { data: pendingVendors, isLoading: vendorsLoading, refetch: refetchVendors } = usePendingVendors();
  
  const approveVendor = useApproveVendor();
  const rejectVendor = useRejectVendor();

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive",
      });
      navigate("/", { replace: true });
    }
  }, [user, authLoading, isAdmin, navigate, toast]);

  const handleApprove = async (vendorId: string, vendorName: string) => {
    try {
      await approveVendor(vendorId);
      toast({ title: "Vendor Approved", description: `${vendorName} has been approved.` });
      queryClient.invalidateQueries({ queryKey: ['pending-vendors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleReject = async (vendorId: string, vendorName: string) => {
    try {
      await rejectVendor(vendorId);
      toast({ title: "Vendor Rejected", description: `${vendorName} has been rejected.` });
      queryClient.invalidateQueries({ queryKey: ['pending-vendors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRefresh = () => {
    refetchStats();
    refetchVendors();
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { icon: Store, label: "Total Vendors", value: stats?.totalVendors ?? 0, color: "text-primary" },
    { icon: Clock, label: "Pending", value: stats?.pendingApprovals ?? 0, color: "text-amber-500" },
    { icon: Users, label: "Total Users", value: stats?.totalUsers ?? 0, color: "text-emerald-500" },
    { icon: AlertTriangle, label: "Reports", value: stats?.reports ?? 0, color: "text-destructive" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-3 h-14 px-4">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">uShop Management</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-4xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="p-4 rounded-xl bg-card border border-border/50"
            >
              {statsLoading ? (
                <>
                  <Skeleton className="w-5 h-5 mb-2" />
                  <Skeleton className="w-12 h-8 mb-1" />
                  <Skeleton className="w-16 h-4" />
                </>
              ) : (
                <>
                  <Icon className={`w-5 h-5 ${color} mb-2`} />
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Pending Approvals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Pending Approvals</h2>
            {stats && stats.pendingApprovals > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-medium">
                {stats.pendingApprovals} pending
              </span>
            )}
          </div>
          
          {vendorsLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : pendingVendors && pendingVendors.length > 0 ? (
            <div className="space-y-2">
              {pendingVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="p-4 rounded-xl bg-card border border-border/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{vendor.business_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {vendor.category?.name || 'No category'} • {vendor.city || 'No location'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Applied {formatDistanceToNow(new Date(vendor.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(vendor.id, vendor.business_name)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(vendor.id, vendor.business_name)}
                      variant="destructive"
                      className="flex-1"
                      size="sm"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No pending approvals</p>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold mb-3">Management</h2>
          <Link
            to="/admin/vendors"
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-colors"
          >
            <Store className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 font-medium">All Vendors</span>
            <span className="text-sm text-muted-foreground">{stats?.totalVendors || 0}</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
          <Link
            to="/admin/reports"
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-colors"
          >
            <AlertTriangle className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 font-medium">Reports & Flags</span>
            {stats && stats.reports > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
                {stats.reports}
              </span>
            )}
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-colors"
          >
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 font-medium">User Management</span>
            <span className="text-sm text-muted-foreground">{stats?.totalUsers || 0}</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
          <Link
            to="/admin/settings"
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-colors"
          >
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 font-medium">Admin Settings</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
