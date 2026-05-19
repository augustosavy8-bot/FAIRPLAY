export default function sitemap() {
  return [
    {
      url: 'https://www.fairplayvidadeportiva.com.ar',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://www.fairplayvidadeportiva.com.ar/admin',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.1,
    },
  ];
}
