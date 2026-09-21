import type { Metadata } from 'next';
import { Suspense } from 'react';
import ProductsClient from './ProductsClient';

export const metadata: Metadata = {
  title: 'منتجات الأثاث — كنب وقنفات ومجالس ومساند',
  description:
    'تصفح منتجات مزونة في الكويت: كنب وقنفات ومجالس ومساند وغرف نوم وطاولات وديكور، جاهزة أو بالتفصيل. استفسر عبر واتساب.',
  // كل روابط ?category=… تُنسب لهذه الصفحة عشان ما يتشتت الفهرس
  alternates: { canonical: '/products/' },
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">جارٍ التحميل…</div>}>
      <ProductsClient />
    </Suspense>
  );
}
