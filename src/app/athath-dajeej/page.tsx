import type { Metadata } from 'next';
import Link from 'next/link';
import { visibleProducts } from '@/data/products';
import { siteConfig, whatsappLink } from '@/data/site-config';
import { bedroomPrice } from '@/data/wood-tiers';
import { absoluteUrl, breadcrumbLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ProductCard from '@/components/ProductCard';

// صفحة «أثاث الضجيج» — أحجام بحث الكويت (OpenSEO وUbersuggest، أكتوبر 2026):
// أثاث الضجيج 320 · غرف نوم الضجيج 170 · كبتات الضجيج 140 · محلات الضجيج 140 · قنفات الضجيج 110 ·
// كنب الضجيج 70 · كنبات الضجيج 70 · تنجيد كنب الضجيج 50. المنجرة والمعرض فعليًا في الضجيج (مجمع علي عبدالوهاب).
// الأقسام المعروضة: الظاهرة فقط (كنب، غرف نوم، مجالس، مساند) — تتبع hidden-sections.ts عبر visibleProducts.
const PATH = '/athath-dajeej/';
const TITLE = 'أثاث الضجيج | معرض ومنجرة مزونة — كنب وغرف نوم ومجالس';
const H1 = 'أثاث الضجيج — معرض ومنجرة مزونة لتفصيل الكنب وغرف النوم والمجالس';
const DESCRIPTION =
  'معرض ومنجرة مزونة في الضجيج منذ 2009: تفصيل كنب وقنفات، غرف نوم وكبتات وتسريحات، مجالس وديوانيات ومساند، وتنجيد كنب. زُر المعرض أو اطلب زيارة لأخذ المقاسات.';

const mapsLink = siteConfig.geo
  ? `https://www.google.com/maps?q=${siteConfig.geo.lat},${siteConfig.geo.lng}`
  : `https://www.google.com/maps?q=${encodeURIComponent(`${siteConfig.address} الكويت`)}`;

const SECTIONS = [
  {
    href: '/category/sofas/',
    title: 'كنب وقنفات الضجيج',
    text: 'نفصّل الكنب والقنفات في منجرتنا بالضجيج: كنب زاوية، وكنب مودرن، وقنفات مفردة وأطقم كاملة، بالمقاس والقماش الذي تختاره.',
  },
  {
    href: '/kanab-amriki-kuwait/',
    title: 'كنب أمريكي',
    text: 'كنب وقنفات أمريكي مريح بمقعد عميق ومخدات ظهر ممتلئة: طقم كامل أو حرف L وزاوية أو متصل بطول الجدار.',
  },
  {
    href: '/category/bedrooms/',
    title: 'غرف نوم الضجيج',
    text: `غرف نوم كاملة مودرن بخامة الميلامين بسعر ${bedroomPrice} د.ك للمتر المربع، مع سرير منجّد بمقاس المرتبة، وكومودينات، وتسريحة، وكبت ملابس.`,
  },
  {
    href: '/tafseel-kabatat-kuwait/',
    title: 'كبتات الضجيج',
    text: 'كبتات ملابس بطول الجدار، وكبت زاوية، وكبتات بأبواب زجاجية وإضاءة داخلية، مفصلية أو سحّابة، على مقاس جدارك.',
  },
  {
    href: '/tafseel-tasriha-kuwait/',
    title: 'تسريحات غرف النوم',
    text: 'تسريحات بمرآة مضيئة وأدراج، معلّقة أو مع خزانة عرض زجاجية، بنفس خامة غرفة النوم.',
  },
  {
    href: '/category/majlis/',
    title: 'مجالس وجلسات ديوانية',
    text: 'جلسات ديوانية رسمية بقاعدة خشبية، ومجالس عربية وأرضية، تُفصَّل حسب أطوال الجدران وعدد الجالسين.',
  },
  {
    href: '/category/cushions/',
    title: 'مساند عربية',
    text: 'مساند ظهر ومتكآت للمجالس والديوانيات، بإطار خشبي أو بقماش سدو، بالمقاس واللون المناسب.',
  },
  {
    href: '/tanjeed-sofa-kuwait/',
    title: 'تنجيد كنب الضجيج',
    text: 'تنجيد الكنب وتلبيس القنفات بقماش تركي داخل منجرتنا، ونجدد الإسفنج والقماش مع الحفاظ على الهيكل السليم.',
  },
];

const FAQS = [
  {
    q: 'أين يقع معرض ومنجرة مزونة في الضجيج؟',
    a: `معرضنا ومنجرتنا في ${siteConfig.address}، وساعات العمل ${siteConfig.hours}. ويمكنك أيضًا طلب زيارة لأخذ المقاسات في بيتك عبر واتساب.`,
  },
  {
    q: 'هل تصنعون الأثاث في الضجيج أم تبيعون أثاثًا جاهزًا؟',
    a: `نصنع داخل منجرتنا في الضجيج منذ ${siteConfig.foundedYear}: فريقنا من النجارين والمنجدين يفصّل الكنب وغرف النوم والكبتات والمجالس والمساند حسب المقاس والتصميم الذي تختاره.`,
  },
  {
    q: 'ماذا أجد في معرض الضجيج؟',
    a: 'في المعرض عينات الأقمشة والخشب والإسفنج، وقطع من أعمالنا، فتختار الخامة واللون وترى جودة التنفيذ قبل الطلب.',
  },
  {
    q: 'هل توصّلون من الضجيج إلى كل مناطق الكويت؟',
    a: 'نعم، التوصيل مجاني داخل الكويت، ونزورك لأخذ المقاسات وعرض العينات في جميع المحافظات.',
  },
];

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, siteName: siteConfig.name, locale: 'ar_KW', type: 'website', images: ['/og-image.jpg'] },
};

// أعمال من كل قسم ظاهر (الأحدث أولًا حسب ترتيب products.json)
const works = () =>
  ['bedrooms', 'sofas', 'majlis', 'cushions'].flatMap((c) => visibleProducts.filter((p) => p.categorySlug === c).slice(0, 3));

export default function DajeejPage() {
  const items = works();
  const whatsapp = whatsappLink('أثاث الضجيج', PATH);

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  const pageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: H1,
    description: DESCRIPTION,
    url: absoluteUrl(PATH),
    about: { '@id': `${siteConfig.siteUrl}/#store` },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-12" data-wa-label="أثاث الضجيج">
      <JsonLd data={pageLd} />
      <JsonLd data={faqLd} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'الرئيسية', path: '/' },
          { name: 'أثاث الضجيج', path: PATH },
        ])}
      />

      <nav aria-label="مسار التنقل" className="text-sm text-ink/55 mb-4">
        <Link href="/" className="hover:text-sage">الرئيسية</Link>
        <span className="mx-2">/</span>
        <span>أثاث الضجيج</span>
      </nav>

      <h1 className="text-2xl sm:text-4xl leading-tight mb-4">{H1}</h1>
      <div className="max-w-3xl space-y-3 text-ink/75 leading-relaxed">
        <p>
          تبحث عن أثاث في الضجيج؟ منجرة مزونة منجرة ومعرض في الضجيج منذ {siteConfig.foundedYear}، نفصّل فيها الكنب والقنفات وغرف
          النوم والكبتات والمجالس والمساند، وننجّد الكنب، وكل العمل داخل منجرتنا بفريق من النجارين والمنجدين.
        </p>
        <p>
          زُر معرضنا في {siteConfig.address} لترى عينات الأقمشة والخشب والإسفنج وقطعًا من أعمالنا، أو أرسل لنا صورة التصميم عبر
          واتساب ونزورك لأخذ المقاسات. التوصيل مجاني داخل الكويت.
        </p>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-grid min-h-12 px-8 place-items-center bg-sage text-white rounded-full">
          استفسر عبر واتساب
        </a>
        <a href={mapsLink} target="_blank" rel="noreferrer" className="inline-grid min-h-12 px-8 place-items-center border border-sage text-sage rounded-full">
          موقع المعرض على الخريطة
        </a>
      </div>

      <section className="mt-12" aria-labelledby="sections-title">
        <h2 id="sections-title" className="text-xl sm:text-2xl mb-4">ماذا نفصّل في منجرتنا بالضجيج</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="block bg-white border border-sand rounded-2xl p-4 hover:border-sage-soft">
              <h3 className="font-medium text-ink">{s.title}</h3>
              <p className="text-sm text-ink/70 mt-1 leading-relaxed">{s.text}</p>
            </Link>
          ))}
        </div>
      </section>

      {items.length > 0 && (
        <section className="mt-12" aria-labelledby="works-title">
          <h2 id="works-title" className="text-xl sm:text-2xl mb-4">من أعمال منجرتنا في الضجيج</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {items.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 max-w-3xl" aria-labelledby="visit-title">
        <h2 id="visit-title" className="text-xl sm:text-2xl mb-3">زيارة المعرض</h2>
        <ul className="list-disc ps-5 space-y-1.5 text-ink/75 leading-relaxed">
          <li>العنوان: {siteConfig.address}</li>
          <li>ساعات العمل: {siteConfig.hours}</li>
          <li>واتساب: {siteConfig.phoneDisplay}</li>
        </ul>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-xl sm:text-2xl mb-4">أسئلة شائعة عن معرضنا في الضجيج</h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="bg-white border border-sand rounded-2xl p-4">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="text-ink/75 mt-2 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
