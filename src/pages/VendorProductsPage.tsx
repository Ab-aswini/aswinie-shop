import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit2, Trash2, Eye, EyeOff, Loader2, Package } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_max: number | null;
  category: string | null;
  original_image_url: string | null;
  enhanced_image_url: string | null;
  is_active: boolean | null;
}

export default function VendorProductsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      // Get vendor ID
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
      
      setVendorId(vendor.id);
      
      // Fetch products
      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({ title: "Failed to load products", variant: "destructive" });
      } else {
        setProducts(productsData || []);
      }
      
      setIsLoading(false);
    }
    
    if (!authLoading) fetchData();
  }, [user, authLoading, navigate, toast]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const toggleActive = async (product: Product) => {
    setTogglingId(product.id);
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id);
    
    if (error) {
      toast({ title: "Failed to update", variant: "destructive" });
    } else {
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, is_active: !p.is_active } : p
      ));
      toast({ title: product.is_active ? "Product hidden" : "Product visible" });
    }
    setTogglingId(null);
  };

  const deleteProduct = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    } else {
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Product deleted" });
    }
    setDeletingId(null);
  };

  const formatPrice = (price: number | null, priceMax: number | null) => {
    if (!price) return "Price not set";
    if (priceMax && priceMax > price) return `₹${price} - ₹${priceMax}`;
    return `₹${price}`;
  };

  if (authLoading || isLoading) {
    return (
      <AppLayout showNav={false}>
        <div className="px-4 py-4 space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showNav={false}>
      <div className="px-4 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/vendor/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">My Products</h1>
              <p className="text-sm text-muted-foreground">{products.length} items</p>
            </div>
          </div>
          <Button size="sm" onClick={() => navigate("/vendor/product/new")} className="gap-1">
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>

        {/* Products List */}
        {products.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-xl">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-1">No products yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Start by adding your first product</p>
            <Button onClick={() => navigate("/vendor/product/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map(product => (
              <div
                key={product.id}
                className={`flex gap-3 p-3 rounded-xl border bg-card ${!product.is_active ? 'opacity-60' : ''}`}
              >
                {/* Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                  {product.enhanced_image_url || product.original_image_url ? (
                    <img
                      src={product.enhanced_image_url || product.original_image_url || ''}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      <p className="text-sm text-primary font-medium">
                        {formatPrice(product.price, product.price_max)}
                      </p>
                      {product.category && (
                        <span className="text-xs text-muted-foreground">{product.category}</span>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate(`/vendor/product/${product.id}/edit`)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleActive(product)}
                        disabled={togglingId === product.id}
                      >
                        {togglingId === product.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : product.is_active ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{product.name}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteProduct(product.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingId === product.id ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
