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
  const parts = entry.variants.map((v) => `${v.path} ${v.width}w`);
  // نضيف الأصل نفسه كأكبر خيار بعرضه الحقيقي.
  parts.push(`${src} ${entry.width}w`);
  return parts.join(', ');
}

export function getImageDimensions(src: string): { width: number; height: number } | undefined {
  const entry = imageManifest[src];
  return entry ? { width: entry.width, height: entry.height } : undefined;
}
