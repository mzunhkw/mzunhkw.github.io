import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import JsonLd from '@/components/JsonLd';
import { siteConfig } from '@/data/site-config';

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
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
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
  logo: `${siteConfig.siteUrl}/icon-512.png`,
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
  // يُضافان تلقائيًا فقط بعد تعبئة geo / socialLinks في site-config.ts.
  ...(siteConfig.geo
    ? { geo: { '@type': 'GeoCoordinates', latitude: siteConfig.geo.lat, longitude: siteConfig.geo.lng } }
    : {}),
  ...(siteConfig.socialLinks.length ? { sameAs: siteConfig.socialLinks } : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
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
