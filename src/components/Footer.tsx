import Link from 'next/link';
import { categories } from '@/data/categories';
import { siteConfig } from '@/data/site-config';

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
              href={`https://wa.me/${siteConfig.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="text-sage underline"
              dir="ltr"
            >
              {siteConfig.phoneDisplay}
            </a>
          </li>
        </ul>
      </div>
      <nav aria-label="أقسام الموقع" className="max-w-6xl mx-auto px-4 sm:px-8 pb-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <Link href="/من-نحن/" className="bg-cream border border-sand rounded-full px-3 py-1.5 text-ink/80 hover:border-sage-soft">
          من نحن
        </Link>
        {categories.map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}/`} className="bg-cream border border-sand rounded-full px-3 py-1.5 text-ink/80 hover:border-sage-soft">
            {c.name}
          </Link>
        ))}
      </nav>
      <p className="text-center text-xs text-ink/45 pb-6">
        {siteConfig.name} — منذ {siteConfig.foundedYear}
      </p>
    </footer>
  );
}
