import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readyGroupsWithItems, readyGroupHref } from '@/data/ready-groups';
import { siteConfig, READY_DELIVERY_DAYS } from '@/data/site-config';
import { breadcrumbLd, absoluteUrl } from '@/lib/seo';
import { formatPrice } from '@/lib/catalog';
import ProductCard from '@/components/ProductCard';
import JsonLd from '@/components/JsonLd';

// صفحة نوع القطع الجاهزة (2026-11-27): صفحة ثابتة قابلة للفهرسة لكل نوع (طاولات، كنب وكراسي، إضاءة…)
// تستهدف بحث «<نوع القطعة> الكويت». الأنواع بلا قطع ظاهرة لا تُبنى أصلًا.
export function generateStaticParams() {
  const params = readyGroupsWithItems.map((g) => ({ type: g.slug }));
  return params.length ? params : [{ type: 'none' }];
}

export function generateMetadata({ params }: { params: { type: string } }): Metadata {
  const g = readyGroupsWithItems.find((x) => x.slug === params.type);
  if (!g) return {};
  const path = readyGroupHref(g.slug);
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: path },
    openGraph: {
      title: g.title,
      description: g.description,
      url: path,
      siteName: siteConfig.name,
      locale: 'ar_KW',
      type: 'website',
      images: [g.cover || '/og-image.jpg'],
    },
  };
}

const feeText = (fees: number[]) =>
  fees.length === 1 ? `${formatPrice(fees[0])} د.ك` : `من ${formatPrice(fees[0])} إلى ${formatPrice(fees[fees.length - 1])} د.ك حسب القطعة`;

export default function ReadyTypePage({ params }: { params: { type: string } }) {
  const g = readyGroupsWithItems.find((x) => x.slug === params.type);
  if (!g) return notFound();
  const path = readyGroupHref(g.slug);
  const others = readyGroupsWithItems.filter((x) => x.slug !== g.slug);

  const faqs = [
    {
      q: `كم أسعار ${g.name} الجاهزة؟`,
      a:
        g.count === 1
          ? `السعر ${formatPrice(g.minPrice)} د.ك، وهو سعر نهائي مكتوب في صفحة القطعة.`
          : `الأسعار من ${formatPrice(g.minPrice)} إلى ${formatPrice(g.maxPrice)} د.ك، ولكل قطعة سعر نهائي مكتوب في صفحتها.`,
    },
    {
      q: 'كم التوصيل ومتى توصل القطعة؟',
      a: `التوصيل داخل الكويت خلال ${READY_DELIVERY_DAYS === 2 ? 'يومين' : `${READY_DELIVERY_DAYS} أيام`} من تأكيد الطلب، وأجوره ${feeText(g.fees)}.`,
    },
    {
      q: 'كيف أطلب؟',
      a: 'اضغط «اطلب عبر واتساب» على القطعة أو أرسل رقمها (مثل MZ-001)، ونؤكد التوفر وموعد التوصيل.',
    },
  ];

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: g.h1,
    description: g.description,
    url: absoluteUrl(path),
    inLanguage: 'ar',
    isPartOf: { '@id': `${siteConfig.siteUrl}/#store` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: g.count,
      itemListElement: g.items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: absoluteUrl(`/products/${p.slug}/`) })),
    },
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10" data-wa-label={g.name}>
      <JsonLd data={collectionLd} />
      <JsonLd data={faqLd} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'الرئيسية', path: '/' },
          { name: 'قطع جاهزة', path: '/category/ready-pieces/' },
          { name: g.name, path },
        ])}
      />

      <nav aria-label="مسار التنقل" className="text-sm text-ink/75 mb-4">
        <Link href="/" className="hover:text-sage">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href="/category/ready-pieces/" className="hover:text-sage">قطع جاهزة</Link>
        <span className="mx-2">/</span>
        <span>{g.name}</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl">{g.h1}</h1>
      <p className="mt-3 max-w-3xl text-ink/75 leading-relaxed">{g.intro}</p>
      <p className="mt-2 text-sm text-ink/75">
        {g.count} قطعة · {g.count === 1 ? `${formatPrice(g.minPrice)} د.ك` : `من ${formatPrice(g.minPrice)} إلى ${formatPrice(g.maxPrice)} د.ك`} · التوصيل خلال يومين
      </p>

      <nav aria-label="أنواع أخرى" className="mt-5 flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {others.map((o) => (
          <Link key={o.slug} href={readyGroupHref(o.slug)} className="shrink-0 bg-white border border-sand rounded-full px-4 py-2 text-sm hover:border-sage-soft">
            {o.name}
          </Link>
        ))}
      </nav>

      <div className="store-grid mt-8">
        {g.items.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>

      <section className="mt-14 max-w-3xl">
        <h2 className="text-2xl mb-4">أسئلة شائعة</h2>
        <div className="space-y-5">
          {faqs.map((f) => (
            <div key={f.q}>
              <h3 className="font-medium">{f.q}</h3>
              <p className="text-ink/75 mt-1 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-10">
        <Link href="/category/ready-pieces/" className="text-sage underline underline-offset-4">كل القطع الجاهزة</Link>
      </p>
    </div>
  );
}
