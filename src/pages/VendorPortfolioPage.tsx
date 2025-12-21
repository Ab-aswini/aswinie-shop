import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Share2, MapPin, Calendar, CheckCircle2, Eye, ExternalLink, Package } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductCard } from "@/components/ui/ProductCard";
import { RatingStars } from "@/components/ui/RatingStars";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { WhatsAppCTA } from "@/components/ui/WhatsAppCTA";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Vendor {
  id: string;
  business_name: string;
  description: string | null;
  whatsapp_number: string;
  city: string | null;
  location: string | null;
  logo_url: string | null;
  shop_image_url: string | null;
  is_verified: boolean | null;
  years_active: number | null;
  gst_number: string | null;
  udyam_number: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number | null;
  original_image_url: string | null;
  enhanced_image_url: string | null;
}

export default function VendorPortfolioPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!vendorData) {
        toast({ title: "Not a vendor", variant: "destructive" });
        navigate("/vendor/register");
        return;
      }
      
      setVendor(vendorData);
      
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, price, original_image_url, enhanced_image_url')
        .eq('vendor_id', vendorData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      setProducts(productsData || []);
      setIsLoading(false);
    }
    
    if (!authLoading) fetchData();
  }, [user, authLoading, navigate, toast]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const shareShop = async () => {
    if (!vendor) return;
    const url = `${window.location.origin}/shop/${vendor.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: vendor.business_name,
          text: `Check out ${vendor.business_name} on uShop!`,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  if (authLoading || isLoading) {
    return (
      <AppLayout showHeader={false} showNav={false}>
        <div className="pb-24">
          <Skeleton className="h-48 w-full" />
          <div className="px-4 -mt-8 relative">
            <div className="bg-card rounded-2xl p-4 shadow-elevated space-y-4">
              <div className="flex items-start gap-4">
                <Skeleton className="w-16 h-16 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!vendor) {
    return null;
  }

  return (
    <AppLayout showHeader={false} showNav={false}>
      <div className="pb-24">
        {/* Preview Banner */}
        <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Preview Mode</span>
          </div>
          <Link 
            to={`/shop/${vendor.id}`} 
            target="_blank"
            className="text-xs flex items-center gap-1 underline"
          >
            Open Live Page <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Cover image with back button */}
        <div className="relative h-48">
          <img
            src={vendor.shop_image_url || "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=400&fit=crop"}
            alt={vendor.business_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="bg-card/80 backdrop-blur-sm"
              onClick={() => navigate("/vendor/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-card/80 backdrop-blur-sm"
              onClick={shareShop}
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Shop info */}
        <div className="px-4 -mt-8 relative">
          <div className="bg-card rounded-2xl p-4 shadow-elevated">
            <div className="flex items-start gap-4">
              {vendor.logo_url ? (
                <img 
                  src={vendor.logo_url} 
                  alt={vendor.business_name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center text-2xl font-bold text-secondary-foreground shrink-0">
                  {vendor.business_name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold truncate">{vendor.business_name}</h1>
                  {vendor.is_verified && (
                    <CheckCircle2 className="w-5 h-5 text-trust-verified shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <RatingStars rating={4.5} />
                  <span className="text-sm font-medium">4.5</span>
                  <span className="text-sm text-muted-foreground">(0 reviews)</span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {vendor.years_active && vendor.years_active > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{vendor.years_active}+ years</span>
                </div>
              )}
              {(vendor.city || vendor.location) && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{vendor.location || vendor.city}</span>
                </div>
              )}
            </div>

            {(vendor.gst_number || vendor.udyam_number) && (
              <div className="mt-3">
                <TrustBadge level="verified" label="GST/UDYAM Verified" />
              </div>
            )}

            {/* Description */}
            {vendor.description && (
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                {vendor.description}
              </p>
            )}

            {/* WhatsApp CTA */}
            <WhatsAppCTA
              phoneNumber={vendor.whatsapp_number}
              className="w-full mt-4"
            />
          </div>
        </div>

        {/* Products */}
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Products ({products.length})</h2>
            <Button variant="outline" size="sm" onClick={() => navigate("/vendor/product/new")}>
              Add More
            </Button>
          </div>
          
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  shopId={vendor.id}
                  name={product.name}
                  image={product.enhanced_image_url || product.original_image_url || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400"}
                  price={product.price || 0}
                  whatsappNumber={vendor.whatsapp_number}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/30 rounded-xl">
              <Package className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground mb-3">No products listed yet</p>
              <Button size="sm" onClick={() => navigate("/vendor/product/new")}>
                Add Your First Product
              </Button>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="px-4 mt-6">
          <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
            <h3 className="font-semibold text-sm mb-2">Tips to improve your profile</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              {!vendor.shop_image_url && <li>• Add a shop cover photo</li>}
              {!vendor.logo_url && <li>• Upload your business logo</li>}
              {!vendor.description && <li>• Write a business description</li>}
              {products.length < 3 && <li>• Add more products (at least 3 recommended)</li>}
              {!vendor.gst_number && !vendor.udyam_number && <li>• Add GST/Udyam for verified badge</li>}
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
