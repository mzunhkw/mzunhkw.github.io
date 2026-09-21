# SEO PHASE 2 — Implementation Guide

## Objective
Phase 2 converts the approved keyword map into indexable commercial landing pages and a stronger internal-linking structure.

## Detected project structure
- App/Page route files detected: 0
- Component files detected: 5

## Service landing pages
Create these independent routes using the project's existing routing/components:

1. `/تنجيد-كنب-الكويت/`
   - Target: تنجيد كنب، تنجيد كنب الكويت، تجديد كنب، تغيير قماش كنب
2. `/تنجيد-مساند-الكويت/`
   - Target: تنجيد مساند، تنجيد مساند الكويت، مساند مجالس، مساند ظهر
3. `/تنجيد-مجالس-الكويت/`
   - Target: تنجيد مجالس، تنجيد مجالس الكويت، تجديد مجالس، تغيير قماش مجالس

## Core category pages — قرار: لن تُنشأ (Superseded)
تقرر عدم إنشاء هذه الروابط كصفحات مستقلة. صفحات `/category/<slug>/` الموجودة فعليًا في المشروع تستهدف نفس الكلمات، وإنشاء صفحة ثانية بنفس الكلمة يعني Duplicate Content/Cannibalization (ممنوع بنص الخطة، القسم 8 و13). قرار المالك — راجع `seo-services/PHASE-2-URL-MAP.json` (`categories_superseded_by_existing_routes`) للتفاصيل والربط بالروابط الفعلية:
- كنب الكويت → `/category/sofas/`
- قنفات الكويت → `/category/sofas/`
- مجالس الكويت → `/category/majlis/`
- مساند الكويت → `/category/cushions/`
- غرف نوم الكويت → `/category/bedrooms/`

## On-page requirements
Each commercial page must have:
- Unique title and meta description.
- One clear H1.
- Descriptive H2 sections.
- Original product/service copy.
- Real images with useful alt text.
- Clear CTA.
- FAQ visible on the page if FAQ structured data is used.
- Breadcrumb.
- Internal links to parent/related pages.
- Canonical URL.

## Internal linking map

Homepage
→ كنب
→ قنفات
→ مجالس
→ مساند
→ غرف نوم
→ خدمات التنجيد

كنب
→ تنجيد كنب
→ قنفات
→ مجالس
→ مساند

مجالس
→ تنجيد مجالس
→ تنجيد مساند
→ مساند

Product/service pages
→ parent category
→ related service
→ contact/WhatsApp

## Schema
Use schema only where the visible page content supports it:
- Organization/LocalBusiness
- BreadcrumbList
- Product/Offer on real product pages
- FAQPage for visible FAQs

## Technical checklist
- Sitemap includes only canonical indexable URLs.
- Robots does not block important pages.
- No accidental noindex on commercial routes.
- No duplicate title/meta.
- 404 links removed.
- Images compressed and have dimensions.
- Mobile layout checked.
- Canonical and Open Graph URLs match production URLs.

## Content rule
Do not create pages solely for spelling variants:
- كنب / كنبات / كنفات should normally share one intent page.
- Similar variants should be incorporated naturally.

## Phase 2 completion criteria
A service page is complete only when:
1. It is a real route in the site's router.
2. It has unique SEO metadata.
3. It renders useful content.
4. It is linked internally.
5. It appears in the sitemap.
6. It has appropriate schema.
7. It passes build/type checks.
