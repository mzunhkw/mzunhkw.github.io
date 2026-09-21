import type { Metadata } from 'next';
import Link from 'next/link';
import { visibleProducts } from '@/data/products';
import { categories } from '@/data/categories';
import { getCategorySeo } from '@/data/category-seo';
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
  },
};

export default function HomePage() {
  const featured = visibleProducts.filter((p) => p.featured);
  const whatsapp = `https://wa.me/${siteConfig.whatsappNumber}`;

  return (
    <div>
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-4 sm:pt-10 pb-8">
        <div className="bg-sand rounded-3xl px-5 py-8 sm:px-12 sm:py-14">
          <p className="text-sage text-sm">{siteConfig.nameEn}</p>
          <h1 className="text-2xl sm:text-5xl mt-2 max-w-3xl leading-snug sm:leading-tight">
            كنب وقنفات ومجالس ومساند في الكويت
          </h1>
          <p className="text-ink/70 mt-3 max-w-xl text-sm sm:text-base leading-relaxed">{siteConfig.about}</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link
              href="/products/"
              className="min-h-12 px-6 grid place-items-center bg-sage text-white rounded-full"
            >
              تصفح المنتجات
            </Link>
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="min-h-12 px-6 grid place-items-center bg-white/70 border border-sage/30 rounded-full"
            >
              تواصل عبر واتساب
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-10">
        <h2 className="text-xl sm:text-2xl mb-4">أقسام المعرض</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((c) => {
            const seo = getCategorySeo(c.slug, c.name);
            return (
              <Link
                key={c.slug}
                href={`/category/${c.slug}/`}
                className="border border-sand bg-white rounded-2xl p-4 hover:border-sage-soft"
              >
                <span className="block text-base sm:text-lg text-sage font-medium">{c.name}</span>
                {seo.short && <span className="block text-sm text-ink/60 mt-1">{seo.short}</span>}
              </Link>
            );
          })}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-10">
          <h2 className="text-xl sm:text-2xl mb-4">مختارات</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-16">
        <div className="grid grid-cols-2 gap-3 max-w-xl mb-8">
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

        <h2 className="text-2xl mb-4">مزونة للكنب والمجالس والمساند في الكويت</h2>
        <div className="max-w-3xl space-y-4 text-ink/80 leading-relaxed">
          <p>
            مزونة منجرة ومعرض للأثاث والديكور في الكويت منذ {siteConfig.foundedYear}، ونفّذنا{' '}
            {siteConfig.projectsText}. نوفّر{' '}
            <Link href="/category/sofas/" className="text-sage underline">
              كنب وقنفات
            </Link>
            ،{' '}
            <Link href="/category/majlis/" className="text-sage underline">
              مجالس
            </Link>{' '}
            و
            <Link href="/category/cushions/" className="text-sage underline">
              مساند
            </Link>{' '}
            جاهزة، ونفصّلها حسب الطلب بالمقاس والقماش واللون الذي يناسب بيتك.
          </p>
          <p>
            معرضنا في {siteConfig.address}، والدوام {siteConfig.hours}. للاستفسار عن أي قطعة أو طلب تفصيل،
            راسلنا عبر{' '}
            <a href={whatsapp} target="_blank" rel="noreferrer" className="text-sage underline">
              واتساب
            </a>{' '}
            على الرقم <span dir="ltr">{siteConfig.phoneDisplay}</span>.
          </p>
        </div>
      </section>
    </div>
  );
}
