export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin',
    },
    sitemap: 'https://www.fairplayvidadeportiva.com.ar/sitemap.xml',
  };
}
