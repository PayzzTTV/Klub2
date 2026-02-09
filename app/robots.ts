import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/bde/dashboard',
        '/orga/dashboard',
        '/rental/manage',
        '/settings',
        '/profile',
        '/feedback/*',
      ],
    },
    sitemap: 'https://klub.app/sitemap.xml',
  };
}
