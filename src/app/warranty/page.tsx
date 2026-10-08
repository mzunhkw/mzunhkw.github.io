import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig, whatsappLink } from '@/data/site-config';
import { absoluteUrl, breadcrumbLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

// سياسة الضمان والإرجاع — مدد الضمان من المالك مباشرة (2026-10-08):
// خامات عالية الجودة (خشب الزان وإسفنج البغلي): من سنة إلى خمس سنوات، والزان الأحمر خمس سنوات؛
// الخامات الأقل: عيوب التصنيع فقط. الإرجاع: في حالة العيوب المصنعية فقط.
// بنود «ما لا يشمله الضمان» والعناية مبنية على المتعارف عليه في ضمانات الأثاث.
// لا يُذكر الضمان في صفحات المنتجات (طلب المالك) — هنا وفي «من نحن» فقط.
const path = '/warranty/';
const title = `ضمان الأثاث وسياسة الإرجاع | منجرة ${siteConfig.name}`;
const description = `سياسة ضمان منجرة ${siteConfig.name}: ضمان من سنة إلى خمس سنوات على خشب الزان وإسفنج البغلي، وخمس سنوات على الزان الأحمر، وما يشمله الضمان وكيف تطلبه.`;

const PERIODS = [
  { material: 'خشب الزان الأحمر', period: 'خمس سنوات' },
  { material: 'خامات عالية الجودة: خشب الزان وإسفنج البغلي', period: 'من سنة إلى خمس سنوات حسب القطعة والخامة' },
  { material: 'خامات أخرى يختارها العميل', period: 'ضمان على عيوب التصنيع فقط' },
];

const COVERED = [
  'تفكك الهيكل الخشبي أو المفاصل والتجميعات في الاستخدام العادي.',
  'كسر أو تشقق في الهيكل سببه عيب في التصنيع.',
  'هبوط غير طبيعي في الإسفنج خلال مدة الضمان.',
  'فتق في خياطة التنجيد أو انفصال القماش عن الهيكل بسبب عيب في الشغل.',
  'عيوب تركيب الأبواب والأدراج في الكبتات وغرف النوم.',
];

const NOT_COVERED = [
  'الاستهلاك الطبيعي مع الوقت، مثل بهتان لون القماش أو ظهور الوبر عليه.',
  'الحوادث: انسكاب السوائل، البقع، الحروق، أو القطع والتمزق.',
  'سوء الاستخدام، مثل الوقوف أو القفز على الأثاث أو تحميله فوق طاقته.',
  'أضرار الماء والرطوبة العالية وأشعة الشمس المباشرة لفترات طويلة.',
  'الخدوش والصدمات الناتجة عن الاستخدام أو النقل.',
  'نقل القطعة أو فكها وتركيبها أو تعديلها أو إصلاحها من جهة أخرى غير منجرتنا.',
  'الاختلاف الطبيعي في عروق الخشب ودرجات لونه، فهي من طبيعة الخشب وليست عيبًا.',
];

const CARE = [
  'أبعد الأثاث عن أشعة الشمس المباشرة ومكيفات الهواء القريبة جدًا.',
  'نظّف القماش بقطعة قماش ناعمة، وعالج البقع فورًا بدون فرك قوي.',
  'لا تستخدم مواد تنظيف قوية على الخشب أو القماش.',
  'عند نقل القطعة ارفعها ولا تسحبها على الأرض.',
];

const FAQS = [
  {
    q: 'كم مدة ضمان الأثاث لديكم؟',
    a: 'من سنة إلى خمس سنوات على الأعمال المنفذة بخامات عالية الجودة مثل خشب الزان وإسفنج البغلي، وخمس سنوات على خشب الزان الأحمر. وإذا اختار العميل خامة أقل جودة، يكون الضمان على عيوب التصنيع فقط.',
  },
  {
    q: 'هل الضمان يشمل بهتان القماش؟',
    a: 'لا، بهتان القماش مع الوقت أو بسبب الشمس من الاستهلاك الطبيعي ولا يشمله الضمان. الضمان يغطي عيوب التصنيع مثل تفكك الهيكل أو فتق الخياطة.',
  },
  {
    q: 'كيف أطلب الضمان؟',
    a: 'راسلنا عبر واتساب برقم الفاتورة وصور واضحة للمشكلة، ونحدد معك موعدًا لمعاينة القطعة.',
  },
  {
    q: 'هل يمكن إرجاع قطعة مفصّلة حسب الطلب؟',
    a: 'القطع المفصّلة حسب الطلب لا تُسترجع، إلا في حالة وجود عيب مصنعي.',
  },
];

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: path },
  openGraph: { title, description, url: path, siteName: siteConfig.name, locale: 'ar_KW', type: 'website', images: ['/og-image.jpg'] },
};

export default function WarrantyPage() {
  const whatsapp = whatsappLink('طلب ضمان', path);
  const pageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: absoluteUrl(path),
    inLanguage: 'ar',
    isPartOf: { '@id': `${siteConfig.siteUrl}/#store` },
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
      <JsonLd data={pageLd} />
      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd([{ name: 'الرئيسية', path: '/' }, { name: 'الضمان', path }])} />

      <nav aria-label="مسار التنقل" className="text-sm text-ink/55 mb-4">
        <Link href="/" className="hover:text-sage">الرئيسية</Link>
        <span className="mx-2">/</span>
        <span>الضمان</span>
      </nav>

      <h1 className="text-2xl sm:text-4xl leading-tight">ضمان الأثاث وسياسة الإرجاع في منجرة {siteConfig.name}</h1>
      <p className="mt-6 text-ink/75 leading-relaxed">
        نصنع كل أعمال النجارة والتنجيد داخل منجرتنا في الضجيج، ولذلك نضمن شغلنا. مدة الضمان تعتمد على الخامة التي
        تختارها: كلما ارتفعت جودة الخشب والإسفنج طالت مدة الضمان.
      </p>

      <section className="mt-10">
        <h2 className="text-xl sm:text-2xl mb-3">مدة الضمان حسب الخامة</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-sand rounded-xl overflow-hidden">
            <thead className="bg-sage-mist">
              <tr>
                <th scope="col" className="text-start font-medium px-3 py-2">الخامة</th>
                <th scope="col" className="text-start font-medium px-3 py-2">مدة الضمان</th>
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((p) => (
                <tr key={p.material} className="border-t border-sand bg-white">
                  <th scope="row" className="text-start font-medium px-3 py-2">{p.material}</th>
                  <td className="px-3 py-2 text-ink/75">{p.period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl sm:text-2xl mb-3">ما يشمله الضمان</h2>
        <p className="text-ink/75 leading-relaxed mb-2">يغطي الضمان عيوب التصنيع التي تظهر مع الاستخدام العادي، مثل:</p>
        <ul className="list-disc ps-5 space-y-1.5 text-ink/75 leading-relaxed">
          {COVERED.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl sm:text-2xl mb-3">ما لا يشمله الضمان</h2>
        <ul className="list-disc ps-5 space-y-1.5 text-ink/75 leading-relaxed">
          {NOT_COVERED.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl sm:text-2xl mb-3">كيف تطلب الضمان</h2>
        <ol className="list-decimal ps-5 space-y-1.5 text-ink/75 leading-relaxed">
          <li>راسلنا عبر واتساب برقم الفاتورة.</li>
          <li>أرسل صورًا واضحة للمشكلة.</li>
          <li>نحدد معك موعدًا لمعاينة القطعة، وإذا كان العيب مشمولًا بالضمان نصلحه.</li>
        </ol>
        <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-grid mt-5 min-h-12 px-8 place-items-center bg-sage text-white rounded-full">
          طلب ضمان عبر واتساب
        </a>
      </section>

      <section className="mt-10">
        <h2 className="text-xl sm:text-2xl mb-3">سياسة الإرجاع</h2>
        <p className="text-ink/75 leading-relaxed">
          لأن كل قطعة تُفصّل خصيصًا على مقاسك وتصميمك، فالقطع المفصّلة حسب الطلب لا تُسترجع، إلا في حالة وجود عيب مصنعي.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl sm:text-2xl mb-3">نصائح للعناية بالأثاث</h2>
        <ul className="list-disc ps-5 space-y-1.5 text-ink/75 leading-relaxed">
          {CARE.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl sm:text-2xl mb-4">أسئلة شائعة عن الضمان</h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="bg-white border border-sand rounded-2xl p-4">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="text-ink/75 mt-2 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-10 text-sm text-ink/60">
        تعرّف أكثر على منجرتنا وطريقة عملنا في صفحة <Link href="/about/" className="text-sage underline">من نحن</Link>.
      </p>
    </div>
  );
}
