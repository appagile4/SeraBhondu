export interface PostAdFormData {
  category: string;
  subCategory: string;
  title: string;
  description: string;
  price: number;
  condition: "New" | "Used";
  images: string[];
  attributes: Record<string, string>;
  state: string;
  city: string;
  area: string;
  pincode: string;
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
}
