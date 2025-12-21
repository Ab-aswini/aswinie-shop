-- Create product_views table to track product views for analytics
CREATE TABLE public.product_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  viewer_id UUID,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT
);

-- Enable RLS
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (for anonymous users too)
CREATE POLICY "Anyone can create product views" 
ON public.product_views 
FOR INSERT 
WITH CHECK (true);

-- Vendors can see their own product views
CREATE POLICY "Vendors can view their product views" 
ON public.product_views 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM vendors 
  WHERE vendors.id = product_views.vendor_id 
  AND vendors.user_id = auth.uid()
));

-- Create product_images table for multiple images per product
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Everyone can view product images
CREATE POLICY "Product images are viewable by everyone" 
ON public.product_images 
FOR SELECT 
USING (true);

-- Vendors can manage their own product images
CREATE POLICY "Vendors can manage their product images" 
ON public.product_images 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM products 
  JOIN vendors ON products.vendor_id = vendors.id 
  WHERE products.id = product_images.product_id 
  AND vendors.user_id = auth.uid()
));

-- Create index for faster queries
CREATE INDEX idx_product_views_vendor_date ON public.product_views(vendor_id, viewed_at);
CREATE INDEX idx_product_views_product ON public.product_views(product_id);
CREATE INDEX idx_product_images_product ON public.product_images(product_id, display_order);