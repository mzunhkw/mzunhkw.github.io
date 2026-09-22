// يولّد نسخًا بأحجام متعددة (srcset) لكل صور المنتجات تلقائيًا — قبل كل بناء.
//
// يشتغل على أي صورة webp أصلية داخل public/images (يتجاهل النسخ المولَّدة
// سابقًا التي تنتهي بـ @NNNw.webp)، وينتج نسخًا أصغر عند الحاجة فقط، ثم يكتب
// خريطة (manifest) بأبعاد كل صورة ونسخها في src/data/image-manifest.json
// عشان تقدر مكوّنات React تبني srcset/sizes بدون قراءة الملفات وقت التشغيل.
//
// آلي بالكامل: أي منتج جديد يُضاف (من admin.html أو يدويًا) صوره الأصلية
// تلقائيًا تتولّد لها نسخها المصغّرة أول ما يشتغل `npm run build` أو
// `npm run dev` — لأنه مربوط بـ prebuild/predev في package.json.
// النسخ والـ manifest غير مضافين لِـ git (مؤقتة، تتولّد من جديد كل بناء)
// حتى ما تصير تعارضات بين الأدوات المختلفة اللي تشتغل على المستودع.

import { readdirSync, statSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const IMAGES_DIR = join(ROOT, 'public', 'images');
const MANIFEST_PATH = join(ROOT, 'src', 'data', 'image-manifest.json');

// الأحجام المستهدفة (عرض بالبكسل). لا يتولّد حجم أكبر من الصورة الأصلية.
const WIDTHS = [400, 800, 1200];
// لا يستاهل نولّد نسخة إذا كانت لا تصغّر الأصل بشكل ملموس (أقل من 15%).
const MIN_SAVING_RATIO = 1.15;
// أقصى عرض نسمح نفسه يُخدَم عبر srcset حتى لو الصورة الأصلية أكبر —
// يمنع أن ينتهي الأمر بالمتصفح يطلب الملف الأصلي غير المضغوط (الذي قد
// يكون بجودة تصدير أعلى من اللازم لعرضه بحجم بطاقة منتج) بدل نسخة مضغوطة.
const MAX_SERVED_WIDTH = 1000;
const VARIANT_QUALITY = 75;
const VARIANT_MARKER = '@';

function isVariantFile(name) {
  return name.includes(VARIANT_MARKER);
}

function listOriginalWebp(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      listOriginalWebp(full, out);
    } else if (extname(entry).toLowerCase() === '.webp' && !isVariantFile(entry)) {
      out.push(full);
    }
  }
  return out;
}

function toPublicPath(absPath) {
  return '/' + absPath.slice(join(ROOT, 'public').length + 1).split('\\').join('/');
}

function variantPath(absOriginal, width) {
  const dir = dirname(absOriginal);
  const ext = extname(absOriginal);
  const base = basename(absOriginal, ext);
  return join(dir, `${base}${VARIANT_MARKER}${width}w${ext}`);
}

async function run() {
  const originals = listOriginalWebp(IMAGES_DIR);
  const manifest = {};
  let generated = 0;
  let skippedExisting = 0;

  for (const absOriginal of originals) {
    const meta = await sharp(absOriginal).metadata();
    const originalWidth = meta.width ?? 0;
    const originalHeight = meta.height ?? 0;
    const publicOriginal = toPublicPath(absOriginal);

    const variants = [];
    for (const width of WIDTHS) {
      if (originalWidth < width * MIN_SAVING_RATIO) continue; // ما يستاهل التصغير
      const outAbs = variantPath(absOriginal, width);
      if (!existsSync(outAbs)) {
        const height = Math.round((originalHeight / originalWidth) * width);
        await sharp(absOriginal).resize({ width }).webp({ quality: VARIANT_QUALITY }).toFile(outAbs);
        generated++;
      } else {
        skippedExisting++;
      }
      variants.push({ width, path: toPublicPath(outAbs) });
    }

    // سقف دائم: نضمن أن أكبر نسخة تُعرض عبر srcset مضغوطة دائمًا بجودتنا
    // (VARIANT_QUALITY)، بدل أن ينتهي بها الحال ملف المصدر الخام كما رُفع
    // (الذي قد يكون بإعدادات تصدير أثقل). لو الصورة أصلًا أصغر من السقف،
    // هذا يعيد ضغطها بنفس أبعادها فقط (فرق بسيط)، بدون أي تصغير زائد.
    const ceilingWidth = Math.min(originalWidth, MAX_SERVED_WIDTH);
    const hasCeilingVariant = variants.some((v) => v.width === ceilingWidth);
    if (!hasCeilingVariant && ceilingWidth > 0) {
      const outAbs = variantPath(absOriginal, ceilingWidth);
      if (!existsSync(outAbs)) {
        await sharp(absOriginal)
          .resize({ width: ceilingWidth, withoutEnlargement: true })
          .webp({ quality: VARIANT_QUALITY })
          .toFile(outAbs);
        generated++;
      } else {
        skippedExisting++;
      }
      variants.push({ width: ceilingWidth, path: toPublicPath(outAbs) });
    }

    manifest[publicOriginal] = { width: originalWidth, height: originalHeight, variants };
  }

  mkdirSync(dirname(MANIFEST_PATH), { recursive: true });
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  console.log(
    `[image-variants] ${originals.length} صورة أصلية — ${generated} نسخة جديدة، ${skippedExisting} كانت موجودة مسبقًا.`
  );
}

run().catch((err) => {
  console.error('[image-variants] فشل توليد الصور:', err);
  process.exit(1);
});
