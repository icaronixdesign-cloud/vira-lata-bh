import type { MetadataRoute } from 'next';
import { SITE } from '@/content/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/cardapio', '/latas', '/o-bar', '/parede', '/visite', '/imprensa', '/privacidade'].map((caminho) => ({
    url: `${SITE.url}${caminho}`,
    changeFrequency: caminho === '/cardapio' ? 'weekly' : 'monthly',
    priority: caminho === '' ? 1 : 0.8,
  }));
}
