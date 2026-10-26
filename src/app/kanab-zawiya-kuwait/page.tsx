import type { Metadata } from 'next';
import Link from 'next/link';
import { visibleProducts } from '@/data/products';
import { siteConfig, whatsappLink, deliveryDays } from '@/data/site-config';
import { absoluteUrl, breadcrumbLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ProductCard from '@/components/ProductCard';

// صفحة «كنب زاوية» — كنب زاوية ~170 بحث/شهر في الكويت (Ubersuggest، أكتوبر 2026، category-seo.ts)،
// واقتراحات جوجل: كنب زاوية مودرن، كنب حرف L، كنب كورنر، كنب زاوية صغير.
// صفحة نية فرعية (مثل صفحة التسريحة لغرف النوم) — لا تنافس /category/sofas/ على «كنب» و«قنفات».
// طلب المالك 2026-10-26: تقوية الكنب وغرف النوم بنفس قوة صفحات التسريحة والطاولات.
// السعر من أسعار مزونة المعتمدة فقط: تفصيل كنب جديد من 39 إلى 42 د.ك للمتر (articles.ts).
const PATH = '/kanab-zawiya-kuwait/';
const TITLE = 'كنب زاوية في الكويت | تفصيل كنب زاوية مودرن وحرف L — مزونة';
const H1 = 'كنب زاوية في الكويت — تفصيل كنب زاوية مودرن وحرف L حسب مقاس الصالة';
const DESCRIPTION =
  'تفصيل كنب زاوية في الكويت من منجرة مزونة بالضجيج: كنب زاوية مودرن وحرف L وكورنر ومودولار، بمقاس الجدارين والقماش الذي تختاره. من 39 د.ك للمتر وتوصيل مجاني.';
const PRICE_MIN = 39;
const PRICE_MAX = 42;
const days = deliveryDays('sofas');

const TYPES = [
  { t: 'كنب زاوية حرف L', d: 'ضلعان على جدارين متقابلين في الزاوية، بطول يُفصَّل على مقاس كل جدار.' },
  { t: 'كنب زاوية حرف U', d: 'ثلاثة أضلاع للصالات الواسعة وغرف الجلوس العائلية.' },
  { t: 'كنب زاوية مودولار', d: 'قطع منفصلة تُجمع وتُعاد ترتيبها حسب المكان.' },
  { t: 'كنب زاوية مع شيزلونج', d: 'ضلع ممتد لمدّ الأرجل والاسترخاء بدل الضلع الثاني الكامل.' },
  { t: 'كنب زاوية صغير', d: 'للشقق وغرف الجلوس الصغيرة، بعمق مقعد ومساند تناسب المساحة.' },
];

const FAQS = [
  {
    q: 'كم سعر تفصيل كنب الزاوية في الكويت؟',
    a: `سعر تفصيل الكنب لدى منجرة مزونة من ${PRICE_MIN} إلى ${PRICE_MAX} د.ك للمتر حسب الخامة والتصميم، والإجمالي يعتمد على طول ضلعي الزاوية. الأسعار تقديرية ونتفق على السعر النهائي معك عبر واتساب.`,
  },
  {
    q: 'كيف أقيس المكان لكنب الزاوية؟',
    a: 'قِس طول كل جدار من الزاوية حتى نهاية المساحة المتاحة، وانتبه لمكان الأبواب والنوافذ والمكيف. ويزورك مندوبنا بالعينات لأخذ المقاسات الدقيقة قبل التفصيل.',
  },
  {
    q: 'هل يمكن تفصيل كنب الزاوية بأي مقاس؟',
    a: 'نعم، نفصّل كنب الزاوية على مقاس الجدارين وبعمق المقعد وارتفاع الظهر الذي تريده، ويمكن جعل الزاوية يمينًا أو يسارًا.',
  },
  {
    q: 'كم مدة تفصيل كنب الزاوية؟',
    a: `مدة التنفيذ والتوصيل من ${days.min} إلى ${days.max} يومًا، والتوصيل مجاني داخل الكويت.`,
  },
];

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, siteName: siteConfig.name, locale: 'ar_KW', type: 'website', images: ['/og-image.jpg'] },
};

// أعمالنا الفعلية: كنب الزاوية أولًا، ثم بقية الكنب
const cornerWorks = () => {
  const sofas = visibleProducts.filter((p) => p.categorySlug === 'sofas');
  const isCorner = (t: string) => /زاوية|كورنر|حرف L|\bL\b/.test(t);
  return [...sofas.filter((p) => isCorner(p.title)), ...sofas.filter((p) => !isCorner(p.title))].slice(0, 9);
};

export default function CornerSofaPage() {
  const works = cornerWorks();
  const whatsapp = whatsappLink('تفصيل كنب زاوية', PATH);

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: H1,
    serviceType: 'تفصيل كنب زاوية',
    description: DESCRIPTION,
    url: absoluteUrl(PATH),
    areaServed: { '@type': 'Country', name: 'الكويت' },
    provider: { '@id': `${siteConfig.siteUrl}/#store` },
    offers: { '@type': 'AggregateOffer', priceCurrency: 'KWD', lowPrice: PRICE_MIN, highPrice: PRICE_MAX, url: absoluteUrl(PATH) },
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-12" data-wa-label="تفصيل كنب زاوية">
      <JsonLd data={serviceLd} />
      <JsonLd data={faqLd} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'الرئيسية', path: '/' },
          { name: 'كنب وقنفات', path: '/category/sofas/' },
          { name: 'كنب زاوية', path: PATH },
        ])}
      />

      <nav aria-label="مسار التنقل" className="text-sm text-ink/55 mb-4">
        <Link href="/" className="hover:text-sage">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href="/category/sofas/" className="hover:text-sage">كنب وقنفات</Link>
        <span className="mx-2">/</span>
        <span>كنب زاوية</span>
      </nav>

      <h1 className="text-2xl sm:text-4xl leading-tight mb-4">{H1}</h1>
      <div className="max-w-3xl space-y-3 text-ink/75 leading-relaxed">
        <p>
          كنب الزاوية يستغل زاوية الصالة ويستوعب عددًا أكبر من الجالسين. نفصّله في منجرة مزونة بالضجيج على مقاس الجدارين،
          حرف L أو U أو مودولار أو مع شيزلونج، بالقماش واللون الذي تختاره ومع إسفنج البغلي.
        </p>
        <p>
          الصور في هذه الصفحة من أعمالنا الفعلية. نزورك بعينات الأقمشة لأخذ المقاسات، ونصنع الكنب نجارةً وتنجيدًا في منجرتنا،
          والتوصيل مجاني داخل الكويت.
        </p>
      </div>
      <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-grid mt-5 min-h-12 px-8 place-items-center bg-sage text-white rounded-full">
        اطلب زيارة لأخذ مقاس كنب الزاوية عبر واتساب
      </a>

      {works.length > 0 && (
        <section className="mt-12" aria-labelledby="works-title">
          <h2 id="works-title" className="text-xl sm:text-2xl mb-4">كنب زاوية من أعمالنا</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {works.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 max-w-3xl" aria-labelledby="types-title">
        <h2 id="types-title" className="text-xl sm:text-2xl mb-3">أشكال كنب الزاوية التي نفصّلها</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {TYPES.map((x) => (
            <div key={x.t} className="bg-white border border-sand rounded-2xl p-4">
              <h3 className="font-medium text-ink">{x.t}</h3>
              <p className="text-sm text-ink/70 mt-1 leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="price-title">
        <h2 id="price-title" className="text-xl sm:text-2xl mb-3">الخامات وسعر تفصيل كنب الزاوية</h2>
        <p className="text-ink/75 leading-relaxed">
          نفصّل كنب الزاوية بهيكل خشبي وإسفنج البغلي، وبقماش تركي حسب رغبتك: شانيل أو مخمل أو بوكلي، بالألوان الهادئة كالبيج
          والرمادي أو بلون يناسب ديكورك. سعر التفصيل من {PRICE_MIN} إلى {PRICE_MAX} د.ك للمتر، والأسعار تقديرية ونتفق معك على السعر
          النهائي عبر واتساب بعد معرفة المقاسات.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-xl sm:text-2xl mb-4">أسئلة شائعة عن كنب الزاوية</h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="bg-white border border-sand rounded-2xl p-4">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="text-ink/75 mt-2 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-label="روابط ذات صلة">
        <h2 className="text-lg mb-3">صفحات ذات صلة</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/category/sofas/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">كنب وقنفات مودرن</Link>
          <Link href="/kanab-amriki-kuwait/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">كنب أمريكي</Link>
          <Link href="/tanjeed-sofa-kuwait/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">تنجيد كنب وتلبيس قنفات</Link>
          <Link href="/athath-dajeej/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">معرضنا في الضجيج</Link>
        </div>
      </section>
    </div>
  );
}
