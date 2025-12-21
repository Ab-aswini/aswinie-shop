import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Sparkles, Loader2, Wand2, ImagePlus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    priceMax: "",
    category: "",
  });
  
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);

  // Check if user is a vendor
  useEffect(() => {
    async function checkVendor() {
      if (!user) return;
      const { data } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setVendorId(data.id);
      } else {
        toast({ title: "Not a vendor", description: "Please register as a vendor first.", variant: "destructive" });
        navigate("/vendor/register");
      }
    }
    if (!loading) checkVendor();
  }, [user, loading, navigate, toast]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      setEnhancedImage(null);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const enhanceWithAI = async () => {
    if (!imagePreview) return;
    
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: {
          type: 'enhance-product-image',
          imageBase64: imagePreview,
        },
      });
      
      if (error) throw error;
      
      if (data?.enhancedImage) {
        setEnhancedImage(data.enhancedImage);
        toast({ title: "Image enhanced!" });
      }
      
      // Auto-fill form if AI extracted product info
      if (data?.productInfo) {
        const info = data.productInfo;
        if (info.productName && !formData.name) {
          setFormData(prev => ({ ...prev, name: info.productName }));
        }
        if (info.description && !formData.description) {
          setFormData(prev => ({ ...prev, description: info.description }));
        }
        if (info.priceRange?.min && !formData.price) {
          setFormData(prev => ({ 
            ...prev, 
            price: String(info.priceRange.min),
            priceMax: info.priceRange.max ? String(info.priceRange.max) : ""
          }));
        }
      }
    } catch (e) {
      toast({ title: "Enhancement failed", variant: "destructive" });
    } finally {
      setIsEnhancing(false);
    }
  };

  const generateDescription = async () => {
    if (!formData.name) {
      toast({ title: "Enter product name first", variant: "destructive" });
      return;
    }
    
    setIsGeneratingDesc(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: {
          type: 'suggest-product-description',
          productName: formData.name,
          category: formData.category,
        },
      });
      
      if (error) throw error;
      if (data?.response) {
        setFormData(prev => ({ ...prev, description: data.response }));
        toast({ title: "Description generated!" });
      }
    } catch (e) {
      toast({ title: "Failed to generate", variant: "destructive" });
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const uploadImage = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true });
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(path);
    
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vendorId || !formData.name) {
      toast({ title: "Missing information", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      let originalImageUrl = null;
      let enhancedImageUrl = null;

      // Upload original image
      if (productImage) {
        const path = `${vendorId}/${Date.now()}-original.${productImage.name.split('.').pop()}`;
        originalImageUrl = await uploadImage(productImage, path);
      }

      // Upload enhanced image if exists (convert base64 to blob)
      if (enhancedImage) {
        const response = await fetch(enhancedImage);
        const blob = await response.blob();
        const path = `${vendorId}/${Date.now()}-enhanced.png`;
        const { error } = await supabase.storage
          .from('product-images')
          .upload(path, blob, { upsert: true });
        
        if (!error) {
          const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(path);
          enhancedImageUrl = urlData.publicUrl;
        }
      }

      // Create product
      const { error } = await supabase.from('products').insert({
        vendor_id: vendorId,
        name: formData.name,
        description: formData.description || null,
        price: formData.price ? parseFloat(formData.price) : null,
        price_max: formData.priceMax ? parseFloat(formData.priceMax) : null,
        category: formData.category || null,
        original_image_url: originalImageUrl,
        enhanced_image_url: enhancedImageUrl || originalImageUrl,
        is_active: true,
      });

      if (error) throw error;

      toast({ title: "Product added!" });
      navigate("/vendor/dashboard");
    } catch (error: any) {
      toast({ title: "Failed to add product", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
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
            <h1 className="text-xl font-bold">Add Product</h1>
            <p className="text-sm text-muted-foreground">List a new item for sale</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImagePlus className="w-5 h-5" />
                Product Image
              </CardTitle>
              <CardDescription>Upload and enhance with AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => document.getElementById('product-image')?.click()}
              >
                {imagePreview ? (
                  <img src={enhancedImage || imagePreview} alt="Preview" className="w-full h-48 object-contain rounded-lg" />
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Tap to upload product photo</p>
                  </>
                )}
                <input
                  id="product-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {imagePreview && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={enhanceWithAI}
                  disabled={isEnhancing}
                >
                  {isEnhancing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  {isEnhancing ? "Enhancing..." : "AI Enhance & Extract Info"}
                </Button>
              )}

              {enhancedImage && (
                <p className="text-xs text-center text-primary">✓ AI enhanced image ready</p>
              )}
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Cotton Saree, Mobile Cover"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary"
                    disabled={!formData.name || isGeneratingDesc}
                    onClick={generateDescription}
                  >
                    {isGeneratingDesc ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 mr-1" />
                    )}
                    AI Suggest
                  </Button>
                </div>
                <Textarea
                  id="description"
                  placeholder="Describe your product..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., sarees, electronics, groceries"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Min price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceMax">Max Price (₹)</Label>
                  <Input
                    id="priceMax"
                    type="number"
                    placeholder="Optional"
                    value={formData.priceMax}
                    onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={isSubmitting || !formData.name}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Product"
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
