import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Eye, Star, TrendingUp, Package, Users, Calendar } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, LineChart, Line } from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

interface AnalyticsData {
  totalViews: number;
  totalRatings: number;
  avgProductQuality: number;
  avgBehaviorScore: number;
  productCount: number;
  viewsByDay: { date: string; views: number }[];
  ratingsByDay: { date: string; ratings: number; avgScore: number }[];
  topProducts: { name: string; views: number }[];
}

export default function VendorAnalyticsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange] = useState(30); // Last 30 days

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return;

      // Get vendor ID
      const { data: vendor } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!vendor) {
        navigate("/vendor/register");
        return;
      }

      setVendorId(vendor.id);

      const startDate = startOfDay(subDays(new Date(), dateRange));
      const endDate = new Date();

      // Fetch all analytics data in parallel
      const [viewsResult, ratingsResult, productsResult] = await Promise.all([
        supabase
          .from("product_views")
          .select("viewed_at, product_id, products(name)")
          .eq("vendor_id", vendor.id)
          .gte("viewed_at", startDate.toISOString()),
        supabase
          .from("vendor_ratings")
          .select("*")
          .eq("vendor_id", vendor.id),
        supabase
          .from("products")
          .select("id, name")
          .eq("vendor_id", vendor.id)
          .eq("is_active", true),
      ]);

      const views = viewsResult.data || [];
      const ratings = ratingsResult.data || [];
      const products = productsResult.data || [];

      // Calculate views by day
      const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
      const viewsByDay = dateInterval.map((date) => {
        const dayViews = views.filter(
          (v) => format(new Date(v.viewed_at), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
        );
        return {
          date: format(date, "MMM dd"),
          views: dayViews.length,
        };
      });

      // Calculate ratings by day
      const ratingsByDay = dateInterval.map((date) => {
        const dayRatings = ratings.filter(
          (r) => format(new Date(r.created_at), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
        );
        const avgScore = dayRatings.length > 0
          ? dayRatings.reduce((sum, r) => sum + (r.product_quality || 0), 0) / dayRatings.length
          : 0;
        return {
          date: format(date, "MMM dd"),
          ratings: dayRatings.length,
          avgScore: Math.round(avgScore * 10) / 10,
        };
      });

      // Calculate top products by views
      const productViewCounts: Record<string, { name: string; views: number }> = {};
      views.forEach((v: any) => {
        const productName = v.products?.name || "Unknown";
        if (!productViewCounts[v.product_id]) {
          productViewCounts[v.product_id] = { name: productName, views: 0 };
        }
        productViewCounts[v.product_id].views++;
      });
      const topProducts = Object.values(productViewCounts)
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      // Calculate averages
      const avgProductQuality = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + (r.product_quality || 0), 0) / ratings.length
        : 0;
      const avgBehaviorScore = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + (r.behavior_score || 0), 0) / ratings.length
        : 0;

      setAnalytics({
        totalViews: views.length,
        totalRatings: ratings.length,
        avgProductQuality: Math.round(avgProductQuality * 10) / 10,
        avgBehaviorScore: Math.round(avgBehaviorScore * 10) / 10,
        productCount: products.length,
        viewsByDay,
        ratingsByDay,
        topProducts,
      });

      setIsLoading(false);
    }

    if (!authLoading) {
      if (!user) {
        navigate("/auth");
      } else {
        fetchAnalytics();
      }
    }
  }, [user, authLoading, navigate, dateRange]);

  if (authLoading || isLoading) {
    return (
      <AppLayout showNav={false}>
        <div className="px-4 py-4 space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </AppLayout>
    );
  }

  if (!analytics) return null;

  const chartConfig = {
    views: { label: "Views", color: "hsl(var(--primary))" },
    ratings: { label: "Ratings", color: "hsl(var(--chart-2))" },
    avgScore: { label: "Avg Score", color: "hsl(var(--chart-3))" },
  };

  return (
    <AppLayout showNav={false}>
      <div className="px-4 py-4 space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground">Last {dateRange} days performance</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total Views</span>
              </div>
              <p className="text-2xl font-bold">{analytics.totalViews}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-muted-foreground">Avg Rating</span>
              </div>
              <p className="text-2xl font-bold">{analytics.avgProductQuality || "-"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Reviews</span>
              </div>
              <p className="text-2xl font-bold">{analytics.totalRatings}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Products</span>
              </div>
              <p className="text-2xl font-bold">{analytics.productCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Views Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Product Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-48 w-full">
              <AreaChart data={analytics.viewsByDay}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(var(--primary))"
                  fill="url(#viewsGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Ratings Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-4 h-4" />
              Ratings Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-48 w-full">
              <LineChart data={analytics.ratingsByDay}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        {analytics.topProducts.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-4 h-4" />
                Top Viewed Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-40 w-full">
                <BarChart data={analytics.topProducts} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 11 }} 
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="views" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Empty State for New Vendors */}
        {analytics.totalViews === 0 && analytics.totalRatings === 0 && (
          <Card className="bg-muted/50">
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">No data yet</h3>
              <p className="text-sm text-muted-foreground">
                Analytics will appear here as customers view and rate your products.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}