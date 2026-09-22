import Link from 'next/link';
import { siteConfig } from '@/data/site-config';

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner max-w-6xl mx-auto px-4 sm:px-8">
        <Link href="/" className="brand-link" aria-label={`${siteConfig.name} — الرئيسية`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt={`شعار ${siteConfig.name} للأثاث والديكور`}
            width={900}
            height={194}
            className="brand-logo"
          />
        </Link>

        <nav className="desktop-nav" aria-label="التنقل الرئيسي">
          <Link href="/" className="nav-link">الرئيسية</Link>
          <Link href="/products/" className="nav-link">المنتجات</Link>
          <Link href="/#خدمات-التنجيد" className="nav-link">التنجيد</Link>
          <Link href="/من-نحن/" className="nav-link">من نحن</Link>
        </nav>

        <Link href="/products/" className="header-cta">
          المنتجات
        </Link>
      </div>
    </header>
  );
}
