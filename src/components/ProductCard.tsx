import Link from 'next/link';
import { Product, availabilityLabels } from '@/lib/types';
import { formatPrice } from '@/lib/catalog';
import { getSrcSet } from '@/lib/image';

type ProductCardProps = {
  product: Product;
  featured?: boolean;
  compact?: boolean;
};

export default function ProductCard({ product, featured = false, compact = false }: ProductCardProps) {
  const image = product.images[0];

  return (
    <Link
      href={`/products/${product.slug}/`}
      className={`product-card ${featured ? 'product-card-featured' : ''} ${compact ? 'product-card-compact' : ''}`}
    >
      <div className="product-media">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            srcSet={getSrcSet(image)}
            sizes={
              featured
                ? // نطرح padding الحاوية (32px على الجوال) عشان لا نبالغ في
                  // العرض المطلوب فيختار المتصفح نسخة أكبر من اللازم.
                  '(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) 55vw, 620px'
                : '(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 300px'
            }
            alt={product.title}
            width={900}
            height={900}
            // لا نستعجل تحميل هذه الصورة حتى لو كانت "featured": عنصر LCP
            // الفعلي بالصفحة الرئيسية هو شعار الهيرو (له preload صريح في
            // layout.tsx). تحميلها بـ eager كان يجعلها تنافس شعار الهيرو
            // والخطوط على الشبكة المحدودة في أول ثانيتين، فيتأخر ظهور
            // عنصر LCP الفعلي رغم أنه أصغر بكثير. lazy هنا لا تعني إخفاءها —
            // هي غالبًا أسفل أول شاشة على الجوال، والمتصفح يحمّلها فور اقترابها.
            loading="lazy"
            className="product-image"
          />
        ) : (
          <div className="product-placeholder">بدون صورة بعد</div>
        )}
        {product.featured && <span className="product-badge">مختار من المعرض</span>}
      </div>

      <div className="product-body">
        <div className="product-title-row">
          <h3>{product.title}</h3>
          <span aria-hidden="true" className="product-arrow">↗</span>
        </div>

        {product.shortDescription && (
          <p className="product-description">{product.shortDescription}</p>
        )}

        <div className="product-meta">
          <span>{formatPrice(product.price)} د.ك</span>
          <span>{availabilityLabels[product.availability]}</span>
        </div>
      </div>
    </Link>
  );
}
