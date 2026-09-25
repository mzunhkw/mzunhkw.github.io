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
  inlineFonts: false, // next/font يتكفل بخط الموقع (Noto Kufi Arabic) وpreload الخاص فيه لحاله
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

async function run() {
  const files = listHtmlFiles(OUT_DIR);
  let done = 0;
  let failed = 0;

  for (const file of files) {
    try {
      const html = readFileSync(file, 'utf8');
      const inlined = await critters.process(html);
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

  console.log(`[inline-critical-css] ${done} صفحة تمت معالجتها، ${failed} فشلت، من أصل ${files.length}.`);
}

run().catch((err) => {
  console.error('[inline-critical-css] فشل عام:', err);
  // لا نوقف الـ build بخطأ (process.exit(1)) — أسوأ حالة الموقع يرجع لنفس
  // سلوك الـ CSS الحاجب العادي، مو موقع مكسور.
});
