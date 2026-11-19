import api from "./api";
import { Product } from "@/types/product";

export interface BackendAdvertisement {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  condition: "New" | "Used";
  images: Array<{ url: string; publicId?: string } | string>;
  location: {
    state?: string;
    city: string;
    area?: string;
    pincode?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  seller?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    city?: string;
    avatar?: string;
    isVerified?: boolean;
    createdAt?: string;
    about?: string;
  };
  sellerContact?: {
    name: string;
    phone: string;
    email?: string;
  };
  attributes?: Record<string, any>;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  approvedBy?: any;
  approvedAt?: string;
  isFeatured?: boolean;
  viewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Maps a MongoDB backend advertisement to the frontend Product type
 */
export function mapAdToProduct(ad: BackendAdvertisement | any): Product {
  const images = Array.isArray(ad.images)
    ? ad.images.map((img: any) => (typeof img === "string" ? img : img?.url || "")).filter(Boolean)
    : [];

  return {
    id: ad._id?.toString() || ad.id || `ad-${Date.now()}`,
    title: ad.title || "Untitled Advertisement",
    slug: ad.slug || `ad-${Date.now()}`,
    description: ad.description || "",
    price: Number(ad.price) || 0,
    category: ad.category || "other",
    subCategory: ad.subCategory || "",
    condition: ad.condition === "New" ? "New" : "Used",
    images: images.length > 0 ? images : [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    ],
    location: {
      city: ad.location?.city || "Dhaka",
      state: ad.location?.state || "Dhaka Division",
      area: ad.location?.area || "",
      pincode: ad.location?.pincode || "",
      latitude: ad.location?.latitude ?? null,
      longitude: ad.location?.longitude ?? null,
    },
    seller: {
      id: ad.seller?._id || ad.seller?.id || "seller-unknown",
      name: ad.sellerContact?.name || ad.seller?.name || "Verified Seller",
      avatar:
        ad.seller?.avatar ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      memberSince: ad.seller?.createdAt
        ? new Date(ad.seller.createdAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "Nov 2026",
      verified: Boolean(ad.seller?.isVerified),
      phone: ad.sellerContact?.phone || ad.seller?.phone || "",
      email: ad.sellerContact?.email || ad.seller?.email || "",
      location: {
        city: ad.location?.city || "Dhaka",
        state: ad.location?.state || "Dhaka Division",
        area: ad.location?.area || "",
      },
      totalAds: 1,
    },
    postedAt: ad.createdAt || new Date().toISOString(),
    featured: Boolean(ad.isFeatured),
    attributes: ad.attributes || {},
    viewsCount: ad.viewsCount || 0,
  };
}

/**
 * Fetch all approved advertisements with optional filtering
 */
export async function getApprovedAds(params?: {
  category?: string;
  city?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}): Promise<{ products: Product[]; rawAds: BackendAdvertisement[]; total: number; pages: number }> {
  try {
    const res = await api.get("/advertisements", { params });
    const rawAds: BackendAdvertisement[] = res.data.advertisements || [];
    const products = rawAds.map(mapAdToProduct);
    return {
      products,
      rawAds,
      total: res.data.total || products.length,
      pages: res.data.pages || 1,
    };
  } catch (error) {
    console.warn("Failed to fetch ads from backend, using empty list:", error);
    return { products: [], rawAds: [], total: 0, pages: 1 };
  }
}

/**
 * Fetch featured approved advertisements
 */
export async function getFeaturedAds(limit = 8): Promise<Product[]> {
  try {
    const res = await api.get("/advertisements/featured", { params: { limit } });
    const rawAds: BackendAdvertisement[] = res.data.advertisements || [];
    return rawAds.map(mapAdToProduct);
  } catch (error) {
    console.warn("Failed to fetch featured ads:", error);
    return [];
  }
}

/**
 * Fetch single advertisement by slug (strictly respects approval privacy)
 */
export async function getAdBySlug(
  slug: string
): Promise<{ product: Product | null; rawAd: BackendAdvertisement | null }> {
  try {
    const res = await api.get(`/advertisements/slug/${slug}`);
    const rawAd: BackendAdvertisement = res.data.advertisement;
    return {
      product: mapAdToProduct(rawAd),
      rawAd,
    };
  } catch (error) {
    return { product: null, rawAd: null };
  }
}

/**
 * Search approved advertisements
 */
export async function searchAds(
  q: string,
  city?: string,
  category?: string,
  page = 1,
  limit = 16
): Promise<{ products: Product[]; total: number }> {
  try {
    const res = await api.get("/advertisements/search", {
      params: { q, city, category, page, limit },
    });
    const rawAds: BackendAdvertisement[] = res.data.advertisements || [];
    return {
      products: rawAds.map(mapAdToProduct),
      total: res.data.total || rawAds.length,
    };
  } catch (error) {
    return { products: [], total: 0 };
  }
}

/**
 * Fetch related ads
 */
export async function getRelatedAds(id: string): Promise<Product[]> {
  try {
    const res = await api.get(`/advertisements/${id}/related`);
    const rawAds: BackendAdvertisement[] = res.data.advertisements || [];
    return rawAds.map(mapAdToProduct);
  } catch (error) {
    return [];
  }
}

/**
 * Fetch current user's advertisements across all statuses (pending, approved, rejected)
 */
export async function getMyAds(): Promise<BackendAdvertisement[]> {
  const res = await api.get("/advertisements/my");
  return res.data.advertisements || [];
}

/**
 * Create a new advertisement (ALWAYS starts as status: 'pending')
 */
export async function createAd(payload: {
  title: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  condition: "New" | "Used";
  images: Array<{ url: string; publicId?: string } | string>;
  location: {
    state?: string;
    city: string;
    area?: string;
    pincode?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  sellerContact?: { name: string; phone: string; email?: string };
  attributes?: Record<string, any>;
}): Promise<{ success: boolean; message: string; advertisement: BackendAdvertisement }> {
  const res = await api.post("/advertisements", payload);
  return res.data;
}

/**
 * Update advertisement (if rejected, resubmits to pending)
 */
export async function updateAd(
  id: string,
  payload: Partial<BackendAdvertisement>
): Promise<{ success: boolean; message: string; advertisement: BackendAdvertisement }> {
  const res = await api.put(`/advertisements/${id}`, payload);
  return res.data;
}

/**
 * Delete advertisement
 */
export async function deleteAd(id: string): Promise<{ success: boolean; message: string }> {
  const res = await api.delete(`/advertisements/${id}`);
  return res.data;
}

/**
 * Upload multiple images directly to Cloudinary via backend
 */
export async function uploadAdImages(
  files: File[]
): Promise<Array<{ url: string; publicId: string }>> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });
  formData.append("folder", "dealdoko_advertisements");

  const res = await api.post("/upload/multiple", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.images || [];
}

export interface BannerItem {
  _id?: string;
  id?: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  order?: number;
  isActive?: boolean;
}

/**
 * Fetch active promotional banners from backend
 */
export async function getBanners(): Promise<BannerItem[]> {
  try {
    const res = await api.get("/banners");
    if (res.data?.success && Array.isArray(res.data.banners)) {
      return res.data.banners.filter((b: BannerItem) => b.isActive !== false && Boolean(b.imageUrl));
    }
    return [];
  } catch (error) {
    console.warn("Failed to fetch banners from backend:", error);
    return [];
  }
}
