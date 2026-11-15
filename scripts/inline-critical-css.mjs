// يضغط الـ "Critical CSS" (الأنماط اللازمة لأول شاشة فقط) ويحقنها مباشرة
// داخل كل صفحة HTML الناتجة من `next build` بمجلد out/، ويحوّل رابط ملف
// الـ CSS الكامل من "render-blocking" إلى تحميل غير-حاجب (preload + swap).
//
// السبب: هذا الموقع (Next.js 14، App Router، output: 'export') يحمّل كل
// صفحاته ملف CSS واحد عبر <link rel="stylesheet"> عادي في <head> — والمتصفح
// يوقف رسم الصفحة بالكامل لين يحمّل ويحلّل هذا الملف أولًا. هذا يفسر نفس
// السبب اللي PageSpeed حاطه أول شي بالتقرير (طلبات حظر العرض ≈730ms) والفجوة
// الكبيرة بين FCP (سريع) و LCP (متأخر عنه بثانيتين تقريبًا).
//
// ⚠️ ما استخدمنا خاصية Next.js الجاهزة `experimental.optimizeCss` لأنها
// (وقت كتابة هذا الملف) غير موثوقة مع App Router تحديدًا — فيه نقاش مفتوح
// ومشاكل موثّقة بمستودع Next.js نفسه. بدلها نشغّل `critters` يدويًا بعد
// البناء مباشرة (postbuild)، ونطبّقه على ملفات HTML النهائية فعليًا — أضمن
// وأوضح تحكمًا.
//
// مهم: pruneSource لازم تضل false. الموقع كله يستخدم ملف CSS واحد مشترك
// بين كل الصفحات؛ لو خليناها true بتحذف القواعد المستخدمة بكل صفحة من هذا
// الملف المشترك وقت معالجتها، فتوصل الصفحة اللي بعدها تلاقي الملف الأصلي
// ناقص قواعد تحتاجها هي (لأنه نفس الملف الفيزيائي على القرص). النتيجة تخرب
// تدريجيًا مع كل صفحة تتعالج.

import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import Critters from 'critters';

const OUT_DIR = join(process.cwd(), 'out');

const critters = new Critters({
  path: OUT_DIR,
  publicPath: '/',
  preload: 'swap', // <link rel=stylesheet> الأصلي يصير preload+swap، مع <noscript> احتياطي تلقائي
  compress: true,
  // critters لا يتعرّف على خط معرَّف عبر متغير CSS (var(--font-arabic))، فنتركها false
  // ونحقن قواعد @font-face بأنفسنا أسفل (راجع inlineFontFaces) — لا تحذف ذلك الحقن.
  inlineFonts: false,
  preloadFonts: false,
  pruneSource: false, // مهم جدًا — راجع الشرح أعلاه
  logLevel: 'warn',
});

function listHtmlFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      listHtmlFiles(full, out);
    } else if (extname(entry).toLowerCase() === '.html') {
      out.push(full);
    }
  }
  return out;
}

// ── حقن @font-face داخل الصفحة (إصلاح CLS الدائم، 2026-11-15) ──────────────
// المشكلة: ملف الـ CSS الكامل صار يُحمَّل بعد أول رسم (preload + swap)، وقواعد
// @font-face كانت موجودة فيه فقط. فالمتصفح يرسم أول شاشة بالخط الاحتياطي لأنه
// لا يعرف الخط أصلًا، ثم لما يوصل الملف يتعرّف على الخط (وهو محمَّل مسبقًا
// عبر preload) فيبدّله فورًا → عنوان الهيرو يعيد التفافه والأزرار تنزاح
// (PageSpeed: CLS = 0.142 على الرئيسية). display: optional لا يحمي هنا لأن
// فترة الحجب تبدأ عند أول استخدام للخط، أي بعد وصول الملف المتأخر.
// الحل: قواعد @font-face تكون ضمن الأنماط المحقونة بالصفحة نفسها، فالمتصفح
// يعرف الخط قبل أول رسم؛ ومع preload + optional إما يُرسم النص بالخط من أول
// لحظة أو يبقى الاحتياطي طول الزيارة — بلا أي تبديل متأخر.
const fontFaceCache = new Map();
const inlinedFrom = new Set(); // ملفات CSS التي حُقنت خطوطها داخل الصفحات

// بعد حقن @font-face في كل الصفحات تُحذف من ملف الـ CSS الخارجي. لو بقيت فيه
// يعيد المتصفح تعريف الخط عند وصول الملف المتأخر (قاعدة جديدة بنفس الاسم =
// فترة حجب جديدة)، فإن كانت الزيارة بدأت بالخط الاحتياطي يتبدّل الخط وقتها
// ويرجع نفس الـ CLS. لا تُحذف إلا إذا نجحت معالجة كل الصفحات بلا استثناء،
// حتى لا تبقى صفحة تعتمد على الملف الخارجي وحده بلا خط.
function stripFontFacesFromCssFiles() {
  for (const href of inlinedFrom) {
    const file = join(OUT_DIR, href.split('?')[0]);
    const css = readFileSync(file, 'utf8');
    writeFileSync(file, css.replace(/@font-face\s*\{[^}]*\}/g, ''), 'utf8');
  }
}
function fontFacesOf(href) {
  if (!fontFaceCache.has(href)) {
    let css = '';
    try {
      css = readFileSync(join(OUT_DIR, href.split('?')[0]), 'utf8');
    } catch {
      /* ملف غير موجود: لا شيء يُحقن */
    }
    fontFaceCache.set(href, (css.match(/@font-face\s*\{[^}]*\}/g) || []).join(''));
  }
  return fontFaceCache.get(href);
}

function inlineFontFaces(originalHtml, processedHtml) {
  const hrefs = [...originalHtml.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)]
    .map((m) => m[0].match(/href="([^"]+\.css[^"]*)"/)?.[1])
    .filter(Boolean);
  const unique = [...new Set(hrefs)];
  const faces = unique.map(fontFacesOf).join('');
  if (!faces || processedHtml.includes('data-font-faces')) return processedHtml;
  unique.forEach((h) => inlinedFrom.add(h));
  // قبل أول <style> (أنماط critters) حتى يكون الخط معروفًا قبل أي قاعدة تستخدمه
  const at = processedHtml.indexOf('<style');
  if (at === -1) return processedHtml;
  return processedHtml.slice(0, at) + `<style data-font-faces>${faces}</style>` + processedHtml.slice(at);
}

async function run() {
  const files = listHtmlFiles(OUT_DIR);
  let done = 0;
  let failed = 0;

  for (const file of files) {
    try {
      const html = readFileSync(file, 'utf8');
      // ملفات التحقق (مثل google*.html) ليست صفحات كاملة — تُترك كما هي
      if (!/<head[\s>]/i.test(html)) continue;
      const inlined = inlineFontFaces(html, await critters.process(html));
      writeFileSync(file, inlined, 'utf8');
      done++;
    } catch (err) {
      // لو صفحة معينة فشلت، لا توقف بقية البناء — الصفحة ترجع تُخدم بملف
      // الـ CSS الحاجب العادي (نفس السلوك الحالي قبل هذا السكربت)، بدل ما
      // يفشل الـ deploy كامل بسبب صفحة وحدة.
      failed++;
      console.error(`[inline-critical-css] فشل على ${file}:`, err?.message || err);
    }
  }

  if (failed === 0) stripFontFacesFromCssFiles();
  else console.warn('[inline-critical-css] صفحات فشلت — أُبقيت @font-face في ملف CSS الخارجي احتياطًا.');

  console.log(`[inline-critical-css] ${done} صفحة تمت معالجتها، ${failed} فشلت، من أصل ${files.length}.`);
}

run().catch((err) => {
  console.error('[inline-critical-css] فشل عام:', err);
  // لا نوقف الـ build بخطأ (process.exit(1)) — أسوأ حالة الموقع يرجع لنفس
  // سلوك الـ CSS الحاجب العادي، مو موقع مكسور.
});
