import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { RatingStars } from "@/components/ui/RatingStars";
import { BehaviourTag, behaviourTags } from "@/components/ui/BehaviourTag";
import { getShopById } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

const RateVendorPage = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const shop = getShopById(shopId || "");

  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Please rate your experience",
        description: "Select at least 1 star to continue",
        variant: "destructive",
      });
      return;
    }

    // In real app, this would send to backend
    console.log({ shopId, rating, selectedTags, feedback });
    setSubmitted(true);
    toast({
      title: "Thank you!",
      description: "Your feedback helps build trust in our community.",
    });
  };

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
          <div className="w-20 h-20 rounded-full bg-trust-verified/20 flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-trust-verified" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-muted-foreground mb-8 max-w-[280px]">
            Your feedback helps {shop.name} improve and builds trust in our community.
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
            <h1 className="text-lg font-semibold">Rate {shop.name}</h1>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Shop preview */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-lg font-bold">
              {shop.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-medium">{shop.name}</h3>
              <p className="text-sm text-muted-foreground">{shop.category}</p>
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

          {/* Text feedback */}
          <div>
            <h3 className="font-medium mb-3">Anything else to share? (Optional)</h3>
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
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Submit Rating
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default RateVendorPage;
