import Link from 'next/link';
import { siteConfig } from '@/data/site-config';

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner max-w-6xl mx-auto px-4 sm:px-8">
        <Link href="/" className="brand-link" aria-label={`${siteConfig.name} — الرئيسية`}>
          {/* نسخة صغيرة مخصصة للهيدر (176×161) بدل ملف الشعار الكامل
              (760×694). الهيدر يعرضه بارتفاع 40-48px فقط في كل صفحات
              الموقع، فكان تحميل الملف الكامل (~52 كيلوبايت) على كل صفحة
              — بما فيها صفحات المنتجات والتصنيفات التي لا تحتوي شعار
              الهيرو الكبير أصلًا — هدرًا صافيًا في البايتات وتأخيرًا
              لعنصر LCP في تلك الصفحات. النسخة الجديدة ~10 كيلوبايت فقط. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-header.webp"
            alt={`شعار ${siteConfig.name} للأثاث والديكور`}
            width={176}
            height={161}
            fetchPriority="high"
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
