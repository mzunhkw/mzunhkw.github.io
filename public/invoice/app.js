'use strict';
/* ==========================================================================
   فواتير منجرة مزونة — تطبيق ويب يعمل من الجوال بلا خادم.
   - الفواتير تُحفظ في هذا الجهاز (localStorage) مع نسخة احتياطية يدوية.
   - باركود التحقق: توقيع ECDSA P-256 بمفتاح خاص لا يمكن نسخه (IndexedDB)،
     ومفتاحه العام يُرفع إلى public/verify-keys.json في مستودع الموقع.
   - صفحة التحقق: mazunhkw.com/verify/#<بيانات>.<توقيع>
   ========================================================================== */

const SITE = 'https://mazunhkw.com';
const SHOP = {
  name: 'منجرة مزونة',
  tagline: 'نجارة وتفصيل أثاث وتنجيد — الكويت',
  phone: '65061072',
  whatsapp: '96565061072',
  address: 'الضجيج — مجمع علي عبدالوهاب، الكويت',
  instagram: '@mazunhkw',
};
const REPO = { owner: 'mzunhkw', repo: 'mzunhkw.github.io', branch: 'main' };
const KEYS_PATH = 'public/verify-keys.json';
const VAULT_PATH = 'public/admin-vault.json';
const LS = { archive: 'mzinv_archive', draft: 'mzinv_draft', next: 'mzinv_next', terms: 'mzinv_terms' };
const FOAMS = ['', 'إسفنج البغلي', 'إسفنج الوطنية', 'دانلوب البغلي'];
const DEFAULT_TERMS = [
  'الأسعار متفق عليها بعد أخذ المقاسات ومعاينة العينات.',
  'يبدأ التنفيذ بعد استلام العربون، ويُستكمل باقي المبلغ عند التسليم.',
  'القطع المفصّلة حسب الطلب لا تُسترجع إلا في حالة العيوب المصنعية.',
  'الضمان حسب المدة المذكورة لكل قطعة، ويشمل إصلاح عيوب التصنيع ولا يشمل الاستبدال. التفاصيل: mazunhkw.com/warranty',
  'التوصيل مجاني داخل الكويت.',
].join('\n');

let CODES = null;
let inv = null; // الفاتورة الحالية

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
// تاريخ اليوم بتوقيت الجهاز (الكويت) — toISOString يعطي UTC فيتأخر يومًا بعد منتصف الليل
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const addDays = (iso, d) => {
  const t = new Date(iso + 'T00:00:00Z');
  t.setUTCDate(t.getUTCDate() + d);
  return t.toISOString().slice(0, 10);
};
const toast = (msg) => {
  const t = $('toast');
  t.replaceChildren(h('span', { text: msg }));
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.replaceChildren(), 3200);
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
    toast('تعذّر الحفظ في الجهاز — المساحة ممتلئة؟');
  }
};

// ---------------------------------------------------------------- مخزن المفتاح (IndexedDB)
function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('mazuna-invoice', 1);
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
async function openVault(password) {
  const r = await fetch(`https://api.github.com/repos/${REPO.owner}/${REPO.repo}/contents/${VAULT_PATH}?ref=${REPO.branch}&ts=${Date.now()}`, {
    cache: 'no-store',
    headers: { Accept: 'application/vnd.github.raw+json' },
  });
  if (!r.ok) throw new Error('تعذّر قراءة خزنة لوحة الإدارة.');
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
    throw new Error('كلمة السر غير صحيحة.');
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
  if (!pw) return toast('اكتب كلمة سر لوحة الإدارة');
  const btn = $('activateKey');
  btn.disabled = true;
  btn.textContent = 'جارٍ التفعيل…';
  try {
    const token = await openVault(pw);
    // المفتاح الخاص غير قابل للتصدير: لا يخرج من هذا الجهاز أبدًا
    const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
    const jwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
    const kid = 'k' + Date.now().toString(36);
    const path = `/repos/${REPO.owner}/${REPO.repo}/contents/${KEYS_PATH}`;
    let sha;
    let keys = [];
    try {
      const cur = await gh(token, `${path}?ref=${REPO.branch}`);
      sha = cur.sha;
      keys = JSON.parse(new TextDecoder().decode(b64d(cur.content.replace(/\n/g, ''))));
    } catch (_) {
      /* الملف غير موجود بعد */
    }
    keys.push({ kid, kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y, created: new Date().toISOString() });
    const content = b64e(new TextEncoder().encode(JSON.stringify(keys, null, 2) + '\n'));
    await gh(token, path, {
      method: 'PUT',
      body: { message: 'فواتير مزونة: إضافة مفتاح تحقق لجهاز جديد', content, branch: REPO.branch, ...(sha ? { sha } : {}) },
    });
    await keyPut({ kid, privateKey: pair.privateKey, created: new Date().toISOString() });
    $('s_pw').value = '';
    toast('تم التفعيل — صفحة التحقق تعمل بعد دقائق من نشر الموقع');
    await refreshKeyStatus();
  } catch (e) {
    toast(e.message || 'تعذّر التفعيل');
  } finally {
    btn.disabled = false;
    btn.textContent = 'تفعيل التحقق على هذا الجهاز';
  }
}
async function refreshKeyStatus() {
  const k = await keyGet().catch(() => null);
  $('keyStatus').textContent = k ? `مفعّل على هذا الجهاز (المفتاح ${k.kid}).` : 'غير مفعّل على هذا الجهاز.';
  $('keyWarn').hidden = !!k;
  return k;
}

// ---------------------------------------------------------------- التوقيع
// البيانات الموقّعة (بلا اسم العميل أو هاتفه أو المبلغ):
// { v, k, n: رقم الفاتورة, d: التاريخ, i: [[رمز القطعة, رمز الخامة, أشهر الضمان], ...] }
async function signInvoice(x) {
  const key = await keyGet();
  if (!key) return null;
  const payload = { v: 1, k: key.kid, n: String(x.no), d: x.date, i: x.items.map((it) => [Number(it.cat), Number(it.mat), Number(it.war)]) };
  const data = utf8b64u(JSON.stringify(payload));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key.privateKey, new TextEncoder().encode(data));
  return `${SITE}/verify/#${data}.${b64u(sig)}`;
}

// ---------------------------------------------------------------- الفاتورة
const blankItem = () => ({ cat: '1', desc: '', mat: '9', fabric: '', foam: '', L: '', W: '', H: '', unit: 'm', qty: '', price: '', war: '0' });
function nextNo() {
  return String(lsGet(LS.next, 1));
}
function newInvoice() {
  return { id: crypto.randomUUID(), no: nextNo(), date: today(), cust: { name: '', phone: '', area: '', addr: '' }, items: [blankItem()], disc: '0', dep: '0', days: '', ddate: '', notes: '', verifyUrl: null, savedAt: null };
}
const lineTotal = (it) => num(it.qty) * num(it.price);
function totals(x) {
  const sub = x.items.reduce((s, it) => s + lineTotal(it), 0);
  const total = Math.max(0, sub - num(x.disc));
  return { sub, total, rem: Math.max(0, total - num(x.dep)) };
}
function optionList(map, selected) {
  return Object.entries(map).map(([v, label]) => h('option', { value: v, selected: String(v) === String(selected), text: typeof label === 'string' ? label : label.name }));
}

function renderItems() {
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
        if (k === 'qty' || k === 'price') box.querySelectorAll('.item-total')[idx].textContent = `${kwd(lineTotal(it))} د.ك`;
      };
      const unitLabel = CODES.units[it.unit] || '';
      return h(
        'div',
        { class: 'item' },
        h('div', { class: 'item-head' }, h('b', { text: `قطعة ${idx + 1}` }),
          inv.items.length > 1 ? h('button', { type: 'button', class: 'danger', text: 'حذف', onclick: () => { inv.items.splice(idx, 1); renderItems(); onChange(); } }) : null),
        h('div', { class: 'grid2' },
          h('div', { class: 'field' }, h('label', { text: 'نوع القطعة' }), h('select', { onchange: set('cat') }, optionList(CODES.categories, it.cat))),
          h('div', { class: 'field' }, h('label', { text: 'الخامة' }), h('select', { onchange: set('mat') }, optionList(CODES.materials, it.mat)))),
        h('div', { class: 'field' }, h('label', { text: 'الوصف (التصميم، اللون، التفاصيل)' }), h('input', { value: it.desc, oninput: set('desc') })),
        h('div', { class: 'grid2' },
          h('div', { class: 'field' }, h('label', { text: 'القماش (النوع / الكود / اللون)' }), h('input', { value: it.fabric, oninput: set('fabric') })),
          h('div', { class: 'field' }, h('label', { text: 'الإسفنج' }), h('select', { onchange: set('foam') }, FOAMS.map((f) => h('option', { value: f, selected: f === it.foam, text: f || '—' }))))),
        h('div', { class: 'grid3' },
          h('div', { class: 'field' }, h('label', { text: 'الطول (سم)' }), h('input', { value: it.L, inputmode: 'decimal', dir: 'ltr', oninput: set('L') })),
          h('div', { class: 'field' }, h('label', { text: 'العرض/العمق (سم)' }), h('input', { value: it.W, inputmode: 'decimal', dir: 'ltr', oninput: set('W') })),
          h('div', { class: 'field' }, h('label', { text: 'الارتفاع (سم)' }), h('input', { value: it.H, inputmode: 'decimal', dir: 'ltr', oninput: set('H') }))),
        h('div', { class: 'grid3' },
          h('div', { class: 'field' }, h('label', { text: 'وحدة السعر' }), h('select', { onchange: (e) => { it.unit = e.target.value; renderItems(); onChange(); } }, optionList(CODES.units, it.unit))),
          h('div', { class: 'field' }, h('label', { text: `الكمية (${unitLabel})` }), h('input', { value: it.qty, inputmode: 'decimal', dir: 'ltr', oninput: set('qty') })),
          h('div', { class: 'field' }, h('label', { text: `السعر لكل ${unitLabel}` }), h('input', { value: it.price, inputmode: 'decimal', dir: 'ltr', oninput: set('price') }))),
        h('div', { class: 'grid2' },
          h('div', { class: 'field' }, h('label', { text: 'الضمان' }), h('select', { onchange: set('war') }, optionList(CODES.warranty, it.war))),
          h('div', { class: 'field' }, h('label', { text: 'إجمالي القطعة' }), h('div', { class: 'item-total', text: `${kwd(lineTotal(it))} د.ك` })))
      );
    })
  );
}

function fillForm() {
  $('i_no').value = inv.no;
  $('i_date').value = inv.date;
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
}
function readForm() {
  inv.no = digits($('i_no').value).replace(/\D/g, '');
  inv.date = $('i_date').value || today();
  inv.cust = { name: $('c_name').value.trim(), phone: digits($('c_phone').value).trim(), area: $('c_area').value.trim(), addr: $('c_addr').value.trim() };
  inv.disc = digits($('t_disc').value);
  inv.dep = digits($('t_dep').value);
  inv.days = digits($('d_days').value);
  inv.ddate = $('d_date').value;
  inv.notes = $('n_notes').value.trim();
}
function updateTotals() {
  const t = totals(inv);
  $('t_sub').textContent = `${kwd(t.sub)} د.ك`;
  $('t_total').textContent = `${kwd(t.total)} د.ك`;
  $('t_rem').textContent = `${kwd(t.rem)} د.ك`;
}
function onChange() {
  readForm();
  inv.verifyUrl = null; // أي تعديل يُلغي التوقيع القديم حتى يُحفظ من جديد
  inv.savedAt = null;
  updateTotals();
  lsSet(LS.draft, inv);
}

async function saveInvoice() {
  readForm();
  if (!inv.no) return toast('رقم الفاتورة مطلوب');
  if (!inv.items.some((it) => num(it.qty) > 0)) return toast('أضف كمية لقطعة واحدة على الأقل');
  const archive = lsGet(LS.archive, []);
  if (archive.some((a) => a.no === inv.no && a.id !== inv.id)) return toast(`رقم الفاتورة ${inv.no} مستخدم في فاتورة أخرى`);
  try {
    inv.verifyUrl = await signInvoice(inv);
  } catch (_) {
    inv.verifyUrl = null;
  }
  inv.savedAt = new Date().toISOString();
  const i = archive.findIndex((a) => a.id === inv.id);
  if (i >= 0) archive[i] = inv;
  else archive.unshift(inv);
  lsSet(LS.archive, archive);
  const n = Number(inv.no);
  if (Number.isFinite(n) && n >= Number(nextNo())) lsSet(LS.next, n + 1);
  lsSet(LS.draft, inv);
  toast(inv.verifyUrl ? `حُفظت الفاتورة ${inv.no} مع باركود التحقق` : `حُفظت الفاتورة ${inv.no} — بدون باركود (التحقق غير مفعّل)`);
}

// ---------------------------------------------------------------- ورقة الفاتورة
function qrDataUrl(text) {
  const qr = qrcode(0, 'M'); // eslint-disable-line no-undef
  qr.addData(text);
  qr.make();
  return qr.createDataURL(6, 2);
}
function warrantyText(it) {
  const months = Number(it.war);
  const label = CODES.warranty[it.war] || '';
  if (!months) return label;
  const end = new Date(inv.date + 'T00:00:00Z');
  end.setUTCMonth(end.getUTCMonth() + months);
  return `${label} — حتى ${end.toISOString().slice(0, 10)}`;
}
function buildSheet() {
  const t = totals(inv);
  const terms = (lsGet(LS.terms, null) || DEFAULT_TERMS).split('\n').filter(Boolean);
  const dims = (it) => [it.L && `طول ${digits(it.L)}`, it.W && `عمق ${digits(it.W)}`, it.H && `ارتفاع ${digits(it.H)}`].filter(Boolean).join(' · ');
  const sheet = $('sheet');
  sheet.replaceChildren(
    h('div', { class: 'sh-head' },
      h('div', { class: 'sh-brand' }, h('img', { src: '/logo.png', alt: '' }),
        h('div', {}, h('h1', { text: SHOP.name }), h('p', { text: SHOP.tagline }), h('p', { text: `${SHOP.address} · هاتف وواتساب ${SHOP.phone}` }))),
      h('div', { class: 'sh-meta' }, h('div', {}, 'فاتورة رقم ', h('b', { text: inv.no })), h('div', { text: `التاريخ: ${inv.date}` }))),
    h('div', { class: 'sh-cust' },
      h('div', { text: `العميل: ${inv.cust.name || '—'}` }), h('div', { text: `الهاتف: ${inv.cust.phone || '—'}` }),
      h('div', { text: `المنطقة: ${inv.cust.area || '—'}` }), h('div', { text: `العنوان: ${inv.cust.addr || '—'}` })),
    h('table', { class: 'sh-table' },
      h('thead', {}, h('tr', {}, ['#', 'القطعة والمواصفات', 'المقاس (سم)', 'الكمية', 'السعر', 'الإجمالي'].map((c) => h('th', { text: c })))),
      h('tbody', {}, inv.items.filter((it) => num(it.qty) > 0).map((it, i) => {
        const cat = (CODES.categories[it.cat] || {}).name || '';
        const spec = [CODES.materials[it.mat], it.fabric && `قماش: ${it.fabric}`, it.foam, `الضمان: ${warrantyText(it)}`].filter(Boolean).join(' · ');
        return h('tr', {},
          h('td', { text: String(i + 1) }),
          h('td', {}, h('div', { text: [cat, it.desc].filter(Boolean).join(' — ') }), h('div', { class: 'sh-spec', text: spec })),
          h('td', { text: dims(it) || '—' }),
          h('td', { class: 'num', text: `${digits(it.qty)} ${CODES.units[it.unit] || ''}` }),
          h('td', { class: 'num', text: kwd(num(it.price)) }),
          h('td', { class: 'num', text: kwd(lineTotal(it)) }));
      }))),
    h('div', { class: 'sh-bottom' },
      h('div', { class: 'sh-totals' },
        h('div', {}, h('span', { text: 'المجموع' }), h('span', { text: `${kwd(t.sub)} د.ك` })),
        num(inv.disc) ? h('div', {}, h('span', { text: 'الخصم' }), h('span', { text: `${kwd(num(inv.disc))} د.ك` })) : null,
        h('div', { class: 'grand' }, h('span', { text: 'الإجمالي' }), h('span', { text: `${kwd(t.total)} د.ك` })),
        h('div', {}, h('span', { text: 'العربون المدفوع' }), h('span', { text: `${kwd(num(inv.dep))} د.ك` })),
        h('div', {}, h('span', { text: 'المتبقي عند التسليم' }), h('span', { text: `${kwd(t.rem)} د.ك` })),
        inv.days || inv.ddate ? h('div', {}, h('span', { text: 'التسليم المتوقع' }), h('span', { text: [inv.days && `${inv.days} يوم`, inv.ddate].filter(Boolean).join(' — ') })) : null,
        inv.notes ? h('p', { text: `ملاحظات: ${inv.notes}` }) : null),
      inv.verifyUrl
        ? h('div', { class: 'sh-qr' }, h('img', { src: qrDataUrl(inv.verifyUrl), alt: '' }), h('div', { text: 'امسح للتحقق من الفاتورة والضمان' }), h('div', { text: 'mazunhkw.com/verify' }))
        : null),
    h('div', { class: 'sh-terms' }, h('b', { text: 'الشروط' }), h('ol', {}, terms.map((x) => h('li', { text: x })))),
    h('div', { class: 'sh-sign' }, h('div', { text: 'توقيع العميل' }), h('div', { text: `عن ${SHOP.name}` })),
    h('div', { class: 'sh-foot', text: `${SHOP.name} · ${SITE.replace('https://', '')} · انستقرام ${SHOP.instagram}` })
  );
  return sheet;
}
const loadScript = (src) =>
  new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    document.head.append(h('script', { src, onload: res, onerror: rej }));
  });
async function makePdf() {
  if (!inv.savedAt) await saveInvoice();
  if (!inv.savedAt) return;
  toast('جارٍ تجهيز الـ PDF…');
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
  const file = new File([pdf.output('blob')], `mazuna-invoice-${inv.no}.pdf`, { type: 'application/pdf' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `فاتورة ${SHOP.name} رقم ${inv.no}` });
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
  if (!inv.savedAt) await saveInvoice();
  if (!inv.verifyUrl) return toast('فعّل باركود التحقق من الإعدادات ثم احفظ الفاتورة');
  const phone = digits(inv.cust.phone).replace(/\D/g, '');
  const to = phone.length === 8 ? `965${phone}` : phone;
  const msg = `${SHOP.name}\nفاتورتك رقم ${inv.no} بتاريخ ${inv.date}.\nللتحقق من الفاتورة والضمان:\n${inv.verifyUrl}`;
  window.open(`https://wa.me/${to}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
}

// ---------------------------------------------------------------- الأرشيف
function renderArchive() {
  const q = digits($('a_q').value).trim().toLowerCase();
  const list = lsGet(LS.archive, []).filter((a) => !q || `${a.no} ${a.cust.name} ${a.cust.phone}`.toLowerCase().includes(q));
  $('a_list').replaceChildren(
    ...(list.length
      ? list.map((a) =>
          h('div', { class: 'row' },
            h('div', {}, h('b', { text: `#${a.no} — ${a.cust.name || 'بدون اسم'}` }), h('div', { class: 'meta', text: `${a.date} · ${kwd(totals(a).total)} د.ك · ${a.verifyUrl ? 'موقّعة' : 'بلا باركود'}` })),
            h('div', { class: 'btns' },
              h('button', { type: 'button', text: 'فتح', onclick: () => { inv = structuredClone(a); fillForm(); show('edit'); } }),
              h('button', { type: 'button', text: 'نسخ', onclick: () => { inv = { ...structuredClone(a), id: crypto.randomUUID(), no: nextNo(), date: today(), verifyUrl: null, savedAt: null }; fillForm(); show('edit'); toast('نسخة جديدة — راجعها واحفظ'); } }),
              h('button', { type: 'button', class: 'danger', text: 'حذف', onclick: () => { if (confirm(`حذف الفاتورة ${a.no} من هذا الجهاز؟`)) { lsSet(LS.archive, lsGet(LS.archive, []).filter((x) => x.id !== a.id)); renderArchive(); } } }))))
      : [h('p', { class: 'hint', text: 'لا توجد فواتير محفوظة.' })])
  );
}
function exportArchive() {
  const blob = new Blob([JSON.stringify({ archive: lsGet(LS.archive, []), next: lsGet(LS.next, 1), terms: lsGet(LS.terms, null) }, null, 2)], { type: 'application/json' });
  const a = h('a', { href: URL.createObjectURL(blob), download: `mazuna-invoices-${today()}.json` });
  document.body.append(a);
  a.click();
  a.remove();
}
async function importArchive(e) {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    const cur = lsGet(LS.archive, []);
    const ids = new Set(cur.map((x) => x.id));
    const merged = cur.concat((data.archive || []).filter((x) => !ids.has(x.id)));
    lsSet(LS.archive, merged);
    if (data.next && Number(data.next) > Number(nextNo())) lsSet(LS.next, Number(data.next));
    if (data.terms) lsSet(LS.terms, data.terms);
    toast(`تم الاسترجاع — ${merged.length} فاتورة`);
    renderArchive();
  } catch (_) {
    toast('ملف غير صالح');
  }
  e.target.value = '';
}

// ---------------------------------------------------------------- التنقل والإعدادات
function show(view) {
  for (const v of ['edit', 'archive', 'settings']) $(`v-${v}`).hidden = v !== view;
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('on', t.dataset.view === view));
  if (view === 'archive') renderArchive();
  if (view === 'settings') {
    $('s_next').value = nextNo();
    $('s_terms').value = lsGet(LS.terms, null) || DEFAULT_TERMS;
    refreshKeyStatus();
  }
  window.scrollTo(0, 0);
}

async function init() {
  CODES = await (await fetch('/invoice/codes.json', { cache: 'no-cache' })).json();
  inv = lsGet(LS.draft, null) || newInvoice();
  fillForm();
  refreshKeyStatus();

  document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => show(t.dataset.view)));
  ['i_no', 'i_date', 'c_name', 'c_phone', 'c_area', 'c_addr', 't_disc', 't_dep', 'n_notes', 'd_date'].forEach((id) => $(id).addEventListener('input', onChange));
  $('d_days').addEventListener('input', () => {
    const d = parseInt(digits($('d_days').value), 10);
    if (d > 0) $('d_date').value = addDays($('i_date').value || today(), d);
    onChange();
  });
  $('addItem').addEventListener('click', () => { inv.items.push(blankItem()); renderItems(); onChange(); });
  $('btnSave').addEventListener('click', saveInvoice);
  $('btnPdf').addEventListener('click', () => makePdf().catch(() => toast('تعذّر إنشاء الـ PDF')));
  $('btnWa').addEventListener('click', sendWhatsapp);
  $('btnNew').addEventListener('click', () => {
    if (!inv.savedAt && inv.items.some((it) => num(it.qty) > 0) && !confirm('الفاتورة الحالية غير محفوظة. بدء فاتورة جديدة؟')) return;
    inv = newInvoice();
    lsSet(LS.draft, inv);
    fillForm();
  });
  $('a_q').addEventListener('input', renderArchive);
  $('btnExport').addEventListener('click', exportArchive);
  $('importFile').addEventListener('change', importArchive);
  $('saveNext').addEventListener('click', () => {
    const n = parseInt(digits($('s_next').value), 10);
    if (!(n > 0)) return toast('رقم غير صالح');
    lsSet(LS.next, n);
    if (!inv.savedAt) { inv.no = String(n); $('i_no').value = inv.no; lsSet(LS.draft, inv); }
    toast(`الفاتورة التالية رقم ${n}`);
  });
  $('saveTerms').addEventListener('click', () => { lsSet(LS.terms, $('s_terms').value.trim()); toast('حُفظت الشروط'); });
  $('activateKey').addEventListener('click', activateKey);

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/invoice/sw.js', { scope: '/invoice/' }).catch(() => {});
}
init().catch(() => toast('تعذّر تشغيل التطبيق — تحقق من الاتصال'));
