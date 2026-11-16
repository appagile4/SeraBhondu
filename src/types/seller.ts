export interface Seller {
  id: string;
  name: string;
  avatar: string;
  memberSince: string;
  verified: boolean;
  phone?: string;
  email?: string;
  location: {
    city: string;
    state: string;
    area?: string;
  };
  totalAds: number;
  rating?: number;
  reviewCount?: number;
  about?: string;
}
