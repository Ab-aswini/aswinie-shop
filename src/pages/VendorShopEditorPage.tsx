import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Store,
  Save,
  Loader2,
  Camera,
  MapPin,
  FileText,
  Phone,
  Upload,
  X,
  Crop
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentVendor } from "@/hooks/useCurrentVendor";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageCropper } from "@/components/ui/ImageCropper";

const shopEditorSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  location: z.string().max(200, "Location must be less than 200 characters").optional(),
  whatsapp_number: z.string().min(10, "Enter a valid WhatsApp number"),
  gst_number: z.string().optional(),
  udyam_number: z.string().optional(),
});

type ShopEditorFormValues = z.infer<typeof shopEditorSchema>;

const VendorShopEditorPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: vendor, isLoading: vendorLoading, refetch } = useCurrentVendor();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  // Cropper states
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperType, setCropperType] = useState<'logo' | 'cover'>('logo');
  const [cropperImage, setCropperImage] = useState<string>('');

  const form = useForm<ShopEditorFormValues>({
    resolver: zodResolver(shopEditorSchema),
    defaultValues: {
      business_name: "",
      description: "",
      location: "",
      whatsapp_number: "",
      gst_number: "",
      udyam_number: "",
    },
  });

  // Populate form when vendor data loads
  useEffect(() => {
    if (vendor) {
      form.reset({
        business_name: vendor.business_name || "",
        description: vendor.description || "",
        location: vendor.location || "",
        whatsapp_number: "",
        gst_number: vendor.gst_number || "",
        udyam_number: vendor.udyam_number || "",
      });
      setLogoPreview(vendor.logo_url);
      setCoverPreview(vendor.shop_image_url);
      
      fetchWhatsappNumber();
    }
  }, [vendor]);

  const fetchWhatsappNumber = async () => {
    if (!vendor?.id) return;
    const { data } = await supabase
      .from('vendors')
      .select('whatsapp_number')
      .eq('id', vendor.id)
      .single();
    if (data) {
      form.setValue('whatsapp_number', data.whatsapp_number);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'cover'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 10MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setCropperImage(e.target?.result as string);
      setCropperType(type);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], `${cropperType}-${Date.now()}.jpg`, { type: 'image/jpeg' });
    const previewUrl = URL.createObjectURL(croppedBlob);
    
    if (cropperType === 'logo') {
      setLogoFile(file);
      setLogoPreview(previewUrl);
    } else {
      setCoverFile(file);
      setCoverPreview(previewUrl);
    }
  };

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('shop-images')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('shop-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const onSubmit = async (values: ShopEditorFormValues) => {
    if (!vendor?.id) return;

    setIsSaving(true);
    try {
      let logoUrl = vendor.logo_url;
      let shopImageUrl = vendor.shop_image_url;

      if (logoFile) {
        const url = await uploadImage(logoFile, `logos/${vendor.id}`);
        if (url) logoUrl = url;
      }

      if (coverFile) {
        const url = await uploadImage(coverFile, `covers/${vendor.id}`);
        if (url) shopImageUrl = url;
      }

      const { error } = await supabase
        .from('vendors')
        .update({
          business_name: values.business_name,
          description: values.description || null,
          location: values.location || null,
          whatsapp_number: values.whatsapp_number,
          gst_number: values.gst_number || null,
          udyam_number: values.udyam_number || null,
          logo_url: logoUrl,
          shop_image_url: shopImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', vendor.id);

      if (error) throw error;

      toast({
        title: "Shop updated",
        description: "Your shop details have been saved.",
      });

      queryClient.invalidateQueries({ queryKey: ['current-vendor'] });
      refetch();
      
      navigate('/vendor/dashboard');
    } catch (error: any) {
      console.error('Error updating shop:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update shop details",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || vendorLoading) {
    return (
      <AppLayout>
        <div className="px-4 py-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
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
              <h1 className="text-lg font-semibold">Edit Shop</h1>
            </div>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSaving}
              size="sm"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Cover Image */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Crop className="w-4 h-4" />
                  Cover Image (16:9)
                </Label>
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-muted border-2 border-dashed border-border">
                  {coverPreview ? (
                    <>
                      <img
                        src={coverPreview}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <label className="p-1.5 rounded-full bg-background/80 hover:bg-background cursor-pointer">
                          <Crop className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileSelect(e, 'cover')}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setCoverPreview(null);
                            setCoverFile(null);
                          }}
                          className="p-1.5 rounded-full bg-background/80 hover:bg-background"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-muted/80 transition-colors">
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Upload & crop cover image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, 'cover')}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Logo */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Crop className="w-4 h-4" />
                  Shop Logo (Square)
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted border-2 border-dashed border-border">
                    {logoPreview ? (
                      <>
                        <img
                          src={logoPreview}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 right-1 flex gap-0.5">
                          <label className="p-1 rounded-full bg-background/80 hover:bg-background cursor-pointer">
                            <Crop className="w-3 h-3" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileSelect(e, 'logo')}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setLogoPreview(null);
                              setLogoFile(null);
                            }}
                            className="p-1 rounded-full bg-background/80 hover:bg-background"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-muted/80 transition-colors">
                        <Camera className="w-6 h-6 text-muted-foreground" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileSelect(e, 'logo')}
                        />
                      </label>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Shop Logo</p>
                    <p className="text-xs text-muted-foreground">
                      Square image, auto-cropped
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Name */}
              <FormField
                control={form.control}
                name="business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Store className="w-4 h-4" />
                      Business Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Your business name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell customers about your business..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* WhatsApp Number */}
              <FormField
                control={form.control}
                name="whatsapp_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      WhatsApp Number
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+91 9876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location / Address
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Shop address or area"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Verification Documents */}
              <div className="p-4 rounded-xl bg-muted/50 space-y-4">
                <h3 className="font-medium text-sm">Verification Documents (Optional)</h3>
                
                <FormField
                  control={form.control}
                  name="gst_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">GST Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 22AAAAA0000A1Z5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="udyam_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Udyam Registration Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., UDYAM-XX-00-0000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Image Cropper Modal */}
        <ImageCropper
          open={cropperOpen}
          onOpenChange={setCropperOpen}
          imageSrc={cropperImage}
          aspectRatio={cropperType === 'logo' ? 1 : 16/9}
          onCropComplete={handleCropComplete}
        />
      </div>
    </AppLayout>
  );
};

export default VendorShopEditorPage;