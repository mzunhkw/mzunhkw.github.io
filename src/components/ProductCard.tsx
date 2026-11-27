import Link from 'next/link';
import { Product, availabilityLabels } from '@/lib/types';
import { priceText, formatPrice } from '@/lib/catalog';
import { bedroomPrice, isWoodPriced } from '@/data/wood-tiers';
import { whatsappLink } from '@/data/site-config';
import { getSrcSet } from '@/lib/image';

type ProductCardProps = {
  product: Product;
  featured?: boolean;
  compact?: boolean;
  /** نسخة مكررة للزينة داخل حاوية aria-hidden (شريط الأعمال المتحرك): تُخرج من ترتيب Tab */
  decorative?: boolean;
  /** شارة «جديد» (شريط وصل حديثاً في الرئيسية) */
  isNew?: boolean;
  /** بطاقة ضيقة للشرائط الأفقية: بدون زر واتساب */
  rail?: boolean;
};

export default function ProductCard({ product, featured = false, compact = false, decorative = false, isNew = false, rail = false }: ProductCardProps) {
  const image = product.images[0];
  const href = `/products/${product.slug}/`;
  // قطعة جاهزة (لها رقم MZ-…): تصميم «سوق إلكتروني» — السعر النهائي ورسوم التوصيل وزر واتساب
  const isReady = product.availability === 'ready-piece' && !!product.ref;

  const media = (
    <div className="product-media">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          srcSet={getSrcSet(image)}
          sizes={
            featured
              ? '(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) 55vw, 620px'
              : rail
                ? '160px'
                : '(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 300px'
          }
          alt={product.imageAlts?.[0] || product.title}
          width={900}
          height={900}
          // lazy: عنصر LCP الفعلي هو شعار الهيدر (preload في layout.tsx) — انظر PERFORMANCE-LOG.md
          loading="lazy"
          className="product-image"
        />
      ) : (
        <div className="product-placeholder">بدون صورة بعد</div>
      )}
      {isNew ? (
        <span className="product-badge product-badge-new">جديد</span>
      ) : (
        !isReady && product.featured && <span className="product-badge">مختار من المعرض</span>
      )}
    </div>
  );

  if (isReady) {
    return (
      <div className={`product-card product-card-ready ${rail ? 'product-card-rail' : ''}`}>
        <Link href={href} tabIndex={decorative ? -1 : undefined} className="ready-card-link">
          {media}
          <div className="ready-card-body">
            <span className="ready-card-ref" dir="ltr">{product.ref}</span>
            <h3>{product.title}</h3>
            <p className="ready-card-price">
              <b>{formatPrice(product.price)}</b> <span>د.ك</span>
              <small>{product.deliveryFee ? `+ توصيل ${product.deliveryFee}` : 'توصيل مجاني'}</small>
            </p>
          </div>
        </Link>
        {!rail && (
          <a
            href={whatsappLink(`${product.title} — ${product.ref}`, href)}
            target="_blank"
            rel="noreferrer"
            tabIndex={decorative ? -1 : undefined}
            className="ready-card-wa"
          >
            اطلب عبر واتساب
          </a>
        )}
      </div>
    );
  }

  return (
    <Link
      href={href}
      tabIndex={decorative ? -1 : undefined}
      className={`product-card ${featured ? 'product-card-featured' : ''} ${compact ? 'product-card-compact' : ''}`}
    >
      {media}

      <div className="product-body">
        <div className="product-title-row">
          <h3>{product.title}</h3>
          <span aria-hidden="true" className="product-arrow">↗</span>
        </div>

        {product.shortDescription && (
          <p className="product-description">{product.shortDescription}</p>
        )}

        <div className="product-meta">
          <span>{isWoodPriced(product) ? `${bedroomPrice} د.ك/م²` : priceText(product)}</span>
          <span>{availabilityLabels[product.availability]}</span>
        </div>
      </div>
    </Link>
  );
}
