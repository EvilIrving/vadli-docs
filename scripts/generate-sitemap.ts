// Script to generate sitemap.xml for SEO
import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { glob } from 'glob'

const SITE_URL = 'https://valdi-docs.onecat.dev'

// Import document modules to get all available routes
const docModulesPath = './src/content'

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

// Read all markdown files from content directory
async function getAllDocumentPaths() {
  const files = await glob('src/content/**/*.md')

  return files.map(file => {
    // Convert file path to URL path
    const path = file
      .replace('src/content/', '')
      .replace('.md', '')
    return `/${path}`
  })
}

function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map(url => {
      return `  <url>
    <loc>${url.loc}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority ? `\n    <priority>${url.priority}</priority>` : ''}
  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`
}

async function generateSitemap() {
  const urls: SitemapUrl[] = []
  const now = new Date().toISOString().split('T')[0]

  // Add homepage
  urls.push({
    loc: SITE_URL,
    lastmod: now,
    changefreq: 'weekly',
    priority: 1.0
  })

  // Get all document paths
  const docPaths = await getAllDocumentPaths()

  // Add document pages
  for (const path of docPaths) {
    const url = `${SITE_URL}${path}`

    // Determine priority based on path
    let priority = 0.7
    if (path.includes('/docs/start-')) {
      priority = 0.9 // Getting started pages are high priority
    } else if (path.includes('/api/')) {
      priority = 0.8 // API reference is important
    } else if (path.includes('/codelabs/')) {
      priority = 0.8 // Code labs are important
    }

    urls.push({
      loc: url,
      lastmod: now,
      changefreq: 'weekly',
      priority
    })
  }

  const sitemapXml = generateSitemapXml(urls)

  // Write sitemap to public directory
  const outputPath = resolve(process.cwd(), 'public', 'sitemap.xml')
  writeFileSync(outputPath, sitemapXml, 'utf-8')

  console.log(`✅ Sitemap generated with ${urls.length} URLs`)
  console.log(`📝 Output: ${outputPath}`)
}

// Run the generator
generateSitemap().catch(console.error)
