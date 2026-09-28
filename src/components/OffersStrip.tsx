import { Offer } from '@/lib/types';
import { formatPrice } from '@/lib/catalog';
import { products } from '@/data/products';
import { whatsappLinkForProduct } from '@/data/site-config';

export default function OffersStrip({ offers }: { offers: Offer[] }) {
  if (!offers.length) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8" aria-labelledby="offers-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">لفترة محدودة</span>
          <h2 id="offers-title">عروض حصرية</h2>
        </div>
      </div>

      <div className="offers-strip">
        {offers.map((o) => {
          const linkedProduct = o.productSlug ? products.find((p) => p.slug === o.productSlug) : undefined;
          const href = linkedProduct ? `/products/${linkedProduct.slug}/` : whatsappLinkForProduct(o.title);
          const isDiscounted = !!o.originalPrice && o.originalPrice > o.price;
          const discountPct = isDiscounted ? Math.round(100 - (o.price / (o.originalPrice as number)) * 100) : 0;

          return (
            <a
              key={o.id}
              href={href}
              {...(!linkedProduct ? { target: '_blank', rel: 'noreferrer' } : {})}
              className="offer-card"
            >
              <div className="offer-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.image} alt={o.title} width={260} height={260} loading="lazy" />
                {isDiscounted && <span className="offer-discount">خصم {discountPct}٪</span>}
              </div>
              <div className="offer-body">
                <strong>{o.title}</strong>
                <div className="offer-price">
                  <span>{formatPrice(o.price)} د.ك</span>
                  {isDiscounted && <s>{formatPrice(o.originalPrice as number)} د.ك</s>}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
