import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Sparkles, Loader2, Wand2, ImagePlus, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_max: number | null;
  category: string | null;
  original_image_url: string | null;
  enhanced_image_url: string | null;
  vendor_id: string;
}

export default function ProductEditPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      if (!user || !productId) return;
      
      // First get vendor ID
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

      // Fetch product
      const { data: productData, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('vendor_id', vendor.id)
        .maybeSingle();

      if (error || !productData) {
        toast({ title: "Product not found", variant: "destructive" });
        navigate("/vendor/products");
        return;
      }

      setProduct(productData);
      setFormData({
        name: productData.name || "",
        description: productData.description || "",
        price: productData.price?.toString() || "",
        priceMax: productData.price_max?.toString() || "",
        category: productData.category || "",
      });
      setExistingImageUrl(productData.enhanced_image_url || productData.original_image_url);
      setIsLoading(false);
    }

    if (!authLoading && user) {
      fetchProduct();
    }
  }, [user, authLoading, productId, navigate, toast]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

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
    
    if (!product || !formData.name) {
      toast({ title: "Missing information", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      let originalImageUrl = product.original_image_url;
      let enhancedImageUrl = product.enhanced_image_url;

      // Upload new original image if changed
      if (productImage) {
        const path = `${product.vendor_id}/${Date.now()}-original.${productImage.name.split('.').pop()}`;
        originalImageUrl = await uploadImage(productImage, path);
        enhancedImageUrl = originalImageUrl; // Reset enhanced if new original
      }

      // Upload enhanced image if exists
      if (enhancedImage) {
        const response = await fetch(enhancedImage);
        const blob = await response.blob();
        const path = `${product.vendor_id}/${Date.now()}-enhanced.png`;
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

      // Update product
      const { error } = await supabase.from('products').update({
        name: formData.name,
        description: formData.description || null,
        price: formData.price ? parseFloat(formData.price) : null,
        price_max: formData.priceMax ? parseFloat(formData.priceMax) : null,
        category: formData.category || null,
        original_image_url: originalImageUrl,
        enhanced_image_url: enhancedImageUrl,
      }).eq('id', product.id);

      if (error) throw error;

      toast({ title: "Product updated!" });
      navigate("/vendor/products");
    } catch (error: any) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setProductImage(null);
    setImagePreview(null);
    setEnhancedImage(null);
  };

  if (authLoading || isLoading) {
    return (
      <AppLayout showNav={false}>
        <div className="px-4 py-4 space-y-6 max-w-lg mx-auto">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AppLayout>
    );
  }

  const displayImage = enhancedImage || imagePreview || existingImageUrl;

  return (
    <AppLayout showNav={false}>
      <div className="px-4 py-4 space-y-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Edit Product</h1>
            <p className="text-sm text-muted-foreground">Update product details</p>
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
              <CardDescription>Update or enhance with AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors relative"
                onClick={() => document.getElementById('product-image')?.click()}
              >
                {displayImage ? (
                  <>
                    <img src={displayImage} alt="Preview" className="w-full h-48 object-contain rounded-lg" />
                    {(imagePreview || existingImageUrl) && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </>
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
                  {isEnhancing ? "Enhancing..." : "AI Enhance Image"}
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
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
