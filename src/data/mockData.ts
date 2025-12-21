// Mock data for uShop Phase 1 development
export interface Shop {
  id: string;
  name: string;
  image: string;
  coverImage?: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  category: string;
  location: string;
  whatsappNumber: string;
  story: string;
  since: number;
  isVerified: boolean;
  gstVerified?: boolean;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  image: string;
  price: number;
  description: string;
  category: string;
}

export const mockShops: Shop[] = [
  {
    id: "1",
    name: "Verma's Boutique",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=300&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&h=400&fit=crop",
    rating: 4.8,
    reviewCount: 124,
    category: "Clothing",
    location: "Bhubaneswar",
    whatsappNumber: "919876543210",
    story: "Family-run boutique since 2015. We specialize in ethnic wear and custom tailoring for all occasions.",
    since: 2015,
    isVerified: true,
    gstVerified: true,
  },
  {
    id: "2",
    name: "Divine Sweets",
    image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=400&fit=crop",
    rating: 4.6,
    reviewCount: 89,
    category: "Food",
    location: "Cuttack",
    whatsappNumber: "919876543211",
    story: "Traditional sweets made with love. Pure ghee, no preservatives, just like grandma used to make.",
    since: 2010,
    isVerified: true,
  },
  {
    id: "3",
    name: "Smile Electronics",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&h=300&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&h=400&fit=crop",
    rating: 4.5,
    reviewCount: 203,
    category: "Electronics",
    location: "Bhubaneswar",
    whatsappNumber: "919876543212",
    story: "Your trusted partner for electronics since 2008. Genuine products, expert advice, and after-sales support.",
    since: 2008,
    isVerified: true,
    gstVerified: true,
  },
  {
    id: "4",
    name: "Green Leaf Cafe",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=400&fit=crop",
    rating: 4.7,
    reviewCount: 156,
    category: "Food",
    location: "Puri",
    whatsappNumber: "919876543213",
    story: "Cozy cafe with organic coffee and fresh bakes. Perfect for work meetings or quiet reading.",
    since: 2019,
    isVerified: false,
  },
  {
    id: "5",
    name: "City Mart",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=400&fit=crop",
    rating: 4.4,
    reviewCount: 312,
    category: "General Store",
    location: "Bhubaneswar",
    whatsappNumber: "919876543214",
    story: "Your neighborhood general store. From groceries to home essentials, we've got you covered.",
    since: 2020,
    isVerified: true,
    gstVerified: true,
  },
  {
    id: "6",
    name: "Artisan Jewels",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=400&fit=crop",
    rating: 4.9,
    reviewCount: 67,
    category: "Jewelry",
    location: "Cuttack",
    whatsappNumber: "919876543215",
    story: "Handcrafted silver jewelry with traditional Odisha designs. Each piece tells a story.",
    since: 2012,
    isVerified: true,
  },
];

export const mockProducts: Product[] = [
  {
    id: "p1",
    shopId: "1",
    name: "Silk Saree - Royal Blue",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop",
    price: 3500,
    description: "Elegant silk saree perfect for weddings and special occasions. Pure Banarasi silk with gold zari work.",
    category: "Clothing",
  },
  {
    id: "p2",
    shopId: "1",
    name: "Cotton Kurti Set",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop",
    price: 1200,
    description: "Comfortable cotton kurti with matching pants. Perfect for daily wear and office.",
    category: "Clothing",
  },
  {
    id: "p3",
    shopId: "2",
    name: "Rasmalai (500g)",
    image: "https://images.unsplash.com/photo-1666190094566-ab7ead2f2e1a?w=400&h=400&fit=crop",
    price: 280,
    description: "Soft cottage cheese dumplings soaked in saffron-flavored milk. Made fresh daily.",
    category: "Sweets",
  },
  {
    id: "p4",
    shopId: "3",
    name: "Wireless Earbuds Pro",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
    price: 2999,
    description: "Premium wireless earbuds with noise cancellation. 24-hour battery life with case.",
    category: "Electronics",
  },
  {
    id: "p5",
    shopId: "4",
    name: "Organic Coffee Blend",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
    price: 450,
    description: "Single-origin Arabica beans, medium roast. Notes of chocolate and citrus.",
    category: "Beverages",
  },
  {
    id: "p6",
    shopId: "6",
    name: "Silver Temple Earrings",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop",
    price: 1800,
    description: "Traditional temple design earrings in 925 sterling silver. Lightweight and hypoallergenic.",
    category: "Jewelry",
  },
];

export const getShopById = (id: string): Shop | undefined => {
  return mockShops.find(shop => shop.id === id);
};

export const getProductsByShopId = (shopId: string): Product[] => {
  return mockProducts.filter(product => product.shopId === shopId);
};

export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};
