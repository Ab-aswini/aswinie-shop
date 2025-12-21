import { 
  Users, 
  Store, 
  Shield, 
  AlertTriangle,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Mock admin data
  const stats = {
    totalVendors: 24,
    pendingApprovals: 5,
    totalUsers: 156,
    reports: 2,
  };

  const pendingVendors = [
    { id: "v1", name: "Fresh Grocers", category: "Food", date: "2 hours ago" },
    { id: "v2", name: "Tech Hub", category: "Electronics", date: "5 hours ago" },
    { id: "v3", name: "Style Studio", category: "Clothing", date: "1 day ago" },
  ];

  const statCards = [
    { icon: Store, label: "Total Vendors", value: stats.totalVendors, color: "text-primary" },
    { icon: Clock, label: "Pending", value: stats.pendingApprovals, color: "text-accent" },
    { icon: Users, label: "Total Users", value: stats.totalUsers, color: "text-trust-verified" },
    { icon: AlertTriangle, label: "Reports", value: stats.reports, color: "text-destructive" },
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
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="p-4 rounded-xl bg-card border border-border/50"
            >
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* Pending Approvals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Pending Approvals</h2>
            <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-medium">
              {stats.pendingApprovals} new
            </span>
          </div>
          <div className="space-y-2">
            {pendingVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="p-4 rounded-xl bg-card border border-border/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{vendor.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {vendor.category} • {vendor.date}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-lg bg-trust-verified/20 text-trust-verified font-medium text-sm flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button className="flex-1 py-2 rounded-lg bg-destructive/20 text-destructive font-medium text-sm flex items-center justify-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <Link
            to="/admin/vendors"
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-colors"
          >
            <Store className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 font-medium">All Vendors</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
          <Link
            to="/admin/reports"
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-colors"
          >
            <AlertTriangle className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 font-medium">Reports & Flags</span>
            {stats.reports > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
                {stats.reports}
              </span>
            )}
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
