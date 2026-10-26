import type { Metadata } from 'next';
import Link from 'next/link';
import { visibleProducts } from '@/data/products';
import { categories, focusCategories, secondaryCategories } from '@/data/categories';
import { getCategorySeo } from '@/data/category-seo';
import { services } from '@/data/services';
import { siteConfig, whatsappGeneralLink, whatsappLink } from '@/data/site-config';
import ProductCard from '@/components/ProductCard';
import OffersStrip from '@/components/OffersStrip';
import { focusOffers } from '@/data/offers';
import { getSrcSet } from '@/lib/image';
import TrustSection from '@/components/TrustSection';

export const metadata: Metadata = {
  // «نجار» ~5,400/شهر و«نجار الكويت» ~1,600 و«منجرة» ~1,000 (Ubersuggest، الكويت، أكتوبر 2026)
  title: { absolute: `منجرة ${siteConfig.name} | ${siteConfig.seoTitle}` },
  description: siteConfig.seoDescription,
  alternates: { canonical: '/' },
  openGraph: {
    title: `منجرة ${siteConfig.name} | ${siteConfig.seoTitle}`,
    description: siteConfig.seoDescription,
    url: '/',
    siteName: siteConfig.name,
    locale: 'ar_KW',
    type: 'website',
    images: ['/og-image.jpg'],
  },
};

export default function HomePage() {
  const whatsapp = whatsappGeneralLink();

  // شريط "أعمال مختارة": أحدث أعمال أقسام التركيز فقط (غرف نوم، كنب، مجالس، مساند) — focus.ts
  const byNewest = [...visibleProducts].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  const latestOf = (slug: string, n: number) => byNewest.filter((p) => p.categorySlug === slug).slice(0, n);
  const featuredWorks = focusCategories.flatMap((c) =>
    latestOf(c.slug, c.slug === 'bedrooms' || c.slug === 'sofas' ? 3 : 1)
  );

  // القسمان الرئيسيان في الرئيسية: تفصيل غرف النوم وتفصيل الكنب، بأحدث أعمالهما الفعلية
  const showcases = [
    {
      slug: 'bedrooms',
      eyebrow: 'تخصصنا الأول',
      title: 'تفصيل غرف نوم كاملة',
      text: 'سرير وكومودينات وكبت ملابس وتسريحة بخامة ولون موحّد، بمقاس الغرفة. نزورك لأخذ المقاسات وعرض العينات، والتصنيع في منجرتنا في الضجيج.',
      cta: 'كل غرف النوم',
      wa: 'تفصيل غرفة نوم كاملة',
    },
    {
      slug: 'sofas',
      eyebrow: 'تفصيل وتنجيد',
      title: 'تفصيل كنب وقنفات',
      text: 'كنب زاوية ومودرن وأمريكي بالمقاس والقماش واللون الذي تختاره، نجارة وتنجيد داخل منجرتنا.',
      cta: 'كل الكنب والقنفات',
      wa: 'تفصيل كنب',
    },
  ].filter((sc) => categories.some((c) => c.slug === sc.slug));

  const coverOf = (slug: string) => visibleProducts.find((p) => p.categorySlug === slug && p.images[0])?.images[0];
  const countOf = (slug: string) => visibleProducts.filter((p) => p.categorySlug === slug).length;

  return (
    <div className="home-page">
      {/* SEO-friendly H1 remains a real heading and the page remains fully server-rendered. */}
      <section className="home-hero max-w-6xl mx-auto px-4 sm:px-8 pt-5 sm:pt-8">
        <div className="hero-panel">
          <div className="hero-copy">
            <span className="eyebrow">منجرة مزونة · نجار وتفصيل أثاث في الكويت منذ {siteConfig.foundedYear}</span>
            <h1>منجرة مزونة: نجار الكويت لتفصيل غرف النوم الكاملة والكنب والمجالس</h1>
            <p>{siteConfig.about}</p>

            <div className="hero-actions">
              <Link href="/category/bedrooms/" className="primary-cta">
                تفصيل غرف النوم
                <span aria-hidden="true">←</span>
              </Link>
              <Link href="/category/sofas/" className="secondary-cta">
                تفصيل الكنب
              </Link>
              <a href={whatsapp} target="_blank" rel="noreferrer" className="secondary-cta">
                تواصل عبر واتساب
              </a>
            </div>

            <nav className="hero-chips" aria-label="تصفح سريع للأقسام">
              {focusCategories.map((c) => (
                <Link key={c.slug} href={`/category/${c.slug}/`}>{c.name}</Link>
              ))}
            </nav>

            <div className="hero-trust">
              <span><b>{siteConfig.projectsCount}</b> عمل منفّذ</span>
              <span><b>{siteConfig.foundedYear}</b> منذ التأسيس</span>
              <span>تفصيل حسب الطلب</span>
            </div>
          </div>
        </div>
      </section>

      <OffersStrip offers={focusOffers} />

      {showcases.map((sc) => {
        const works = latestOf(sc.slug, 4);
        if (!works.length) return null;
        return (
          <section key={sc.slug} className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 sm:pt-14" aria-labelledby={`focus-${sc.slug}-title`}>
            <div className="section-heading">
              <div>
                <span className="eyebrow">{sc.eyebrow}</span>
                <h2 id={`focus-${sc.slug}-title`}>{sc.title}</h2>
              </div>
              <Link href={`/category/${sc.slug}/`} className="section-link">
                {sc.cta} <span aria-hidden="true">←</span>
              </Link>
            </div>
            <p className="text-ink/75 leading-relaxed max-w-3xl mb-5">{sc.text}</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {works.map((p) => (
                <ProductCard key={p.slug} product={p} compact />
              ))}
            </div>
            <a
              href={whatsappLink(sc.wa, `/category/${sc.slug}/`)}
              target="_blank"
              rel="noreferrer"
              className="inline-grid mt-5 min-h-12 px-8 place-items-center bg-sage text-white rounded-full"
            >
              اطلب زيارة لأخذ المقاسات — {sc.title}
            </a>
          </section>
        );
      })}

      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 sm:pt-14" aria-labelledby="categories-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">تصفح حسب النوع</span>
            <h2 id="categories-title">أقسام المعرض</h2>
          </div>
          <Link href="/products/" className="section-link">
            كل المنتجات <span aria-hidden="true">←</span>
          </Link>
        </div>

        <div className="category-grid visual">
          {focusCategories.map((c) => {
            const seo = getCategorySeo(c.slug, c.name);
            const cover = coverOf(c.slug);
            const count = countOf(c.slug);
            return (
              <Link key={c.slug} href={`/category/${c.slug}/`} className="category-card">
                <span className="category-card-media">
                  {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} srcSet={getSrcSet(cover)} sizes="(max-width: 640px) 45vw, 190px" alt={c.name} width={400} height={300} loading="lazy" decoding="async" />
                  )}
                </span>
                <span className="category-card-body">
                  <strong>{c.name}</strong>
                  {seo.short && <small>{seo.short}</small>}
                  {count > 0 && <em>{count} تصميم</em>}
                </span>
              </Link>
            );
          })}
        </div>

        {secondaryCategories.length > 0 && (
          <nav className="flex flex-wrap items-center gap-2 mt-5 text-sm" aria-label="أقسام أخرى">
            <span className="text-ink/55">أقسام أخرى:</span>
            {secondaryCategories.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}/`} className="bg-cream border border-sand rounded-full px-3 py-1.5 text-ink/70 hover:border-sage-soft">
                {c.name}
              </Link>
            ))}
          </nav>
        )}
      </section>

      <section id="upholstery" className="max-w-6xl mx-auto px-4 sm:px-8 pt-12 sm:pt-16 scroll-mt-24" aria-labelledby="upholstery-title">
        <div className="upholstery-panel">
          <div className="upholstery-intro">
            <span className="eyebrow">تفصيل وتجديد</span>
            <h2 id="upholstery-title">خدمات التنجيد</h2>
            <p>نجدد الكنب والمجالس والمساند مع اختيار القماش والحشوة والتفاصيل المناسبة للمكان.</p>
          </div>

          <div className="service-list">
            {services.map((s) => (
              <Link key={s.slug} href={s.path} className="service-item">
                <span>
                  <strong>{s.h1}</strong>
                  <small>{s.description}</small>
                </span>
                <span aria-hidden="true">←</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* شريط يتحرك تلقائيًا بـ CSS فقط (transform) — بدون JavaScript وبصور lazy وبأبعاد ثابتة، فلا يؤثر على LCP أو CLS */}
      {featuredWorks.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-12 sm:pt-16" aria-labelledby="featured-works-title">
          <div className="section-heading">
            <div>
              <span className="eyebrow">المعرض</span>
              <h2 id="featured-works-title">أعمال مختارة</h2>
            </div>
            <Link href="/products/" className="section-link">
              كل المنتجات <span aria-hidden="true">←</span>
            </Link>
          </div>
          <div className="works-marquee">
            <div className="works-marquee-track">
              {[0, 1].map((copy) => (
                <div key={copy} className="works-marquee-group" aria-hidden={copy === 1 ? true : undefined}>
                  {featuredWorks.map((product) => (
                    <div key={product.slug} className="works-marquee-item">
                      <ProductCard product={product} compact />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-12 sm:pt-16" aria-label="الفواتير والضمان">
        <TrustSection />
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="home-about">
          <div className="stats-grid">
            <div><b>{siteConfig.projectsCount}</b><span>عمل منفّذ</span></div>
            <div><b>{siteConfig.foundedYear}</b><span>منذ التأسيس</span></div>
          </div>

          <div className="about-copy">
            <span className="eyebrow">عن مزونة</span>
            <h2>أثاث وديكور بتفاصيل تناسب بيتك</h2>
            <p>
              مزونة منجرة ومعرض للأثاث والديكور في الكويت منذ {siteConfig.foundedYear}، ونفّذنا {siteConfig.projectsText}.
              نوفّر <Link href="/category/sofas/">كنب وقنفات</Link>، <Link href="/category/majlis/">مجالس</Link>،
              <Link href="/category/cushions/"> مساند</Link> و<Link href="/category/bedrooms/"> غرف نوم</Link>،
              جاهزة أو بالتفصيل حسب الطلب بالمقاس والقماش واللون المناسب.
            </p>
            <p>
              معرضنا في {siteConfig.address}، والدوام {siteConfig.hours}. للاستفسار عن أي قطعة أو طلب تفصيل،
              راسلنا عبر <a href={whatsapp} target="_blank" rel="noreferrer">واتساب</a> على الرقم{' '}
              <span dir="ltr">{siteConfig.phoneDisplay}</span>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
