import type { Metadata } from 'next';
import Link from 'next/link';
import { visibleProducts } from '@/data/products';
import { categories } from '@/data/categories';
import { getCategorySeo } from '@/data/category-seo';
import { services } from '@/data/services';
import { siteConfig, whatsappGeneralLink, whatsappLink } from '@/data/site-config';
import ProductCard from '@/components/ProductCard';
import OffersStrip from '@/components/OffersStrip';
import { visibleOffers } from '@/data/offers';
import { getSrcSet } from '@/lib/image';
import { formatPrice } from '@/lib/catalog';
import { readyPieces, readyGroupsWithItems, readyGroupHref } from '@/data/ready-groups';
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

  // شريط "أعمال مختارة": أحدث عمل من كل قسم، وثلاثة أعمال لغرف النوم والكنب
  const byNewest = [...visibleProducts].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  const latestOf = (slug: string, n: number) => byNewest.filter((p) => p.categorySlug === slug).slice(0, n);
  const featuredWorks = categories.flatMap((c) =>
    latestOf(c.slug, c.slug === 'bedrooms' || c.slug === 'sofas' || c.slug === 'tables' ? 3 : 1)
  );

  // الأقسام الرئيسية في الرئيسية (طلب المالك 2026-11-23): غرف النوم ثم الكنب ثم طاولات الطعام، ثم الوجار
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
    {
      slug: 'tables',
      eyebrow: 'تفصيل حسب المقاس',
      title: 'تفصيل طاولات طعام',
      text: 'طاولة طعام خشب أو رخام لـ4 و6 و7 أشخاص، مع كراسي منجّدة وطاولة بوفيه بالتصميم نفسه، بمقاس غرفة الطعام. التصنيع في منجرتنا في الضجيج والتوصيل مجاني.',
      cta: 'كل طاولات الطعام',
      wa: 'تفصيل طاولة طعام',
    },
    {
      slug: 'coffee-wijar',
      eyebrow: 'تجهيز الديوانيات',
      title: 'تفصيل وجار ديوانية',
      text: 'وجار خشب من الأرض للسقف بمقاس جدار الديوانية: مكان للشاشة، رفوف لعرض الدلال، إضاءة مخفية وقاعدة لركن القهوة. 45 د.ك للمتر، والتصنيع والتركيب من منجرتنا في الضجيج.',
      cta: 'كل أعمال الوجار',
      wa: 'تفصيل وجار ديوانية',
    },
  ].filter((sc) => categories.some((c) => c.slug === sc.slug));

  // القطع الجاهزة للتوصيل (طلب المالك 2026-11-27): لها الأولوية في الرئيسية، الأحدث أولًا حسب رقم القطعة
  const readyGroups = readyGroupsWithItems;
  const newest = readyPieces.slice(0, 8);
  // بانرات الأقسام: أقل سعر يُحسب من البيانات الفعلية (لا أرقام مكتوبة يدويًا)
  const bannerOrder: { slug: string; tone: string }[] = [
    { slug: 'seating', tone: 'yellow' },
    { slug: 'lighting', tone: 'dark' },
    { slug: 'storage', tone: 'sage' },
    { slug: 'tables', tone: 'yellow' },
  ];
  const banners = bannerOrder
    .map((b) => ({ ...b, ...readyGroups.find((g) => g.slug === b.slug)! }))
    .filter((b) => b.name && b.count > 0);
  const inBand = (min: number, max: number) => readyPieces.filter((p) => p.price >= min && p.price < max).length;
  const priceBands = [
    { pre: 'تحت', label: '20', href: '/products/?max=20', count: inBand(0, 20), highlight: true },
    { pre: 'من', label: '20–50', href: '/products/?min=20&max=50', count: inBand(20, 50) },
    { pre: 'من', label: '50–100', href: '/products/?min=50&max=100', count: inBand(50, 100) },
    { pre: 'فوق', label: '100', href: '/products/?min=100', count: inBand(100, Infinity) },
  ].filter((b) => b.count > 0);

  const coverOf = (slug: string) => visibleProducts.find((p) => p.categorySlug === slug && p.images[0])?.images[0];
  const countOf = (slug: string) => visibleProducts.filter((p) => p.categorySlug === slug).length;

  return (
    <div className="home-page">
      {/* تصميم «سوق إلكتروني» (اعتمده المالك 2026-11-27): القطع الجاهزة أولًا.
          نص H1 والعنوان والوصف كما هي حرفيًا (لا تغيير على كلمات البحث الحالية). */}
      <section className="store-intro" aria-label="منجرة مزونة">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <h1>منجرة مزونة: نجار الكويت لتفصيل غرف النوم والكنب وطاولات الطعام ووجار الديوانية</h1>
          <p>{readyPieces.length} قطعة جاهزة بسعر نهائي ورسوم توصيل مكتوبة، وتفصيل حسب الطلب من منجرتنا في الضجيج منذ {siteConfig.foundedYear}.</p>
        </div>
      </section>

      {readyGroups.length > 0 && (
        <nav className="store-groups" aria-label="أنواع القطع الجاهزة">
          <div className="store-groups-row max-w-6xl mx-auto">
            {readyGroups.map((g) => (
              <Link key={g.slug} href={readyGroupHref(g.slug)} className="store-group">
                <span className="store-group-img">
                  {g.cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.cover} srcSet={getSrcSet(g.cover)} sizes="68px" alt="" width={68} height={68} loading="lazy" decoding="async" />
                  )}
                </span>
                <span className="store-group-name">{g.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}

      {banners.length > 0 && (
        <section className="store-banners max-w-6xl mx-auto" aria-label="عروض الأقسام">
          <div className="store-banners-track">
            {banners.map((b, i) => (
              <Link key={b.slug} href={readyGroupHref(b.slug)} className={`store-banner store-banner-${b.tone}`}>
                <span className="store-banner-copy">
                  <small>{b.name}</small>
                  <strong>من {formatPrice(b.minPrice)} د.ك</strong>
                  <em>تسوّق الآن</em>
                </span>
                {b.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.cover}
                    srcSet={getSrcSet(b.cover)}
                    sizes="150px"
                    alt=""
                    width={150}
                    height={170}
                    // صورة البانر الأول هي عنصر LCP في الرئيسية على الجوال (PageSpeed 2026-11-27: 3.5 ث بسبب lazy):
                    // تُحمَّل فورًا وبأولوية عالية، وبقية البانرات (خارج الشاشة أفقيًا) lazy.
                    loading={i === 0 ? 'eager' : 'lazy'}
                    fetchPriority={i === 0 ? 'high' : 'auto'}
                    decoding={i === 0 ? 'sync' : 'async'}
                  />
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {newest.length > 0 && (
        <section className="store-block max-w-6xl mx-auto" aria-labelledby="store-new-title">
          <div className="store-head">
            <h2 id="store-new-title">وصل حديثاً</h2>
            <Link href="/category/ready-pieces/">عرض الكل</Link>
          </div>
          <div className="store-rail">
            {newest.map((p) => (
              <ProductCard key={p.slug} product={p} rail isNew />
            ))}
          </div>
        </section>
      )}

      {readyPieces.length > 0 && (
        <section className="store-block max-w-6xl mx-auto" aria-labelledby="store-price-title">
          <div className="store-head">
            <h2 id="store-price-title">تسوّق حسب السعر</h2>
          </div>
          <div className="store-prices">
            {priceBands.map((b) => (
              <Link key={b.label} href={b.href} className={`store-price ${b.highlight ? 'is-hot' : ''}`}>
                <small>{b.pre}</small>
                <b dir="ltr">{b.label}</b>
                <small>د.ك · {b.count} قطعة</small>
              </Link>
            ))}
          </div>
        </section>
      )}

      {readyPieces.length > 0 && (
        <section className="store-block max-w-6xl mx-auto" aria-labelledby="store-all-title">
          <div className="store-head">
            <h2 id="store-all-title">كل القطع الجاهزة</h2>
            <span>{readyPieces.length} قطعة</span>
          </div>
          <div className="store-grid">
            {readyPieces.slice(0, 12).map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
          <Link href="/category/ready-pieces/" className="store-more">
            عرض كل القطع الجاهزة ({readyPieces.length})
          </Link>
        </section>
      )}

      <OffersStrip offers={visibleOffers} />

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
                      <ProductCard product={product} compact decorative={copy === 1} />
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
              نوفّر <Link href="/category/bedrooms/">غرف نوم</Link>، <Link href="/category/sofas/">كنب وقنفات</Link>، <Link href="/category/tables/">طاولات طعام</Link>،
              <Link href="/category/coffee-wijar/"> وجار ديوانية</Link>، <Link href="/category/majlis/">مجالس</Link> و<Link href="/category/cushions/"> مساند</Link>،
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
