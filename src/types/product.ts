import { Seller } from "./seller";

export interface ProductAttribute {
  label: string;
  value: string | number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  condition?: "New" | "Used";
  images: string[];
  location: {
    city: string;
    state: string;
    area?: string;
    pincode?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  seller: Seller;
  postedAt: string;
  featured?: boolean;
  attributes?: Record<string, string | number | boolean>;
  viewsCount?: number;
  tags?: string[];
}

export interface ProductFilterState {
  category?: string;
  subCategory?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: "New" | "Used" | "All";
  sortBy?: "relevance" | "newest" | "oldest" | "price_asc" | "price_desc";
  brand?: string;
  fuelType?: string;
  transmission?: string;
  propertyType?: string;
  bedrooms?: string;
}
