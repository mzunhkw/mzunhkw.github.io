import type { Metadata } from 'next';
import Link from 'next/link';
import { visibleProducts } from '@/data/products';
import { siteConfig, whatsappLink, deliveryDays } from '@/data/site-config';
import { woodMin, woodMax, bedroomPrice, woodTiers } from '@/data/wood-tiers';
import { absoluteUrl, breadcrumbLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ProductCard from '@/components/ProductCard';

// صفحة «غرف نوم عرسان» — نية فرعية لغرف النوم الكاملة (مثل صفحة التسريحة)، لا تنافس /category/bedrooms/
// على «غرف نوم» و«تفصيل غرف نوم». طلب المالك 2026-10-26: تقوية غرف النوم بنفس قوة صفحات التسريحة والطاولات.
// السعر من wood-tiers.ts (الميلامين هو الخامة الأساسية)، ومدة التنفيذ من deliveryDays('bedrooms').
const PATH = '/ghuraf-nawm-arsan-kuwait/';
const TITLE = 'غرف نوم عرسان في الكويت | تفصيل غرفة نوم كاملة مودرن — مزونة';
const H1 = 'غرف نوم عرسان في الكويت — تفصيل غرفة نوم كاملة بسرير وكبت وتسريحة';
const DESCRIPTION = `تفصيل غرف نوم عرسان في الكويت من منجرة مزونة بالضجيج: غرفة نوم كاملة مودرن بسرير منجّد وكبت ملابس وتسريحة وكومودينات بخامة ولون موحّد. ${bedroomPrice} د.ك للمتر المربع.`;
const days = deliveryDays('bedrooms');

const PIECES = [
  'سرير منجّد بظهر عالٍ أو بقاعدة عائمة، على مقاس المرتبة وبالقماش الذي تختاره.',
  'كبت ملابس بطول الجدار أو كبت زاوية أو غرفة ملابس، بأبواب مفصلية أو سحّابة أو زجاجية مضيئة.',
  'تسريحة بمرآة مضيئة وأدراج، معلّقة أو مع خزانة عرض زجاجية.',
  'كومودينات على جانبي السرير بنفس الخامة واللون.',
  'وحدة تلفزيون أو جدار خشب مضلّع أو إضاءة مخفية خلف السرير حسب التصميم.',
];

const FINISHES = woodTiers.map((t) => `${t.name} — ${t.price} د.ك للمتر المربع: ${t.note}.`);

const FAQS = [
  {
    q: 'كم سعر تفصيل غرفة نوم عرسان في الكويت؟',
    a: `نسعّر غرف النوم بالمتر المربع: ${bedroomPrice} د.ك للمتر المربع بخامة الميلامين، و${woodMin} د.ك للخشب مع الصبغ. الإجمالي يعتمد على حجم الكبت وعدد القطع والإضافات، والأسعار تقديرية ونتفق على السعر النهائي معك عبر واتساب.`,
  },
  {
    q: 'متى أطلب غرفة نوم العرسان قبل موعد الزواج؟',
    a: `مدة تنفيذ وتوصيل غرف النوم من ${days.min} إلى ${days.max} يومًا، لذلك يُفضّل الطلب قبل موعد الزواج بشهر على الأقل حتى يتسع الوقت للزيارة والمقاسات والتعديلات.`,
  },
  {
    q: 'هل يمكن تنفيذ تصميم غرفة نوم من صورة؟',
    a: 'نعم، أرسل صورة التصميم الذي يعجبك عبر واتساب، حتى لو كان تصميمًا من الإنترنت أو من الذكاء الاصطناعي، وننفذه على مقاس غرفتك.',
  },
  {
    q: 'هل تزورون البيت لأخذ مقاس غرفة النوم؟',
    a: 'نعم، يزورك مندوبنا بالعينات لأخذ المقاسات في جميع مناطق الكويت، والتوصيل مجاني داخل الكويت.',
  },
];

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, siteName: siteConfig.name, locale: 'ar_KW', type: 'website', images: ['/og-image.jpg'] },
};

// أعمالنا الفعلية: غرف النوم الكاملة للكبار (بدون أطفال والقطع المنفردة)، وغرف العرسان والماستر أولًا
const fullBedroomWorks = () => {
  const rooms = visibleProducts.filter(
    (p) => p.categorySlug === 'bedrooms' && /^غرفة نوم/.test(p.title) && !/أطفال/.test(p.title)
  );
  const top = (t: string) => /عرسان|كاملة|ماستر|ملكية/.test(t);
  return [...rooms.filter((p) => top(p.title)), ...rooms.filter((p) => !top(p.title))].slice(0, 12);
};

export default function BridalBedroomsPage() {
  const works = fullBedroomWorks();
  const whatsapp = whatsappLink('تفصيل غرفة نوم عرسان', PATH);

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: H1,
    serviceType: 'تفصيل غرف نوم عرسان',
    description: DESCRIPTION,
    url: absoluteUrl(PATH),
    areaServed: { '@type': 'Country', name: 'الكويت' },
    provider: { '@id': `${siteConfig.siteUrl}/#store` },
    offers: { '@type': 'AggregateOffer', priceCurrency: 'KWD', lowPrice: woodMin, highPrice: woodMax, url: absoluteUrl(PATH) },
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-12" data-wa-label="تفصيل غرفة نوم عرسان">
      <JsonLd data={serviceLd} />
      <JsonLd data={faqLd} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'الرئيسية', path: '/' },
          { name: 'غرف نوم', path: '/category/bedrooms/' },
          { name: 'غرف نوم عرسان', path: PATH },
        ])}
      />

      <nav aria-label="مسار التنقل" className="text-sm text-ink/55 mb-4">
        <Link href="/" className="hover:text-sage">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href="/category/bedrooms/" className="hover:text-sage">غرف نوم</Link>
        <span className="mx-2">/</span>
        <span>غرف نوم عرسان</span>
      </nav>

      <h1 className="text-2xl sm:text-4xl leading-tight mb-4">{H1}</h1>
      <div className="max-w-3xl space-y-3 text-ink/75 leading-relaxed">
        <p>
          نفصّل في منجرة مزونة بالضجيج غرف نوم العرسان كاملة: السرير والكبت والتسريحة والكومودينات بتصميم واحد وخامة ولون
          موحّد، على مقاس الغرفة. نعتمد الميلامين خامةً أساسية لأنه مقاوم للخدوش وسهل التنظيف، بألوان خشبية وسادة متعددة.
        </p>
        <p>
          الصور في هذه الصفحة من غرف نوم نفذناها فعلًا في مناطق الكويت. نزورك بالعينات لأخذ المقاسات، ونصنع الغرفة في منجرتنا،
          والتوصيل مجاني داخل الكويت.
        </p>
      </div>
      <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-grid mt-5 min-h-12 px-8 place-items-center bg-sage text-white rounded-full">
        اطلب زيارة لأخذ مقاس غرفة النوم عبر واتساب
      </a>

      {works.length > 0 && (
        <section className="mt-12" aria-labelledby="works-title">
          <h2 id="works-title" className="text-xl sm:text-2xl mb-4">غرف نوم كاملة من أعمالنا</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {works.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 max-w-3xl" aria-labelledby="pieces-title">
        <h2 id="pieces-title" className="text-xl sm:text-2xl mb-3">ماذا تشمل غرفة نوم العرسان؟</h2>
        <ul className="list-disc ps-5 space-y-1.5 text-ink/75 leading-relaxed">
          {PIECES.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="price-title">
        <h2 id="price-title" className="text-xl sm:text-2xl mb-3">الخامات وسعر تفصيل غرفة النوم بالمتر</h2>
        <p className="text-ink/75 leading-relaxed mb-3">
          سعر تفصيل غرف النوم {bedroomPrice} د.ك للمتر المربع بخامة الميلامين، و{woodMin} د.ك للمتر المربع للخشب مع الصبغ. الأسعار
          تقديرية، ونتفق معك على السعر النهائي عبر واتساب بعد معرفة المقاسات والتفاصيل.
        </p>
        <ul className="list-disc ps-5 space-y-1.5 text-ink/75 leading-relaxed">
          {FINISHES.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-xl sm:text-2xl mb-4">أسئلة شائعة عن غرف نوم العرسان</h2>
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
          <Link href="/tafseel-tasriha-kuwait/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">تسريحة غرفة نوم</Link>
          <Link href="/articles/bed-sizes-kuwait/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">مقاسات السرير</Link>
          <Link href="/athath-dajeej/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">معرضنا في الضجيج</Link>
        </div>
      </section>
    </div>
  );
}
