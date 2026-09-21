'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { visibleProducts } from '@/data/products';
import { categories } from '@/data/categories';
import ProductCard from '@/components/ProductCard';

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visibleProducts
      .filter((p) => (categorySlug ? p.categorySlug === categorySlug : true))
      .filter(
        (p) =>
          !q ||
          [p.title, p.shortDescription ?? '', ...(p.materials ?? [])].join(' ').toLowerCase().includes(q)
      );
  }, [categorySlug, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
      <h1 className="text-2xl sm:text-3xl mb-4">المنتجات</h1>

      <input
        aria-label="بحث عن منتج"
        className="w-full min-h-12 border border-sand bg-white rounded-full px-5 mb-4"
        placeholder="بحث عن منتج…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 mb-6" role="group" aria-label="التصنيف">
        {[{ slug: '', name: 'الكل' }, ...categories].map((c) => (
          <button
            key={c.slug || 'all'}
            type="button"
            onClick={() => setCategorySlug(c.slug)}
            aria-pressed={categorySlug === c.slug}
            className={`shrink-0 min-h-10 px-4 rounded-full text-sm border ${
              categorySlug === c.slug ? 'bg-sage text-white border-sage' : 'bg-white border-sand text-ink/80'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink/55">ما فيه منتجات مطابقة حاليًا.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {filtered.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
