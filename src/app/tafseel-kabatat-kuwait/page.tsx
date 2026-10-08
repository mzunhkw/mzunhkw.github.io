import type { Metadata } from 'next';
import Link from 'next/link';
import { visibleProducts } from '@/data/products';
import { areaPages } from '@/data/area-pages';
import { siteConfig, whatsappLink } from '@/data/site-config';
import { woodMin, woodMax } from '@/data/wood-tiers';
import { absoluteUrl, breadcrumbLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ProductCard from '@/components/ProductCard';

// صفحة «تفصيل كبتات ملابس» — مبنية على أحجام بحث Ubersuggest للكويت (أكتوبر 2026):
// كبت ملابس ~320/شهر، نجار كبتات ~260 (صعوبة 13)، كبتات ملابس ~70، تفصيل كبتات ~70، غرفة ملابس ~70.
// الكبتات تبقى بيانات ضمن قسم غرف النوم (نفس التسعير بالمتر حسب الخشب)، وتُعرض هنا من أعمالنا الفعلية فقط.
const PATH = '/tafseel-kabatat-kuwait/';
const TITLE = 'تفصيل كبتات ملابس في الكويت | نجار كبتات — منجرة مزونة';
const H1 = 'تفصيل كبتات ملابس في الكويت — كبت بطول الجدار وغرفة ملابس';
const DESCRIPTION = `نجار كبتات في الكويت: منجرة مزونة تفصّل كبت الملابس بطول الجدار، كبت زاوية، وغرفة ملابس بأبواب مفصلية أو سحّابة، مع تسريحة وأدراج. من ${woodMin} إلى ${woodMax} د.ك للمتر حسب الخشب.`;

const TYPES = [
  'كبت ملابس بطول الجدار حتى السقف، بخزائن علوية تستغل كل المساحة.',
  'كبت زاوية للغرف الصغيرة أو الجدران المتقابلة.',
  'غرفة ملابس (Walk-in Closet) بأبواب زجاجية ورفوف مضيئة.',
  'كبت مع تسريحة ومرآة مضيئة في نفس الوحدة.',
  'كبت برفوف أحذية وأدراج داخلية حسب احتياجك.',
  'كبتات غرف الأطفال، مثبتة في الجدار لمنع الانقلاب.',
];

const FINISHES = [
  'ميلامين: اقتصادي وعملي بألوان خشبية وسادة.',
  'MDF بتشطيب UV أو أكريليك: سطح ناعم مقاوم للخدوش.',
  'بولي لاك أو هاي جلوس: تشطيب لامع أو مطفي بالألوان التي تختارها.',
  'قشر جوز: عروق خشب داكنة.',
  'خشب طبيعي: الأعلى متانة.',
];

const FAQS = [
  {
    q: 'كم سعر تفصيل كبت الملابس في الكويت؟',
    a: `نسعّر الكبتات بالمتر حسب نوع الخشب، من ${woodMin} إلى ${woodMax} د.ك للمتر. الإجمالي يعتمد على طول الكبت والتقسيم الداخلي والإضافات مثل التسريحة والإضاءة، والأسعار تقديرية ونتفق على السعر النهائي معك عبر واتساب بعد معرفة المقاسات.`,
  },
  {
    q: 'أيهما أفضل: أبواب مفصلية أم سحّابة؟',
    a: 'الأبواب السحّابة تناسب الغرف الضيقة لأنها لا تحتاج مساحة لفتحها أمام الكبت، والأبواب المفصلية تفتح الكبت بالكامل وتسهّل الوصول لكل الرفوف. نفصّل النوعين ونساعدك في الاختيار حسب مساحة الغرفة.',
  },
  {
    q: 'هل تفصّلون الكبت مع غرفة النوم كاملة؟',
    a: 'نعم، يمكن تفصيل الكبت مع السرير والتسريحة والكومودينات بخامة ولون موحد، أو تفصيل الكبت وحده ليتناسق مع غرفتك الحالية.',
  },
  {
    q: 'هل تزورون البيت لأخذ مقاسات الكبت؟',
    a: 'نعم، نزورك لأخذ المقاسات ومعاينة الجدار وعرض عينات الخشب في جميع مناطق الكويت، والتوصيل مجاني داخل الكويت.',
  },
];

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, siteName: siteConfig.name, locale: 'ar_KW', type: 'website', images: ['/og-image.jpg'] },
};

// أعمالنا الفعلية: منتجات غرف النوم التي فيها كبت أو غرفة ملابس — الكبتات المنفردة أولًا، ثم غرف النوم التي يظهر فيها الكبت
const wardrobeWorks = () =>
  visibleProducts
    .filter((p) => p.categorySlug === 'bedrooms' && /كبت|غرفة ملابس/.test(p.title))
    .sort((a, b) => Number(!a.title.startsWith('كبت')) - Number(!b.title.startsWith('كبت')));

export default function WardrobesPage() {
  const works = wardrobeWorks();
  const whatsapp = whatsappLink('تفصيل كبتات ملابس', PATH);

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: H1,
    serviceType: 'تفصيل كبتات ملابس',
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
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-12" data-wa-label="تفصيل كبتات ملابس">
      <JsonLd data={serviceLd} />
      <JsonLd data={faqLd} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'الرئيسية', path: '/' },
          { name: 'غرف نوم', path: '/category/bedrooms/' },
          { name: 'تفصيل كبتات ملابس', path: PATH },
        ])}
      />

      <nav aria-label="مسار التنقل" className="text-sm text-ink/55 mb-4">
        <Link href="/" className="hover:text-sage">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href="/category/bedrooms/" className="hover:text-sage">غرف نوم</Link>
        <span className="mx-2">/</span>
        <span>تفصيل كبتات ملابس</span>
      </nav>

      <h1 className="text-2xl sm:text-4xl leading-tight mb-4">{H1}</h1>
      <div className="max-w-3xl space-y-3 text-ink/75 leading-relaxed">
        <p>
          تبحث عن نجار كبتات في الكويت؟ نفصّل في منجرة مزونة كبت الملابس على مقاس جدارك بالضبط: من الأرض حتى السقف أو
          بارتفاع تختاره، بأبواب مفصلية أو سحّابة، وبتقسيم داخلي يناسب ملابسك من رفوف وعلّاقات وأدراج ورفوف أحذية.
        </p>
        <p>
          الصور في هذه الصفحة من كبتات نفذناها فعلًا في مناطق الكويت. نزورك لأخذ المقاسات وعرض عينات الخشب، ونصنع الكبت في
          منجرتنا في الضجيج، والتوصيل مجاني داخل الكويت.
        </p>
      </div>
      <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-grid mt-5 min-h-12 px-8 place-items-center bg-sage text-white rounded-full">
        اطلب زيارة لأخذ مقاسات الكبت عبر واتساب
      </a>

      {works.length > 0 && (
        <section className="mt-12" aria-labelledby="works-title">
          <h2 id="works-title" className="text-xl sm:text-2xl mb-4">كبتات ملابس من أعمالنا</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {works.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 max-w-3xl" aria-labelledby="types-title">
        <h2 id="types-title" className="text-xl sm:text-2xl mb-3">أنواع الكبتات التي نفصّلها</h2>
        <ul className="list-disc ps-5 space-y-1.5 text-ink/75 leading-relaxed">
          {TYPES.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="price-title">
        <h2 id="price-title" className="text-xl sm:text-2xl mb-3">الخامات وسعر تفصيل الكبت بالمتر</h2>
        <p className="text-ink/75 leading-relaxed mb-3">
          سعر تفصيل الكبت من {woodMin} إلى {woodMax} د.ك للمتر حسب نوع الخشب الذي تختاره. الأسعار تقديرية، ونتفق معك على
          السعر النهائي عبر واتساب بعد معرفة المقاسات والتفاصيل.
        </p>
        <ul className="list-disc ps-5 space-y-1.5 text-ink/75 leading-relaxed">
          {FINISHES.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-xl sm:text-2xl mb-4">أسئلة شائعة عن تفصيل الكبتات</h2>
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
          <Link href="/category/bedrooms/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">غرف نوم مودرن</Link>
          <Link href="/articles/wardrobe-ideas-kuwait/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">أفكار كبت ملابس وكبت زاوية</Link>
          <Link href="/category/kids-beds/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">أسرّة أطفال</Link>
          {areaPages.map((a) => (
            <Link key={a.slug} href={a.path} className="bg-cream border border-sand rounded-full px-3 py-1.5 text-sm hover:border-sage-soft">نجار {a.governorate}</Link>
          ))}
        </div>
      </section>
    </div>
  );
}
