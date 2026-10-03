import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { visibleProducts } from '@/data/products';
import { categories } from '@/data/categories';
import { availabilityLabels } from '@/lib/types';
import { formatPrice } from '@/lib/catalog';
import { woodTiers, woodMin, woodMax, woodAvg, woodPricedCategories } from '@/data/wood-tiers';
import { whatsappLinkForProduct, deliveryDays } from '@/data/site-config';
import Gallery from '@/components/Gallery';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import ProductCard from '@/components/ProductCard';
import { siteConfig } from '@/data/site-config';
import { absoluteUrl, breadcrumbLd } from '@/lib/seo';
import { areaPages } from '@/data/area-pages';
import { articlesLinkingTo } from '@/data/articles';

export function generateStaticParams() {
  const params = visibleProducts.map((p) => ({ slug: p.slug }));
  // مع output: 'export' قائمة فارغة قد تفشل البناء (مثلاً لو حذفت كل المنتجات من اللوحة).
  return params.length ? params : [{ slug: 'none' }];
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = visibleProducts.find((p) => p.slug === params.slug);
  if (!product) return {};
  const category = categories.find((c) => c.slug === product.categorySlug);
  const short = (product.shortDescription || '').trim();
  const base =
    short.length >= 70
      ? short
      : [product.title, short, product.description, category ? `${category.name} في الكويت من مزونة` : '']
          .map((x) => x.trim().replace(/[.،\s]+$/, ''))
          .filter(Boolean)
          .join('. ');
  const generatedDescription = base.length > 160 ? base.slice(0, 157).replace(/\s+\S*$/, '') + '…' : base;
  const seoTitle = (product.seoTitle || '').trim() || product.title;
  const description = (product.metaDescription || '').trim() || generatedDescription;
  return {
    title: seoTitle,
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

  const delivery = deliveryDays(product.categorySlug);

  const productLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.shortDescription || product.description,
    url: absoluteUrl(path),
    sku: product.slug,
    brand: { '@type': 'Brand', name: siteConfig.name },
    ...(product.materials?.length ? { material: product.materials[0] } : {}),
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
                : // التفصيل حسب الطلب متاح للطلب الآن — Google لا يقبل MadeToOrder في بيانات التاجر
                  { availability: 'https://schema.org/InStock' }),
            ...(/للمتر|المتر/.test(product.size || '')
              ? {
                  priceSpecification: {
                    '@type': 'UnitPriceSpecification',
                    price: formatPrice(product.price),
                    priceCurrency: 'KWD',
                    unitCode: 'MTR',
                    unitText: 'متر',
                  },
                }
              : {}),
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@type': 'Organization', name: siteConfig.name },
            // التوصيل مجاني داخل الكويت
            shippingDetails: {
              '@type': 'OfferShippingDetails',
              shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'KWD' },
              shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'KW' },
              // مجموع التجهيز + التوصيل = المدة المؤكدة من المالك (يوم واحد للتوصيل داخل الكويت)
              deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: { '@type': 'QuantitativeValue', minValue: delivery.min - 1, maxValue: delivery.max - 1, unitCode: 'DAY' },
                transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1, unitCode: 'DAY' },
              },
            },
            // التفصيل حسب الطلب لا يُسترجع، إلا في حالة العيوب المصنعية (بدون رسوم على العميل)
            hasMerchantReturnPolicy: {
              '@type': 'MerchantReturnPolicy',
              applicableCountry: 'KW',
              returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
              itemDefectReturnFees: 'https://schema.org/FreeReturn',
            },
            areaServed: { '@type': 'Country', name: 'الكويت' },
          },
        }
      : {}),
  };

  // غرف النوم: كل نوع خشب = متغيّر (variant) بسعره، ضمن ProductGroup يفهمه Google كمنتج احترافي بخيارات
  const woodPriced = woodPricedCategories.includes(product.categorySlug);
  const baseOffer = (productLd.offers || {}) as Record<string, unknown>;
  const structuredData: Record<string, unknown> = woodPriced
    ? {
        '@context': 'https://schema.org',
        '@type': 'ProductGroup',
        name: product.title,
        description: productLd.description,
        url: absoluteUrl(path),
        productGroupID: product.slug,
        brand: productLd.brand,
        ...(productLd.image ? { image: productLd.image } : {}),
        variesBy: 'https://schema.org/material',
        hasVariant: woodTiers.map((t) => ({
          '@type': 'Product',
          name: `${product.title} — ${t.name}`,
          // Google يشترط description لكل متغيّر Product (كان ينقص فيُرفض التحقق في Search Console)
          description: `${productLd.description} الخامة: ${t.name}.`,
          sku: `${product.slug}-${t.id}`,
          inProductGroupWithID: product.slug,
          material: t.name,
          ...(productLd.image ? { image: productLd.image } : {}),
          offers: {
            ...baseOffer,
            url: `${absoluteUrl(path)}?wood=${t.id}`,
            price: formatPrice(t.price),
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: formatPrice(t.price),
              priceCurrency: 'KWD',
              unitCode: 'MTR',
              unitText: 'متر',
            },
          },
        })),
      }
    : productLd;

  const crumbs = [
    { name: 'الرئيسية', path: '/' },
    ...(category ? [{ name: category.name, path: `/category/${category.slug}/` }] : []),
    { name: product.title, path },
  ];

  // روابط داخلية: صفحة "نجار المحافظة" حسب منطقة المنتج، ومقالات القسم
  const areaPage = areaPages.find((a) => a.districts.some((d) => (product.region || '').includes(d)));
  const guides = category ? articlesLinkingTo(`/category/${category.slug}/`) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-4 pb-28 sm:py-12" data-wa-label={category?.name || product.title}>
      <JsonLd data={structuredData} />
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
        alts={product.imageAlts}
      />

      <div>
        {category && <p className="text-sm text-sage">{category.name}</p>}
        <h1 className="text-xl sm:text-3xl mt-1 leading-snug">{product.title}</h1>
        <p className="text-2xl mt-2 text-sage font-medium">
            {woodPriced ? `من ${woodMin} إلى ${woodMax} د.ك للمتر` : `${formatPrice(product.price)} د.ك`}
          </p>
          {woodPriced && <p className="text-sm text-ink/60 mt-1">متوسط السعر {formatPrice(woodAvg)} د.ك للمتر حسب نوع الخشب</p>}
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

        {woodPriced && (
          <div className="mt-6">
            <h2 className="text-base font-medium mb-2">السعر حسب نوع الخشب (للمتر)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-sand rounded-xl overflow-hidden">
                <tbody>
                  {woodTiers.map((t) => (
                    <tr key={t.id} className="border-b border-sand last:border-0">
                      <th scope="row" className="text-start font-medium px-3 py-2 bg-cream">{t.name}</th>
                      <td className="px-3 py-2 text-ink/60">{t.note}</td>
                      <td className="px-3 py-2 text-sage font-medium whitespace-nowrap">{t.price} د.ك</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-ink/55 mt-2">الإجمالي = عدد الأمتار × سعر المتر للخشب المختار. نحدد المقاسات بدقة في زيارة القياس.</p>
          </div>
        )}

        <ul className="mt-6 grid gap-2 text-sm text-ink/75">
          <li>✓ تفصيل حسب المقاس والتصميم الذي تختاره</li>
          <li>✓ زيارة لأخذ المقاسات ومعاينة العينات</li>
          <li>✓ توصيل مجاني داخل الكويت</li>
          <li>✓ مدة التنفيذ والتوصيل: من {delivery.min} إلى {delivery.max} يومًا</li>
          <li>✓ الإرجاع في حالة العيوب المصنعية فقط</li>
        </ul>

        <a
          href={whatsappLinkForProduct(category?.name || product.title, path)}
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-grid mt-8 min-h-12 px-8 place-items-center bg-sage text-white rounded-full"
        >
          الاستفسار عبر واتساب
        </a>
      </div>
      </div>

      {(areaPage || guides.length > 0) && (
        <section className="mt-10 flex flex-wrap gap-2" aria-label="روابط ذات صلة">
          {areaPage && (
            <Link href={areaPage.path} className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">
              نجار {areaPage.governorate} — منجرة مزونة
            </Link>
          )}
          {guides.map((g) => (
            <Link key={g.slug} href={g.path} className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">
              {g.h1}
            </Link>
          ))}
        </section>
      )}

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
          href={whatsappLinkForProduct(category?.name || product.title, path)}
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
