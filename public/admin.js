'use strict';

/* ==========================================================================
   لوحة إدارة مزونة
   - لا خادم: كل شيء يتم عبر GitHub API مباشرة من المتصفح.
   - كل عملية حفظ = Commit واحد ذري (بيانات + صور) → نشر واحد فقط.
   - الدخول بالتوكن نفسه (يُتحقق من صلاحية الكتابة فورًا).
   ========================================================================== */

// ---------------------------------------------------------------------------
// الإعدادات
// ---------------------------------------------------------------------------
const TOKEN_KEY = 'mazuna_gh_token';
const LS_KEYS = { owner: 'mazuna_gh_owner', repo: 'mazuna_gh_repo', branch: 'mazuna_gh_branch' };
const DEFAULTS = { owner: 'mzunhkw', repo: 'mzunhkw.github.io', branch: 'main' };
const PRODUCTS_PATH = 'src/data/products.json';
const CATEGORIES_PATH = 'src/data/categories.json';
const IMAGES_DIR = 'public/images';
const MAX_IMAGES = 8;
const MAX_INPUT_MB = 25;
const MAX_SIDE = 1600;
const IDLE_MS = 30 * 60 * 1000;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const AVAILABILITY = [
  { value: 'custom-order', label: 'متاح للتفصيل', help: '' },
  { value: 'ready-piece', label: 'قطعة جاهزة', help: '' },
  { value: 'temporarily-unavailable', label: 'غير متاح مؤقتًا', help: 'يظهر بالموقع مع وسم «غير متاح مؤقتًا».' },
  { value: 'archived', label: 'مؤرشف', help: 'المؤرشف يختفي من الموقع بالكامل (القوائم، صفحة المنتج، sitemap).' },
];
const availabilityLabel = (v) => (AVAILABILITY.find((a) => a.value === v) || { label: v }).label;

// ---------------------------------------------------------------------------
// أدوات عامة (بدون DOM)
// ---------------------------------------------------------------------------
function normalizeDigits(s) {
  return String(s == null ? '' : s)
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\u066B/g, '.')
    .replace(/\s+/g, '');
}

// يقبل: 250 — 12.5 — 12.500 — ٢٥٠ — ١٢٫٥ ؛ ويرفض الفواصل لأنها ملتبسة (12,500 ؟)
function parsePrice(raw) {
  const s = normalizeDigits(raw);
  if (!/^\d{1,7}(\.\d{1,3})?$/.test(s)) return NaN;
  return Number(s);
}

function parseMaterials(raw) {
  const seen = new Set();
  const out = [];
  for (const part of String(raw || '').split(/[,،\n]+/)) {
    const m = part.trim();
    if (m && !seen.has(m)) {
      seen.add(m);
      out.push(m);
    }
  }
  return out;
}

function randomSeed() {
  return Math.random().toString(36).slice(2, 7);
}

// slug من الجزء اللاتيني بالعنوان، وإلا product-xxxxx
function autoSlug(title, seed) {
  const latin = String(title || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/g, '');
  return latin.length >= 3 ? latin : `product-${seed}`;
}

function urlToRepoPath(url) {
  if (typeof url !== 'string' || !url.startsWith('/images/') || url.includes('..') || url.includes('//')) return null;
  return 'public' + url;
}

// مسارات الصور اللي ما عاد يستخدمها أي منتج (آمن للحذف)
function orphanPaths(urls, products) {
  const used = new Set();
  for (const p of products) for (const u of p.images || []) used.add(u);
  return [...new Set(urls)].filter((u) => !used.has(u)).map(urlToRepoPath).filter(Boolean);
}

function toJson(value) {
  return JSON.stringify(value, null, 2) + '\n';
}

function encPath(p) {
  return String(p).split('/').map(encodeURIComponent).join('/');
}

function validateProduct(v, ctx) {
  const e = {};
  if (v.title.length < 2) e.title = 'اكتب اسم المنتج (حرفان على الأقل).';
  if (!SLUG_RE.test(v.slug)) {
    e.slug = 'الرابط المختصر: حروف إنجليزية صغيرة وأرقام وشرطات فقط (مثال: wooden-bed-01).';
  } else if (!ctx.editing && ctx.products.some((p) => p.slug === v.slug)) {
    e.slug = 'هذا الرابط مستخدم بمنتج ثاني، غيّره.';
  }
  if (!ctx.categories.some((c) => c.slug === v.categorySlug)) {
    e.category = ctx.categories.length ? 'اختر تصنيفًا.' : 'أضف تصنيفًا أولًا من تبويب «التصنيفات».';
  }
  if (!(v.price > 0)) e.price = 'اكتب سعرًا أكبر من صفر — أرقام فقط وحتى 3 خانات عشرية، بدون فواصل.';
  if (!v.size) e.size = 'اكتب المقاس.';
  if (!v.region) e.region = 'اكتب المنطقة.';
  if (v.description.length < 10) e.description = 'اكتب وصفًا كاملًا (10 أحرف على الأقل).';
  if (v.imageCount > MAX_IMAGES) e.images = `الحد الأقصى ${MAX_IMAGES} صور لكل منتج.`;
  return e;
}

// ---------------------------------------------------------------------------
// طبقة GitHub
// ---------------------------------------------------------------------------
class AuthError extends Error {
  constructor(message) {
    super(message);
    this.status = 401;
  }
}

function cfg() {
  return {
    owner: localStorage.getItem(LS_KEYS.owner) || DEFAULTS.owner,
    repo: localStorage.getItem(LS_KEYS.repo) || DEFAULTS.repo,
    branch: localStorage.getItem(LS_KEYS.branch) || DEFAULTS.branch,
  };
}

function repoBase() {
  const c = cfg();
  return `/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}`;
}

function ghMessage(status, body) {
  const msg = (body && body.message) || '';
  if (status === 401) return 'التوكن غير صحيح أو منتهي الصلاحية.';
  if (status === 403 && /rate limit/i.test(msg)) return 'وصلت الحد المسموح من الطلبات لدى GitHub. انتظر قليلًا وحاول مرة ثانية.';
  if (status === 403 || /resource not accessible/i.test(msg)) {
    return 'التوكن ما عنده الصلاحية المطلوبة — لازم Contents: Read and write على هذا المستودع.';
  }
  if (status === 404) return 'GitHub ما لقى المستودع أو الفرع أو الملف. تأكد من إعدادات المستودع ومن أن التوكن يخص هذا المستودع.';
  return msg || `خطأ من GitHub (${status}).`;
}

async function gh(path, opts) {
  const { method = 'GET', body, raw = false } = opts || {};
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) throw new AuthError('سجّل الدخول أولًا.');
  let res;
  try {
    res = await fetch('https://api.github.com' + path, {
      method,
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (_) {
    throw new Error('تعذر الاتصال بـ GitHub. تحقق من الإنترنت وحاول مرة ثانية.');
  }
  if (!res.ok) {
    let data = {};
    try {
      data = await res.json();
    } catch (_) {
      /* ignore */
    }
    if (res.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY);
      throw new AuthError(ghMessage(401, data));
    }
    const err = new Error(ghMessage(res.status, data));
    err.status = res.status;
    err.githubMessage = (data && data.message) || '';
    throw err;
  }
  if (raw) return res.text();
  return res.status === 204 ? null : res.json();
}

async function getHead() {
  const branch = cfg().branch;
  const ref = await gh(`${repoBase()}/git/ref/heads/${encPath(branch)}`);
  const commitSha = ref.object.sha;
  const commit = await gh(`${repoBase()}/git/commits/${commitSha}`);
  return { commitSha, treeSha: commit.tree.sha };
}

async function readJson(path, commitSha) {
  const text = await gh(`${repoBase()}/contents/${encPath(path)}?ref=${encodeURIComponent(commitSha)}`, { raw: true });
  let value;
  try {
    value = JSON.parse(text);
  } catch (_) {
    throw new Error(`الملف ${path} فيه خطأ بالتنسيق (JSON غير صالح). صلّحه من GitHub أولًا.`);
  }
  if (!Array.isArray(value)) throw new Error(`الملف ${path} ليس قائمة كما هو متوقع.`);
  return value;
}

async function filterExistingPaths(paths, treeSha) {
  if (!paths.length) return [];
  const t = await gh(`${repoBase()}/git/trees/${treeSha}?recursive=1`);
  if (t.truncated) return paths;
  const existing = new Set(t.tree.map((x) => x.path));
  return paths.filter((p) => existing.has(p));
}

/**
 * Commit ذري واحد: صور جديدة + products.json + categories.json + حذف صور يتيمة.
 * mutate({products, categories}) تُستدعى على أحدث نسخة من المستودع (تفادي الكتابة فوق تعديلات أخرى)
 * وترجع { products?, categories?, deletePaths? } أو ترمي Error.
 */
async function commitData({ message, images = [], mutate }) {
  const blobEntries = [];
  for (const img of images) {
    const blob = await gh(`${repoBase()}/git/blobs`, { method: 'POST', body: { content: img.base64, encoding: 'base64' } });
    blobEntries.push({ path: img.path, mode: '100644', type: 'blob', sha: blob.sha });
  }

  const branch = cfg().branch;
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    const head = await getHead();
    const [products, categories] = await Promise.all([
      readJson(PRODUCTS_PATH, head.commitSha),
      readJson(CATEGORIES_PATH, head.commitSha),
    ]);
    const result = mutate({ products, categories });

    const tree = [...blobEntries];
    if (result.products) tree.push({ path: PRODUCTS_PATH, mode: '100644', type: 'blob', content: toJson(result.products) });
    if (result.categories) tree.push({ path: CATEGORIES_PATH, mode: '100644', type: 'blob', content: toJson(result.categories) });
    const toDelete = await filterExistingPaths(result.deletePaths || [], head.treeSha);
    for (const p of toDelete) tree.push({ path: p, mode: '100644', type: 'blob', sha: null });

    const newTree = await gh(`${repoBase()}/git/trees`, { method: 'POST', body: { base_tree: head.treeSha, tree } });
    const commit = await gh(`${repoBase()}/git/commits`, {
      method: 'POST',
      body: { message, tree: newTree.sha, parents: [head.commitSha] },
    });
    try {
      await gh(`${repoBase()}/git/refs/heads/${encPath(branch)}`, { method: 'PATCH', body: { sha: commit.sha, force: false } });
      return {
        products: result.products || products,
        categories: result.categories || categories,
        sha: commit.sha,
        deleted: toDelete.length,
      };
    } catch (e) {
      // شخص/عملية ثانية سبقتنا بـ commit → نعيد المحاولة على أحدث نسخة
      if (e.status === 422 && /fast.?forward/i.test(e.githubMessage || '') && attempt < 2) {
        lastErr = e;
        continue;
      }
      throw e;
    }
  }
  throw lastErr || new Error('تعذر الحفظ بسبب تعديلات متزامنة. حاول مرة ثانية.');
}

// ---------------------------------------------------------------------------
// معالجة الصور
// ---------------------------------------------------------------------------
function loadImageEl(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('تعذر قراءة الصورة'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('تعذر قراءة الصورة'));
    reader.readAsDataURL(blob);
  });
}

async function processImage(file) {
  if (!/^image\//.test(file.type)) throw new Error(`«${file.name}» ليس ملف صورة.`);
  if (file.size > MAX_INPUT_MB * 1024 * 1024) throw new Error(`«${file.name}» أكبر من ${MAX_INPUT_MB}MB.`);
  let src;
  let w;
  let ht;
  try {
    src = await createImageBitmap(file, { imageOrientation: 'from-image' });
    w = src.width;
    ht = src.height;
  } catch (_) {
    try {
      src = await loadImageEl(file);
      w = src.naturalWidth;
      ht = src.naturalHeight;
    } catch (__) {
      throw new Error(`تعذر قراءة «${file.name}». جرّب صيغة JPG أو PNG.`);
    }
  }
  if (!w || !ht) throw new Error(`«${file.name}» صورة تالفة.`);
  const scale = Math.min(1, MAX_SIDE / Math.max(w, ht));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(ht * scale));
  const ctx = canvas.getContext('2d');
  ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
  if (src.close) src.close();

  let blob = await canvasToBlob(canvas, 'image/webp', 0.82);
  let ext = 'webp';
  if (!blob || blob.type !== 'image/webp') {
    // متصفح ما يدعم ترميز WebP → JPEG بخلفية بيضاء
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    blob = await canvasToBlob(canvas, 'image/jpeg', 0.85);
    ext = 'jpg';
  }
  if (!blob) throw new Error(`تعذر تحويل «${file.name}».`);
  return { kind: 'new', key: 'n' + randomSeed() + Date.now(), blob, ext, size: blob.size, name: file.name, previewUrl: URL.createObjectURL(blob) };
}

// ---------------------------------------------------------------------------
// الحالة
// ---------------------------------------------------------------------------
const state = {
  products: [],
  categories: [],
  tab: 'products',
  editing: null, // slug المنتج قيد التعديل
  images: [], // عناصر: {kind:'existing', url, key} | {kind:'new', blob, ext, size, previewUrl, key}
  slugTouched: false,
  slugSeed: randomSeed(),
  dirty: false,
  busy: false,
  filters: { q: '', cat: '', status: '' },
};

// ---------------------------------------------------------------------------
// أدوات DOM
// ---------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);

function h(tag, props, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.append(c);
  }
  return node;
}

let toastTimer;
function toast(content, type) {
  const t = $('toast');
  clearTimeout(toastTimer);
  if (!content) {
    t.hidden = true;
    return;
  }
  t.className = 'toast ' + (type || 'ok');
  t.replaceChildren(content);
  t.hidden = false;
  if (type === 'ok') toastTimer = setTimeout(() => (t.hidden = true), 9000);
}

function fmtKB(bytes) {
  return bytes >= 1024 * 1024 ? (bytes / 1024 / 1024).toFixed(1) + ' MB' : Math.max(1, Math.round(bytes / 1024)) + ' KB';
}

function openDialog({ title, content, okLabel = 'تأكيد', danger = false, validate, hideCancel = false }) {
  return new Promise((resolve) => {
    const dlg = $('dlg');
    const ok = $('dlgOk');
    const cancel = $('dlgCancel');
    $('dlgTitle').textContent = title;
    $('dlgBody').replaceChildren(content);
    $('dlgErr').textContent = '';
    ok.textContent = okLabel;
    ok.className = danger ? 'danger-solid' : 'primary';
    cancel.hidden = hideCancel;

    const finish = (val) => {
      ok.onclick = null;
      cancel.onclick = null;
      dlg.oncancel = null;
      $('dlgBody').onkeydown = null;
      if (dlg.open) dlg.close();
      resolve(val);
    };
    ok.onclick = () => {
      if (validate) {
        const msg = validate();
        if (msg) {
          $('dlgErr').textContent = msg;
          return;
        }
      }
      finish(true);
    };
    cancel.onclick = () => finish(false);
    dlg.oncancel = (e) => {
      e.preventDefault();
      finish(false);
    };
    $('dlgBody').onkeydown = (e) => {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        e.preventDefault();
        ok.click();
      }
    };
    dlg.showModal();
    const first = $('dlgBody').querySelector('input:not([disabled]),textarea,select');
    (first || (danger ? cancel : ok)).focus();
  });
}

function confirmAction(title, message, okLabel, danger) {
  return openDialog({ title, content: h('p', { text: message }), okLabel, danger });
}

// ---------------------------------------------------------------------------
// الدخول والجلسة
// ---------------------------------------------------------------------------
let idleTimer;
function resetIdle() {
  clearTimeout(idleTimer);
  if ($('app').hidden) return;
  idleTimer = setTimeout(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    if ($('dlg').open) $('dlg').close();
    showLogin('انتهت الجلسة لعدم النشاط (30 دقيقة). سجّل الدخول من جديد — ما كتبته بالنموذج محفوظ بالصفحة.');
  }, IDLE_MS);
}

function updateRepoLabel() {
  const c = cfg();
  $('repoLabel').textContent = `${c.owner}/${c.repo} @ ${c.branch}`;
}

function showLogin(message) {
  clearTimeout(idleTimer);
  const c = cfg();
  $('app').hidden = true;
  $('login').hidden = false;
  $('loginErr').textContent = message || '';
  $('l_owner').value = c.owner;
  $('l_repo').value = c.repo;
  $('l_branch').value = c.branch;
  $('l_token').value = '';
  $('l_token').focus();
}

function showApp() {
  $('login').hidden = true;
  $('app').hidden = false;
  updateRepoLabel();
  resetIdle();
}

async function verifyAndLoad() {
  const repo = await gh(repoBase());
  if (!repo.permissions || !repo.permissions.push) {
    throw new Error('هذا التوكن ما عنده صلاحية كتابة على المستودع — فعّل Contents: Read and write.');
  }
  await loadData();
}

async function onLogin(e) {
  e.preventDefault();
  const token = $('l_token').value.trim();
  const owner = $('l_owner').value.trim();
  const repo = $('l_repo').value.trim();
  const branch = $('l_branch').value.trim();
  const err = $('loginErr');
  err.textContent = '';
  if (!token) {
    err.textContent = 'الصق الـ GitHub Token أولًا.';
    return;
  }
  if (!/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo) || !/^[\w./-]+$/.test(branch)) {
    $('l_repoBox').open = true;
    err.textContent = 'إعدادات المستودع غير صحيحة (owner / repo / branch).';
    return;
  }
  localStorage.setItem(LS_KEYS.owner, owner);
  localStorage.setItem(LS_KEYS.repo, repo);
  localStorage.setItem(LS_KEYS.branch, branch);
  sessionStorage.setItem(TOKEN_KEY, token);
  const btn = $('loginBtn');
  btn.disabled = true;
  btn.textContent = 'جارٍ التحقق…';
  try {
    await verifyAndLoad();
    $('l_token').value = '';
    showApp();
    toast('', '');
  } catch (ex) {
    sessionStorage.removeItem(TOKEN_KEY);
    err.textContent = ex.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'دخول';
  }
}

async function onLogout() {
  if (state.dirty && !(await confirmAction('تسجيل الخروج', 'عندك تعديلات غير محفوظة بالنموذج. تبي تخرج وتتجاهلها؟', 'خروج', true))) return;
  state.dirty = false;
  sessionStorage.removeItem(TOKEN_KEY);
  location.reload();
}

function handleError(e) {
  if (e instanceof AuthError) {
    showLogin(e.message + ' سجّل الدخول من جديد.');
    return;
  }
  toast(e.message || 'صار خطأ غير متوقع.', 'error');
}

function setBusyUI(on) {
  $('app').classList.toggle('busy', on);
  $('app').setAttribute('aria-busy', String(on));
}

async function runBusy(label, fn) {
  if (state.busy) {
    toast('انتظر انتهاء العملية الحالية…', 'busy');
    return false;
  }
  state.busy = true;
  setBusyUI(true);
  try {
    if (label) toast(label, 'busy');
    return (await fn()) === false ? false : true;
  } catch (e) {
    handleError(e);
    return false;
  } finally {
    state.busy = false;
    setBusyUI(false);
  }
}

function publishedNote() {
  const c = cfg();
  return h(
    'span',
    null,
    'تم الحفظ ✓ — النشر التلقائي يأخذ دقيقة أو دقيقتين. ',
    h('a', { href: `https://github.com/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/actions`, target: '_blank', rel: 'noopener noreferrer', text: 'متابعة النشر' })
  );
}

// ---------------------------------------------------------------------------
// تحميل البيانات
// ---------------------------------------------------------------------------
async function loadData() {
  const head = await getHead();
  const [products, categories] = await Promise.all([
    readJson(PRODUCTS_PATH, head.commitSha),
    readJson(CATEGORIES_PATH, head.commitSha),
  ]);
  state.products = products;
  state.categories = categories;
  renderAll();
}

function categoryName(slug) {
  const c = state.categories.find((x) => x.slug === slug);
  return c ? c.name : `${slug} (محذوف)`;
}

// ---------------------------------------------------------------------------
// عرض: المنتجات
// ---------------------------------------------------------------------------
function fillCategorySelects() {
  const formSel = $('f_category');
  const filterSel = $('filterCat');
  const prevForm = formSel.value;
  const prevFilter = filterSel.value;
  formSel.replaceChildren(
    ...(state.categories.length ? [] : [h('option', { value: '', text: '— لا توجد تصنيفات —' })]),
    ...state.categories.map((c) => h('option', { value: c.slug, text: c.name }))
  );
  filterSel.replaceChildren(h('option', { value: '', text: 'كل التصنيفات' }), ...state.categories.map((c) => h('option', { value: c.slug, text: c.name })));
  if (state.categories.some((c) => c.slug === prevForm)) formSel.value = prevForm;
  if (state.categories.some((c) => c.slug === prevFilter)) filterSel.value = prevFilter;
  else state.filters.cat = '';
}

function matchesStatus(p, status) {
  switch (status) {
    case 'visible': return p.published && p.availability !== 'archived';
    case 'draft': return !p.published;
    case 'featured': return !!p.featured;
    case 'temporarily-unavailable': return p.availability === 'temporarily-unavailable';
    case 'archived': return p.availability === 'archived';
    default: return true;
  }
}

function filteredProducts() {
  const { q, cat, status } = state.filters;
  const query = q.trim().toLowerCase();
  return state.products.filter(
    (p) =>
      (!query || `${p.title} ${p.slug} ${categoryName(p.categorySlug)}`.toLowerCase().includes(query)) &&
      (!cat || p.categorySlug === cat) &&
      matchesStatus(p, status)
  );
}

function productRow(p) {
  const cover = (p.images || [])[0];
  const badges = h(
    'div',
    { class: 'badges' },
    !p.published && h('span', { class: 'badge draft', text: 'مسودة' }),
    p.featured && h('span', { class: 'badge feat', text: 'مميز' }),
    (p.availability === 'archived' || p.availability === 'temporarily-unavailable') && h('span', { class: 'badge off', text: availabilityLabel(p.availability) })
  );
  const visible = p.published && p.availability !== 'archived';
  return h(
    'div',
    { class: 'list-item' + (state.editing === p.slug ? ' is-editing' : '') },
    cover ? h('img', { class: 'thumb', src: cover, alt: '', loading: 'lazy' }) : h('div', { class: 'thumb-empty' }),
    h(
      'div',
      { class: 'meta' },
      h('strong', { text: p.title, title: p.title }),
      h('div', { class: 'line', text: `${categoryName(p.categorySlug)} · ${p.price} د.ك · ${availabilityLabel(p.availability)}` }),
      badges
    ),
    h(
      'div',
      { class: 'btns' },
      h('button', { type: 'button', class: 'small', text: 'تعديل', onclick: () => startEdit(p.slug) }),
      h('button', { type: 'button', class: 'small', text: 'نسخ', onclick: () => duplicateProduct(p.slug) }),
      h('button', { type: 'button', class: 'small', text: p.published ? 'إخفاء' : 'نشر', onclick: () => togglePublished(p.slug) }),
      visible && h('a', { href: `/products/${encodeURIComponent(p.slug)}/`, target: '_blank', rel: 'noopener', class: 'small-link', text: 'عرض' }),
      h('button', { type: 'button', class: 'small danger', text: 'حذف', onclick: () => deleteProduct(p.slug) })
    )
  );
}

function renderProducts() {
  const items = filteredProducts();
  $('countLabel').textContent = items.length === state.products.length ? String(state.products.length) : `${items.length} من ${state.products.length}`;
  const list = $('list');
  if (!items.length) {
    list.replaceChildren(h('p', { class: 'empty', text: state.products.length ? 'ما فيه منتجات مطابقة للبحث.' : 'ما أضفت أي منتج بعد — عبّي النموذج وابدأ.' }));
    return;
  }
  list.replaceChildren(...items.map(productRow));
}

// ---------------------------------------------------------------------------
// النموذج
// ---------------------------------------------------------------------------
const FIELD_INPUT = { title: 'f_title', slug: 'f_slug', category: 'f_category', price: 'f_price', size: 'f_size', region: 'f_region', description: 'f_description', images: 'f_images' };

function showErrors(errors) {
  for (const key of Object.keys(FIELD_INPUT)) {
    const msg = errors[key] || '';
    const errEl = $('e_' + key);
    if (errEl) errEl.textContent = msg;
    const input = $(FIELD_INPUT[key]);
    if (msg) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }
}

function releasePreviews(items) {
  for (const it of items) if (it.kind === 'new') URL.revokeObjectURL(it.previewUrl);
}

function updateAvailHelp() {
  const a = AVAILABILITY.find((x) => x.value === $('f_availability').value);
  $('availHelp').textContent = a ? a.help : '';
}

function updateShortCount() {
  $('shortCount').textContent = `${$('f_shortDescription').value.length}/160`;
}

function fillForm(p, opts) {
  const o = opts || {};
  releasePreviews(state.images);
  state.editing = o.editing ? p.slug : null;
  state.images = o.keepImages === false ? [] : (p.images || []).map((url, i) => ({ kind: 'existing', url, key: 'e' + i + url }));
  state.slugTouched = !!o.editing;
  state.slugSeed = randomSeed();
  $('f_title').value = p.title || '';
  $('f_slug').value = o.editing ? p.slug : '';
  $('f_slug').disabled = !!o.editing;
  $('f_category').value = p.categorySlug && state.categories.some((c) => c.slug === p.categorySlug) ? p.categorySlug : (state.categories[0] || {}).slug || '';
  $('f_price').value = p.price != null ? String(p.price) : '';
  $('f_size').value = p.size || '';
  $('f_region').value = p.region || 'الكويت';
  $('f_availability').value = p.availability || 'custom-order';
  $('f_shortDescription').value = p.shortDescription || '';
  $('f_description').value = p.description || '';
  $('f_materials').value = (p.materials || []).join('، ');
  $('f_featured').checked = !!p.featured;
  $('f_published').checked = p.published !== false;
  $('f_images').value = '';
  $('formTitle').textContent = o.editing ? 'تعديل: ' + p.title : 'إضافة منتج';
  $('cancelBtn').hidden = !(o.editing || o.duplicate);
  showErrors({});
  updateAvailHelp();
  updateShortCount();
  renderImages();
  renderProducts();
  state.dirty = !!o.duplicate;
}

function resetForm() {
  fillForm({ region: 'الكويت', availability: 'custom-order', published: true }, { editing: false, keepImages: false });
  state.dirty = false;
}

function readForm() {
  const title = $('f_title').value.trim();
  return {
    title,
    slug: state.editing || $('f_slug').value.trim(),
    categorySlug: $('f_category').value,
    price: parsePrice($('f_price').value),
    size: $('f_size').value.trim(),
    region: $('f_region').value.trim(),
    availability: $('f_availability').value,
    shortDescription: $('f_shortDescription').value.trim(),
    description: $('f_description').value.trim(),
    materials: parseMaterials($('f_materials').value),
    featured: $('f_featured').checked,
    published: $('f_published').checked,
    imageCount: state.images.length,
  };
}

async function confirmDiscard() {
  if (!state.dirty) return true;
  return confirmAction('تعديلات غير محفوظة', 'عندك تعديلات غير محفوظة بالنموذج. تبي تتجاهلها؟', 'تجاهل', true);
}

async function startEdit(slug) {
  const p = state.products.find((x) => x.slug === slug);
  if (!p || !(await confirmDiscard())) return;
  fillForm(p, { editing: true });
  state.dirty = false;
  setTab('products');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function duplicateProduct(slug) {
  const p = state.products.find((x) => x.slug === slug);
  if (!p || !(await confirmDiscard())) return;
  fillForm({ ...p, title: `${p.title} (نسخة)`, published: false }, { duplicate: true, keepImages: false });
  $('f_slug').value = autoSlug($('f_title').value, state.slugSeed);
  setTab('products');
  toast('تم نسخ البيانات كمسودة — الصور ما تنسخ، أضف صور المنتج الجديد.', 'busy');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------------------------------------------------------------------------
// الصور بالنموذج
// ---------------------------------------------------------------------------
function moveImage(i, delta) {
  const j = i + delta;
  if (j < 0 || j >= state.images.length) return;
  const arr = state.images;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  state.dirty = true;
  renderImages();
}

function removeImage(i) {
  const [gone] = state.images.splice(i, 1);
  if (gone) releasePreviews([gone]);
  state.dirty = true;
  renderImages();
}

function renderImages() {
  $('imgList').replaceChildren(
    ...state.images.map((it, i) =>
      h(
        'div',
        { class: 'img-card' },
        h('img', { src: it.kind === 'new' ? it.previewUrl : it.url, alt: '' }),
        i === 0 && h('span', { class: 'tag', text: 'الغلاف' }),
        it.kind === 'new' && h('span', { class: 'tag new', text: 'جديدة' }),
        it.kind === 'new' && h('div', { class: 'size', text: fmtKB(it.size) }),
        h(
          'div',
          { class: 'ctl' },
          h('button', { type: 'button', text: 'تقديم', disabled: i === 0, onclick: () => moveImage(i, -1) }),
          h('button', { type: 'button', text: 'تأخير', disabled: i === state.images.length - 1, onclick: () => moveImage(i, 1) }),
          h('button', { type: 'button', class: 'wide', text: 'حذف', onclick: () => removeImage(i) })
        )
      )
    )
  );
}

async function addFiles(fileList) {
  const files = Array.from(fileList || []).filter(Boolean);
  if (!files.length) return;
  const room = MAX_IMAGES - state.images.length;
  if (room <= 0) {
    toast(`وصلت الحد الأقصى (${MAX_IMAGES} صور).`, 'error');
    return;
  }
  const take = files.slice(0, room);
  const problems = [];
  if (files.length > room) problems.push(`تم تجاهل ${files.length - room} صورة (الحد الأقصى ${MAX_IMAGES}).`);
  for (let i = 0; i < take.length; i++) {
    toast(`جارٍ تجهيز الصورة ${i + 1} من ${take.length}…`, 'busy');
    try {
      state.images.push(await processImage(take[i]));
      state.dirty = true;
      renderImages();
    } catch (e) {
      problems.push(e.message);
    }
  }
  $('f_images').value = '';
  $('e_images').textContent = '';
  if (problems.length) toast(problems.join(' '), 'error');
  else toast('', '');
}

// ---------------------------------------------------------------------------
// حفظ / حذف / نشر المنتجات
// ---------------------------------------------------------------------------
function buildProduct(v, images) {
  return {
    slug: v.slug,
    title: v.title,
    categorySlug: v.categorySlug,
    price: v.price,
    size: v.size,
    region: v.region,
    availability: v.availability,
    shortDescription: v.shortDescription,
    description: v.description,
    materials: v.materials,
    images,
    featured: v.featured,
    published: v.published,
  };
}

async function saveProduct() {
  if (state.busy) return;
  const values = readForm();
  const errors = validateProduct(values, { products: state.products, categories: state.categories, editing: !!state.editing });
  showErrors(errors);
  const firstBad = Object.keys(FIELD_INPUT).find((k) => errors[k]);
  if (firstBad) {
    $(FIELD_INPUT[firstBad]).focus();
    toast('راجع الحقول المظللة بالأحمر.', 'error');
    return;
  }
  const isEdit = !!state.editing;
  await runBusy('جارٍ تجهيز الصور…', async () => {
    const stamp = Date.now().toString(36);
    const uploads = [];
    const finalUrls = [];
    for (let i = 0; i < state.images.length; i++) {
      const it = state.images[i];
      if (it.kind === 'existing') {
        finalUrls.push(it.url);
      } else {
        const path = `${IMAGES_DIR}/${values.slug}/${stamp}-${i}.${it.ext}`;
        uploads.push({ path, base64: await blobToBase64(it.blob) });
        finalUrls.push('/' + path.replace(/^public\//, ''));
      }
    }
    const original = isEdit ? (state.products.find((p) => p.slug === values.slug) || {}).images || [] : [];
    const removed = original.filter((u) => !finalUrls.includes(u));
    const product = buildProduct(values, finalUrls);

    toast('جارٍ الحفظ على GitHub (Commit واحد)…', 'busy');
    const result = await commitData({
      message: `${isEdit ? 'تعديل' : 'إضافة'} منتج: ${values.title}`,
      images: uploads,
      mutate: ({ products, categories }) => {
        if (!categories.some((c) => c.slug === product.categorySlug)) throw new Error('التصنيف المختار انحذف من مكان ثاني. حدّث الصفحة واختر تصنيفًا.');
        const idx = products.findIndex((p) => p.slug === product.slug);
        let next;
        if (isEdit) {
          if (idx < 0) throw new Error('هذا المنتج انحذف من مكان ثاني. حدّث الصفحة.');
          next = products.map((p, i) => (i === idx ? product : p));
        } else {
          if (idx >= 0) throw new Error('هذا الرابط المختصر صار مستخدمًا للتو بمنتج ثاني. غيّره.');
          next = [product, ...products];
        }
        return { products: next, deletePaths: orphanPaths(removed, next) };
      },
    });
    state.products = result.products;
    state.categories = result.categories;
    resetForm();
    renderAll();
    toast(publishedNote(), 'ok');
  });
}

async function deleteProduct(slug) {
  const p = state.products.find((x) => x.slug === slug);
  if (!p) return;
  const n = orphanPaths(p.images || [], state.products.filter((x) => x.slug !== slug)).length;
  const ok = await confirmAction(
    'حذف منتج',
    `حذف «${p.title}» نهائيًا من الموقع؟` + (n ? ` وتنحذف معه ${n} صورة من المستودع.` : ''),
    'حذف نهائي',
    true
  );
  if (!ok) return;
  await runBusy('جارٍ الحذف…', async () => {
    const result = await commitData({
      message: `حذف منتج: ${p.title}`,
      mutate: ({ products }) => {
        const gone = products.find((x) => x.slug === slug);
        const next = products.filter((x) => x.slug !== slug);
        return { products: next, deletePaths: gone ? orphanPaths(gone.images || [], next) : [] };
      },
    });
    state.products = result.products;
    state.categories = result.categories;
    if (state.editing === slug) resetForm();
    renderAll();
    toast(publishedNote(), 'ok');
  });
}

async function togglePublished(slug) {
  const p = state.products.find((x) => x.slug === slug);
  if (!p) return;
  const target = !p.published;
  await runBusy(target ? 'جارٍ النشر…' : 'جارٍ الإخفاء…', async () => {
    const result = await commitData({
      message: `${target ? 'نشر' : 'إخفاء'} منتج: ${p.title}`,
      mutate: ({ products }) => {
        if (!products.some((x) => x.slug === slug)) throw new Error('هذا المنتج انحذف من مكان ثاني. حدّث الصفحة.');
        return { products: products.map((x) => (x.slug === slug ? { ...x, published: target } : x)) };
      },
    });
    state.products = result.products;
    state.categories = result.categories;
    renderAll();
    toast(publishedNote(), 'ok');
  });
}

// ---------------------------------------------------------------------------
// التصنيفات
// ---------------------------------------------------------------------------
function categoryCount(slug) {
  return state.products.filter((p) => p.categorySlug === slug).length;
}

function renderCategories() {
  $('catCount').textContent = String(state.categories.length);
  const list = $('catList');
  if (!state.categories.length) {
    list.replaceChildren(h('p', { class: 'empty', text: 'ما فيه تصنيفات. أضف تصنيفًا لتقدر تضيف منتجات.' }));
    return;
  }
  list.replaceChildren(
    ...state.categories.map((c, i) => {
      const n = categoryCount(c.slug);
      return h(
        'div',
        { class: 'list-item' },
        h('div', { class: 'meta' }, h('strong', { text: c.name }), h('div', { class: 'line', dir: 'ltr', text: `${c.slug} · ${n} منتج` })),
        h(
          'div',
          { class: 'btns' },
          h('button', { type: 'button', class: 'small', text: 'تقديم', disabled: i === 0, onclick: () => moveCategory(c.slug, -1) }),
          h('button', { type: 'button', class: 'small', text: 'تأخير', disabled: i === state.categories.length - 1, onclick: () => moveCategory(c.slug, 1) }),
          h('button', { type: 'button', class: 'small', text: 'تعديل الاسم', onclick: () => editCategory(c.slug) }),
          h('button', { type: 'button', class: 'small danger', text: 'حذف', disabled: n > 0, title: n > 0 ? 'انقل المنتجات لتصنيف ثاني أو احذفها أولًا' : '', onclick: () => deleteCategory(c.slug) })
        )
      );
    })
  );
}

async function commitCategories(message, mutateCats) {
  return runBusy('جارٍ الحفظ…', async () => {
    const result = await commitData({
      message,
      mutate: ({ products, categories }) => ({ categories: mutateCats(categories, products) }),
    });
    state.products = result.products;
    state.categories = result.categories;
    renderAll();
    toast(publishedNote(), 'ok');
  });
}

async function addCategory() {
  const name = h('input', { id: 'c_name', maxlength: 60, autocomplete: 'off' });
  const slug = h('input', { id: 'c_slug', dir: 'ltr', maxlength: 60, autocomplete: 'off', placeholder: 'bedrooms' });
  let slugTouched = false;
  const seed = randomSeed();
  name.addEventListener('input', () => {
    if (!slugTouched) slug.value = autoSlug(name.value, seed).replace(/^product-/, 'category-');
  });
  slug.addEventListener('input', () => (slugTouched = true));
  const content = h('div', null, h('div', { class: 'field' }, h('label', { for: 'c_name', text: 'اسم التصنيف' }), name), h('div', { class: 'field' }, h('label', { for: 'c_slug', text: 'الرابط المختصر (لا يتغير بعد الإنشاء)' }), slug));
  const ok = await openDialog({
    title: 'إضافة تصنيف',
    content,
    okLabel: 'إضافة',
    validate: () => {
      if (!name.value.trim()) return 'اكتب اسم التصنيف.';
      if (!SLUG_RE.test(slug.value.trim())) return 'الرابط المختصر: حروف إنجليزية صغيرة وأرقام وشرطات فقط.';
      if (state.categories.some((c) => c.slug === slug.value.trim())) return 'هذا الرابط مستخدم بتصنيف ثاني.';
      return '';
    },
  });
  if (!ok) return;
  const entry = { slug: slug.value.trim(), name: name.value.trim() };
  await commitCategories(`إضافة تصنيف: ${entry.name}`, (cats) => {
    if (cats.some((c) => c.slug === entry.slug)) throw new Error('هذا الرابط صار مستخدمًا للتو بتصنيف ثاني.');
    return [...cats, entry];
  });
}

async function editCategory(slug) {
  const cat = state.categories.find((c) => c.slug === slug);
  if (!cat) return;
  const name = h('input', { id: 'c_name', maxlength: 60, autocomplete: 'off', value: cat.name });
  const content = h('div', null, h('div', { class: 'field' }, h('label', { for: 'c_name', text: 'اسم التصنيف' }), name), h('div', { class: 'help', dir: 'ltr', text: slug }));
  const ok = await openDialog({ title: 'تعديل التصنيف', content, okLabel: 'حفظ', validate: () => (name.value.trim() ? '' : 'اكتب اسم التصنيف.') });
  if (!ok) return;
  const newName = name.value.trim();
  if (newName === cat.name) return;
  await commitCategories(`تعديل تصنيف: ${newName}`, (cats) => {
    if (!cats.some((c) => c.slug === slug)) throw new Error('هذا التصنيف انحذف من مكان ثاني. حدّث الصفحة.');
    return cats.map((c) => (c.slug === slug ? { ...c, name: newName } : c));
  });
}

async function moveCategory(slug, delta) {
  await commitCategories('ترتيب التصنيفات', (cats) => {
    const i = cats.findIndex((c) => c.slug === slug);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= cats.length) return cats;
    const next = [...cats];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });
}

async function deleteCategory(slug) {
  const cat = state.categories.find((c) => c.slug === slug);
  if (!cat) return;
  if (!(await confirmAction('حذف تصنيف', `حذف التصنيف «${cat.name}»؟`, 'حذف', true))) return;
  await commitCategories(`حذف تصنيف: ${cat.name}`, (cats, products) => {
    if (products.some((p) => p.categorySlug === slug)) throw new Error('فيه منتجات ضمن هذا التصنيف. انقلها أو احذفها أولًا.');
    return cats.filter((c) => c.slug !== slug);
  });
}

// ---------------------------------------------------------------------------
// التبويبات والتشغيل
// ---------------------------------------------------------------------------
function setTab(tab) {
  state.tab = tab;
  for (const t of ['products', 'categories']) {
    $('tab-' + t).hidden = t !== tab;
    $('tabBtn-' + t).setAttribute('aria-selected', String(t === tab));
  }
}

function renderAll() {
  fillCategorySelects();
  renderProducts();
  renderCategories();
  updateRepoLabel();
}

function wire() {
  $('loginForm').addEventListener('submit', onLogin);
  $('logoutBtn').addEventListener('click', onLogout);
  $('refreshBtn').addEventListener('click', () => runBusy('جارٍ التحديث…', async () => { await loadData(); toast('تم التحديث.', 'ok'); }));
  document.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));
  $('addCatBtn').addEventListener('click', addCategory);

  $('f_availability').replaceChildren(...AVAILABILITY.map((a) => h('option', { value: a.value, text: a.label })));
  $('f_availability').addEventListener('change', updateAvailHelp);
  $('maxImgs').textContent = String(MAX_IMAGES);

  const form = $('productForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveProduct();
  });
  form.addEventListener('input', () => (state.dirty = true));
  form.addEventListener('change', () => (state.dirty = true));
  $('f_shortDescription').addEventListener('input', updateShortCount);
  $('f_title').addEventListener('input', (e) => {
    if (!state.editing && !state.slugTouched) $('f_slug').value = autoSlug(e.target.value, state.slugSeed);
  });
  $('f_slug').addEventListener('input', (e) => {
    state.slugTouched = true;
    e.target.value = e.target.value.toLowerCase().replace(/\s+/g, '-');
  });
  $('cancelBtn').addEventListener('click', async () => {
    if (await confirmDiscard()) {
      resetForm();
      toast('', '');
    }
  });

  $('f_images').addEventListener('change', (e) => addFiles(e.target.files));
  const dz = $('dropzone');
  ['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('drag'); }));
  dz.addEventListener('drop', (e) => addFiles(e.dataTransfer && e.dataTransfer.files));

  $('q').addEventListener('input', (e) => { state.filters.q = e.target.value; renderProducts(); });
  $('filterCat').addEventListener('change', (e) => { state.filters.cat = e.target.value; renderProducts(); });
  $('filterStatus').addEventListener('change', (e) => { state.filters.status = e.target.value; renderProducts(); });

  ['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, resetIdle, { passive: true }));
  window.addEventListener('beforeunload', (e) => {
    if (state.dirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

async function init() {
  localStorage.removeItem('mazuna_admin_pw_hash'); // بقايا كلمة المرور المحلية القديمة (ما عادت مستخدمة)
  wire();
  resetForm();
  if (sessionStorage.getItem(TOKEN_KEY)) {
    $('login').hidden = true;
    toast('جارٍ التحقق من الجلسة…', 'busy');
    try {
      await verifyAndLoad();
      showApp();
      toast('', '');
    } catch (e) {
      sessionStorage.removeItem(TOKEN_KEY);
      showLogin(e.message);
      toast('', '');
    }
  } else {
    showLogin('');
  }
}

if (typeof document !== 'undefined' && document.getElementById('login')) {
  init();
}
