import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-5 py-24 text-center">
      <h1 className="text-3xl mb-3">الصفحة غير موجودة</h1>
      <p className="text-ink/60 mb-6">الرابط اللي فتحته مو موجود أو تم حذف المنتج.</p>
      <Link href="/" className="text-sage underline">
        الرجوع للرئيسية
      </Link>
    </div>
  );
}
