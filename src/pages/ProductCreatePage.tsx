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
import { ArrowLeft, Sparkles, Loader2, ImagePlus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MultiImageUpload } from "@/components/ui/MultiImageUpload";

interface ImageItem {
  id: string;
  url: string;
  file?: File;
  isNew?: boolean;
}

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    priceMax: "",
    category: "",
  });
  
  const [productImages, setProductImages] = useState<ImageItem[]>([]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vendorId || !formData.name) {
      toast({ title: "Missing information", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the product first
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          vendor_id: vendorId,
          name: formData.name,
          description: formData.description || null,
          price: formData.price ? parseFloat(formData.price) : null,
          price_max: formData.priceMax ? parseFloat(formData.priceMax) : null,
          category: formData.category || null,
          is_active: true,
        })
        .select('id')
        .single();

      if (productError) throw productError;

      // Upload images to storage and create product_images records
      const uploadPromises = productImages.map(async (image, index) => {
        if (!image.file) return null;
        
        const path = `${vendorId}/${newProduct.id}/${Date.now()}-${index}.${image.file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, image.file, { upsert: true });
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(path);
        
        return {
          product_id: newProduct.id,
          image_url: urlData.publicUrl,
          display_order: index,
          is_primary: index === 0,
        };
      });

      const imageRecords = (await Promise.all(uploadPromises)).filter(Boolean);
      
      if (imageRecords.length > 0) {
        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageRecords);
        
        if (imagesError) throw imagesError;
        
        // Also set the first image as the legacy image URL for backwards compatibility
        await supabase.from('products').update({
          original_image_url: imageRecords[0]?.image_url,
          enhanced_image_url: imageRecords[0]?.image_url,
        }).eq('id', newProduct.id);
      }

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
                Product Images
              </CardTitle>
              <CardDescription>Upload up to 5 photos</CardDescription>
            </CardHeader>
            <CardContent>
              <MultiImageUpload
                images={productImages}
                onImagesChange={setProductImages}
                maxImages={5}
                isUploading={isSubmitting}
              />
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
