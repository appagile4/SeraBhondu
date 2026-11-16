export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

export interface CategoryGroup {
  id: string;
  title: string;
  slug: string;
  subcategories: SubCategory[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  image: string;
  itemCount: number;
  description: string;
  featured?: boolean;
  subcategories?: SubCategory[];
}
