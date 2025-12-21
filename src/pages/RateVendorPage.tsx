import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Sparkles, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { RatingStars } from "@/components/ui/RatingStars";
import { BehaviourTag, behaviourTags } from "@/components/ui/BehaviourTag";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const RateVendorPage = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);

  useEffect(() => {
    const fetchShop = async () => {
      if (!shopId) return;
      const { data } = await supabase
        .from('vendors')
        .select('*, category:categories(name)')
        .eq('id', shopId)
        .single();
      setShop(data);
      setLoading(false);
    };
    fetchShop();
  }, [shopId]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const generateAIReview = async () => {
    if (rating === 0) {
      toast({ title: "Rate first", description: "Select stars before generating review", variant: "destructive" });
      return;
    }
    setIsGeneratingReview(true);
    try {
      const sentiment = rating >= 4 ? "positive" : rating >= 3 ? "neutral" : "negative";
      const { data } = await supabase.functions.invoke('ai-assist', {
        body: {
          type: 'rate-help',
          prompt: `Write a ${sentiment} review for ${shop?.business_name}. Tags: ${selectedTags.join(', ') || 'good service'}`
        }
      });
      if (data?.response) {
        setFeedback(data.response);
      }
    } catch (e) {
      toast({ title: "Failed to generate", variant: "destructive" });
    } finally {
      setIsGeneratingReview(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Please rate your experience",
        description: "Select at least 1 star to continue",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({ title: "Please login to rate", variant: "destructive" });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('vendor_ratings').insert({
        vendor_id: shopId,
        user_id: user.id,
        product_quality: rating,
        behavior_score: rating,
        behavior_tags: selectedTags,
        comment: feedback || null,
      });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Thank you!",
        description: "Your feedback helps build trust in our community.",
      });
    } catch (e: any) {
      toast({ title: "Failed to submit", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout showHeader={false} showNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!shop) {
    return (
      <AppLayout showHeader={false} showNav={false}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-xl font-bold mb-2">Shop not found</h2>
          <Link to="/" className="text-primary">Go back home</Link>
        </div>
      </AppLayout>
    );
  }

  if (submitted) {
    return (
      <AppLayout showHeader={false} showNav={false}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-muted-foreground mb-8 max-w-[280px]">
            Your feedback helps {shop.business_name} improve and builds trust in our community.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
          >
            Back to Home
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showHeader={false} showNav={false}>
      <div className="min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center gap-3 h-14 px-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">Rate {shop.business_name}</h1>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Shop preview */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-lg font-bold">
              {shop.business_name.charAt(0)}
            </div>
            <div>
              <h3 className="font-medium">{shop.business_name}</h3>
              <p className="text-sm text-muted-foreground">{shop.category?.name}</p>
            </div>
          </div>

          {/* Star rating */}
          <div className="text-center py-4">
            <h2 className="text-lg font-semibold mb-4">How was your experience?</h2>
            <div className="flex justify-center">
              <RatingStars
                rating={rating}
                size="lg"
                interactive
                onChange={setRating}
              />
            </div>
          </div>

          {/* Behaviour tags */}
          <div>
            <h3 className="font-medium mb-3">What made your visit great?</h3>
            <div className="flex flex-wrap gap-2">
              {behaviourTags.map((tag) => (
                <BehaviourTag
                  key={tag}
                  label={tag}
                  selected={selectedTags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                />
              ))}
            </div>
          </div>

          {/* Text feedback with AI */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Anything else to share?</h3>
              <button
                onClick={generateAIReview}
                disabled={isGeneratingReview}
                className="flex items-center gap-1 text-xs text-primary"
              >
                {isGeneratingReview ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                AI Suggest
              </button>
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us more about your experience..."
              className="w-full h-24 px-4 py-3 rounded-xl bg-muted/50 border border-border resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default RateVendorPage;
