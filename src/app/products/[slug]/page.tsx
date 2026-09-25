import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { visibleProducts } from '@/data/products';
import { categories } from '@/data/categories';
import { availabilityLabels } from '@/lib/types';
import { formatPrice } from '@/lib/catalog';
import { whatsappLinkForProduct } from '@/data/site-config';
import Gallery from '@/components/Gallery';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import ProductCard from '@/components/ProductCard';
import { siteConfig } from '@/data/site-config';
import { absoluteUrl, breadcrumbLd } from '@/lib/seo';

export function generateStaticParams() {
  const params = visibleProducts.map((p) => ({ slug: p.slug }));
  // مع output: 'export' قائمة فارغة قد تفشل البناء (مثلاً لو حذفت كل المنتجات من اللوحة).
  return params.length ? params : [{ slug: 'none' }];
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = visibleProducts.find((p) => p.slug === params.slug);
  if (!product) return {};
  const description = (product.shortDescription || product.description).slice(0, 160);
  return {
    title: product.title,
    description,
    alternates: { canonical: `/products/${product.slug}/` },
    openGraph: {
      title: product.title,
      description,
      url: `/products/${product.slug}/`,
      siteName: siteConfig.name,
      locale: 'ar_KW',
      type: 'website',
      images: [product.images[0] || '/og-image.jpg'],
    },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = visibleProducts.find((p) => p.slug === params.slug);
  if (!product) return notFound();

  const category = categories.find((c) => c.slug === product.categorySlug);
  const path = `/products/${product.slug}/`;
  const related = visibleProducts
    .filter((p) => p.categorySlug === product.categorySlug && p.slug !== product.slug)
    .slice(0, 3);

  const productLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.shortDescription || product.description,
    url: absoluteUrl(path),
    sku: product.slug,
    brand: { '@type': 'Brand', name: siteConfig.name },
    ...(category ? { category: category.name } : {}),
    ...(product.images.length ? { image: product.images.map(absoluteUrl) } : {}),
    ...(product.price > 0
      ? {
          offers: {
            '@type': 'Offer',
            url: absoluteUrl(path),
            priceCurrency: 'KWD',
            price: formatPrice(product.price),
            ...(product.availability === 'ready-piece'
              ? { availability: 'https://schema.org/InStock' }
              : product.availability === 'temporarily-unavailable'
                ? { availability: 'https://schema.org/OutOfStock' }
                : {}),
          },
        }
      : {}),
  };

  const crumbs = [
    { name: 'الرئيسية', path: '/' },
    ...(category ? [{ name: category.name, path: `/category/${category.slug}/` }] : []),
    { name: product.title, path },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-4 pb-28 sm:py-12">
      <JsonLd data={productLd} />
      <JsonLd data={breadcrumbLd(crumbs)} />

      <nav aria-label="مسار التنقل" className="text-sm text-ink/55 mb-4">
        <Link href="/" className="hover:text-sage">
          الرئيسية
        </Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/category/${category.slug}/`} className="hover:text-sage">
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid sm:grid-cols-2 gap-6 sm:gap-10">
      {/* لا تتوفر أوصاف alt فريدة لكل صورة منتج (بعكس صور أعمال صفحات التنجيد) —
          لذلك نبني عنوان alt أغنى من العنوان المجرد بإضافة القسم والخامة إن وجدت،
          وهذا أفضل ما يمكن اشتقاقه تلقائيًا من بيانات المنتج الحالية. لإضافة alt
          وصفي مختلف فعليًا لكل صورة، يلزم إضافة حقل بيانات جديد في products.json
          (ولوحة الإدارة) لكل صورة على حدة. */}
      <Gallery
        images={product.images}
        title={[product.title, category?.name, product.materials?.[0]].filter(Boolean).join(' — ')}
      />

      <div>
        {category && <p className="text-sm text-sage">{category.name}</p>}
        <h1 className="text-xl sm:text-3xl mt-1 leading-snug">{product.title}</h1>
        <p className="text-2xl mt-2 text-sage font-medium">{formatPrice(product.price)} د.ك</p>
        <p className="text-sm text-ink/60 mt-1">
          {product.size} · {product.region}
        </p>
        <p className="text-sm mt-3 inline-block bg-sand rounded-full px-3 py-1">
          {availabilityLabels[product.availability]}
        </p>

        <p className="mt-6 leading-relaxed text-ink/80 whitespace-pre-line">{product.description}</p>

        {product.materials && product.materials.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-ink/55 mb-2">الخامات</p>
            <div className="flex flex-wrap gap-2">
              {product.materials.map((m) => (
                <span key={m} className="text-sm bg-sage-mist rounded-full px-3 py-1">
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        <a
          href={whatsappLinkForProduct(product.title)}
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-grid mt-8 min-h-12 px-8 place-items-center bg-sage text-white rounded-full"
        >
          الاستفسار عبر واتساب
        </a>
      </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg sm:text-xl mb-4">قطع أخرى من {category?.name}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-sand px-4 pt-3 pb-safe">
        <a
          href={whatsappLinkForProduct(product.title)}
          target="_blank"
          rel="noreferrer"
          className="min-h-12 grid place-items-center bg-sage text-white rounded-full font-medium"
        >
          اسأل عن المنتج عبر واتساب
        </a>
      </div>
    </div>
  );
}
