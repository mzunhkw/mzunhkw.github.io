'use client';

import { useEffect, useState } from 'react';
import { siteConfig } from '@/data/site-config';

// التحقق من باركود فواتير منجرة مزونة.
// الرابط: /verify/#<بيانات base64url>.<توقيع ECDSA P-256 base64url>
// المفاتيح العامة في /verify-keys.json (يضيفها تطبيق الفواتير عند تفعيل جهاز)،
// والرموز (نوع القطعة/الخامة/الضمان) في /invoice/codes.json — نفس مصدر تطبيق الفواتير.
type Payload = { v: number; k: string; n: string; d: string; i: [number, number, number][] };
type Codes = {
  categories: Record<string, { name: string }>;
  materials: Record<string, string>;
  warranty: Record<string, string>;
};
type Result =
  | { state: 'loading' }
  | { state: 'empty' }
  | { state: 'invalid' }
  | { state: 'valid'; p: Payload; codes: Codes };

const fromB64u = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));

function addMonths(iso: string, m: number) {
  const t = new Date(iso + 'T00:00:00Z');
  t.setUTCMonth(t.getUTCMonth() + m);
  return t.toISOString().slice(0, 10);
}

async function verify(hash: string): Promise<Result> {
  const raw = hash.replace(/^#/, '');
  if (!raw) return { state: 'empty' };
  const dot = raw.lastIndexOf('.');
  if (dot < 1) return { state: 'invalid' };
  const data = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  try {
    const p = JSON.parse(new TextDecoder().decode(fromB64u(data))) as Payload;
    const [keys, codes] = await Promise.all([
      fetch('/verify-keys.json', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/invoice/codes.json', { cache: 'no-store' }).then((r) => r.json()),
    ]);
    const k = (keys as { kid: string; x: string; y: string }[]).find((x) => x.kid === p.k);
    if (!k) return { state: 'invalid' };
    const key = await crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x: k.x, y: k.y, ext: true }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, fromB64u(sig), new TextEncoder().encode(data));
    return ok ? { state: 'valid', p, codes } : { state: 'invalid' };
  } catch {
    return { state: 'invalid' };
  }
}

export default function VerifyClient() {
  const [res, setRes] = useState<Result>({ state: 'loading' });

  useEffect(() => {
    const run = () => verify(window.location.hash).then(setRes);
    run();
    window.addEventListener('hashchange', run);
    return () => window.removeEventListener('hashchange', run);
  }, []);

  if (res.state === 'loading') return <p className="text-ink/60">جارٍ التحقق…</p>;

  if (res.state === 'empty')
    return (
      <div className="bg-sage-mist rounded-2xl p-5 leading-relaxed text-ink/75">
        امسح الباركود المطبوع على فاتورة منجرة مزونة بكاميرا الجوال، وستفتح هذه الصفحة وتعرض لك بيانات الفاتورة والضمان.
      </div>
    );

  if (res.state === 'invalid')
    return (
      <div className="rounded-2xl p-5 border-2 border-red-300 bg-red-50 leading-relaxed">
        <p className="text-lg font-medium text-red-800">✗ لم نتمكن من التحقق من هذه الفاتورة</p>
        <p className="mt-2 text-ink/75">
          الرابط غير مكتمل أو تم تعديله، أو الفاتورة ليست صادرة من منجرة مزونة. للتأكد راسلنا على واتساب{' '}
          <span dir="ltr">{siteConfig.phoneDisplay}</span> برقم الفاتورة.
        </p>
      </div>
    );

  const { p, codes } = res;
  const now = new Date().toISOString().slice(0, 10);
  const wa = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(`مرحبا، استفسار عن ضمان الفاتورة رقم ${p.n} من منجرة مزونة`)}`;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-5 border-2 border-sage bg-sage-mist">
        <p className="text-lg font-medium text-sage">✓ فاتورة صحيحة صادرة من منجرة مزونة</p>
        <p className="mt-2 text-ink/75">
          رقم الفاتورة <b dir="ltr">{p.n}</b> بتاريخ <span dir="ltr">{p.d}</span>
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-sand rounded-xl overflow-hidden bg-white">
          <thead className="bg-cream">
            <tr>
              <th scope="col" className="text-start font-medium px-3 py-2">القطعة</th>
              <th scope="col" className="text-start font-medium px-3 py-2">الخامة</th>
              <th scope="col" className="text-start font-medium px-3 py-2">الضمان</th>
            </tr>
          </thead>
          <tbody>
            {p.i.map(([c, m, w], idx) => {
              const end = w > 0 ? addMonths(p.d, w) : null;
              return (
                <tr key={idx} className="border-t border-sand align-top">
                  <td className="px-3 py-2">{codes.categories[String(c)]?.name || '—'}</td>
                  <td className="px-3 py-2">{codes.materials[String(m)] || '—'}</td>
                  <td className="px-3 py-2">
                    {codes.warranty[String(w)] || '—'}
                    {end && (
                      <span className={`block text-xs mt-0.5 ${end >= now ? 'text-sage' : 'text-red-700'}`}>
                        {end >= now ? 'ساري حتى' : 'انتهى في'} <span dir="ltr">{end}</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-ink/60 leading-relaxed">
        الضمان يشمل إصلاح عيوب التصنيع ولا يشمل الاستبدال.{' '}
        <a href="/warranty/" className="text-sage underline">تفاصيل الضمان</a>
      </p>
      <a href={wa} target="_blank" rel="noreferrer" className="inline-grid min-h-12 px-8 place-items-center bg-sage text-white rounded-full">
        طلب ضمان لهذه الفاتورة عبر واتساب
      </a>
    </div>
  );
}
