import Link from 'next/link';
import { visibleProducts } from '@/data/products';
import { services } from '@/data/services';
import { areaPages, AreaPage } from '@/data/area-pages';
import { siteConfig, whatsappLink } from '@/data/site-config';
import { absoluteUrl, breadcrumbLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ProductCard from '@/components/ProductCard';

// الأعمال التي تنفذها منجرة مزونة فعليًا (بدون أبواب أو مطابخ)
const AREA_SERVICES = [
  { name: 'كنب وقنفات', href: '/category/sofas/' },
  { name: 'غرف نوم', href: '/category/bedrooms/' },
  { name: 'كبتات ملابس', href: '/tafseel-kabatat-kuwait/' },
  { name: 'طاولات طعام', href: '/category/tables/' },
  { name: 'طاولات قهوة', href: '/category/coffee-tables/' },
  { name: 'مجالس وديوانيات', href: '/category/majlis/' },
  { name: 'مساند عربية', href: '/category/cushions/' },
];

export default function AreaLandingPage({ area }: { area: AreaPage }) {
  // أعمالنا الفعلية المنفذة في مناطق المحافظة (حسب حقل region بالمنتج)
  const terms = [...area.districts, ...(area.regionAliases || [])];
  const works = visibleProducts.filter((p) => terms.some((d) => (p.region || '').includes(d))).slice(0, 12);
  const others = areaPages.filter((a) => a.slug !== area.slug);
  const whatsapp = whatsappLink(`نجار ${area.governorate}`, area.path);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: area.h1,
    serviceType: 'نجارة وتفصيل أثاث وتنجيد',
    description: area.description,
    url: absoluteUrl(area.path),
    areaServed: [{ '@type': 'AdministrativeArea', name: `محافظة ${area.governorate}` }, ...area.districts.map((d) => ({ '@type': 'Place', name: d }))],
    provider: { '@id': `${siteConfig.siteUrl}/#store` },
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: area.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-12" data-wa-label={`نجار ${area.governorate}`}>
      <JsonLd data={ld} />
      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd([{ name: 'الرئيسية', path: '/' }, { name: area.h1, path: area.path }])} />

      <nav aria-label="مسار التنقل" className="text-sm text-ink/55 mb-4">
        <Link href="/" className="hover:text-sage">الرئيسية</Link>
        <span className="mx-2">/</span>
        <span>نجار {area.governorate}</span>
      </nav>

      <h1 className="text-2xl sm:text-4xl leading-tight mb-4">{area.h1}</h1>
      {area.intro.map((t) => (
        <p key={t} className="text-ink/75 leading-relaxed mb-3 max-w-3xl">{t}</p>
      ))}
      <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-grid mt-3 min-h-12 px-8 place-items-center bg-sage text-white rounded-full">
        اطلب زيارة لأخذ المقاسات عبر واتساب
      </a>

      <section className="mt-12" aria-labelledby="services-title">
        <h2 id="services-title" className="text-xl sm:text-2xl mb-4">خدماتنا في {area.governorate}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {AREA_SERVICES.map((sv) => (
            <Link key={sv.name} href={sv.href} className="block bg-white border border-sand rounded-2xl p-4 hover:border-sage-soft">
              <strong>تفصيل {sv.name}</strong>
              <span className="block text-sm text-ink/60 mt-1">في {area.governorate} حسب المقاس</span>
            </Link>
          ))}
          {services.map((s) => (
            <Link key={s.slug} href={s.path} className="block bg-white border border-sand rounded-2xl p-4 hover:border-sage-soft">
              <strong>{s.h1.split(' — ')[0]}</strong>
              <span className="block text-sm text-ink/60 mt-1">نخدم {area.governorate} وكل مناطق الكويت</span>
            </Link>
          ))}
        </div>
      </section>

      {works.length > 0 && (
        <section className="mt-12" aria-labelledby="works-title">
          <h2 id="works-title" className="text-xl sm:text-2xl mb-4">من أعمالنا في محافظة {area.governorate}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {works.map((p) => <ProductCard key={p.slug} product={p} compact />)}
          </div>
        </section>
      )}

      <section className="mt-12" aria-labelledby="districts-title">
        <h2 id="districts-title" className="text-xl sm:text-2xl mb-3">المناطق التي نخدمها في {area.governorate}</h2>
        <p className="text-ink/75 leading-relaxed">{area.districts.join('، ')}، وجميع مناطق المحافظة.</p>
      </section>

      <section className="mt-12" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-xl sm:text-2xl mb-4">أسئلة شائعة</h2>
        <div className="space-y-3">
          {area.faqs.map((f) => (
            <details key={f.q} className="bg-white border border-sand rounded-2xl p-4">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="text-ink/75 mt-2 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg mb-3">نخدم أيضًا</h2>
        <div className="flex flex-wrap gap-2">
          {others.map((a) => (
            <Link key={a.slug} href={a.path} className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">نجار {a.governorate}</Link>
          ))}
        </div>
      </section>
    </div>
  );
}
