import type { Metadata } from 'next';
import Link from 'next/link';
import { visibleProducts } from '@/data/products';
import { categories } from '@/data/categories';
import { getCategorySeo } from '@/data/category-seo';
import { services } from '@/data/services';
import { siteConfig } from '@/data/site-config';
import ProductCard from '@/components/ProductCard';

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — ${siteConfig.seoTitle}` },
  description: siteConfig.seoDescription,
  alternates: { canonical: '/' },
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.seoTitle}`,
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

  // products.json is maintained newest-first by the existing admin workflow.
  // Keeping the data source unchanged preserves the existing SEO/product URLs.
  const latestProducts = visibleProducts.slice(0, 8);
  const heroProduct = latestProducts[0];
  const supportingProducts = latestProducts.slice(1, 5);

  const categoryWorks = categories
    .map((c) => ({
      category: c,
      items: visibleProducts.filter((p) => p.categorySlug === c.slug).slice(0, 4),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="home-page">
      {/* SEO-friendly H1 remains a real heading and the page remains fully server-rendered. */}
      <section className="home-hero max-w-6xl mx-auto px-4 sm:px-8 pt-5 sm:pt-8">
        <div className="hero-panel">
          <div className="hero-copy">
            <span className="eyebrow">مزونة للأثاث والديكور · الكويت</span>
            <h1>كنب وقنفات ومجالس ومساند وغرف نوم في الكويت</h1>
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

            <div className="hero-trust">
              <span><b>{siteConfig.projectsCount}</b> مشروع</span>
              <span><b>{siteConfig.foundedYear}</b> منذ التأسيس</span>
              <span>تفصيل حسب الطلب</span>
            </div>
          </div>

          <div className="hero-brand" aria-label={siteConfig.name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-hero@760w.webp"
              srcSet="/logo-hero@508w.webp 508w, /logo-hero@600w.webp 600w, /logo-hero@760w.webp 760w"
              sizes="(max-width: 600px) 300px, 410px"
              alt={`شعار ${siteConfig.name}`}
              width={760}
              height={694}
              fetchPriority="high"
              className="hero-logo"
            />
            <span>للديكور الحديث</span>
          </div>
        </div>
      </section>

      {/* Main product discovery block: the first product gets visual priority without hiding links from crawlers. */}
      {heroProduct && (
        <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 sm:pt-14" aria-labelledby="latest-products-title">
          <div className="section-heading">
            <div>
              <span className="eyebrow">مختارات من المعرض</span>
              <h2 id="latest-products-title">أحدث الأعمال</h2>
            </div>
            <Link href="/products/" className="section-link">
              عرض كل المنتجات <span aria-hidden="true">←</span>
            </Link>
          </div>

          <div className="latest-showcase">
            <div className="featured-product">
              <ProductCard product={heroProduct} featured />
            </div>

            <div className="latest-grid">
              {supportingProducts.map((product) => (
                <ProductCard key={product.slug} product={product} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-12 sm:pt-16" aria-labelledby="categories-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">تصفح حسب النوع</span>
            <h2 id="categories-title">أقسام المعرض</h2>
          </div>
          <Link href="/products/" className="section-link">
            كل المنتجات <span aria-hidden="true">←</span>
          </Link>
        </div>

        <div className="category-grid">
          {categories.map((c) => {
            const seo = getCategorySeo(c.slug, c.name);
            return (
              <Link key={c.slug} href={`/category/${c.slug}/`} className="category-tile">
                <span className="category-number" aria-hidden="true">
                  {String(categories.indexOf(c) + 1).padStart(2, '0')}
                </span>
                <span>
                  <strong>{c.name}</strong>
                  {seo.short && <small>{seo.short}</small>}
                </span>
                <span className="tile-arrow" aria-hidden="true">←</span>
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

      {/* Category product links remain in the HTML for discoverability and internal linking. */}
      {categoryWorks.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-12 sm:pt-16" aria-labelledby="category-works-title">
          <div className="section-heading">
            <div>
              <span className="eyebrow">المعرض</span>
              <h2 id="category-works-title">أعمال مختارة حسب القسم</h2>
            </div>
          </div>

          <div className="category-work-sections">
            {categoryWorks.map(({ category, items }) => (
              <div key={category.slug} className="category-work-row">
                <div className="category-work-heading">
                  <h3>{category.name}</h3>
                  <Link href={`/category/${category.slug}/`} className="section-link">
                    عرض القسم <span aria-hidden="true">←</span>
                  </Link>
                </div>
                <div className="category-work-grid">
                  {items.map((product) => (
                    <ProductCard key={product.slug} product={product} compact />
                  ))}
                </div>
              </div>
            ))}
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
