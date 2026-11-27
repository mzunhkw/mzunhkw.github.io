import manifest from '@/data/image-manifest.json';

type ManifestEntry = { width: number; height: number; variants: { width: number; path: string }[] };
type Manifest = Record<string, ManifestEntry>;

const imageManifest = manifest as Manifest;

// يبني srcSet من الخريطة المولَّدة (scripts/generate-image-variants.mjs).
// لو الصورة ما إلها نسخ (لأنها صغيرة أصلًا، أو الخريطة ما تولّدت بعد محليًا)
// يرجع undefined فيرجع المتصفح لعرض src الأصلي كالمعتاد — بدون كسر شي.
// صور Cloudinary (صور القطع الجاهزة المعاد تصميمها — طلب المالك 2026-11-27):
// تُحفظ في products.json برابط فيه تحويل العرض w_1200 مع f_auto,q_auto، ونبني منها
// نسخًا بعروض أصغر بنفس التحويل فيختار المتصفح الأنسب، بدون ملفات في المستودع.
export const CLOUDINARY_PREFIX = 'https://res.cloudinary.com/erzoaatk/image/upload/';
const CLD_WIDTHS = [400, 500, 600, 800, 1200];
export const isCloudinary = (src: string) => src.startsWith(CLOUDINARY_PREFIX);

export function getSrcSet(src: string): string | undefined {
  if (isCloudinary(src)) {
    if (!/\/f_auto,q_auto,w_\d+\//.test(src)) return undefined;
    return CLD_WIDTHS.map((w) => `${src.replace(/\/f_auto,q_auto,w_\d+\//, `/f_auto,q_auto,w_${w}/`)} ${w}w`).join(', ');
  }
  const entry = imageManifest[src];
  if (!entry || entry.variants.length === 0) return undefined;
  // نعتمد فقط على النسخ المولَّدة (كلها مضغوطة بجودة موحّدة عبر
  // generate-image-variants.mjs، وتشمل دائمًا نسخة بأقصى عرض مسموح
  // به). لا نضيف الملف الأصلي كما رُفع: قد يكون بجودة تصدير أعلى
  // بكثير مما تحتاجه بطاقة منتج، وإضافته كخيار كانت تجعل المتصفح
  // يختاره أحيانًا بدل النسخة المضغوطة على الجوال بسبب كثافة البكسل.
  return entry.variants.map((v) => `${v.path} ${v.width}w`).join(', ');
}

export function getImageDimensions(src: string): { width: number; height: number } | undefined {
  const entry = imageManifest[src];
  return entry ? { width: entry.width, height: entry.height } : undefined;
}
