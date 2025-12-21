import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Star, MessageSquare, TrendingUp, Calendar } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { BehaviourTag } from "@/components/ui/BehaviourTag";
import { format } from "date-fns";

interface Rating {
  id: string;
  product_quality: number | null;
  behavior_score: number | null;
  behavior_tags: string[] | null;
  comment: string | null;
  created_at: string;
  user_id: string;
}

export default function VendorRatingsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    avgQuality: 0,
    avgBehavior: 0,
    totalRatings: 0,
  });

  useEffect(() => {
    async function fetchRatings() {
      if (!user) return;
      
      // Get vendor ID
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!vendor) {
        toast({ title: "Not a vendor", variant: "destructive" });
        navigate("/vendor/register");
        return;
      }

      // Fetch ratings
      const { data: ratingsData, error } = await supabase
        .from('vendor_ratings')
        .select('*')
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({ title: "Failed to load ratings", variant: "destructive" });
        return;
      }

      setRatings(ratingsData || []);

      // Calculate stats
      if (ratingsData && ratingsData.length > 0) {
        const qualityRatings = ratingsData.filter(r => r.product_quality !== null);
        const behaviorRatings = ratingsData.filter(r => r.behavior_score !== null);
        
        const avgQ = qualityRatings.length > 0
          ? qualityRatings.reduce((sum, r) => sum + (r.product_quality || 0), 0) / qualityRatings.length
          : 0;
        const avgB = behaviorRatings.length > 0
          ? behaviorRatings.reduce((sum, r) => sum + (r.behavior_score || 0), 0) / behaviorRatings.length
          : 0;
        
        setStats({
          avgQuality: avgQ,
          avgBehavior: avgB,
          totalRatings: ratingsData.length,
        });
      }
      
      setIsLoading(false);
    }

    if (!authLoading) {
      if (!user) {
        navigate("/auth");
      } else {
        fetchRatings();
      }
    }
  }, [user, authLoading, navigate, toast]);

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-muted-foreground text-sm">No rating</span>;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
        <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (authLoading || isLoading) {
    return (
      <AppLayout showNav={false}>
        <div className="px-4 py-4 space-y-6 max-w-lg mx-auto">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showNav={false}>
      <div className="px-4 py-4 space-y-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Ratings & Reviews</h1>
            <p className="text-sm text-muted-foreground">Customer feedback on your business</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-5 h-5 mx-auto mb-2 text-amber-400" />
              <div className="text-xl font-bold">{stats.avgQuality.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Product Quality</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-2 text-primary" />
              <div className="text-xl font-bold">{stats.avgBehavior.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Behavior Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xl font-bold">{stats.totalRatings}</div>
              <div className="text-xs text-muted-foreground">Total Reviews</div>
            </CardContent>
          </Card>
        </div>

        {/* Ratings List */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">All Reviews</h2>
          
          {ratings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-semibold mb-2">No reviews yet</h3>
                <p className="text-sm text-muted-foreground">
                  When customers rate your business, reviews will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            ratings.map((rating) => (
              <Card key={rating.id}>
                <CardContent className="p-4 space-y-3">
                  {/* Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(rating.created_at), "dd MMM yyyy")}
                    </div>
                  </div>

                  {/* Ratings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Product Quality</p>
                      {renderStars(rating.product_quality)}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Behavior</p>
                      {renderStars(rating.behavior_score)}
                    </div>
                  </div>

                  {/* Behavior Tags */}
                  {rating.behavior_tags && rating.behavior_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {rating.behavior_tags.map((tag) => (
                        <BehaviourTag key={tag} label={tag} />
                      ))}
                    </div>
                  )}

                  {/* Comment */}
                  {rating.comment && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground italic">"{rating.comment}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
