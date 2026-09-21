import Link from 'next/link';
import { categories } from '@/data/categories';
import { siteConfig } from '@/data/site-config';
import { breadcrumbLd, absoluteUrl } from '@/lib/seo';
import { services, ServicePage } from '@/data/services';
import JsonLd from '@/components/JsonLd';
import Gallery from '@/components/Gallery';

export default function ServiceLandingPage({ service }: { service: ServicePage }) {
  const whatsapp = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `مرحبًا، أستفسر عن: ${service.h1}`
  )}`;
  const category = categories.find((c) => c.slug === service.relatedCategorySlug);
  const otherServices = services.filter((s) => s.slug !== service.slug);

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.h1,
    description: service.description,
    url: absoluteUrl(service.path),
    areaServed: { '@type': 'Country', name: 'الكويت' },
    provider: { '@id': `${siteConfig.siteUrl}/#store` },
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: service.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  // بيانات تسعير حقيقية ومؤكدة فقط — تُضاف لعنصر Offer عند توفرها (لا تُختلق لخدمة أخرى).
  // تدعم إما سعرًا واحدًا (pricePerMeter) أو عدة تسعيرات (tiers)، مثل مجلس ظهر / مجلس كنب رسمي.
  if (service.pricing) {
    const pricing = service.pricing;
    const buildOffer = (price: number, label?: string) => ({
      '@type': 'Offer',
      ...(label ? { name: label } : {}),
      priceCurrency: pricing.currency,
      price,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price,
        priceCurrency: pricing.currency,
        unitText: 'متر',
      },
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(service.path),
    });

    if (pricing.tiers && pricing.tiers.length > 0) {
      (serviceLd as Record<string, unknown>).offers = pricing.tiers.map((t) => buildOffer(t.pricePerMeter, t.label));
    } else if (pricing.pricePerMeter !== undefined) {
      (serviceLd as Record<string, unknown>).offers = buildOffer(pricing.pricePerMeter);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
      <JsonLd data={serviceLd} />
      <JsonLd data={faqLd} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'الرئيسية', path: '/' },
          { name: service.h1, path: service.path },
        ])}
      />

      <nav aria-label="مسار التنقل" className="text-sm text-ink/55 mb-4">
        <Link href="/" className="hover:text-sage">
          الرئيسية
        </Link>
        <span className="mx-2">/</span>
        <span>{service.h1}</span>
      </nav>

      <h1 className="text-2xl sm:text-4xl">{service.h1}</h1>
      <p className="mt-4 max-w-3xl text-ink/75 leading-relaxed">{service.description}</p>

      <div className="mt-8 max-w-3xl space-y-8">
        {service.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl sm:text-2xl mb-2">{s.heading}</h2>
            <p className="text-ink/75 leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>

      {service.images && service.images.length > 0 && (
        <section className="mt-12 max-w-3xl">
          <h2 className="text-xl sm:text-2xl mb-4">أعمالنا الحقيقية</h2>
          <Gallery
            images={service.images.map((img) => img.src)}
            alts={service.images.map((img) => img.alt)}
            title={service.h1}
            eagerFirst={false}
          />
        </section>
      )}

      {service.pricing && (
        <section className="mt-12 bg-sand/40 border border-sand rounded-2xl p-6 max-w-xl">
          <h2 className="text-xl mb-2">السعر والتفاصيل</h2>
          {service.pricing.tiers && service.pricing.tiers.length > 0 ? (
            <ul className="space-y-1">
              {service.pricing.tiers.map((t) => (
                <li key={t.label} className="text-ink/75 leading-relaxed">
                  {t.label}: {t.pricePerMeter} دنانير للمتر الواحد
                </li>
              ))}
            </ul>
          ) : (
            service.pricing.pricePerMeter !== undefined && (
              <p className="text-ink/75 leading-relaxed">
                {service.pricing.pricePerMeter} دنانير للمتر الواحد
                {service.pricing.material ? `، بخامة ${service.pricing.material}` : ''}.
              </p>
            )
          )}
          {service.pricing.includes && service.pricing.includes.length > 0 && (
            <p className="text-ink/75 leading-relaxed mt-2">يشمل السعر: {service.pricing.includes.join('، ')}.</p>
          )}
          {service.pricing.excludes && service.pricing.excludes.length > 0 && (
            <p className="text-ink/75 leading-relaxed mt-2">لا يشمل السعر: {service.pricing.excludes.join('، ')}.</p>
          )}
          {service.pricing.deliveryFee !== undefined && (
            <p className="text-ink/75 leading-relaxed mt-2">رسوم التوصيل: {service.pricing.deliveryFee} دنانير.</p>
          )}
          {service.pricing.note && <p className="text-ink/75 leading-relaxed mt-2">{service.pricing.note}</p>}
        </section>
      )}

      <section className="mt-12 bg-sage-mist rounded-2xl p-6 max-w-xl">
        <h2 className="text-xl mb-2">اطلب الخدمة</h2>
        <p className="text-ink/70 leading-relaxed">{service.ctaText}</p>
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-4 min-h-12 px-6 grid place-items-center bg-sage text-white rounded-full"
        >
          الاستفسار عبر واتساب
        </a>
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="text-2xl mb-4">أسئلة شائعة</h2>
        <div className="space-y-5">
          {service.faqs.map((f) => (
            <div key={f.q}>
              <h3 className="font-medium">{f.q}</h3>
              <p className="text-ink/75 mt-1 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl mb-4">صفحات ذات صلة</h2>
        <div className="flex flex-wrap gap-3">
          {category && (
            <Link
              href={`/category/${category.slug}/`}
              className="border border-sand bg-white rounded-full px-4 py-2 text-sm hover:border-sage-soft"
            >
              {category.name}
            </Link>
          )}
          {otherServices.map((s) => (
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
    </div>
  );
}
