-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'vendor', 'user');

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create has_role function (security definer to avoid recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    trust_score DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    category_type TEXT NOT NULL DEFAULT 'product', -- 'product' or 'service'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create vendors table
CREATE TABLE public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    business_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category_id UUID REFERENCES public.categories(id),
    location TEXT,
    city TEXT,
    whatsapp_number TEXT NOT NULL,
    shop_image_url TEXT,
    logo_url TEXT,
    gst_number TEXT,
    udyam_number TEXT,
    years_active INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved vendors are viewable by everyone"
ON public.vendors FOR SELECT USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own vendor profile"
ON public.vendors FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendor profile"
ON public.vendors FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all vendors"
ON public.vendors FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    price_max DECIMAL(10,2),
    category TEXT,
    style TEXT, -- 'clean', 'luxury', 'local', 'tech', 'handmade'
    original_image_url TEXT,
    enhanced_image_url TEXT,
    highlights TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
ON public.products FOR SELECT USING (true);

CREATE POLICY "Vendors can manage their own products"
ON public.products FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.vendors 
        WHERE vendors.id = products.vendor_id 
        AND vendors.user_id = auth.uid()
    )
);

-- Create vendor_ratings table (consumer rates vendor)
CREATE TABLE public.vendor_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_quality INTEGER CHECK (product_quality >= 1 AND product_quality <= 5),
    behavior_score INTEGER CHECK (behavior_score >= 1 AND behavior_score <= 5),
    behavior_tags TEXT[], -- 'respectful', 'calm', 'honest', 'helpful', 'on_time', 'friendly', 'clear_communication'
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (vendor_id, user_id)
);

ALTER TABLE public.vendor_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings are viewable by everyone"
ON public.vendor_ratings FOR SELECT USING (true);

CREATE POLICY "Authenticated users can rate vendors"
ON public.vendor_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
ON public.vendor_ratings FOR UPDATE USING (auth.uid() = user_id);

-- Create consumer_ratings table (vendor rates consumer - trust memory)
CREATE TABLE public.consumer_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
    consumer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    behavior_tags TEXT[], -- 'respectful', 'patient', 'clear_communicator'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (vendor_id, consumer_id)
);

ALTER TABLE public.consumer_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendor can see ratings they gave"
ON public.consumer_ratings FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.vendors 
        WHERE vendors.id = consumer_ratings.vendor_id 
        AND vendors.user_id = auth.uid()
    )
);

CREATE POLICY "Vendors can rate consumers"
ON public.consumer_ratings FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.vendors 
        WHERE vendors.id = consumer_ratings.vendor_id 
        AND vendors.user_id = auth.uid()
    )
);

-- Create saved_shops table
CREATE TABLE public.saved_shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, vendor_id)
);

ALTER TABLE public.saved_shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their saved shops"
ON public.saved_shops FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save shops"
ON public.saved_shops FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave shops"
ON public.saved_shops FOR DELETE USING (auth.uid() = user_id);

-- Create reports table for admin
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reported_vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all reports"
ON public.reports FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create reports"
ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage reports"
ON public.reports FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone'
  );
  
  -- Default role is 'user'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-images', 'shop-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage policies
CREATE POLICY "Anyone can view shop images"
ON storage.objects FOR SELECT
USING (bucket_id = 'shop-images');

CREATE POLICY "Authenticated users can upload shop images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'shop-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own shop images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'shop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);