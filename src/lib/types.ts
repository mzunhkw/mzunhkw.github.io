export type Availability =
  | 'custom-order' // متاح للتفصيل
  | 'ready-piece' // قطعة جاهزة
  | 'temporarily-unavailable' // غير متاح مؤقتًا
  | 'archived'; // مؤرشف

export const availabilityLabels: Record<Availability, string> = {
  'custom-order': 'متاح للتفصيل',
  'ready-piece': 'قطعة جاهزة',
  'temporarily-unavailable': 'غير متاح مؤقتًا',
  archived: 'مؤرشف',
};

export type Category = {
  slug: string;
  name: string;
  description?: string;
};

export type Product = {
  slug: string;
  title: string;
  categorySlug: string;
  price: number;
  size: string;
  region: string;
  availability: Availability;
  shortDescription?: string;
  description: string;
  materials?: string[];
  images: string[];
  featured?: boolean;
  published: boolean;
};
