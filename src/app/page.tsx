import type { Metadata } from 'next';
import Link from 'next/link';
import { visibleProducts } from '@/data/products';
import { categories } from '@/data/categories';
import { getCategorySeo } from '@/data/category-seo';
import { services } from '@/data/services';
import { siteConfig } from '@/data/site-config';
import ProductCard from '@/components/ProductCard';
import OffersStrip from '@/components/OffersStrip';
import { visibleOffers } from '@/data/offers';
import { getSrcSet } from '@/lib/image';

export const metadata: Metadata = {
  title: { absolute: `منجرة ${siteConfig.name} — ${siteConfig.seoTitle}` },
  description: siteConfig.seoDescription,
  alternates: { canonical: '/' },
  openGraph: {
    title: `منجرة ${siteConfig.name} — ${siteConfig.seoTitle}`,
    description: siteConfig.seoDescription,
    url: '/',
    siteName: siteConfig.name,
    locale: 'ar_KW',
    type: 'website',
    images: ['/og-image.jpg'],
  },
};

export default function HomePage() {
  const whatsapp = `https://wa.me/${siteConfig.whatsappNumber}`;

  // آخر منتج من كل قسم — تظهر بشريط "أعمال مختارة" المتحرك
  const byNewest = [...visibleProducts].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  const featuredWorks = categories
    .map((c) => byNewest.find((p) => p.categorySlug === c.slug))
    .filter((p): p is (typeof visibleProducts)[number] => !!p);

  const coverOf = (slug: string) => visibleProducts.find((p) => p.categorySlug === slug && p.images[0])?.images[0];
  const countOf = (slug: string) => visibleProducts.filter((p) => p.categorySlug === slug).length;

  return (
    <div className="home-page">
      {/* SEO-friendly H1 remains a real heading and the page remains fully server-rendered. */}
      <section className="home-hero max-w-6xl mx-auto px-4 sm:px-8 pt-5 sm:pt-8">
        <div className="hero-panel">
          <div className="hero-copy">
            <span className="eyebrow">منجرة مزونة · نجار وتفصيل أثاث في الكويت منذ {siteConfig.foundedYear}</span>
            <h1>منجرة مزونة: تفصيل أثاث وتنجيد كنب في الكويت</h1>
            <p>{siteConfig.about}</p>

            <div className="hero-actions">
              <Link href="/products/" className="primary-cta">
                استكشف المنتجات
                <span aria-hidden="true">←</span>
              </Link>
              <a href={whatsapp} target="_blank" rel="noreferrer" className="secondary-cta">
                تواصل عبر واتساب
              </a>
            </div>

            <nav className="hero-chips" aria-label="تصفح سريع للأقسام">
              {categories.map((c) => (
                <Link key={c.slug} href={`/category/${c.slug}/`}>{c.name}</Link>
              ))}
            </nav>

            <div className="hero-trust">
              <span><b>{siteConfig.projectsCount}</b> مشروع</span>
              <span><b>{siteConfig.foundedYear}</b> منذ التأسيس</span>
              <span>تفصيل حسب الطلب</span>
            </div>
          </div>
        </div>
      </section>

      <OffersStrip offers={visibleOffers} />

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
          {categories.map((c) => {
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
      </section>

      <section id="خدمات-التنجيد" className="max-w-6xl mx-auto px-4 sm:px-8 pt-12 sm:pt-16 scroll-mt-24" aria-labelledby="upholstery-title">
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

      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="home-about">
          <div className="stats-grid">
            <div><b>{siteConfig.projectsCount}</b><span>مشروع منفّذ</span></div>
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
