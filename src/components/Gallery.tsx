'use client';

import { useEffect, useRef, useState } from 'react';

// معرض صور للجوال: سحب أفقي بالإصبع + نقاط + صور مصغّرة + تكبير بملء الشاشة.
// eagerFirst: حمّل أول صورة فورًا (eager) بدل lazy — يُستخدم فقط عندما يكون المعرض
// أول عنصر مرئي أعلى الصفحة (مثل صفحة المنتج) ليكون هو عنصر LCP.
// أي استخدام آخر للمعرض في وسط/أسفل الصفحة يجب أن يبقى eagerFirst=false حتى لا
// ينافس صورة/نص LCP الفعلي على الموارد.
export default function Gallery({
  images,
  title,
  alts,
  eagerFirst = true,
}: {
  images: string[];
  title: string;
  // نص alt وصفي لكل صورة بنفس ترتيب images. لو ما توفر أو كان أقصر من عدد
  // الصور، الصور الناقصة ترجع للنمط العام (title — صورة N).
  alts?: string[];
  eagerFirst?: boolean;
}) {
  const altFor = (i: number) => alts?.[i] || (i === 0 ? title : `${title} — صورة ${i + 1}`);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(false);
      // الموقع RTL: السهم الأيسر = التالي
      if (e.key === 'ArrowLeft') setActive((a) => Math.min(a + 1, images.length - 1));
      if (e.key === 'ArrowRight') setActive((a) => Math.max(a - 1, 0));
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [zoom, images.length]);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/5] rounded-2xl bg-sage-mist grid place-items-center text-sm text-sage">
        بدون صورة بعد
      </div>
    );
  }

  const onScroll = () => {
    const el = scroller.current;
    if (!el || !el.clientWidth) return;
    // في RTL قيمة scrollLeft سالبة، لذلك نأخذ القيمة المطلقة
    const i = Math.round(Math.abs(el.scrollLeft) / el.clientWidth);
    if (i !== active) setActive(Math.min(Math.max(i, 0), images.length - 1));
  };

  const goTo = (i: number) => {
    setActive(i);
    scroller.current?.children[i]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div
          ref={scroller}
          onScroll={onScroll}
          className="no-scrollbar flex overflow-x-auto snap-x snap-mandatory rounded-2xl bg-sage-mist"
        >
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => {
                setActive(i);
                setZoom(true);
              }}
              aria-label={`تكبير الصورة ${i + 1}`}
              className="snap-center shrink-0 w-full aspect-[4/5] sm:aspect-square"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={altFor(i)}
                loading={i === 0 && eagerFirst ? 'eager' : 'lazy'}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 pointer-events-none" aria-hidden="true">
            {images.map((img, i) => (
              <span
                key={img}
                className={`h-1.5 rounded-full transition-all ${i === active ? 'w-5 bg-sage' : 'w-1.5 bg-white/90'}`}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`عرض الصورة ${i + 1}`}
              aria-current={i === active}
              className={`shrink-0 w-16 h-16 overflow-hidden rounded-xl border-2 ${
                i === active ? 'border-sage' : 'border-transparent opacity-80'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-50 bg-ink/90 flex items-center justify-center p-3"
          onClick={() => setZoom(false)}
        >
          <button
            type="button"
            onClick={() => setZoom(false)}
            aria-label="إغلاق"
            className="absolute top-3 left-3 h-11 w-11 rounded-full bg-white text-ink text-xl grid place-items-center"
          >
            ✕
          </button>
          {images.length > 1 && (
            <p className="absolute top-5 inset-x-0 text-center text-white text-sm pointer-events-none">
              {active + 1} / {images.length}
            </p>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active]}
            alt={altFor(active)}
            className="max-h-full max-w-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="السابقة"
                disabled={active === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  setActive(active - 1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/90 text-ink text-xl grid place-items-center disabled:opacity-30"
              >
                ›
              </button>
              <button
                type="button"
                aria-label="التالية"
                disabled={active === images.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  setActive(active + 1);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/90 text-ink text-xl grid place-items-center disabled:opacity-30"
              >
                ‹
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
