import Link from 'next/link';
import { siteConfig, whatsappLink } from '@/data/site-config';
import { absoluteUrl, breadcrumbLd } from '@/lib/seo';
import { Article, articles } from '@/data/articles';
import JsonLd from '@/components/JsonLd';
import ProductCard from '@/components/ProductCard';
import { visibleProducts } from '@/data/products';
import { getSrcSet, getImageDimensions } from '@/lib/image';

const chip = 'border border-sand bg-white rounded-full px-4 py-2 text-sm hover:border-sage-soft';

export default function ArticlePage({ article }: { article: Article }) {
  const url = absoluteUrl(article.path);
  const others = articles.filter((a) => a.slug !== article.slug);
  const gallery = article.gallery || [];
  const linkedProducts = (article.productSlugs || [])
    .map((slug) => visibleProducts.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.h1,
    description: article.description,
    inLanguage: 'ar',
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    image: gallery.length > 0 ? gallery.map((g) => absoluteUrl(g.src)) : [absoluteUrl('/og-image.jpg')],
    author: { '@type': 'Organization', name: `منجرة ${siteConfig.name}`, url: siteConfig.siteUrl },
    publisher: { '@id': `${siteConfig.siteUrl}/#store` },
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <article className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
      <JsonLd data={articleLd} />
      <JsonLd data={faqLd} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'الرئيسية', path: '/' },
          { name: 'المقالات', path: '/articles/' },
          { name: article.h1, path: article.path },
        ])}
      />

      <nav aria-label="مسار التنقل" className="text-sm text-ink/55 mb-4">
        <Link href="/" className="hover:text-sage">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href="/articles/" className="hover:text-sage">المقالات</Link>
        <span className="mx-2">/</span>
        <span>{article.h1}</span>
      </nav>

      <header className="max-w-3xl">
        <h1 className="text-2xl sm:text-4xl leading-snug">{article.h1}</h1>
        <p className="mt-3 text-sm text-ink/55">
          <time dateTime={article.dateModified}>{article.dateModified}</time>
          <span className="mx-2">·</span>
          قراءة {article.readingMinutes} دقائق
        </p>
        {article.intro.map((t) => (
          <p key={t} className="mt-4 text-ink/75 leading-relaxed">{t}</p>
        ))}
      </header>

      {gallery.length > 0 && (
        <section aria-label="صور من أعمالنا" className="mt-8 max-w-3xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {gallery.map((g, i) => {
              const dim = getImageDimensions(g.src);
              return (
                <figure key={g.src} className={i === 0 ? 'col-span-2 sm:col-span-1' : ''}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.src}
                    srcSet={getSrcSet(g.src)}
                    sizes={i === 0 ? '(max-width: 640px) calc(100vw - 32px), 250px' : '(max-width: 640px) 45vw, 250px'}
                    alt={g.alt}
                    width={dim?.width || 900}
                    height={dim?.height || 1200}
                    loading="lazy"
                    className="w-full aspect-[3/4] object-cover rounded-2xl bg-sand"
                  />
                </figure>
              );
            })}
          </div>
          <p className="text-sm text-ink/55 mt-2">صور حقيقية من أعمال منجرة مزونة</p>
        </section>
      )}

      <div className="mt-8 max-w-3xl space-y-10">
        {article.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl sm:text-2xl mb-3">{s.heading}</h2>
            {s.paragraphs.map((p) => (
              <p key={p} className="text-ink/75 leading-relaxed mb-3">{p}</p>
            ))}
            {s.list && s.list.length > 0 && (
              <ul className="list-disc pr-5 space-y-1.5 text-ink/75 leading-relaxed">
                {s.list.map((li) => <li key={li}>{li}</li>)}
              </ul>
            )}
            {s.links && s.links.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {s.links.map((l) => (
                  <Link key={l.href} href={l.href} className={chip}>{l.label}</Link>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {linkedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl sm:text-2xl mb-4">من أعمالنا</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {linkedProducts.map((p) => (
              <ProductCard key={p.slug} product={p} compact />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 bg-sage-mist rounded-2xl p-6 max-w-xl">
        <h2 className="text-xl mb-2">تحتاج عرض سعر؟</h2>
        <p className="text-ink/70 leading-relaxed">أرسل لنا الصور والقياسات عبر واتساب، ونرد عليك بالتفاصيل والسعر.</p>
        <a
          href={whatsappLink(article.h1, article.path)}
          target="_blank"
          rel="noreferrer"
          className="inline-grid mt-4 min-h-12 px-6 place-items-center bg-sage text-white rounded-full"
        >
          تواصل عبر واتساب
        </a>
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="text-2xl mb-4">أسئلة شائعة</h2>
        <div className="space-y-3">
          {article.faqs.map((f) => (
            <details key={f.q} className="bg-white border border-sand rounded-2xl p-4">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="text-ink/75 mt-2 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl mb-4">صفحات ذات صلة</h2>
        <div className="flex flex-wrap gap-3">
          {article.related.map((l) => (
            <Link key={l.href} href={l.href} className={chip}>{l.label}</Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl mb-4">مقالات أخرى</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {others.map((a) => (
            <Link key={a.slug} href={a.path} className="block bg-white border border-sand rounded-2xl p-4 hover:border-sage-soft">
              <strong className="block leading-relaxed">{a.h1}</strong>
              <span className="block text-sm text-ink/60 mt-1 leading-relaxed">{a.excerpt}</span>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
