import type { Metadata } from 'next';
import Link from 'next/link';
import { categories } from '@/data/categories';
import { services } from '@/data/services';
import { siteConfig } from '@/data/site-config';
import { absoluteUrl, breadcrumbLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

const path = '/من-نحن/';
const title = `من نحن | ${siteConfig.name} للأثاث والديكور في الكويت`;
const description = `${siteConfig.about} معرضنا في ${siteConfig.address}، ونعمل منذ ${siteConfig.foundedYear}.`.slice(
  0,
  160
);

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: path },
  openGraph: {
    title,
    description,
    url: path,
    siteName: siteConfig.name,
    locale: 'ar_KW',
    type: 'website',
    images: ['/og-image.jpg'],
  },
};

export default function AboutPage() {
  const whatsapp = `https://wa.me/${siteConfig.whatsappNumber}`;
  const mapEmbedSrc = siteConfig.geo
    ? `https://www.google.com/maps?q=${siteConfig.geo.lat},${siteConfig.geo.lng}&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(`${siteConfig.address} الكويت`)}&output=embed`;

  const aboutLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: title,
    description,
    url: absoluteUrl(path),
    mainEntity: { '@id': `${siteConfig.siteUrl}/#store` },
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
      <JsonLd data={aboutLd} />
      <JsonLd data={breadcrumbLd([{ name: 'الرئيسية', path: '/' }, { name: 'من نحن', path }])} />

      <nav aria-label="مسار التنقل" className="text-sm text-ink/55 mb-4">
        <Link href="/" className="hover:text-sage">
          الرئيسية
        </Link>
        <span className="mx-2">/</span>
        <span>من نحن</span>
      </nav>

      <h1 className="text-2xl sm:text-4xl">من نحن — {siteConfig.name}</h1>

      <div className="mt-6 space-y-4 text-ink/75 leading-relaxed">
        <p>{siteConfig.about}</p>
        <p>
          نعمل في مجال الأثاث والديكور بالكويت منذ عام {siteConfig.foundedYear}، ونفّذنا خلال هذي المدة{' '}
          {siteConfig.projectsText}، بين قطع جاهزة وتفصيل حسب الطلب.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
        <div className="bg-sage-mist rounded-2xl p-5 text-center">
          <p className="text-2xl sm:text-3xl text-sage" dir="ltr">
            {siteConfig.projectsCount}
          </p>
          <p className="text-sm text-ink/65 mt-1">مشروع منفّذ</p>
        </div>
        <div className="bg-sage-mist rounded-2xl p-5 text-center">
          <p className="text-2xl sm:text-3xl text-sage">{siteConfig.foundedYear}</p>
          <p className="text-sm text-ink/65 mt-1">سنة التأسيس</p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-xl sm:text-2xl mb-4">ماذا نقدّم</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
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

      {services.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl sm:text-2xl mb-4">خدمات التنجيد</h2>
          <div className="flex flex-wrap gap-3">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={s.path}
                className="border border-sand bg-white rounded-full px-4 py-2 text-sm hover:border-sage-soft"
              >
                {s.h1}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-xl sm:text-2xl mb-4">موقعنا وساعات العمل</h2>
        <ul className="space-y-2 text-ink/80">
          <li>
            <span className="text-ink/55">العنوان: </span>
            {siteConfig.address}
          </li>
          <li>
            <span className="text-ink/55">الدوام: </span>
            {siteConfig.hours}
          </li>
          <li>
            <span className="text-ink/55">واتساب: </span>
            <a href={whatsapp} target="_blank" rel="noreferrer" className="text-sage underline" dir="ltr">
              {siteConfig.phoneDisplay}
            </a>
          </li>
        </ul>

        <div className="mt-4 rounded-2xl overflow-hidden border border-sand aspect-video">
          <iframe
            src={mapEmbedSrc}
            title={`موقع ${siteConfig.name} على الخريطة`}
            className="w-full h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <section className="mt-12 bg-sage-mist rounded-2xl p-6">
        <h2 className="text-xl mb-2">تواصل معنا</h2>
        <p className="text-ink/70 leading-relaxed">
          للاستفسار عن أي قطعة أو طلب تفصيل حسب مقاسك، راسلنا عبر واتساب وبنرد عليك بأقرب وقت.
        </p>
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-4 min-h-12 px-6 grid place-items-center bg-sage text-white rounded-full"
        >
          الاستفسار عبر واتساب
        </a>
      </section>
    </div>
  );
}
