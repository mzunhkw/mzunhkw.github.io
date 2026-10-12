import type { Metadata } from 'next';
import Link from 'next/link';
import { visibleProducts } from '@/data/products';
import { siteConfig, whatsappLink, deliveryDays } from '@/data/site-config';
import { absoluteUrl, breadcrumbLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ProductCard from '@/components/ProductCard';

// صفحة «كنب أمريكي» — حجم البحث في الكويت: كنب امريكي ~110/شهر (OpenSEO، أكتوبر 2026).
// اقتراحات جوجل للكويت: كنب امريكي مريح، حرف ال/L، زاوية، متصل، مفرد، كلاسيك، مودرن، بيج،
// طقم قنفات امريكي، قنفات نظام امريكي. طلب المالك إضافتها (2026-10-12).
// السعر من أسعار مزونة المعتمدة فقط: تفصيل كنب جديد من 39 إلى 42 د.ك للمتر (articles.ts).
const PATH = '/kanab-amriki-kuwait/';
const TITLE = 'كنب امريكي الكويت | تفصيل كنب وقنفات أمريكي مريح — مزونة';
const H1 = 'كنب أمريكي في الكويت — تفصيل كنب وقنفات أمريكي مريح حسب المقاس';
const DESCRIPTION =
  'تفصيل كنب أمريكي في الكويت من منجرة مزونة بالضجيج: مقاعد عميقة ومخدات ظهر ممتلئة، طقم قنفات أمريكي أو كنب حرف L وزاوية ومتصل، بإسفنج البغلي. من 39 د.ك للمتر.';
const PRICE_MIN = 39;
const PRICE_MAX = 42;
const days = deliveryDays('sofas');

const FEATURES = [
  'مقعد عميق وعريض يسمح بالجلوس المريح والاسترخاء لفترة طويلة.',
  'مخدات ظهر منفصلة وممتلئة تُرتَّب وتُنفض بسهولة.',
  'مساند جانبية عريضة، ملفوفة في الطراز الكلاسيكي أو مستقيمة في المودرن.',
  'هيكل خشبي متين وإسفنج عالي الكثافة يحافظ على شكل المقعد.',
];

const TYPES = [
  { t: 'طقم قنفات أمريكي', d: 'قنفة ثلاثية مع قنفة ثنائية ومفردة، أو بالتوزيع الذي يناسب صالتك.' },
  { t: 'كنب أمريكي حرف L وزاوية', d: 'يستغل زاوية الصالة ويستوعب عددًا أكبر، ويُفصَّل على طول الجدارين.' },
  { t: 'كنب أمريكي متصل', d: 'قطعة طويلة واحدة بطول الجدار للصالات وغرف الجلوس الواسعة.' },
  { t: 'كنب أمريكي مفرد', d: 'قنفة مفردة بنفس التصميم لتكمل الطقم أو لركن القراءة.' },
  { t: 'أمريكي كلاسيك أو مودرن', d: 'مساند ملفوفة وتفاصيل كلاسيكية، أو خطوط مستقيمة وأرجل مخفية بطابع مودرن.' },
];

const FAQS = [
  {
    q: 'كم سعر تفصيل الكنب الأمريكي في الكويت؟',
    a: `سعر تفصيل الكنب لدى منجرة مزونة من ${PRICE_MIN} إلى ${PRICE_MAX} د.ك للمتر حسب الخامة والتصميم، والإجمالي يعتمد على طول الكنب وعدد القطع. الأسعار تقديرية ونتفق على السعر النهائي معك عبر واتساب.`,
  },
  {
    q: 'ما الفرق بين الكنب الأمريكي والكنب المودرن؟',
    a: 'الكنب الأمريكي يتميز بمقعد أعمق ومخدات ظهر منفصلة ممتلئة ومساند عريضة، فهو أقرب للاسترخاء. والمودرن خطوطه أنحف ومقعده أقل عمقًا. ويمكن الجمع بينهما في كنب أمريكي بخطوط مودرن.',
  },
  {
    q: 'هل تفصّلون كنب أمريكي حرف L أو زاوية؟',
    a: 'نعم، نفصّل الكنب الأمريكي حرف L والزاوية والمتصل والمفرد، على مقاس الصالة وبالقماش واللون الذي تختاره.',
  },
  {
    q: 'كم مدة تفصيل الكنب الأمريكي؟',
    a: `مدة التنفيذ والتوصيل من ${days.min} إلى ${days.max} يومًا، والتوصيل مجاني داخل الكويت.`,
  },
];

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, siteName: siteConfig.name, locale: 'ar_KW', type: 'website', images: ['/og-image.jpg'] },
};

export default function AmericanSofaPage() {
  const works = visibleProducts.filter((p) => p.categorySlug === 'sofas').slice(0, 9);
  const whatsapp = whatsappLink('تفصيل كنب أمريكي', PATH);

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: H1,
    serviceType: 'تفصيل كنب أمريكي',
    description: DESCRIPTION,
    url: absoluteUrl(PATH),
    areaServed: { '@type': 'Country', name: 'الكويت' },
    provider: { '@id': `${siteConfig.siteUrl}/#store` },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'KWD',
      lowPrice: PRICE_MIN,
      highPrice: PRICE_MAX,
      url: absoluteUrl(PATH),
    },
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-12" data-wa-label="تفصيل كنب أمريكي">
      <JsonLd data={serviceLd} />
      <JsonLd data={faqLd} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'الرئيسية', path: '/' },
          { name: 'كنب وقنفات', path: '/category/sofas/' },
          { name: 'كنب أمريكي', path: PATH },
        ])}
      />

      <nav aria-label="مسار التنقل" className="text-sm text-ink/55 mb-4">
        <Link href="/" className="hover:text-sage">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href="/category/sofas/" className="hover:text-sage">كنب وقنفات</Link>
        <span className="mx-2">/</span>
        <span>كنب أمريكي</span>
      </nav>

      <h1 className="text-2xl sm:text-4xl leading-tight mb-4">{H1}</h1>
      <div className="max-w-3xl space-y-3 text-ink/75 leading-relaxed">
        <p>
          الكنب الأمريكي (أو القنفات الأمريكية) كنب مريح بمقعد عميق ومخدات ظهر ممتلئة ومساند عريضة، يناسب الصالات وغرف
          الجلوس العائلية. نفصّله في منجرة مزونة بالضجيج على مقاس صالتك، بالقماش واللون الذي تختاره، ومع إسفنج البغلي.
        </p>
        <p>
          نفصّل طقم قنفات أمريكي كاملًا، أو كنب أمريكي حرف L وزاوية، أو كنبًا متصلًا بطول الجدار، بطابع كلاسيكي أو مودرن.
          نزورك بالعينات لأخذ المقاسات، والتوصيل مجاني داخل الكويت.
        </p>
      </div>
      <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-grid mt-5 min-h-12 px-8 place-items-center bg-sage text-white rounded-full">
        اطلب تفصيل كنب أمريكي عبر واتساب
      </a>

      <section className="mt-12 max-w-3xl" aria-labelledby="features-title">
        <h2 id="features-title" className="text-xl sm:text-2xl mb-3">ما الذي يميز الكنب الأمريكي؟</h2>
        <ul className="list-disc ps-5 space-y-1.5 text-ink/75 leading-relaxed">
          {FEATURES.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="types-title">
        <h2 id="types-title" className="text-xl sm:text-2xl mb-3">أنواع الكنب الأمريكي التي نفصّلها</h2>
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
        <h2 id="price-title" className="text-xl sm:text-2xl mb-3">الخامات وسعر تفصيل الكنب الأمريكي</h2>
        <p className="text-ink/75 leading-relaxed">
          نفصّل الكنب الأمريكي بهيكل خشبي وإسفنج البغلي، وبقماش تركي حسب رغبتك: شانيل أو مخمل أو شامواه، وبالألوان الهادئة
          كالبيج والرمادي أو بلون يناسب ديكورك. سعر التفصيل من {PRICE_MIN} إلى {PRICE_MAX} د.ك للمتر، والأسعار تقديرية ونتفق معك على
          السعر النهائي عبر واتساب بعد معرفة المقاسات.
        </p>
      </section>

      {works.length > 0 && (
        <section className="mt-12" aria-labelledby="works-title">
          <h2 id="works-title" className="text-xl sm:text-2xl mb-4">من أعمالنا في تفصيل الكنب</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {works.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 max-w-3xl" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-xl sm:text-2xl mb-4">أسئلة شائعة عن الكنب الأمريكي</h2>
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
          <Link href="/tanjeed-sofa-kuwait/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">تنجيد كنب وتلبيس قنفات</Link>
          <Link href="/articles/tanjeed-sofa-prices-kuwait/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">أسعار تنجيد الكنب</Link>
          <Link href="/athath-dajeej/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">معرضنا في الضجيج</Link>
        </div>
      </section>
    </div>
  );
}
