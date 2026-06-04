export interface MenuCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  slug: string;
  category_id: string;
  name: string;
  description: string | null;
  weight: string | null;
  price: number;
  image_url: string | null;
  badges: string[] | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: number;
  phone: string | null;
  address: string | null;
  instagram_url: string | null;
  working_hours: string | null;
  google_analytics_id: string | null;
  meta_pixel_id: string | null;
  contacts_image_url: string | null;
  updated_at: string;
}

export interface Lead {
  id: string;
  type: string;
  name: string;
  phone: string;
  message: string | null;
  is_processed: boolean;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  alt: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Vacancy {
  id: string;
  title: string;
  emoji: string | null;
  description: string;
  requirements: string[];
  schedule: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface SiteContent {
  key: string;
  value: string;
  updated_at: string;
}

export interface Review {
  id: string;
  author_name: string;
  rating: number;
  text: string;
  status: "pending" | "published";
  approved: boolean;
  reply: string | null;
  created_at: string;
  published_at: string | null;
}
