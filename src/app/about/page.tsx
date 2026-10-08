import type { Metadata } from 'next';
import Link from 'next/link';
import { categories } from '@/data/categories';
import { services } from '@/data/services';
import { siteConfig, whatsappGeneralLink } from '@/data/site-config';
import { absoluteUrl, breadcrumbLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

// كل المعلومات في هذه الصفحة من المالك مباشرة (2026-10-08): البداية، الفريق، المعرض،
// خطوات الطلب، الضمان، وما يميز المنجرة. لا تُضف ادعاءً غير مؤكد.
const path = '/about/';
const title = `من نحن | منجرة ${siteConfig.name} في الضجيج منذ ${siteConfig.foundedYear}`;
const description = `منجرة ${siteConfig.name} في الضجيج منذ ${siteConfig.foundedYear}: ${siteConfig.teamSize} نجارًا ومنجّدًا وخياطًا، كل التصنيع داخل منجرتنا، وضمان حتى 5 سنوات على الخامات عالية الجودة.`;

const STEPS = [
  'تراسلنا عبر واتساب بما تريد تفصيله، وتطلب زيارة المندوب.',
  'يزورك المندوب في بيتك ويعرض عليك عينات القماش والخشب والإسفنج.',
  'يأخذ المندوب المقاسات الدقيقة للمكان، ويتفق معك على التصميم ومدة التسليم.',
  'نستلم العربون ونبدأ التصنيع في منجرتنا.',
  'نسلّمك القطعة في المدة المتفق عليها، وتستكمل بقية المبلغ عند التسليم.',
];

const FAQS = [
  {
    q: 'هل تقدمون ضمانًا على الأثاث؟',
    a: 'نعم. الأعمال المنفذة بخامات عالية الجودة، مثل خشب الزان وإسفنج البغلي، عليها ضمان من سنة إلى خمس سنوات، وخشب الزان الأحمر ضمانه خمس سنوات. وإذا اختار العميل خامة أقل، يكون الضمان على عيوب التصنيع فقط.',
  },
  {
    q: 'هل تنفذون تصميمًا أرسله لكم من الإنترنت أو صممته بالذكاء الاصطناعي؟',
    a: 'نعم، ننفذ أي تصميم يطلبه العميل، بما فيها تصاميم يصممها العملاء بأدوات الذكاء الاصطناعي، ونحوّلها إلى قطعة حقيقية بمقاسات المكان الفعلية.',
  },
  {
    q: 'هل التصنيع يتم عندكم أم عند جهة أخرى؟',
    a: 'كل أعمال النجارة والتنجيد تتم داخل منجرتنا في الضجيج، على يد فريقنا من النجارين والمنجدين والخياطين.',
  },
  {
    q: 'كيف أبدأ الطلب؟',
    a: 'راسلنا عبر واتساب واطلب زيارة المندوب، فيزورك بالعينات ويأخذ المقاسات، ثم نبدأ العمل بعد استلام العربون.',
  },
];

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: path },
  openGraph: {
    title,
    description,
    url: path,
    siteName: siteConfig.name,
    locale: 'ar_KW',
    type: 'website',
    images: ['/og-image.jpg'],
  },
};

export default function AboutPage() {
  const whatsapp = whatsappGeneralLink();
  const mapEmbedSrc = siteConfig.geo
    ? `https://www.google.com/maps?q=${siteConfig.geo.lat},${siteConfig.geo.lng}&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(`${siteConfig.address} الكويت`)}&output=embed`;

  const aboutLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: title,
    description,
    url: absoluteUrl(path),
    mainEntity: { '@id': `${siteConfig.siteUrl}/#store` },
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  const stats = [
    { value: siteConfig.projectsCount, label: 'عمل منذ التأسيس', ltr: true },
    { value: String(siteConfig.foundedYear), label: 'سنة التأسيس' },
    { value: String(siteConfig.teamSize), label: 'نجارًا ومنجّدًا وخياطًا' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
      <JsonLd data={aboutLd} />
      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd([{ name: 'الرئيسية', path: '/' }, { name: 'من نحن', path }])} />

      <nav aria-label="مسار التنقل" className="text-sm text-ink/55 mb-4">
        <Link href="/" className="hover:text-sage">
          الرئيسية
        </Link>
        <span className="mx-2">/</span>
        <span>من نحن</span>
      </nav>

      <h1 className="text-2xl sm:text-4xl leading-tight">من نحن — منجرة {siteConfig.name} في الضجيج منذ {siteConfig.foundedYear}</h1>

      <div className="mt-6 space-y-4 text-ink/75 leading-relaxed">
        <p>
          بدأت منجرة {siteConfig.name} في الضجيج عام {siteConfig.foundedYear} منجرةً فقط، ثم توسعت لتصبح منجرة ومعرضًا للأثاث
          في المكان نفسه. نفصّل الكنب والقنفات، وغرف النوم وكبتات الملابس، والطاولات، والمجالس والمساند، وننجّد الأثاث
          القديم ونجدده.
        </p>
        <p>
          منذ التأسيس أصدرنا {siteConfig.projectsText} بفواتير مرقّمة، بين أعمال بسيطة كتنجيد قطعة واحدة ومشاريع كبيرة
          كتفصيل ديوانية أو بيت كامل.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-sage-mist rounded-2xl p-4 sm:p-5 text-center">
            <p className="text-xl sm:text-3xl text-sage" dir={s.ltr ? 'ltr' : undefined}>
              {s.value}
            </p>
            <p className="text-xs sm:text-sm text-ink/65 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-xl sm:text-2xl mb-3">فريقنا ومنجرتنا</h2>
        <div className="space-y-3 text-ink/75 leading-relaxed">
          <p>
            يعمل في منجرتنا {siteConfig.teamSize} حرفيًا: 4 نجارين و8 منجدين وخياطين. وكل أعمال النجارة والتنجيد تتم داخل
            منجرتنا في الضجيج، فنتابع كل قطعة من قص الخشب إلى آخر غرزة في القماش.
          </p>
          <p>
            وفي معرضنا تجد عينات الأقمشة والأخشاب والإسفنج لتلمسها وتقارن بينها قبل الاختيار، إلى جانب أعمال جاهزة تشاهد
            فيها جودة التشطيب بنفسك.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl sm:text-2xl mb-3">كيف نعمل</h2>
        <ol className="list-decimal ps-5 space-y-2 text-ink/75 leading-relaxed">
          {STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-xl sm:text-2xl mb-3">الضمان</h2>
        <div className="space-y-3 text-ink/75 leading-relaxed">
          <p>
            نقدم ضمانًا من سنة إلى خمس سنوات على الأعمال المنفذة بخامات عالية الجودة، مثل خشب الزان وإسفنج البغلي، ويصل
            ضمان خشب الزان الأحمر إلى خمس سنوات.
          </p>
          <p>وإذا اختار العميل خامة أقل جودة، يكون الضمان على عيوب التصنيع فقط.</p>
          <p>
            <Link href="/warranty/" className="text-sage underline">تفاصيل الضمان وما يشمله وكيف تطلبه</Link>
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl sm:text-2xl mb-3">ما يميزنا</h2>
        <ul className="list-disc ps-5 space-y-2 text-ink/75 leading-relaxed">
          <li>ضمان خمس سنوات على أعمال خشب الزان الأحمر.</li>
          <li>ننفذ أي تصميم يطلبه العميل، بالمقاس والخامة واللون الذي يختاره.</li>
          <li>
            ننفذ تصاميم يصممها العملاء بأدوات الذكاء الاصطناعي، ونحوّل الصورة إلى قطعة حقيقية بمقاسات المكان الفعلية.
          </li>
          <li>كل التصنيع داخل منجرتنا، بلا وسطاء.</li>
          <li>توصيل مجاني داخل الكويت.</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl sm:text-2xl mb-4">ماذا نقدّم</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}/`}
              className="border border-sand bg-white rounded-full px-4 py-2 text-sm hover:border-sage-soft"
            >
              {c.name}
            </Link>
          ))}
          <Link href="/tafseel-kabatat-kuwait/" className="border border-sand bg-white rounded-full px-4 py-2 text-sm hover:border-sage-soft">
            تفصيل كبتات ملابس
          </Link>
        </div>
      </section>

      {services.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl sm:text-2xl mb-4">خدمات التنجيد</h2>
          <div className="flex flex-wrap gap-3">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={s.path}
                className="border border-sand bg-white rounded-full px-4 py-2 text-sm hover:border-sage-soft"
              >
                {s.h1}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-xl sm:text-2xl mb-4">أسئلة شائعة</h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="bg-white border border-sand rounded-2xl p-4">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="text-ink/75 mt-2 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl sm:text-2xl mb-4">موقعنا وساعات العمل</h2>
        <ul className="space-y-2 text-ink/80">
          <li>
            <span className="text-ink/55">العنوان: </span>
            {siteConfig.address}
          </li>
          <li>
            <span className="text-ink/55">الدوام: </span>
            {siteConfig.hours}
          </li>
          <li>
            <span className="text-ink/55">واتساب: </span>
            <a href={whatsapp} target="_blank" rel="noreferrer" className="text-sage underline" dir="ltr">
              {siteConfig.phoneDisplay}
            </a>
          </li>
        </ul>

        <div className="mt-4 rounded-2xl overflow-hidden border border-sand aspect-video">
          <iframe
            src={mapEmbedSrc}
            title={`موقع ${siteConfig.name} على الخريطة`}
            className="w-full h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <section className="mt-12 bg-sage-mist rounded-2xl p-6">
        <h2 className="text-xl mb-2">تواصل معنا</h2>
        <p className="text-ink/70 leading-relaxed">
          للاستفسار عن أي قطعة أو طلب زيارة المندوب لأخذ المقاسات، راسلنا عبر واتساب وبنرد عليك بأقرب وقت.
        </p>
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-4 min-h-12 px-6 grid place-items-center bg-sage text-white rounded-full"
        >
          الاستفسار عبر واتساب
        </a>
      </section>
    </div>
  );
}
