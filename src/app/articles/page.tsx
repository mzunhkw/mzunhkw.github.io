import type { Metadata } from 'next';
import Link from 'next/link';
import { articles } from '@/data/articles';
import { siteConfig } from '@/data/site-config';
import { absoluteUrl, breadcrumbLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

const title = 'مقالات ونصائح الأثاث والتنجيد | منجرة مزونة';
const description =
  'مقالات منجرة مزونة: أسعار تنجيد الكنب والفرق بين التنجيد والتلبيس، أفكار كبت ملابس وكبت زاوية، غرف نوم أطفال، واختيار مقاس طاولة الوسط.';

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/articles/' },
  openGraph: { title, description, url: '/articles/', siteName: siteConfig.name, locale: 'ar_KW', type: 'website', images: ['/og-image.jpg'] },
};

export default function ArticlesIndex() {
  const listLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'مقالات منجرة مزونة',
    description,
    url: absoluteUrl('/articles/'),
    inLanguage: 'ar',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: articles.map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: absoluteUrl(a.path), name: a.h1 })),
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
      <JsonLd data={listLd} />
      <JsonLd data={breadcrumbLd([{ name: 'الرئيسية', path: '/' }, { name: 'المقالات', path: '/articles/' }])} />

      <nav aria-label="مسار التنقل" className="text-sm text-ink/55 mb-4">
        <Link href="/" className="hover:text-sage">الرئيسية</Link>
        <span className="mx-2">/</span>
        <span>المقالات</span>
      </nav>

      <h1 className="text-2xl sm:text-4xl">مقالات ونصائح من منجرة مزونة</h1>
      <p className="mt-4 max-w-3xl text-ink/75 leading-relaxed">
        نصائح عملية من خبرتنا في تفصيل الأثاث والتنجيد في الكويت منذ {siteConfig.foundedYear}: الأسعار، المقاسات، وأفكار التصميم.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {articles.map((a) => (
          <Link key={a.slug} href={a.path} className="block bg-white border border-sand rounded-2xl p-5 hover:border-sage-soft">
            <h2 className="text-lg leading-relaxed">{a.h1}</h2>
            <p className="text-sm text-ink/65 mt-2 leading-relaxed">{a.excerpt}</p>
            <span className="block text-sm text-sage mt-3">اقرأ المقال ←</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
