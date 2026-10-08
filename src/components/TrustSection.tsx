import Link from 'next/link';
import { siteConfig } from '@/data/site-config';

// قسم الثقة: فواتير مرقّمة بباركود تحقق موقّع رقميًا، وضمان مكتوب لكل قطعة،
// وطلب رقم السجل التجاري عبر واتساب (لا يُنشر الرقم في الموقع — طلب المالك).
export const commercialRegistrationLink = () =>
  `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent('مرحبا، أرغب بالحصول على رقم السجل التجاري لمنجرة مزونة')}`;

export default function TrustSection({ headingLevel = 'h2' }: { headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel;
  const points = [
    { t: 'فاتورة مرقّمة لكل عمل', d: 'كل فاتورة تصدر برقم مسلسل، وفيها المقاسات والخامة والسعر والعربون والمتبقي وموعد التسليم.' },
    { t: 'باركود تحقق مدمج في الفاتورة', d: 'امسح الباركود بكاميرا الجوال لتتأكد أن الفاتورة صادرة منا، ولا يمكن تعديل بياناتها أو تزويرها.' },
    { t: 'ضمان مكتوب لكل قطعة', d: 'مدة ضمان كل قطعة مكتوبة في الفاتورة وتظهر عند التحقق مع تاريخ انتهائها، فلا يضيع حقك.' },
  ];
  return (
    <div className="bg-white border border-sand rounded-2xl p-5 sm:p-7">
      <H className="text-xl sm:text-2xl mb-2">فواتير موثّقة وضمان مكتوب وتحقق بالباركود</H>
      <p className="text-ink/70 leading-relaxed mb-5">
        نعتمد في منجرة {siteConfig.name} نظامًا للفواتير والضمان يحفظ حقك من أول عربون حتى نهاية مدة الضمان.
      </p>
      <ul className="grid sm:grid-cols-3 gap-3">
        {points.map((p) => (
          <li key={p.t} className="bg-cream rounded-xl p-4">
            <strong className="block mb-1">{p.t}</strong>
            <span className="text-sm text-ink/70 leading-relaxed">{p.d}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/verify/" className="inline-grid min-h-11 px-5 place-items-center bg-sage text-white rounded-full text-sm">
          التحقق من فاتورة
        </Link>
        <Link href="/warranty/" className="inline-grid min-h-11 px-5 place-items-center border border-sand rounded-full text-sm hover:border-sage-soft">
          سياسة الضمان
        </Link>
        <a
          href={commercialRegistrationLink()}
          target="_blank"
          rel="noreferrer"
          className="inline-grid min-h-11 px-5 place-items-center border border-sand rounded-full text-sm hover:border-sage-soft"
        >
          طلب رقم السجل التجاري عبر واتساب
        </a>
      </div>
    </div>
  );
}
