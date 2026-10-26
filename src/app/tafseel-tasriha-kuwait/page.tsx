import type { Metadata } from 'next';
import Link from 'next/link';
import { visibleProducts } from '@/data/products';
import { areaPages } from '@/data/area-pages';
import { siteConfig, whatsappLink } from '@/data/site-config';
import { woodMin, woodMax, bedroomPrice, woodTiers } from '@/data/wood-tiers';
import { absoluteUrl, breadcrumbLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ProductCard from '@/components/ProductCard';
import { isHiddenHref } from '@/data/hidden-sections';

// صفحة «تفصيل تسريحة غرفة نوم» — أحجام بحث Ubersuggest للكويت (أكتوبر 2026): تسريحة غرفة نوم ~320/شهر،
// واقتراحات جوجل: «تسريحة غرفة نوم الكويت». («تسريحات» وحدها يغلب عليها تسريحات الشعر، فلا نستهدفها.)
// التسريحات بيانات ضمن قسم غرف النوم (السعر بالمتر المربع من wood-tiers.ts)، وتُعرض هنا من أعمالنا الفعلية فقط.
const PATH = '/tafseel-tasriha-kuwait/';
const TITLE = 'تسريحة غرفة نوم في الكويت | تفصيل تسريحة ميلامين بمرآة مضيئة — مزونة';
const H1 = 'تسريحة غرفة نوم في الكويت — تفصيل تسريحة بمرآة مضيئة وأدراج';
const DESCRIPTION = `تفصيل تسريحة غرفة نوم في الكويت من منجرة مزونة: تسريحة ميلامين بمرآة مضيئة وأدراج، معلّقة أو مع خزانة عرض زجاجية، حسب مقاس الجدار. ${bedroomPrice} د.ك للمتر المربع.`;

const TYPES = [
  'تسريحة بسطح ممتد ووحدتي أدراج على الجانبين ومساحة جلوس في الوسط.',
  'تسريحة معلّقة على الجدار تترك الأرضية مفتوحة وتسهّل التنظيف.',
  'تسريحة مع خزانة عرض طولية بباب زجاجي ورفوف مضيئة للعطور والإكسسوارات.',
  'تسريحة مدمجة في كبت الملابس بنفس الخامة واللون.',
  'مرآة تسريحة بإضاءة خلفية: مربعة أو مقوّسة أو طولية حتى الأرض أو بشكل عضوي.',
  'بوف أو كرسي منجّد للتسريحة بالقماش الذي تختاره.',
];

const FINISHES = woodTiers.map((t) => `${t.name} — ${t.price} د.ك للمتر المربع: ${t.note}.`);

const FAQS = [
  {
    q: 'كم سعر تفصيل تسريحة غرفة نوم في الكويت؟',
    a: `نسعّر التسريحة بالمتر المربع: ${bedroomPrice} د.ك للمتر المربع بخامة الميلامين، و${woodMin} د.ك للخشب مع الصبغ. الإجمالي يعتمد على عرض التسريحة وعدد الأدراج والإضافات مثل المرآة المضيئة وخزانة العرض، والأسعار تقديرية ونتفق على السعر النهائي معك عبر واتساب.`,
  },
  {
    q: 'هل تفصّلون مرآة التسريحة بإضاءة؟',
    a: 'نعم، نركّب مرآة التسريحة بإضاءة LED خلفية أو بإطار مضيء، بالشكل الذي تختاره: مربعة أو مقوّسة أو طولية أو بشكل عضوي.',
  },
  {
    q: 'هل يمكن تفصيل التسريحة مع الكبت أو غرفة النوم كاملة؟',
    a: 'نعم، نفصّل التسريحة منفصلة، أو مدمجة مع كبت الملابس، أو ضمن غرفة النوم كاملة مع السرير والكومودينات بخامة ولون موحد.',
  },
  {
    q: 'هل تزورون البيت لأخذ مقاس التسريحة؟',
    a: 'نعم، نزورك لأخذ المقاسات وعرض العينات في جميع مناطق الكويت، والتوصيل مجاني داخل الكويت.',
  },
];

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, siteName: siteConfig.name, locale: 'ar_KW', type: 'website', images: ['/og-image.jpg'] },
};

// أعمالنا الفعلية: منتجات غرف النوم التي فيها تسريحة — التسريحات المنفردة أولًا، ثم الغرف والكبتات التي تضم تسريحة
const dressingTableWorks = () =>
  visibleProducts
    .filter((p) => p.categorySlug === 'bedrooms' && /تسريحة/.test(p.title))
    .sort((a, b) => Number(!a.title.startsWith('تسريحة')) - Number(!b.title.startsWith('تسريحة')));

export default function DressingTablesPage() {
  const works = dressingTableWorks();
  const whatsapp = whatsappLink('تفصيل تسريحة غرفة نوم', PATH);

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: H1,
    serviceType: 'تفصيل تسريحة غرفة نوم',
    description: DESCRIPTION,
    url: absoluteUrl(PATH),
    areaServed: { '@type': 'Country', name: 'الكويت' },
    provider: { '@id': `${siteConfig.siteUrl}/#store` },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'KWD',
      lowPrice: woodMin,
      highPrice: woodMax,
      url: absoluteUrl(PATH),
    },
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-12" data-wa-label="تفصيل تسريحة غرفة نوم">
      <JsonLd data={serviceLd} />
      <JsonLd data={faqLd} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'الرئيسية', path: '/' },
          { name: 'غرف نوم', path: '/category/bedrooms/' },
          { name: 'تفصيل تسريحة غرفة نوم', path: PATH },
        ])}
      />

      <nav aria-label="مسار التنقل" className="text-sm text-ink/55 mb-4">
        <Link href="/" className="hover:text-sage">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href="/category/bedrooms/" className="hover:text-sage">غرف نوم</Link>
        <span className="mx-2">/</span>
        <span>تفصيل تسريحة غرفة نوم</span>
      </nav>

      <h1 className="text-2xl sm:text-4xl leading-tight mb-4">{H1}</h1>
      <div className="max-w-3xl space-y-3 text-ink/75 leading-relaxed">
        <p>
          تبحث عن تسريحة غرفة نوم في الكويت بمقاس جدارك؟ نفصّل في منجرة مزونة التسريحة بخامة الميلامين بالعرض وعدد الأدراج
          الذي تحتاجه، مع مرآة بإضاءة خلفية، وخزانة عرض زجاجية للعطور إن أردت، معلّقة على الجدار أو على وحدات أدراج.
        </p>
        <p>
          الصور في هذه الصفحة من تسريحات نفذناها فعلًا. نزورك لأخذ المقاسات وعرض العينات، ونصنع التسريحة في منجرتنا في
          الضجيج، والتوصيل مجاني داخل الكويت.
        </p>
      </div>
      <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-grid mt-5 min-h-12 px-8 place-items-center bg-sage text-white rounded-full">
        اطلب زيارة لأخذ مقاس التسريحة عبر واتساب
      </a>

      {works.length > 0 && (
        <section className="mt-12" aria-labelledby="works-title">
          <h2 id="works-title" className="text-xl sm:text-2xl mb-4">تسريحات من أعمالنا</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {works.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 max-w-3xl" aria-labelledby="types-title">
        <h2 id="types-title" className="text-xl sm:text-2xl mb-3">أنواع التسريحات التي نفصّلها</h2>
        <ul className="list-disc ps-5 space-y-1.5 text-ink/75 leading-relaxed">
          {TYPES.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="price-title">
        <h2 id="price-title" className="text-xl sm:text-2xl mb-3">الخامات وسعر تفصيل التسريحة بالمتر</h2>
        <p className="text-ink/75 leading-relaxed mb-3">
          سعر تفصيل التسريحة {bedroomPrice} د.ك للمتر المربع بخامة الميلامين، و{woodMin} د.ك للمتر المربع للخشب مع الصبغ. الأسعار تقديرية، ونتفق معك على
          السعر النهائي عبر واتساب بعد معرفة المقاسات والتفاصيل.
        </p>
        <ul className="list-disc ps-5 space-y-1.5 text-ink/75 leading-relaxed">
          {FINISHES.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-xl sm:text-2xl mb-4">أسئلة شائعة عن تفصيل التسريحة</h2>
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
          <Link href="/category/bedrooms/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">تفصيل غرف نوم</Link>
          <Link href="/tafseel-kabatat-kuwait/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">تفصيل كبتات ملابس</Link>
          {!isHiddenHref('/category/kids-beds/') && (<Link href="/category/kids-beds/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">أسرّة أطفال</Link>)}
          {areaPages.map((a) => (
            <Link key={a.slug} href={a.path} className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">نجار {a.governorate}</Link>
          ))}
        </div>
      </section>
    </div>
  );
}
