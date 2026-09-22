import type { Metadata } from 'next';
import { Noto_Kufi_Arabic } from 'next/font/google';
import './globals.css';

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-arabic',
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
  areaServed: { '@type': 'Country', name: 'الكويت' },
  address: { '@type': 'PostalAddress', streetAddress: siteConfig.address, addressCountry: 'KW' },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    opens: '09:00',
    closes: '23:00',
  },
  ...(siteConfig.geo
    ? { geo: { '@type': 'GeoCoordinates', latitude: siteConfig.geo.lat, longitude: siteConfig.geo.lng } }
    : {}),
  ...(siteConfig.socialLinks.length ? { sameAs: siteConfig.socialLinks } : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={notoKufiArabic.variable}>
      <head>
        {/* تحميل مسبق صريح لشعار الهيدر الصغير — يظهر في أعلى كل صفحة بالموقع
            (وهو عنصر LCP الفعلي في صفحات المنتجات والتصنيفات التي لا تحتوي
            شعار الهيرو الكبير). الشعار الكبير بالصفحة الرئيسية (hero-logo)
            لا يحتاج preload منفصل: fetchPriority="high" على وسمه مباشرة
            كافٍ لأن ماسح الأولوية بالمتصفح يكتشفه فور تحليل HTML، وتحديد
            preload هنا لملف واحد صغير بدل الملف الكبير يقلّل التنافس على
            الشبكة المحدودة في أول ثانيتين من تحميل أي صفحة. */}
        <link rel="preload" as="image" href="/logo-header.webp" fetchPriority="high" />
      </head>
      <body className="bg-cream text-ink min-h-screen flex flex-col antialiased">
        <JsonLd data={jsonLd} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
