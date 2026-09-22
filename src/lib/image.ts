import manifest from '@/data/image-manifest.json';

type ManifestEntry = { width: number; height: number; variants: { width: number; path: string }[] };
type Manifest = Record<string, ManifestEntry>;

const imageManifest = manifest as Manifest;

// يبني srcSet من الخريطة المولَّدة (scripts/generate-image-variants.mjs).
// لو الصورة ما إلها نسخ (لأنها صغيرة أصلًا، أو الخريطة ما تولّدت بعد محليًا)
// يرجع undefined فيرجع المتصفح لعرض src الأصلي كالمعتاد — بدون كسر شي.
export function getSrcSet(src: string): string | undefined {
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
