import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://xyzbuyinghouse.com';
  const currentDate = new Date().toISOString();

  const routes = [
    '',
    '/about',
    '/services',
    '/products',
    '/capabilities',
    '/quality',
    '/compliance',
    '/sustainability',
    '/factories',
    '/insights',
    '/contact',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
