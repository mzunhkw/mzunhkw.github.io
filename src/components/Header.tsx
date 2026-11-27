import Link from 'next/link';
import { siteConfig } from '@/data/site-config';

// تصميم «سوق إلكتروني» (اعتمده المالك 2026-11-27): هيدر أخضر بشعار وشريط بحث.
// شريط البحث خارج الهيدر اللاصق حتى لا يأخذ مساحة كبيرة على الجوال أثناء التمرير.
// البحث نموذج GET عادي إلى /products/?q=… (يعمل بدون JavaScript، والصفحة لها canonical ثابت).
export default function Header() {
  return (
    <>
      <header className="site-header">
        <div className="header-inner max-w-6xl mx-auto px-4 sm:px-8">
          <Link href="/" className="brand-link" aria-label={`${siteConfig.name} — الرئيسية`}>
            {/* نسخة صغيرة مخصصة للهيدر (132×121، ~3 كيلوبايت) — انظر PERFORMANCE-LOG.md */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-header.webp"
              srcSet="/logo-header-88.webp 88w, /logo-header.webp 132w"
              sizes="(max-width: 600px) 44px, 53px"
              alt={`شعار ${siteConfig.name} للأثاث والديكور`}
              width={132}
              height={121}
              fetchPriority="high"
              className="brand-logo"
            />
          </Link>

          <nav className="desktop-nav" aria-label="التنقل الرئيسي">
            <Link href="/" className="nav-link">الرئيسية</Link>
            <Link href="/category/ready-pieces/" className="nav-link">قطع جاهزة</Link>
            <Link href="/products/" className="nav-link">المنتجات</Link>
            <Link href="/#upholstery" className="nav-link">التنجيد</Link>
            <Link href="/about/" className="nav-link">من نحن</Link>
          </nav>

          <Link href="/category/ready-pieces/" className="header-cta">
            قطع جاهزة
          </Link>
        </div>
      </header>

      <div className="header-search-bar">
        <form action="/products/" method="get" role="search" className="header-search max-w-6xl mx-auto">
          <label className="header-search-field">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <span className="sr-only">بحث في المنتجات</span>
            <input type="search" name="q" placeholder="ابحث باسم القطعة أو رقمها MZ" autoComplete="off" />
          </label>
          <span className="header-search-note">توصيل داخل الكويت</span>
        </form>
      </div>
    </>
  );
}
