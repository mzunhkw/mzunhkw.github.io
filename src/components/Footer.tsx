import Link from 'next/link';
import { categories } from '@/data/categories';
import { siteConfig, whatsappLink } from '@/data/site-config';
import { areaPages } from '@/data/area-pages';

export default function Footer() {
  return (
    <footer className="border-t border-sand bg-white mt-12 pb-24 sm:pb-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 grid gap-8 sm:grid-cols-2">
        <div className="space-y-3">
          <p className="text-lg text-sage font-medium">{siteConfig.name}</p>
          <p className="text-sm text-ink/65 max-w-md leading-relaxed">{siteConfig.about}</p>
        </div>
        <ul className="space-y-2 text-sm text-ink/80">
          <li>
            <span className="text-ink/55">العنوان: </span>
            {siteConfig.address}
          </li>
          <li>
            <span className="text-ink/55">الدوام: </span>
            {siteConfig.hours}
          </li>
          <li>
            <span className="text-ink/55">واتساب: </span>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="social-link social-whatsapp"
              aria-label="تواصل معنا عبر واتساب"
            >
              <svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor" aria-hidden="true" focusable="false"><path d="M16.004 3c-7.18 0-13 5.82-13 13 0 2.3.61 4.46 1.68 6.33L3 29l6.86-1.8a12.94 12.94 0 0 0 6.14 1.56h.01c7.18 0 13-5.82 13-13s-5.82-12.76-13.01-12.76zm0 23.77h-.01a10.8 10.8 0 0 1-5.5-1.51l-.4-.24-4.08 1.07 1.09-3.98-.26-.41a10.77 10.77 0 0 1-1.66-5.7c0-5.96 4.85-10.8 10.82-10.8 2.89 0 5.6 1.13 7.64 3.17a10.74 10.74 0 0 1 3.17 7.65c0 5.96-4.86 10.75-10.81 10.75zm5.93-8.08c-.33-.16-1.92-.95-2.22-1.06-.3-.11-.51-.16-.73.16-.22.33-.84 1.06-1.03 1.27-.19.22-.38.24-.7.08-.33-.16-1.37-.5-2.6-1.6-.96-.86-1.61-1.92-1.8-2.24-.19-.33-.02-.5.14-.67.14-.14.33-.38.49-.57.16-.19.22-.33.33-.54.11-.22.05-.41-.03-.57-.08-.16-.73-1.75-1-2.4-.26-.63-.53-.54-.73-.55h-.62c-.22 0-.57.08-.87.41-.3.33-1.14 1.11-1.14 2.71 0 1.6 1.17 3.14 1.33 3.36.16.22 2.3 3.51 5.57 4.93.78.34 1.39.54 1.86.69.78.25 1.5.21 2.06.13.63-.09 1.92-.78 2.19-1.54.27-.76.27-1.4.19-1.54-.08-.14-.3-.22-.62-.38z" /></svg>
              <span dir="ltr">{siteConfig.phoneDisplay}</span>
            </a>
          </li>
          <li>
            <span className="text-ink/55">انستقرام: </span>
            <a
              href="https://www.instagram.com/mazunhkw"
              target="_blank"
              rel="me noreferrer"
              className="social-link social-instagram"
              aria-label="حسابنا على انستقرام"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
              <span dir="ltr">@mazunhkw</span>
            </a>
          </li>
          <li>
            <span className="text-ink/55">إكس: </span>
            <a
              href="https://x.com/mazunhkw"
              target="_blank"
              rel="me noreferrer"
              className="social-link social-x"
              aria-label="حسابنا على إكس"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" focusable="false"><path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.25l-4.9-6.4L6.45 22H3.33l7.24-8.28L2.9 2h6.4l4.43 5.85L18.9 2zm-1.1 18.1h1.73L8.3 3.8H6.45L17.8 20.1z" /></svg>
              <span dir="ltr">@mazunhkw</span>
            </a>
          </li>
        </ul>
      </div>
      <nav aria-label="أقسام الموقع" className="max-w-6xl mx-auto px-4 sm:px-8 pb-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <Link href="/about/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-ink/80 hover:border-sage-soft">
          من نحن
        </Link>
        {categories.map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}/`} className="bg-cream border border-sand rounded-full px-3 py-1.5 text-ink/80 hover:border-sage-soft">
            {c.name}
          </Link>
        ))}
        <Link href="/tafseel-kabatat-kuwait/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-ink/80 hover:border-sage-soft">
          تفصيل كبتات ملابس
        </Link>
        <Link href="/articles/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-ink/80 hover:border-sage-soft">
          مقالات ونصائح
        </Link>
        {areaPages.map((a) => (
          <Link key={a.slug} href={a.path} className="bg-cream border border-sand rounded-full px-3 py-1.5 text-ink/80 hover:border-sage-soft">
            نجار {a.governorate}
          </Link>
        ))}
      </nav>
      <p className="text-center text-xs text-ink/45 pb-6">
        {siteConfig.name} — منذ {siteConfig.foundedYear}
      </p>
    </footer>
  );
}
