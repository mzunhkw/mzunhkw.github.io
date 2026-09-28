import type { Metadata } from 'next';
import { Suspense } from 'react';
import ProductsClient from './ProductsClient';
import { visibleProducts } from '@/data/products';
import ProductCard from '@/components/ProductCard';

export const metadata: Metadata = {
  title: 'منتجات الأثاث — كنب وقنفات ومجالس ومساند',
  description:
    'تصفح منتجات مزونة في الكويت: كنب وقنفات ومجالس ومساند وغرف نوم وطاولات وديكور، جاهزة أو بالتفصيل. استفسر عبر واتساب.',
  // كل روابط ?category=… تُنسب لهذه الصفحة عشان ما يتشتت الفهرس
  alternates: { canonical: '/products/' },
};

export default function ProductsPage() {
  return (
    // الـ fallback يُطبع بالـ HTML الثابت: عنوان H1 وكل روابط المنتجات ظاهرة لمحركات البحث قبل تشغيل JavaScript
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
          <h1 className="text-2xl sm:text-3xl mb-6">المنتجات</h1>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {visibleProducts.map((p) => (
              <ProductCard key={p.slug} product={p} compact />
            ))}
          </div>
        </div>
      }
    >
      <ProductsClient />
    </Suspense>
  );
}
