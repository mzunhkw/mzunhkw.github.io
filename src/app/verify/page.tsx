import type { Metadata } from 'next';
import VerifyClient from '@/components/VerifyClient';

// صفحة التحقق من فواتير منجرة مزونة — لا تُفهرس ولا تُضاف للـ sitemap.
export const metadata: Metadata = {
  title: { absolute: 'التحقق من فاتورة منجرة مزونة' },
  description: 'تحقق من أن فاتورتك صادرة من منجرة مزونة، واعرف مدة ضمان كل قطعة.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/verify/' },
};

export default function VerifyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
      <h1 className="text-2xl sm:text-3xl mb-6">التحقق من فاتورة منجرة مزونة</h1>
      <VerifyClient />
    </div>
  );
}
