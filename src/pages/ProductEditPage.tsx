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
import { ArrowLeft, Sparkles, Loader2, ImagePlus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { MultiImageUpload } from "@/components/ui/MultiImageUpload";

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

interface ImageItem {
  id: string;
  url: string;
  file?: File;
  isNew?: boolean;
  dbId?: string; // ID from product_images table
}

export default function ProductEditPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
  const [originalImageIds, setOriginalImageIds] = useState<string[]>([]);

  // Fetch product data and images
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

      // Fetch product and images in parallel
      const [productResult, imagesResult] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .eq('vendor_id', vendor.id)
          .maybeSingle(),
        supabase
          .from('product_images')
          .select('*')
          .eq('product_id', productId)
          .order('display_order', { ascending: true }),
      ]);

      if (productResult.error || !productResult.data) {
        toast({ title: "Product not found", variant: "destructive" });
        navigate("/vendor/products");
        return;
      }

      const productData = productResult.data;
      const existingImages = imagesResult.data || [];

      setProduct(productData);
      setFormData({
        name: productData.name || "",
        description: productData.description || "",
        price: productData.price?.toString() || "",
        priceMax: productData.price_max?.toString() || "",
        category: productData.category || "",
      });

      // Load existing images from product_images table
      if (existingImages.length > 0) {
        const images: ImageItem[] = existingImages.map((img) => ({
          id: img.id,
          url: img.image_url,
          dbId: img.id,
        }));
        setProductImages(images);
        setOriginalImageIds(existingImages.map((img) => img.id));
      } else if (productData.enhanced_image_url || productData.original_image_url) {
        // Fallback to legacy single image
        const legacyUrl = productData.enhanced_image_url || productData.original_image_url;
        if (legacyUrl) {
          setProductImages([{
            id: 'legacy',
            url: legacyUrl,
          }]);
        }
      }

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
    
    if (!product || !formData.name) {
      toast({ title: "Missing information", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update product details
      const { error: updateError } = await supabase.from('products').update({
        name: formData.name,
        description: formData.description || null,
        price: formData.price ? parseFloat(formData.price) : null,
        price_max: formData.priceMax ? parseFloat(formData.priceMax) : null,
        category: formData.category || null,
      }).eq('id', product.id);

      if (updateError) throw updateError;

      // Find deleted images (were in original but not in current)
      const currentDbIds = productImages
        .filter(img => img.dbId)
        .map(img => img.dbId!);
      const deletedImageIds = originalImageIds.filter(id => !currentDbIds.includes(id));

      // Delete removed images from database
      if (deletedImageIds.length > 0) {
        await supabase
          .from('product_images')
          .delete()
          .in('id', deletedImageIds);
      }

      // Upload new images and create records
      const newImages = productImages.filter(img => img.isNew && img.file);
      const uploadPromises = newImages.map(async (image, index) => {
        if (!image.file) return null;
        
        const displayOrder = productImages.findIndex(img => img.id === image.id);
        const path = `${product.vendor_id}/${product.id}/${Date.now()}-${index}.${image.file.name.split('.').pop()}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, image.file, { upsert: true });
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(path);
        
        return {
          product_id: product.id,
          image_url: urlData.publicUrl,
          display_order: displayOrder,
          is_primary: displayOrder === 0,
        };
      });

      const newImageRecords = (await Promise.all(uploadPromises)).filter(Boolean);
      
      if (newImageRecords.length > 0) {
        const { error: insertError } = await supabase
          .from('product_images')
          .insert(newImageRecords);
        
        if (insertError) throw insertError;
      }

      // Update display_order for existing images that were reordered
      const existingImages = productImages.filter(img => img.dbId && !img.isNew);
      for (let i = 0; i < existingImages.length; i++) {
        const img = existingImages[i];
        const newOrder = productImages.findIndex(pImg => pImg.id === img.id);
        await supabase
          .from('product_images')
          .update({ display_order: newOrder, is_primary: newOrder === 0 })
          .eq('id', img.dbId);
      }

      // Update legacy image URL for backwards compatibility
      const firstImage = productImages[0];
      if (firstImage) {
        let primaryUrl = firstImage.url;
        if (firstImage.isNew && newImageRecords[0]) {
          primaryUrl = (newImageRecords[0] as any).image_url;
        }
        await supabase.from('products').update({
          original_image_url: primaryUrl,
          enhanced_image_url: primaryUrl,
        }).eq('id', product.id);
      }

      toast({ title: "Product updated!" });
      navigate("/vendor/products");
    } catch (error: any) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
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