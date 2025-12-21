import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCategoriesHierarchy } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Store, Phone, MapPin, FileText, ArrowLeft, Upload, CheckCircle, Sparkles, Loader2, Navigation, ExternalLink } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

export default function VendorRegisterPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: categoriesHierarchy } = useCategoriesHierarchy();
  const { toast } = useToast();
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    categoryId: "",
    whatsappNumber: "",
    location: "",
    city: "",
    gstNumber: "",
    udyamNumber: "",
  });
  const [shopImage, setShopImage] = useState<File | null>(null);
  const [logoImage, setLogoImage] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
  };

  const uploadImage = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return urlData.publicUrl;
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", variant: "destructive" });
      return;
    }
    
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        
        // Reverse geocode using free Nominatim API
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.district || "";
            const fullAddress = data.display_name || "";
            setFormData(prev => ({
              ...prev,
              city: city,
              location: fullAddress,
            }));
            toast({ title: "Location detected!" });
          }
        } catch {
          toast({ title: "Could not get address", variant: "destructive" });
        }
        setIsGettingLocation(false);
      },
      (error) => {
        toast({ title: "Location access denied", description: error.message, variant: "destructive" });
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const openGoogleMaps = () => {
    if (coordinates) {
      window.open(`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`, '_blank');
    } else if (formData.location) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.location)}`, '_blank');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to register as a vendor.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!formData.businessName || !formData.whatsappNumber || !formData.categoryId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let shopImageUrl = null;
      let logoUrl = null;

      // Upload images if provided
      if (shopImage) {
        const path = `${user.id}/${Date.now()}-shop.${shopImage.name.split('.').pop()}`;
        shopImageUrl = await uploadImage(shopImage, 'shop-images', path);
      }

      if (logoImage) {
        const path = `${user.id}/${Date.now()}-logo.${logoImage.name.split('.').pop()}`;
        logoUrl = await uploadImage(logoImage, 'shop-images', path);
      }

      // Create vendor profile
      const { error } = await supabase.from('vendors').insert({
        user_id: user.id,
        business_name: formData.businessName,
        slug: generateSlug(formData.businessName),
        description: formData.description || null,
        category_id: formData.categoryId,
        whatsapp_number: formData.whatsappNumber,
        location: formData.location || null,
        city: formData.city || null,
        gst_number: formData.gstNumber || null,
        udyam_number: formData.udyamNumber || null,
        shop_image_url: shopImageUrl,
        logo_url: logoUrl,
        status: 'pending',
        is_approved: false,
        is_verified: false,
      });

      if (error) throw error;

      // Add vendor role
      await supabase.from('user_roles').insert({
        user_id: user.id,
        role: 'vendor' as const,
      });

      toast({
        title: "Registration Submitted!",
        description: "Your vendor application is under review. We'll notify you once approved.",
      });

      navigate("/vendor/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
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
            <h1 className="text-xl font-bold">Register Your Shop</h1>
            <p className="text-sm text-muted-foreground">Join thousands of local vendors</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 rounded ${step > s ? 'bg-primary' : 'bg-secondary'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Business Details
                </CardTitle>
                <CardDescription>Tell us about your shop</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    placeholder="e.g., Sharma Electronics"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {categoriesHierarchy?.map((parent) => (
                        <SelectGroup key={parent.id}>
                          <SelectLabel className="text-primary font-semibold">
                            {parent.icon} {parent.name}
                          </SelectLabel>
                          {parent.children?.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id} className="pl-6">
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Description</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-primary"
                      disabled={!formData.businessName || isGeneratingDesc}
                      onClick={async () => {
                        if (!formData.businessName) return;
                        setIsGeneratingDesc(true);
                        try {
                          const selectedCat = categoriesHierarchy?.flatMap(p => p.children || []).find(c => c.id === formData.categoryId);
                          const { data, error } = await supabase.functions.invoke('ai-assist', {
                            body: {
                              type: 'suggest-description',
                              businessName: formData.businessName,
                              category: selectedCat?.name || 'general',
                            },
                          });
                          if (error) throw error;
                          if (data?.response) {
                            setFormData({ ...formData, description: data.response });
                            toast({ title: "AI generated description!" });
                          }
                        } catch (e) {
                          toast({ title: "Failed to generate", variant: "destructive" });
                        } finally {
                          setIsGeneratingDesc(false);
                        }
                      }}
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
                    placeholder="Tell customers about your shop, what you sell, and what makes you special..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <Button 
                  type="button" 
                  className="w-full" 
                  onClick={() => setStep(2)}
                  disabled={!formData.businessName || !formData.categoryId}
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Contact & Location */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Contact & Location
                </CardTitle>
                <CardDescription>How customers can reach you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="91XXXXXXXXXX"
                      className="pl-10"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Location Detection Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  {isGettingLocation ? "Detecting location..." : "Use My Current Location"}
                </Button>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g., Bhubaneswar"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="location">Full Address</Label>
                    {(coordinates || formData.location) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-primary gap-1"
                        onClick={openGoogleMaps}
                      >
                        <ExternalLink className="w-3 h-3" />
                        View on Maps
                      </Button>
                    )}
                  </div>
                  <Textarea
                    id="location"
                    placeholder="Shop address for customers to visit..."
                    rows={2}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    className="flex-1" 
                    onClick={() => setStep(3)}
                    disabled={!formData.whatsappNumber}
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Verification & Submit */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Verification (Optional)
                </CardTitle>
                <CardDescription>Get verified badge for more trust</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gst">GST Number</Label>
                  <Input
                    id="gst"
                    placeholder="22AAAAA0000A1Z5"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="udyam">Udyam Registration Number</Label>
                  <Input
                    id="udyam"
                    placeholder="UDYAM-XX-00-0000000"
                    value={formData.udyamNumber}
                    onChange={(e) => setFormData({ ...formData, udyamNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Shop Photo</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => document.getElementById('shop-image')?.click()}
                  >
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {shopImage ? shopImage.name : "Click to upload shop photo"}
                    </p>
                    <input
                      id="shop-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setShopImage(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => document.getElementById('logo-image')?.click()}
                  >
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {logoImage ? logoImage.name : "Click to upload logo"}
                    </p>
                    <input
                      id="logo-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setLogoImage(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </AppLayout>
  );
}
