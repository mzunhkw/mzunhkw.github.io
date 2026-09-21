import Link from 'next/link';
import { siteConfig } from '@/data/site-config';

export default function Header() {
  return (
    <header className="bg-white/90 backdrop-blur border-b border-sand sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 min-h-14 sm:min-h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-baseline gap-3 leading-tight">
          <span className="text-xl sm:text-2xl text-sage font-medium">{siteConfig.name}</span>
          <span className="hidden sm:inline text-xs text-ink/60">{siteConfig.tagline}</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/" className="px-3 py-2 rounded-full hover:bg-sage-mist">
            الرئيسية
          </Link>
          <Link href="/products/" className="px-3 py-2 rounded-full hover:bg-sage-mist">
            المنتجات
          </Link>
        </nav>
      </div>
    </header>
  );
}
