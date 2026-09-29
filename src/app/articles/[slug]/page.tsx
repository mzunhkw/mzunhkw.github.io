import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { articles, getArticle } from '@/data/articles';
import { siteConfig } from '@/data/site-config';
import ArticlePage from '@/components/ArticlePage';

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = getArticle(params.slug);
  if (!a) return {};
  return {
    title: { absolute: a.title },
    description: a.description,
    alternates: { canonical: a.path },
    openGraph: {
      title: a.title,
      description: a.description,
      url: a.path,
      siteName: siteConfig.name,
      locale: 'ar_KW',
      type: 'article',
      publishedTime: a.datePublished,
      modifiedTime: a.dateModified,
      images: ['/og-image.jpg'],
    },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const a = getArticle(params.slug);
  if (!a) notFound();
  return <ArticlePage article={a} />;
}
