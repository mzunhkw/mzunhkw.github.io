import Link from 'next/link';
import { Product, availabilityLabels } from '@/lib/types';
import { formatPrice } from '@/lib/catalog';

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  return (
    <Link
      href={`/products/${product.slug}/`}
      className="group block bg-white border border-sand rounded-2xl overflow-hidden hover:border-sage-soft transition-colors"
    >
      <div className="aspect-square bg-sage-mist overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="h-full grid place-items-center text-sm text-sage/70">بدون صورة بعد</div>
        )}
      </div>
      <div className="p-3 sm:p-4 space-y-1">
        <h3 className="font-medium text-sm sm:text-base leading-snug line-clamp-2">{product.title}</h3>
        {product.shortDescription && (
          <p className="hidden sm:block text-sm text-ink/70 line-clamp-2">{product.shortDescription}</p>
        )}
        <p className="text-xs sm:text-sm text-ink/60">{product.size}</p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-sm sm:text-base font-medium text-sage">{formatPrice(product.price)} د.ك</span>
          <span className="text-[11px] sm:text-xs bg-sand rounded-full px-2 py-0.5 whitespace-nowrap">
            {availabilityLabels[product.availability]}
          </span>
        </div>
      </div>
    </Link>
  );
}
