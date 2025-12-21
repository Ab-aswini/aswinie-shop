import { useState, useRef } from "react";
import { ArrowLeft, Upload, Camera, Sparkles, Check, Loader2, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const styleOptions = [
  { id: "clean", label: "Clean", description: "White background" },
  { id: "luxury", label: "Luxury", description: "Premium feel" },
  { id: "local", label: "Local", description: "Authentic look" },
  { id: "lifestyle", label: "Lifestyle", description: "In context" },
];

interface AIProductData {
  productName: string;
  description: string;
  highlights: string[];
  priceRange: { min: number; max: number };
  style: string;
}

const AIStudioPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("clean");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiData, setAiData] = useState<AIProductData | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setAiData(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhance = async () => {
    if (!image) return;

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: {
          type: 'enhance-image',
          imageBase64: image,
          style: selectedStyle,
        },
      });

      if (error) throw error;

      if (data?.response) {
        // Parse the JSON response from AI
        try {
          const jsonMatch = data.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            setAiData(parsed);
          }
        } catch (parseError) {
          console.error("Failed to parse AI response:", parseError);
          // Still show success but with basic data
          setAiData({
            productName: "Product",
            description: data.response,
            highlights: [],
            priceRange: { min: 0, max: 0 },
            style: selectedStyle,
          });
        }
      }

      toast({
        title: "Image analyzed!",
        description: "AI has generated product details for you.",
      });
    } catch (error: any) {
      console.error("AI enhance error:", error);
      toast({
        title: "Enhancement failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    // Store AI data in session for product creation
    if (aiData) {
      sessionStorage.setItem('ai-product-data', JSON.stringify({
        ...aiData,
        imageUrl: image,
      }));
    }
    toast({
      title: "Photo saved!",
      description: "Continue to add product details.",
    });
    navigate("/vendor/product/new");
  };

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
            <div className="flex-1">
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                AI Studio
              </h1>
              <p className="text-xs text-muted-foreground">Enhance product photos with AI</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Upload area */}
          {!image ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium">Upload Product Photo</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Take a photo or choose from gallery
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image preview */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                <img
                  src={image}
                  alt="Product"
                  className="w-full h-full object-cover"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <div className="text-center">
                      <p className="font-medium">AI is analyzing your photo...</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Generating product details
                      </p>
                    </div>
                    <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
                    </div>
                  </div>
                )}
                {aiData && !isProcessing && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    Analyzed
                  </div>
                )}
              </div>

              {/* Change photo button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 rounded-xl border border-border text-muted-foreground font-medium hover:bg-muted/50 transition-colors"
              >
                Change Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* AI Generated Data */}
          {aiData && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
              <h3 className="font-semibold text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Generated Details
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground">Product Name</span>
                  <p className="font-medium">{aiData.productName}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Description</span>
                  <p className="text-sm">{aiData.description}</p>
                </div>
                {aiData.highlights.length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground">Highlights</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {aiData.highlights.map((h, i) => (
                        <span key={i} className="px-2 py-0.5 bg-secondary text-xs rounded-full">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {aiData.priceRange.max > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground">Suggested Price</span>
                    <p className="font-medium text-primary">
                      ₹{aiData.priceRange.min} - ₹{aiData.priceRange.max}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Style selector */}
          {image && !aiData && (
            <div>
              <h3 className="font-medium mb-3">Choose Style</h3>
              <div className="grid grid-cols-2 gap-2">
                {styleOptions.map(({ id, label, description }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedStyle(id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      selectedStyle === id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="font-medium">{label}</div>
                    <div className="text-xs text-muted-foreground">{description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          {image && (
            <div className="space-y-3">
              {!aiData ? (
                <button
                  onClick={handleEnhance}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5" />
                  {isProcessing ? "Analyzing..." : "Analyze with AI"}
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity"
                >
                  Use These Details
                </button>
              )}
            </div>
          )}

          {/* Info */}
          <div className="p-4 rounded-xl bg-secondary/50">
            <h4 className="font-medium mb-2">How AI Studio works</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Upload any product photo from your phone</li>
              <li>• AI analyzes and suggests product name</li>
              <li>• Get auto-generated description & highlights</li>
              <li>• Suggested pricing based on market rates</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AIStudioPage;
