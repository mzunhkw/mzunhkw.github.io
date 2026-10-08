import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

/*
 * خط Noto Kufi Arabic مستضاف محليًا (من حزمة @fontsource/noto-kufi-arabic)
 * بدل next/font/google — لا يوجد أي طلب لـ fonts.googleapis.com أو fonts.gstatic.com.
 *
 * - الأوزان المستخدمة فعليًا فقط: 400 (النص)، 500 (font-medium)، 600 (أزرار وعناوين البطاقات)،
 *   700 (strong/b والأسعار). باقي الأوزان (100–300، 800، 900) غير مضمّنة.
 * - الـ subset العربي فقط يُحمَّل مسبقًا (preload) كما كان سابقًا، فلا يتغير سلوك LCP.
 * - ملفات latin (أرقام وحروف لاتينية) بدون preload ومقيدة بـ unicode-range،
 *   فلا تُحمَّل إلا إذا احتاجتها الصفحة.
 * - display: optional يمنع أي swap متأخر (لا CLS)، و adjustFontFallback معطّل
 *   حتى لا يلتقط الخط الاحتياطي الحروف قبل ملفات latin (نفس الترتيب في globals.css).
 */
const notoKufiArabic = localFont({
  src: [
    { path: '../../node_modules/@fontsource/noto-kufi-arabic/files/noto-kufi-arabic-arabic-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/noto-kufi-arabic/files/noto-kufi-arabic-arabic-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../node_modules/@fontsource/noto-kufi-arabic/files/noto-kufi-arabic-arabic-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../node_modules/@fontsource/noto-kufi-arabic/files/noto-kufi-arabic-arabic-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  display: 'optional',
  preload: true,
  adjustFontFallback: false,
  variable: '--font-arabic',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC',
    },
  ],
});

const notoKufiLatin = localFont({
  src: [
    { path: '../../node_modules/@fontsource/noto-kufi-arabic/files/noto-kufi-arabic-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/noto-kufi-arabic/files/noto-kufi-arabic-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../node_modules/@fontsource/noto-kufi-arabic/files/noto-kufi-arabic-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../node_modules/@fontsource/noto-kufi-arabic/files/noto-kufi-arabic-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  display: 'optional',
  preload: false,
  adjustFontFallback: false,
  variable: '--font-latin',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
});
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import JsonLd from '@/components/JsonLd';
import { siteConfig } from '@/data/site-config';

const ICON_VERSION = '3';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.name} — ${siteConfig.seoTitle}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.seoDescription,
  applicationName: siteConfig.name,
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: `/favicon.ico?v=${ICON_VERSION}`, sizes: 'any' },
      { url: `/favicon-32.png?v=${ICON_VERSION}`, sizes: '32x32', type: 'image/png' },
      { url: `/favicon-48.png?v=${ICON_VERSION}`, sizes: '48x48', type: 'image/png' },
      { url: `/icon-192.png?v=${ICON_VERSION}`, sizes: '192x192', type: 'image/png' },
      { url: `/icon-512.png?v=${ICON_VERSION}`, sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: `/apple-touch-icon.png?v=${ICON_VERSION}`, sizes: '180x180' }],
  },
  openGraph: {
    siteName: siteConfig.name,
    locale: 'ar_KW',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: `${siteConfig.name} — ${siteConfig.nameEn}` }],
  },
  twitter: { card: 'summary_large_image', images: ['/og-image.jpg'] },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FurnitureStore',
  '@id': `${siteConfig.siteUrl}/#store`,
  name: siteConfig.name,
  alternateName: siteConfig.nameEn,
  description: siteConfig.seoDescription,
  url: siteConfig.siteUrl,
  logo: `${siteConfig.siteUrl}/icon-512.png?v=${ICON_VERSION}`,
  image: `${siteConfig.siteUrl}/og-image.jpg`,
  telephone: `+${siteConfig.whatsappNumber}`,
  foundingDate: String(siteConfig.foundedYear),
  numberOfEmployees: { '@type': 'QuantitativeValue', value: siteConfig.teamSize },
  areaServed: { '@type': 'Country', name: 'الكويت' },
  // نطاق الأسعار التقديرية المعروضة في الموقع (من مساند الظهر بالمتر إلى طاولات الطعام الرخام)
  priceRange: '9 - 450 KWD',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'مجمع علي عبدالوهاب',
    addressLocality: 'الضجيج',
    addressCountry: 'KW',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '09:00',
    closes: '23:00',
  },
  ...(siteConfig.geo
    ? { geo: { '@type': 'GeoCoordinates', latitude: siteConfig.geo.lat, longitude: siteConfig.geo.lng } }
    : {}),
  ...(siteConfig.socialLinks.length ? { sameAs: siteConfig.socialLinks } : {}),
};

const GA_ID = 'G-9CRZ2J12D6';
// GA4 مؤجَّل (حارس LCP): gtag يُعرَّف فوراً فتُحفظ الأحداث في dataLayer، وسكربت gtag.js لا يُحمَّل
// إلا عند أول تفاعل (لمس/تمرير/نقر/لوحة مفاتيح) أو بعد 6 ثوانٍ من اكتمال الصفحة — على mazunhkw.com فقط.
// كل ضغطة على رابط واتساب تُرسل حدث whatsapp_click (يُعيَّن «حدثاً رئيسياً» في GA4).
const GA_SCRIPT = `(function(){var id='${GA_ID}';window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments);};gtag('js',new Date());gtag('config',id);
if(!(location.hostname==='mazunhkw.com'||location.hostname.slice(-13)==='.mazunhkw.com'))return;
var done=false,ev=['pointerdown','keydown','scroll','touchstart'];function go(){if(done)return;done=true;ev.forEach(function(e){removeEventListener(e,go)});var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+id;document.head.appendChild(s);}
ev.forEach(function(e){addEventListener(e,go,{once:true,passive:true})});function later(){setTimeout(go,6000)}if(document.readyState==='complete')later();else addEventListener('load',later,{once:true});
document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[href*="wa.me"],a[href*="api.whatsapp.com"]');if(!a)return;go();var p=location.pathname,q=p.split('/'),m=q[1]==='products'&&q[2]?[0,q[2]]:null;gtag('event','whatsapp_click',{page_path:p,product:m?m[1]:'',link_text:(a.textContent||'').trim().slice(0,60),language:document.documentElement.lang||'ar',transport_type:'beacon'});},true);})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${notoKufiArabic.variable} ${notoKufiLatin.variable}`}>
      <head>
        {/* تحميل مسبق صريح لشعار الهيدر الصغير — يظهر في أعلى كل صفحة بالموقع،
            وهو عنصر LCP الفعلي في كل صفحات الموقع بعد حذف شعار الهيرو الكبير
            من الصفحة الرئيسية (كان هو عنصر LCP على الجوال بسبب ترتيبه أول
            عنصر مرئي هناك). */}
        <link rel="preload" as="image" href="/logo-header.webp" fetchPriority="high" />
      </head>
      <body className="bg-cream text-ink min-h-screen flex flex-col antialiased">
        <JsonLd data={jsonLd} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingWhatsApp />
        <script dangerouslySetInnerHTML={{ __html: GA_SCRIPT }} />
      </body>
    </html>
  );
}
