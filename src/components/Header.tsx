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
              لعنصر LCP في تلك الصفحات. النسخة الجديدة ~10 كيلوبايت فقط.
              2026-11-15: صُغّرت إلى 132×121 (3× عرضها الفعلي 44px على الجوال) وضُغطت
              إلى ~3 كيلوبايت — PageSpeed كان يحسب 9 من 10 كيلوبايت هدرًا. */}
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
  );
}
