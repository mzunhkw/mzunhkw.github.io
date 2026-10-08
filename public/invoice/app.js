'use strict';
/* ==========================================================================
   نظام الفواتير وعروض الأسعار — تطبيق ويب يعمل من الجوال بلا خادم.
   - الإعدادات (الاسم، الهاتف، المستودع، الشروط) في config.js، والأصناف في codes.json.
   - المستندات تُحفظ في هذا الجهاز (localStorage) مع نسخة احتياطية يدوية.
   - الفواتير فقط تحمل باركود تحقق: توقيع ECDSA P-256 بمفتاح خاص غير قابل للنسخ
     (IndexedDB)، ومفتاحه العام يُرفع إلى keysPath في مستودع الموقع.
   - صفحة التحقق: <site>/verify/#<بيانات>.<توقيع>
   ========================================================================== */

const CFG = window.INVOICE_CONFIG;
const P = CFG.storagePrefix || 'inv';
const LS = { archive: `${P}_archive`, draft: `${P}_draft`, next: `${P}_next`, nextQ: `${P}_nextQ`, terms: `${P}_terms2`, ui: `${P}_ui`, num: `${P}_numfmt`, shop: `${P}_shop` };

// بيانات المتجر: الإعداد الافتراضي من config.js، وما يعدّله المستخدم من الإعدادات يتقدم عليه
function shopData(lang) {
  let o = {};
  try { o = JSON.parse(localStorage.getItem(LS.shop) || '{}') || {}; } catch (_) { o = {}; }
  const base = CFG.shop[lang === 'en' ? 'en' : 'ar'];
  const phone = o.phone || CFG.shop.phone;
  return { ...base, name: (lang === 'en' ? o.nameEn : o.nameAr) || base.name, phone, whatsapp: o.phone ? (o.phone.length === 8 ? `965${o.phone}` : o.phone) : CFG.shop.whatsapp };
}

// ---------------------------------------------------------------- نصوص الواجهة
const I18N = {
  ar: {
    appTitle: () => `فواتير ${shopData('ar').name}`, tabDoc: 'مستند', tabArchive: 'الأرشيف', tabSettings: 'الإعدادات',
    newTitle: 'مستند جديد', newType: 'النوع', newLang: 'لغة المستند', typeInvoice: 'فاتورة', typeQuote: 'عرض سعر',
    typeInvoices: 'الفواتير', typeQuotes: 'عروض الأسعار', all: 'الكل', create: 'إنشاء', cancel: 'إلغاء',
    keyWarn: 'باركود التحقق غير مفعّل على هذا الجهاز — فعّله من الإعدادات.',
    invoiceNo: 'رقم الفاتورة', quoteNo: 'رقم عرض السعر', date: 'التاريخ', validDays: 'صلاحية العرض (يوم)',
    customer: 'العميل', name: 'الاسم', phone: 'الهاتف', area: 'المنطقة', address: 'العنوان (قطعة، شارع، منزل)',
    items: 'القطع', addItem: '+ إضافة قطعة', piece: 'قطعة', del: 'حذف', cat: 'نوع القطعة', mat: 'الخامة',
    desc: 'الوصف (التصميم، اللون، التفاصيل)', fabric: 'القماش (النوع / الكود / اللون)', foam: 'الإسفنج',
    L: 'الطول (سم)', W: 'العرض/العمق (سم)', H: 'الارتفاع (سم)', unit: 'وحدة السعر', qty: 'الكمية', per: 'السعر لكل',
    war: 'الضمان', lineTotal: 'إجمالي القطعة', totals: 'الحساب', subtotal: 'المجموع', discount: 'الخصم (د.ك)',
    deposit: 'العربون (د.ك)', total: 'الإجمالي', remaining: 'المتبقي عند التسليم', delivery: 'التسليم',
    days: 'مدة التنفيذ (يوم)', ddate: 'تاريخ التسليم المتوقع', notes: 'ملاحظات', save: 'حفظ', pdf: 'PDF ومشاركة',
    sendVerify: 'إرسال رابط التحقق واتساب', convert: 'تحويل إلى فاتورة', newDoc: 'مستند جديد',
    saveHint: 'حفظ الفاتورة يوقّع باركود التحقق. أي تعديل بعد الحفظ يتطلب الحفظ مرة أخرى.',
    search: 'ابحث بالرقم أو الاسم أو الهاتف', backup: 'نسخة احتياطية للأرشيف', restore: 'استرجاع نسخة',
    open: 'فتح', copy: 'نسخ', none: 'لا توجد مستندات محفوظة.', signed: 'موقّعة', unsigned: 'بلا باركود',
    uiLang: 'لغة التطبيق', numbering: 'الترقيم', nextInvoice: 'رقم الفاتورة التالية', nextQuote: 'رقم عرض السعر التالي',
    invPrefix: 'بادئة الفواتير', quotePrefix: 'بادئة عروض الأسعار', numDigits: 'عدد الخانات', preview: 'الفاتورة التالية',
    shopTitle: 'بيانات المنجرة في المستندات', shopNameAr: 'الاسم بالعربي', shopNameEn: 'الاسم بالإنجليزي', shopPhone: 'رقم الهاتف وواتساب',
    shopHint: 'تظهر في الفواتير وعروض الأسعار ورسائل واتساب. رقم صفحة التحقق في الموقع يبقى من إعدادات الموقع.', shopSaved: 'حُفظت بيانات المنجرة',
    saveBtn: 'حفظ', verifyTitle: 'باركود التحقق', adminPw: 'كلمة سر لوحة الإدارة', orToken: 'أو الصق توكن GitHub بصلاحية الكتابة',
    activate: 'تفعيل التحقق على هذا الجهاز', activating: 'جارٍ التفعيل…',
    activateHint: 'يُنشأ مفتاح توقيع خاص داخل هذا الجهاز فقط ولا يمكن نسخه، ويُرفع مفتاحه العام للموقع. الفواتير القديمة تبقى صالحة إذا غيّرت الجهاز وفعّلته من جديد.',
    keyOn: (k) => `مفعّل على هذا الجهاز (المفتاح ${k}).`, keyOff: 'غير مفعّل على هذا الجهاز.',
    termsTitle: 'الشروط', saveTerms: 'حفظ الشروط', resetTerms: 'استرجاع الافتراضي',
    needNo: 'الرقم مطلوب', needQty: 'أضف كمية لقطعة واحدة على الأقل', dupNo: (n) => `الرقم ${n} مستخدم في مستند آخر`,
    savedSigned: (n) => `حُفظت الفاتورة ${n} مع باركود التحقق`, savedNoKey: (n) => `حُفظت الفاتورة ${n} — بدون باركود (التحقق غير مفعّل)`,
    savedQuote: (n) => `حُفظ عرض السعر ${n}`, pdfWait: 'جارٍ تجهيز الـ PDF…', pdfFail: 'تعذّر إنشاء الـ PDF',
    needKey: 'فعّل باركود التحقق من الإعدادات ثم احفظ الفاتورة', unsaved: 'المستند الحالي غير محفوظ. بدء مستند جديد؟',
    converted: (n) => `فاتورة جديدة رقم ${n} من عرض السعر — راجعها واحفظ`, copied: 'نسخة جديدة — راجعها واحفظ',
    confirmDel: (n) => `حذف المستند ${n} من هذا الجهاز؟`, restored: (n) => `تم الاسترجاع — ${n} مستند`, badFile: 'ملف غير صالح',
    badNum: 'رقم غير صالح', nextSet: 'حُفظ الترقيم', termsSaved: 'حُفظت الشروط', needPw: 'اكتب كلمة السر أو الصق التوكن',
    activated: 'تم التفعيل — صفحة التحقق تعمل بعد دقائق من نشر الموقع', activateFail: 'تعذّر التفعيل',
    wrongPw: 'كلمة السر غير صحيحة.', noVault: 'تعذّر قراءة خزنة لوحة الإدارة.', startFail: 'تعذّر تشغيل التطبيق — تحقق من الاتصال',
  },
  en: {
    appTitle: () => `${shopData('en').name} — Invoices`, tabDoc: 'Document', tabArchive: 'Archive', tabSettings: 'Settings',
    newTitle: 'New document', newType: 'Type', newLang: 'Document language', typeInvoice: 'Invoice', typeQuote: 'Quotation',
    typeInvoices: 'Invoices', typeQuotes: 'Quotations', all: 'All', create: 'Create', cancel: 'Cancel',
    keyWarn: 'Verification barcode is not activated on this device — activate it in Settings.',
    invoiceNo: 'Invoice no.', quoteNo: 'Quotation no.', date: 'Date', validDays: 'Valid for (days)',
    customer: 'Customer', name: 'Name', phone: 'Phone', area: 'Area', address: 'Address (block, street, house)',
    items: 'Items', addItem: '+ Add item', piece: 'Item', del: 'Delete', cat: 'Item type', mat: 'Material',
    desc: 'Description (design, colour, details)', fabric: 'Fabric (type / code / colour)', foam: 'Foam',
    L: 'Length (cm)', W: 'Width/depth (cm)', H: 'Height (cm)', unit: 'Price unit', qty: 'Quantity', per: 'Price per',
    war: 'Warranty', lineTotal: 'Item total', totals: 'Totals', subtotal: 'Subtotal', discount: 'Discount (KWD)',
    deposit: 'Deposit (KWD)', total: 'Total', remaining: 'Balance due on delivery', delivery: 'Delivery',
    days: 'Lead time (days)', ddate: 'Expected delivery date', notes: 'Notes', save: 'Save', pdf: 'PDF & share',
    sendVerify: 'Send verification link on WhatsApp', convert: 'Convert to invoice', newDoc: 'New document',
    saveHint: 'Saving an invoice signs its verification barcode. Save again after any change.',
    search: 'Search by number, name or phone', backup: 'Back up archive', restore: 'Restore backup',
    open: 'Open', copy: 'Copy', none: 'No saved documents.', signed: 'signed', unsigned: 'no barcode',
    uiLang: 'App language', numbering: 'Numbering', nextInvoice: 'Next invoice no.', nextQuote: 'Next quotation no.',
    invPrefix: 'Invoice prefix', quotePrefix: 'Quotation prefix', numDigits: 'Digits', preview: 'Next invoice',
    shopTitle: 'Business details on documents', shopNameAr: 'Name in Arabic', shopNameEn: 'Name in English', shopPhone: 'Phone & WhatsApp',
    shopHint: 'Shown on invoices, quotations and WhatsApp messages. The phone on the website verification page comes from the website settings.', shopSaved: 'Business details saved',
    saveBtn: 'Save', verifyTitle: 'Verification barcode', adminPw: 'Admin panel password', orToken: 'Or paste a GitHub token with write access',
    activate: 'Activate verification on this device', activating: 'Activating…',
    activateHint: 'A private signing key is created on this device only and cannot be copied; its public key is uploaded to the website. Old invoices stay valid if you switch devices and activate again.',
    keyOn: (k) => `Active on this device (key ${k}).`, keyOff: 'Not active on this device.',
    termsTitle: 'Terms', saveTerms: 'Save terms', resetTerms: 'Restore default',
    needNo: 'Number is required', needQty: 'Add a quantity to at least one item', dupNo: (n) => `Number ${n} is already used`,
    savedSigned: (n) => `Invoice ${n} saved with verification barcode`, savedNoKey: (n) => `Invoice ${n} saved — no barcode (verification not active)`,
    savedQuote: (n) => `Quotation ${n} saved`, pdfWait: 'Preparing PDF…', pdfFail: 'Could not create the PDF',
    needKey: 'Activate the verification barcode in Settings, then save the invoice', unsaved: 'The current document is not saved. Start a new one?',
    converted: (n) => `New invoice ${n} from the quotation — review and save`, copied: 'New copy — review and save',
    confirmDel: (n) => `Delete document ${n} from this device?`, restored: (n) => `Restored — ${n} documents`, badFile: 'Invalid file',
    badNum: 'Invalid number', nextSet: 'Numbering saved', termsSaved: 'Terms saved', needPw: 'Enter the password or paste a token',
    activated: 'Activated — the verification page works a few minutes after the site redeploys', activateFail: 'Activation failed',
    wrongPw: 'Wrong password.', noVault: 'Could not read the admin vault.', startFail: 'Could not start — check your connection',
  },
};
// نصوص ورقة المستند حسب لغته
const DOC = {
  ar: { invoice: 'فاتورة', quote: 'عرض سعر', no: 'رقم', date: 'التاريخ', validUntil: 'صالح حتى', customer: 'العميل', phone: 'الهاتف', area: 'المنطقة', address: 'العنوان',
    cols: ['#', 'القطعة والمواصفات', 'المقاس (سم)', 'الكمية', 'السعر', 'الإجمالي'], fabric: 'قماش', warranty: 'الضمان', until: 'حتى',
    L: 'طول', W: 'عمق', H: 'ارتفاع', subtotal: 'المجموع', discount: 'الخصم', total: 'الإجمالي', deposit: 'العربون المدفوع', remaining: 'المتبقي عند التسليم',
    delivery: 'التسليم المتوقع', day: 'يوم', notes: 'ملاحظات', terms: 'الشروط', scan: 'امسح للتحقق من الفاتورة والضمان',
    signCust: 'توقيع العميل', approveCust: 'موافقة العميل', signShop: (n) => `عن ${n}`, phoneLbl: 'هاتف وواتساب', insta: 'انستقرام', cur: 'د.ك' },
  en: { invoice: 'Invoice', quote: 'Quotation', no: 'No.', date: 'Date', validUntil: 'Valid until', customer: 'Customer', phone: 'Phone', area: 'Area', address: 'Address',
    cols: ['#', 'Item & specifications', 'Size (cm)', 'Qty', 'Price', 'Total'], fabric: 'Fabric', warranty: 'Warranty', until: 'until',
    L: 'L', W: 'D', H: 'H', subtotal: 'Subtotal', discount: 'Discount', total: 'Total', deposit: 'Deposit paid', remaining: 'Balance due on delivery',
    delivery: 'Expected delivery', day: 'days', notes: 'Notes', terms: 'Terms', scan: 'Scan to verify this invoice and its warranty',
    signCust: 'Customer signature', approveCust: 'Customer approval', signShop: (n) => `For ${n}`, phoneLbl: 'Phone & WhatsApp', insta: 'Instagram', cur: 'KWD' },
};

let CODES = null;
let inv = null; // المستند الحالي
let UI = 'ar';
const t = (k, ...a) => {
  const v = (I18N[UI] || I18N.ar)[k];
  return typeof v === 'function' ? v(...a) : v;
};

// ---------------------------------------------------------------- أدوات
const $ = (id) => document.getElementById(id);
const h = (tag, attrs, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'text') el.textContent = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null) el.append(c);
  return el;
};
const digits = (s) =>
  String(s == null ? '' : s)
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٫,]/g, '.');
const num = (s) => {
  const n = parseFloat(digits(s));
  return Number.isFinite(n) ? n : 0;
};
const kwd = (n) => (Math.round(n * 1000) / 1000).toFixed(3);
// تاريخ اليوم بتوقيت الجهاز — toISOString يعطي UTC فيتأخر يومًا بعد منتصف الليل في الكويت
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const addDays = (iso, d) => {
  const x = new Date(iso + 'T00:00:00Z');
  x.setUTCDate(x.getUTCDate() + d);
  return x.toISOString().slice(0, 10);
};
const addMonths = (iso, m) => {
  const x = new Date(iso + 'T00:00:00Z');
  x.setUTCMonth(x.getUTCMonth() + m);
  return x.toISOString().slice(0, 10);
};
const toast = (msg) => {
  const el = $('toast');
  el.replaceChildren(h('span', { text: msg }));
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.replaceChildren(), 3400);
};
const b64u = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const utf8b64u = (str) => b64u(new TextEncoder().encode(str));
const b64e = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const b64d = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const lsGet = (k, d) => {
  try {
    const v = localStorage.getItem(k);
    return v == null ? d : JSON.parse(v);
  } catch (_) {
    return d;
  }
};
const lsSet = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (_) {
    toast('Storage full');
  }
};
const isQuote = () => !!inv && inv.type === 'quote';

// أسماء الرموز حسب اللغة
const catName = (c, lang) => {
  const x = CODES.categories[c] || {};
  return (lang === 'en' ? x.en : x.name) || x.name || '';
};
const matName = (m, lang) => (lang === 'en' ? CODES.materials_en[m] : CODES.materials[m]) || CODES.materials[m] || '';
const warName = (w, lang) => (lang === 'en' ? CODES.warranty_en[w] : CODES.warranty[w]) || CODES.warranty[w] || '';
const unitName = (u, lang) => (lang === 'en' ? CODES.units_en[u] : CODES.units[u]) || CODES.units[u] || '';
const foamName = (f, lang) => {
  const x = (CODES.foams || []).find((o) => o.ar === f);
  return x ? (lang === 'en' ? x.en : x.ar) : f;
};

// ---------------------------------------------------------------- مخزن المفتاح (IndexedDB)
function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(CFG.keyDbName || `${P}-invoice`, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('keys');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function keyGet() {
  const db = await idb();
  return new Promise((res, rej) => {
    const q = db.transaction('keys').objectStore('keys').get('signer');
    q.onsuccess = () => res(q.result || null);
    q.onerror = () => rej(q.error);
  });
}
async function keyPut(v) {
  const db = await idb();
  return new Promise((res, rej) => {
    const tx = db.transaction('keys', 'readwrite');
    tx.objectStore('keys').put(v, 'signer');
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

// ---------------------------------------------------------------- GitHub (لتفعيل المفتاح فقط)
async function tokenFromVault(password) {
  const R = CFG.repo;
  const r = await fetch(`https://api.github.com/repos/${R.owner}/${R.repo}/contents/${CFG.vaultPath}?ref=${R.branch}&ts=${Date.now()}`, {
    cache: 'no-store',
    headers: { Accept: 'application/vnd.github.raw+json' },
  });
  if (!r.ok) throw new Error(t('noVault'));
  const vault = await r.json();
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64d(vault.salt), iterations: vault.iter || 600000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  try {
    const out = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64d(vault.iv) }, key, b64d(vault.data));
    return new TextDecoder().decode(out);
  } catch (_) {
    throw new Error(t('wrongPw'));
  }
}
async function gh(token, path, opts = {}) {
  const r = await fetch('https://api.github.com' + path, {
    method: opts.method || 'GET',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });
  if (!r.ok) throw new Error(`GitHub ${r.status}`);
  return r.json();
}
async function activateKey() {
  const pw = $('s_pw').value;
  const pasted = $('s_token').value.trim();
  if (!pw && !pasted) return toast(t('needPw'));
  const btn = $('activateKey');
  btn.disabled = true;
  btn.textContent = t('activating');
  try {
    const token = pasted || (await tokenFromVault(pw));
    // المفتاح الخاص غير قابل للتصدير: لا يخرج من هذا الجهاز أبدًا
    const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
    const jwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
    const kid = 'k' + Date.now().toString(36);
    const R = CFG.repo;
    const path = `/repos/${R.owner}/${R.repo}/contents/${CFG.keysPath}`;
    let sha;
    let keys = [];
    try {
      const cur = await gh(token, `${path}?ref=${R.branch}`);
      sha = cur.sha;
      keys = JSON.parse(new TextDecoder().decode(b64d(cur.content.replace(/\n/g, ''))));
    } catch (_) {
      /* الملف غير موجود بعد */
    }
    keys.push({ kid, kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y, created: new Date().toISOString() });
    const content = b64e(new TextEncoder().encode(JSON.stringify(keys, null, 2) + '\n'));
    await gh(token, path, { method: 'PUT', body: { message: 'Invoices: add verification key for a device', content, branch: R.branch, ...(sha ? { sha } : {}) } });
    await keyPut({ kid, privateKey: pair.privateKey, created: new Date().toISOString() });
    $('s_pw').value = '';
    $('s_token').value = '';
    toast(t('activated'));
    await refreshKeyStatus();
  } catch (e) {
    toast(e.message || t('activateFail'));
  } finally {
    btn.disabled = false;
    btn.textContent = t('activate');
  }
}
async function refreshKeyStatus() {
  const k = await keyGet().catch(() => null);
  $('keyStatus').textContent = k ? t('keyOn', k.kid) : t('keyOff');
  $('keyWarn').hidden = !!k || isQuote();
  $('pwField').hidden = !CFG.vaultPath;
  return k;
}

// ---------------------------------------------------------------- التوقيع (للفواتير فقط)
// البيانات الموقّعة (بلا اسم العميل أو هاتفه أو المبلغ):
// { v, k, n: رقم الفاتورة, d: التاريخ, i: [[رمز القطعة, رمز الخامة, أشهر الضمان], ...] }
async function signInvoice(x) {
  const key = await keyGet();
  if (!key) return null;
  const payload = { v: 1, k: key.kid, n: String(x.no), d: x.date, i: x.items.filter((it) => num(it.qty) > 0).map((it) => [Number(it.cat), Number(it.mat), Number(it.war)]) };
  const data = utf8b64u(JSON.stringify(payload));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key.privateKey, new TextEncoder().encode(data));
  return `${CFG.site}/verify/#${data}.${b64u(sig)}`;
}

// ---------------------------------------------------------------- المستند
const blankItem = () => ({ cat: '1', desc: '', mat: '9', fabric: '', foam: '', L: '', W: '', H: '', unit: 'm', qty: '', price: '', war: '0' });
// الترقيم: بادئة + رقم بعدد خانات ثابت (مثال A7D/000547). العدّاد يحفظ الرقم فقط.
function numFmt() {
  const d = CFG.numbering || {};
  const o = lsGet(LS.num, {});
  return {
    invoicePrefix: o.invoicePrefix != null ? o.invoicePrefix : d.invoicePrefix || '',
    quotePrefix: o.quotePrefix != null ? o.quotePrefix : d.quotePrefix || '',
    digits: Number(o.digits || d.digits || 0),
  };
}
const fmtNo = (type, n) => {
  const f = numFmt();
  return `${type === 'quote' ? f.quotePrefix : f.invoicePrefix}${String(n).padStart(f.digits, '0')}`;
};
const counter = (type) => Number(lsGet(type === 'quote' ? LS.nextQ : LS.next, (CFG.numbering || {})[type === 'quote' ? 'quoteStart' : 'invoiceStart'] || 1));
const nextNo = (type) => fmtNo(type, counter(type));
// الرقم التسلسلي داخل رقم المستند (آخر مجموعة أرقام)، مثال A7D/000547 → 547
const seqOf = (no) => {
  const m = String(no).match(/(\d+)\D*$/);
  return m ? Number(m[1]) : NaN;
};
function newDoc(type, lang) {
  return {
    id: crypto.randomUUID(), type, lang, no: nextNo(type), date: today(), valid: String(CFG.quoteValidityDays || 14),
    cust: { name: '', phone: '', area: '', addr: '' }, items: [blankItem()], disc: '0', dep: '0', days: '', ddate: '', notes: '',
    verifyUrl: null, savedAt: null,
  };
}
const lineTotal = (it) => num(it.qty) * num(it.price);
function totals(x) {
  const sub = x.items.reduce((s, it) => s + lineTotal(it), 0);
  const total = Math.max(0, sub - num(x.disc));
  return { sub, total, rem: Math.max(0, total - (x.type === 'quote' ? 0 : num(x.dep))) };
}
const ordered = (map, order) => (order || Object.keys(map)).filter((k) => k in map);
const sel = (onchange, keys, label, selected) => h('select', { onchange }, keys.map((v) => h('option', { value: v, selected: String(v) === String(selected), text: label(v) })));

function renderItems() {
  const lang = UI;
  const box = $('items');
  box.replaceChildren(
    ...inv.items.map((it, idx) => {
      const set = (k) => (e) => {
        it[k] = e.target.value;
        if (k === 'cat') {
          it.unit = (CODES.categories[it.cat] || {}).unit || 'pc';
          renderItems();
        }
        onChange();
        if (k === 'qty' || k === 'price') box.querySelectorAll('.item-total')[idx].textContent = kwd(lineTotal(it));
      };
      const u = unitName(it.unit, lang);
      const f = (label, el) => h('div', { class: 'field' }, h('label', { text: label }), el);
      const inp = (k, extra = {}) => h('input', { value: it[k], oninput: set(k), ...extra });
      const nm = { inputmode: 'decimal', dir: 'ltr' };
      return h('div', { class: 'item' },
        h('div', { class: 'item-head' }, h('b', { text: `${t('piece')} ${idx + 1}` }),
          inv.items.length > 1 ? h('button', { type: 'button', class: 'danger', text: t('del'), onclick: () => { inv.items.splice(idx, 1); renderItems(); onChange(); } }) : null),
        h('div', { class: 'grid2' },
          f(t('cat'), sel(set('cat'), ordered(CODES.categories, CODES.categoryOrder), (v) => catName(v, lang), it.cat)),
          f(t('mat'), sel(set('mat'), ordered(CODES.materials, CODES.materialOrder), (v) => matName(v, lang), it.mat))),
        f(t('desc'), inp('desc')),
        h('div', { class: 'grid2' },
          f(t('fabric'), inp('fabric')),
          f(t('foam'), sel(set('foam'), (CODES.foams || []).map((o) => o.ar), (v) => foamName(v, lang) || '—', it.foam))),
        h('div', { class: 'grid3' }, f(t('L'), inp('L', nm)), f(t('W'), inp('W', nm)), f(t('H'), inp('H', nm))),
        h('div', { class: 'grid3' },
          f(t('unit'), sel((e) => { it.unit = e.target.value; renderItems(); onChange(); }, Object.keys(CODES.units), (v) => unitName(v, lang), it.unit)),
          f(`${t('qty')} (${u})`, inp('qty', nm)),
          f(`${t('per')} ${u}`, inp('price', nm))),
        h('div', { class: 'grid2' },
          f(t('war'), sel(set('war'), Object.keys(CODES.warranty), (v) => warName(v, lang), it.war)),
          f(t('lineTotal'), h('div', { class: 'item-total', text: kwd(lineTotal(it)) }))));
    })
  );
}

function fillForm() {
  document.body.classList.toggle('is-quote', isQuote());
  $('docBadge').textContent = `${isQuote() ? t('typeQuote') : t('typeInvoice')} · ${inv.lang === 'en' ? 'English' : 'العربية'}`;
  $('l_no').textContent = isQuote() ? t('quoteNo') : t('invoiceNo');
  $('i_no').value = inv.no;
  $('i_date').value = inv.date;
  $('q_valid').value = inv.valid || '';
  $('c_name').value = inv.cust.name;
  $('c_phone').value = inv.cust.phone;
  $('c_area').value = inv.cust.area;
  $('c_addr').value = inv.cust.addr;
  $('t_disc').value = inv.disc;
  $('t_dep').value = inv.dep;
  $('d_days').value = inv.days;
  $('d_date').value = inv.ddate;
  $('n_notes').value = inv.notes;
  renderItems();
  updateTotals();
  refreshKeyStatus();
}
function readForm() {
  inv.no = digits($('i_no').value).trim().toUpperCase();
  inv.date = $('i_date').value || today();
  inv.valid = digits($('q_valid').value).replace(/\D/g, '');
  inv.cust = { name: $('c_name').value.trim(), phone: digits($('c_phone').value).trim(), area: $('c_area').value.trim(), addr: $('c_addr').value.trim() };
  inv.disc = digits($('t_disc').value);
  inv.dep = digits($('t_dep').value);
  inv.days = digits($('d_days').value);
  inv.ddate = $('d_date').value;
  inv.notes = $('n_notes').value.trim();
}
function updateTotals() {
  const x = totals(inv);
  $('t_sub').textContent = kwd(x.sub);
  $('t_total').textContent = kwd(x.total);
  $('t_rem').textContent = kwd(x.rem);
}
function onChange() {
  readForm();
  inv.verifyUrl = null; // أي تعديل يُلغي التوقيع القديم حتى يُحفظ من جديد
  inv.savedAt = null;
  updateTotals();
  lsSet(LS.draft, inv);
}

async function saveDoc() {
  readForm();
  if (!inv.no) return toast(t('needNo'));
  if (!inv.items.some((it) => num(it.qty) > 0)) return toast(t('needQty'));
  const archive = lsGet(LS.archive, []);
  if (archive.some((a) => (a.type || 'invoice') === inv.type && a.no === inv.no && a.id !== inv.id)) return toast(t('dupNo', inv.no));
  inv.verifyUrl = null;
  if (!isQuote()) {
    try {
      inv.verifyUrl = await signInvoice(inv);
    } catch (_) {
      inv.verifyUrl = null;
    }
  }
  inv.savedAt = new Date().toISOString();
  const i = archive.findIndex((a) => a.id === inv.id);
  if (i >= 0) archive[i] = inv;
  else archive.unshift(inv);
  lsSet(LS.archive, archive);
  // بعد الحفظ تصبح المستند التالي +1 (مثال A7D/000547 → A7D/000548)
  const n = seqOf(inv.no);
  const nk = isQuote() ? LS.nextQ : LS.next;
  if (Number.isFinite(n) && n >= counter(inv.type)) lsSet(nk, n + 1);
  lsSet(LS.draft, inv);
  toast(isQuote() ? t('savedQuote', inv.no) : inv.verifyUrl ? t('savedSigned', inv.no) : t('savedNoKey', inv.no));
}

function convertToInvoice() {
  readForm();
  const src = inv;
  inv = { ...structuredClone(src), id: crypto.randomUUID(), type: 'invoice', no: nextNo('invoice'), date: today(), dep: '0', verifyUrl: null, savedAt: null, fromQuote: src.no };
  lsSet(LS.draft, inv);
  fillForm();
  toast(t('converted', inv.no));
  window.scrollTo(0, 0);
}

// ---------------------------------------------------------------- ورقة المستند
function qrDataUrl(text) {
  const qr = qrcode(0, 'M'); // eslint-disable-line no-undef
  qr.addData(text);
  qr.make();
  return qr.createDataURL(6, 2);
}
function buildSheet() {
  const lang = inv.lang === 'en' ? 'en' : 'ar';
  const D = DOC[lang];
  const S = shopData(lang);
  const quote = isQuote();
  const x = totals(inv);
  const stored = lsGet(LS.terms, {});
  const tk = `${quote ? 'quote' : 'invoice'}_${lang}`;
  const terms = (stored[tk] || CFG.terms[quote ? 'quote' : 'invoice'][lang].join('\n')).split('\n').filter(Boolean);
  const dims = (it) => [it.L && `${D.L} ${digits(it.L)}`, it.W && `${D.W} ${digits(it.W)}`, it.H && `${D.H} ${digits(it.H)}`].filter(Boolean).join(' · ');
  const warText = (it) => {
    const m = Number(it.war);
    // في عرض السعر لا يُذكر تاريخ انتهاء، لأن الضمان يبدأ من تاريخ الفاتورة
    return m && !quote ? `${warName(it.war, lang)} — ${D.until} ${addMonths(inv.date, m)}` : warName(it.war, lang);
  };
  const money = (n) => `${kwd(n)} ${D.cur}`;
  const sheet = $('sheet');
  sheet.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');
  sheet.setAttribute('lang', lang);
  sheet.replaceChildren(
    h('div', { class: 'sh-head' },
      h('div', { class: 'sh-brand' }, h('img', { src: CFG.shop.logo, alt: '' }),
        h('div', {}, h('h1', { text: S.name }), h('p', { text: S.tagline }), h('p', { text: `${S.address} · ${D.phoneLbl} ${S.phone}` }))),
      h('div', { class: 'sh-meta' },
        h('div', { class: 'sh-title', text: quote ? D.quote : D.invoice }),
        h('div', {}, `${D.no} `, h('b', { text: inv.no })),
        h('div', { text: `${D.date}: ${inv.date}` }),
        quote && num(inv.valid) ? h('div', { text: `${D.validUntil}: ${addDays(inv.date, num(inv.valid))}` }) : null)),
    h('div', { class: 'sh-cust' },
      h('div', { text: `${D.customer}: ${inv.cust.name || '—'}` }), h('div', { text: `${D.phone}: ${inv.cust.phone || '—'}` }),
      h('div', { text: `${D.area}: ${inv.cust.area || '—'}` }), h('div', { text: `${D.address}: ${inv.cust.addr || '—'}` })),
    h('table', { class: 'sh-table' },
      h('thead', {}, h('tr', {}, D.cols.map((c) => h('th', { text: c })))),
      h('tbody', {}, inv.items.filter((it) => num(it.qty) > 0).map((it, i) => {
        const spec = [matName(it.mat, lang), it.fabric && `${D.fabric}: ${it.fabric}`, foamName(it.foam, lang), `${D.warranty}: ${warText(it)}`].filter(Boolean).join(' · ');
        return h('tr', {},
          h('td', { text: String(i + 1) }),
          h('td', {}, h('div', { text: [catName(it.cat, lang), it.desc].filter(Boolean).join(' — ') }), h('div', { class: 'sh-spec', text: spec })),
          h('td', { text: dims(it) || '—' }),
          h('td', { class: 'num', text: `${digits(it.qty)} ${unitName(it.unit, lang)}` }),
          h('td', { class: 'num', text: kwd(num(it.price)) }),
          h('td', { class: 'num', text: kwd(lineTotal(it)) }));
      }))),
    h('div', { class: 'sh-bottom' },
      h('div', { class: 'sh-totals' },
        h('div', {}, h('span', { text: D.subtotal }), h('span', { text: money(x.sub) })),
        num(inv.disc) ? h('div', {}, h('span', { text: D.discount }), h('span', { text: money(num(inv.disc)) })) : null,
        h('div', { class: 'grand' }, h('span', { text: D.total }), h('span', { text: money(x.total) })),
        quote ? null : h('div', {}, h('span', { text: D.deposit }), h('span', { text: money(num(inv.dep)) })),
        quote ? null : h('div', {}, h('span', { text: D.remaining }), h('span', { text: money(x.rem) })),
        inv.days || inv.ddate ? h('div', {}, h('span', { text: D.delivery }), h('span', { text: [inv.days && `${inv.days} ${D.day}`, inv.ddate].filter(Boolean).join(' — ') })) : null,
        inv.notes ? h('p', { text: `${D.notes}: ${inv.notes}` }) : null),
      !quote && inv.verifyUrl
        ? h('div', { class: 'sh-qr' }, h('img', { src: qrDataUrl(inv.verifyUrl), alt: '' }), h('div', { text: D.scan }), h('div', { text: `${CFG.site.replace('https://', '')}/verify` }))
        : null),
    h('div', { class: 'sh-terms' }, h('b', { text: D.terms }), h('ol', {}, terms.map((s) => h('li', { text: s })))),
    h('div', { class: 'sh-sign' }, h('div', { text: quote ? D.approveCust : D.signCust }), h('div', { text: D.signShop(S.name) })),
    h('div', { class: 'sh-foot', text: `${S.name} · ${CFG.site.replace('https://', '')} · ${D.insta} ${CFG.shop.instagram}` })
  );
  return sheet;
}
const loadScript = (src) =>
  new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    document.head.append(h('script', { src, onload: res, onerror: rej }));
  });
async function makePdf() {
  if (!inv.savedAt) await saveDoc();
  if (!inv.savedAt) return;
  toast(t('pdfWait'));
  await loadScript('/invoice/vendor/html2canvas.min.js');
  await loadScript('/invoice/vendor/jspdf.umd.min.js');
  const sheet = buildSheet();
  await Promise.all([...sheet.querySelectorAll('img')].map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; }))));
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  const canvas = await html2canvas(sheet, { scale: 2, backgroundColor: '#ffffff' }); // eslint-disable-line no-undef
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const pageHpx = Math.floor((canvas.width * ph) / pw);
  for (let y = 0, page = 0; y < canvas.height; y += pageHpx, page++) {
    const part = document.createElement('canvas');
    part.width = canvas.width;
    part.height = Math.min(pageHpx, canvas.height - y);
    part.getContext('2d').drawImage(canvas, 0, y, canvas.width, part.height, 0, 0, canvas.width, part.height);
    if (page) pdf.addPage();
    pdf.addImage(part.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pw, (part.height * pw) / canvas.width);
  }
  const kind = isQuote() ? 'quotation' : 'invoice';
  const file = new File([pdf.output('blob')], `${P}-${kind}-${String(inv.no).replace(/[^\w-]+/g, '-')}.pdf`, { type: 'application/pdf' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `${isQuote() ? DOC[inv.lang === 'en' ? 'en' : 'ar'].quote : DOC[inv.lang === 'en' ? 'en' : 'ar'].invoice} ${inv.no}` });
      return;
    } catch (e) {
      if (e && e.name === 'AbortError') return;
    }
  }
  const a = h('a', { href: URL.createObjectURL(file), download: file.name });
  document.body.append(a);
  a.click();
  a.remove();
}
async function sendWhatsapp() {
  if (!inv.savedAt) await saveDoc();
  if (!inv.verifyUrl) return toast(t('needKey'));
  const phone = digits(inv.cust.phone).replace(/\D/g, '');
  const to = phone.length === 8 ? `965${phone}` : phone;
  const S = shopData(inv.lang);
  const msg =
    inv.lang === 'en'
      ? `${S.name}\nYour invoice no. ${inv.no} dated ${inv.date}.\nVerify the invoice and its warranty:\n${inv.verifyUrl}`
      : `${S.name}\nفاتورتك رقم ${inv.no} بتاريخ ${inv.date}.\nللتحقق من الفاتورة والضمان:\n${inv.verifyUrl}`;
  window.open(`https://wa.me/${to}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
}

// ---------------------------------------------------------------- الأرشيف
function renderArchive() {
  const q = digits($('a_q').value).trim().toLowerCase();
  const f = (document.querySelector('input[name=af]:checked') || {}).value || '';
  const list = lsGet(LS.archive, []).filter((a) => (!f || (a.type || 'invoice') === f) && (!q || `${a.no} ${a.cust.name} ${a.cust.phone}`.toLowerCase().includes(q)));
  $('a_list').replaceChildren(
    ...(list.length
      ? list.map((a) => {
          const quote = a.type === 'quote';
          return h('div', { class: 'row' },
            h('div', {},
              h('b', { text: `#${a.no} — ${a.cust.name || '—'}` }),
              h('span', { class: 'tag', text: `${quote ? t('typeQuote') : t('typeInvoice')} · ${a.lang === 'en' ? 'EN' : 'ع'}` }),
              h('div', { class: 'meta', text: [a.date, kwd(totals(a).total), quote ? '' : a.verifyUrl ? t('signed') : t('unsigned')].filter(Boolean).join(' · ') })),
            h('div', { class: 'btns' },
              h('button', { type: 'button', text: t('open'), onclick: () => { inv = structuredClone(a); inv.type = inv.type || 'invoice'; inv.lang = inv.lang || 'ar'; fillForm(); show('edit'); } }),
              h('button', { type: 'button', text: t('copy'), onclick: () => { inv = { ...structuredClone(a), type: a.type || 'invoice', lang: a.lang || 'ar', id: crypto.randomUUID(), no: nextNo(a.type || 'invoice'), date: today(), verifyUrl: null, savedAt: null }; fillForm(); show('edit'); toast(t('copied')); } }),
              h('button', { type: 'button', class: 'danger', text: t('del'), onclick: () => { if (confirm(t('confirmDel', a.no))) { lsSet(LS.archive, lsGet(LS.archive, []).filter((y) => y.id !== a.id)); renderArchive(); } } })));
        })
      : [h('p', { class: 'hint', text: t('none') })])
  );
}
function exportArchive() {
  const blob = new Blob([JSON.stringify({ archive: lsGet(LS.archive, []), next: lsGet(LS.next, 1), nextQ: lsGet(LS.nextQ, 1), terms: lsGet(LS.terms, {}) }, null, 2)], { type: 'application/json' });
  const a = h('a', { href: URL.createObjectURL(blob), download: `${P}-documents-${today()}.json` });
  document.body.append(a);
  a.click();
  a.remove();
}
async function importArchive(e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const cur = lsGet(LS.archive, []);
    const ids = new Set(cur.map((x) => x.id));
    const merged = cur.concat((data.archive || []).filter((x) => !ids.has(x.id)));
    lsSet(LS.archive, merged);
    if (data.next && Number(data.next) > Number(lsGet(LS.next, 1))) lsSet(LS.next, Number(data.next));
    if (data.nextQ && Number(data.nextQ) > Number(lsGet(LS.nextQ, 1))) lsSet(LS.nextQ, Number(data.nextQ));
    if (data.terms && typeof data.terms === 'object') lsSet(LS.terms, data.terms);
    toast(t('restored', merged.length));
    renderArchive();
  } catch (_) {
    toast(t('badFile'));
  }
  e.target.value = '';
}

// ---------------------------------------------------------------- الواجهة واللغة
function applyUi() {
  document.documentElement.lang = UI;
  document.documentElement.dir = UI === 'en' ? 'ltr' : 'rtl';
  document.title = t('appTitle');
  $('barTitle').textContent = t('appTitle');
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll('input[name=ul]').forEach((r) => { r.checked = r.value === UI; });
}
function show(view) {
  for (const v of ['edit', 'archive', 'settings']) $(`v-${v}`).hidden = v !== view;
  document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('on', x.dataset.view === view));
  if (view === 'archive') renderArchive();
  if (view === 'settings') {
    const f = numFmt();
    $('s_prefix').value = f.invoicePrefix;
    $('s_prefixQ').value = f.quotePrefix;
    $('s_digits').value = f.digits || '';
    $('s_next').value = counter('invoice');
    $('s_nextQ').value = counter('quote');
    $('s_numPreview').textContent = nextNo('invoice');
    const o = lsGet(LS.shop, {});
    $('s_nameAr').value = o.nameAr || CFG.shop.ar.name;
    $('s_nameEn').value = o.nameEn || CFG.shop.en.name;
    $('s_phone').value = o.phone || CFG.shop.phone;
    loadTermsEditor();
    refreshKeyStatus();
  }
  window.scrollTo(0, 0);
}
const termsKey = () => `${$('s_termsType').value}_${$('s_termsLang').value}`;
function loadTermsEditor() {
  const [type, lang] = termsKey().split('_');
  $('s_terms').value = lsGet(LS.terms, {})[termsKey()] || CFG.terms[type][lang].join('\n');
  $('s_terms').dir = lang === 'en' ? 'ltr' : 'rtl';
}
function askNewDoc() {
  const dlg = $('newDlg');
  dlg.querySelectorAll('input[name=nl]').forEach((r) => { r.checked = r.value === UI; });
  const done = () => {
    dlg.removeEventListener('close', done);
    if (dlg.returnValue !== 'ok') return;
    const type = (dlg.querySelector('input[name=nt]:checked') || {}).value || 'invoice';
    const lang = (dlg.querySelector('input[name=nl]:checked') || {}).value || 'ar';
    inv = newDoc(type, lang);
    lsSet(LS.draft, inv);
    fillForm();
    show('edit');
  };
  dlg.addEventListener('close', done);
  dlg.returnValue = '';
  dlg.showModal();
}

async function init() {
  CODES = await (await fetch('/invoice/codes.json', { cache: 'no-cache' })).json();
  UI = lsGet(LS.ui, 'ar') === 'en' ? 'en' : 'ar';
  applyUi();
  // أول تشغيل لنظام الترقيم الجديد: يبدأ العدّاد من رقم البداية في config.js (مثال 547) إن كان أقل
  if (localStorage.getItem(LS.num) == null) {
    const N = CFG.numbering || {};
    if (Number(lsGet(LS.next, 0)) < (N.invoiceStart || 1)) lsSet(LS.next, N.invoiceStart || 1);
    if (Number(lsGet(LS.nextQ, 0)) < (N.quoteStart || 1)) lsSet(LS.nextQ, N.quoteStart || 1);
    lsSet(LS.num, numFmt());
    const d = lsGet(LS.draft, null);
    if (d && !d.savedAt) { d.no = nextNo(d.type || 'invoice'); lsSet(LS.draft, d); }
  }
  inv = lsGet(LS.draft, null);
  if (inv) {
    inv.type = inv.type || 'invoice';
    inv.lang = inv.lang || 'ar';
    fillForm();
  } else {
    inv = newDoc('invoice', UI);
    fillForm();
    askNewDoc();
  }

  document.querySelectorAll('.tab').forEach((x) => x.addEventListener('click', () => show(x.dataset.view)));
  ['i_no', 'i_date', 'q_valid', 'c_name', 'c_phone', 'c_area', 'c_addr', 't_disc', 't_dep', 'n_notes', 'd_date'].forEach((id) => $(id).addEventListener('input', onChange));
  $('d_days').addEventListener('input', () => {
    const d = parseInt(digits($('d_days').value), 10);
    if (d > 0) $('d_date').value = addDays($('i_date').value || today(), d);
    onChange();
  });
  $('addItem').addEventListener('click', () => { inv.items.push(blankItem()); renderItems(); onChange(); });
  $('btnSave').addEventListener('click', saveDoc);
  $('btnPdf').addEventListener('click', () => makePdf().catch(() => toast(t('pdfFail'))));
  $('btnWa').addEventListener('click', sendWhatsapp);
  $('btnConvert').addEventListener('click', convertToInvoice);
  $('btnNew').addEventListener('click', () => {
    if (!inv.savedAt && inv.items.some((it) => num(it.qty) > 0) && !confirm(t('unsaved'))) return;
    askNewDoc();
  });
  $('a_q').addEventListener('input', renderArchive);
  document.querySelectorAll('input[name=af]').forEach((r) => r.addEventListener('change', renderArchive));
  $('btnExport').addEventListener('click', exportArchive);
  $('importFile').addEventListener('change', importArchive);
  $('saveNext').addEventListener('click', () => {
    const a = parseInt(digits($('s_next').value), 10);
    const b = parseInt(digits($('s_nextQ').value), 10);
    if (!(a > 0) || !(b > 0)) return toast(t('badNum'));
    const dg = parseInt(digits($('s_digits').value), 10) || 0;
    lsSet(LS.num, { invoicePrefix: $('s_prefix').value.trim().toUpperCase(), quotePrefix: $('s_prefixQ').value.trim().toUpperCase(), digits: Math.min(Math.max(dg, 0), 10) });
    lsSet(LS.next, a);
    lsSet(LS.nextQ, b);
    if (!inv.savedAt) { inv.no = nextNo(inv.type); lsSet(LS.draft, inv); fillForm(); }
    $('s_numPreview').textContent = nextNo('invoice');
    toast(t('nextSet'));
  });
  ['s_prefix', 's_digits', 's_next'].forEach((id) => $(id).addEventListener('input', () => {
    const dg = parseInt(digits($('s_digits').value), 10) || 0;
    $('s_numPreview').textContent = `${$('s_prefix').value.trim().toUpperCase()}${String(parseInt(digits($('s_next').value), 10) || 0).padStart(dg, '0')}`;
  }));
  $('saveShop').addEventListener('click', () => {
    const phone = digits($('s_phone').value).replace(/\D/g, '');
    lsSet(LS.shop, { nameAr: $('s_nameAr').value.trim(), nameEn: $('s_nameEn').value.trim(), phone });
    applyUi();
    toast(t('shopSaved'));
  });
  $('resetShop').addEventListener('click', () => { localStorage.removeItem(LS.shop); show('settings'); applyUi(); });
  $('s_termsType').addEventListener('change', loadTermsEditor);
  $('s_termsLang').addEventListener('change', loadTermsEditor);
  $('saveTerms').addEventListener('click', () => { const s = lsGet(LS.terms, {}); s[termsKey()] = $('s_terms').value.trim(); lsSet(LS.terms, s); toast(t('termsSaved')); });
  $('resetTerms').addEventListener('click', () => { const s = lsGet(LS.terms, {}); delete s[termsKey()]; lsSet(LS.terms, s); loadTermsEditor(); });
  document.querySelectorAll('input[name=ul]').forEach((r) => r.addEventListener('change', () => { UI = r.value; lsSet(LS.ui, UI); applyUi(); fillForm(); show('settings'); }));
  $('activateKey').addEventListener('click', activateKey);

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/invoice/sw.js', { scope: '/invoice/' }).catch(() => {});
}
init().catch(() => toast(I18N.ar.startFail));
