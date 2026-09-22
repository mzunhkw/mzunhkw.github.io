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
                ? '(max-width: 640px) 100vw, (max-width: 1024px) 55vw, 620px'
                : '(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 300px'
            }
            alt={product.title}
            width={900}
            height={900}
            // لا نرفع أولوية هذه الصورة: عنصر LCP الفعلي بالصفحة هو شعار الهيرو،
            // ورفع أولوية صورة أخرى تنافسه على الشبكة وتؤخره.
            loading={featured ? 'eager' : 'lazy'}
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
