import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { categories } from '@/data/categories';
import { visibleProducts } from '@/data/products';
import { getCategorySeo } from '@/data/category-seo';
import { siteConfig } from '@/data/site-config';
import { breadcrumbLd, absoluteUrl } from '@/lib/seo';
import ProductCard from '@/components/ProductCard';
import JsonLd from '@/components/JsonLd';

export function generateStaticParams() {
  const params = categories.map((c) => ({ slug: c.slug }));
  // مع output: 'export' قائمة فارغة قد تفشل البناء.
  return params.length ? params : [{ slug: 'none' }];
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const category = categories.find((c) => c.slug === params.slug);
  if (!category) return {};
  const seo = getCategorySeo(category.slug, category.name);
  const path = `/category/${category.slug}/`;
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: path },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: path,
      siteName: siteConfig.name,
      locale: 'ar_KW',
      type: 'website',
    },
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = categories.find((c) => c.slug === params.slug);
  if (!category) return notFound();

  const seo = getCategorySeo(category.slug, category.name);
  const items = visibleProducts.filter((p) => p.categorySlug === category.slug);
  const others = categories.filter((c) => c.slug !== category.slug);
  const path = `/category/${category.slug}/`;
  const whatsapp = `https://wa.me/${siteConfig.whatsappNumber}`;

  const faqs = [
    ...seo.faqs,
    {
      q: 'كيف أطلب أو أستفسر؟',
      a: `راسلنا عبر واتساب على الرقم ${siteConfig.phoneDisplay}، أو زر المعرض في ${siteConfig.address}. الدوام ${siteConfig.hours}.`,
    },
  ];

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: seo.h1,
    description: seo.description,
    url: absoluteUrl(path),
    inLanguage: 'ar',
    isPartOf: { '@id': `${siteConfig.siteUrl}/#store` },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
      <JsonLd data={collectionLd} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'الرئيسية', path: '/' },
          { name: category.name, path },
        ])}
      />

      <nav aria-label="مسار التنقل" className="text-sm text-ink/55 mb-4">
        <Link href="/" className="hover:text-sage">
          الرئيسية
        </Link>
        <span className="mx-2">/</span>
        <span>{category.name}</span>
      </nav>

      <h1 className="text-2xl sm:text-4xl">{seo.h1}</h1>
      {seo.intro.length > 0 && (
        <div className="mt-4 max-w-3xl space-y-3 text-ink/75 leading-relaxed">
          {seo.intro.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
      )}

      <div className="mt-10">
        {items.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {items.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <div className="bg-sage-mist rounded-2xl p-6 max-w-xl">
            <p className="text-ink/70">
              نجهّز عرض قطع هذا القسم قريبًا. تواصل معنا الآن لمعرفة المتوفر أو لطلب تفصيل حسب مقاسك.
            </p>
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-4 min-h-12 px-6 grid place-items-center bg-sage text-white rounded-full"
            >
              الاستفسار عبر واتساب
            </a>
          </div>
        )}
      </div>

      <section className="mt-16 max-w-3xl">
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

      <section className="mt-16">
        <h2 className="text-xl mb-4">أقسام أخرى</h2>
        <div className="flex flex-wrap gap-3">
          {others.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}/`}
              className="border border-sand bg-white rounded-full px-4 py-2 text-sm hover:border-sage-soft"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
