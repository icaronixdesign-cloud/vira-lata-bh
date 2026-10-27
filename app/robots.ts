import type { MetadataRoute } from 'next';
import { MODO, SITE } from '@/content/site';

export default function robots(): MetadataRoute.Robots {
  if (MODO === 'pitch') return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/', disallow: ['/lab'] }, sitemap: `${SITE.url}/sitemap.xml` };
}
