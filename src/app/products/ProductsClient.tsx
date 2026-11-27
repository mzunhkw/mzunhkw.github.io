'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { visibleProducts } from '@/data/products';
import { categories } from '@/data/categories';
import { READY_GROUPS } from '@/data/ready-groups';
import ProductCard from '@/components/ProductCard';

// فلاتر الرابط (تصميم «سوق إلكتروني» 2026-11-27): ?q= بحث، ?type= نوع القطعة الجاهزة،
// ?min= و ?max= نطاق السعر (max غير شامل). كلها تُنسب لصفحة /products/ عبر canonical ثابت.
const num = (v: string | null) => (v !== null && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : null);

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const [categorySlug, setCategorySlug] = useState(searchParams.get('category') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [min, setMin] = useState(num(searchParams.get('min')));
  const [max, setMax] = useState(num(searchParams.get('max')));

  const readyOnly = !!type || min !== null || max !== null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visibleProducts
      .filter((p) => (categorySlug ? p.categorySlug === categorySlug : true))
      .filter((p) => (readyOnly ? p.availability === 'ready-piece' && !!p.ref : true))
      .filter((p) => (type ? p.group === type : true))
      .filter((p) => (min !== null ? p.price >= min : true))
      .filter((p) => (max !== null ? p.price < max : true))
      .filter(
        (p) =>
          !q ||
          [p.title, p.ref ?? '', p.shortDescription ?? '', ...(p.materials ?? [])].join(' ').toLowerCase().includes(q)
      );
  }, [categorySlug, type, min, max, readyOnly, search]);

  const priceLabel =
    min !== null && max !== null ? `من ${min} إلى ${max} د.ك` : max !== null ? `تحت ${max} د.ك` : min !== null ? `فوق ${min} د.ك` : '';
  const typeName = READY_GROUPS.find((g) => g.slug === type)?.name;

  const clearReady = () => {
    setType('');
    setMin(null);
    setMax(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <h1 className="text-2xl sm:text-3xl mb-4">{typeName ? `${typeName} — قطع جاهزة` : 'المنتجات'}</h1>

      <input
        type="search"
        aria-label="بحث عن منتج"
        className="w-full min-h-12 border border-sand bg-white rounded-xl px-5 mb-4"
        placeholder="ابحث باسم القطعة أو رقمها MZ"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 mb-3" role="group" aria-label="أنواع القطع الجاهزة">
        {READY_GROUPS.map((g) => (
          <button
            key={g.slug}
            type="button"
            onClick={() => {
              setCategorySlug('');
              setType(type === g.slug ? '' : g.slug);
            }}
            aria-pressed={type === g.slug}
            className={`shrink-0 min-h-10 px-4 rounded-full text-sm border ${
              type === g.slug ? 'bg-sage text-white border-sage' : 'bg-white border-sand text-ink/80'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {!readyOnly && (
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
      )}

      {readyOnly && (
        <p className="flex flex-wrap items-center gap-2 text-sm text-ink/75 mb-5">
          <span>{filtered.length} قطعة{priceLabel ? ` · ${priceLabel}` : ''}</span>
          <button type="button" onClick={clearReady} className="min-h-10 px-4 rounded-full border border-sand bg-white">
            مسح الفلتر
          </button>
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="text-ink/75">ما فيه منتجات مطابقة حاليًا.</p>
      ) : (
        <div className="store-grid">
          {filtered.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
