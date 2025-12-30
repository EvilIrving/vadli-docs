// seo.ts - SEO utility functions (Unix style)

export interface SeoMetaData {
  title?: string
  description?: string
  keywords?: string
  author?: string
  ogType?: string
  ogImage?: string
  twitterCard?: 'summary' | 'summary_large_image'
  canonical?: string
  robots?: string
}

const DEFAULT: SeoMetaData = {
  title: 'Valdi Documentation - Cross-Platform App Development Framework',
  description: 'Comprehensive documentation for Valdi, a powerful framework for building cross-platform applications. Learn core concepts, API references, and step-by-step tutorials.',
  keywords: 'Valdi, cross-platform, mobile development, native integration, app framework, documentation, API reference',
  author: 'Valdi',
  ogType: 'website',
  ogImage: 'https://valdi-docs.onecat.dev/og-image.png',
  twitterCard: 'summary_large_image',
  robots: 'index, follow'
}

const SITE_URL = 'https://valdi-docs.onecat.dev'

function setTag(attr: 'name' | 'property', key: string, val: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', val)
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

export function setMeta(m: SeoMetaData) {
  const c = { ...DEFAULT, ...m }
  c.title && (document.title = c.title, ['title', 'og:title', 'twitter:title'].forEach(k => setTag('name', k, c.title!)))
  c.description && (document.title = c.description, ['description', 'og:description', 'twitter:description'].forEach(k => setTag('name', k, c.description!)))
  c.keywords && setTag('name', 'keywords', c.keywords)
  c.author && setTag('name', 'author', c.author)
  c.ogType && setTag('property', 'og:type', c.ogType)
  c.ogImage && (setTag('property', 'og:image', c.ogImage), setTag('name', 'twitter:image', c.ogImage))
  c.twitterCard && setTag('name', 'twitter:card', c.twitterCard)
  c.robots && setTag('name', 'robots', c.robots)
  c.canonical && (setLink('canonical', c.canonical), setTag('property', 'og:url', c.canonical), setTag('name', 'twitter:url', c.canonical))
}

export function docMeta(cat: string, slug: string, title: string, content?: string): SeoMetaData {
  const url = `${SITE_URL}/${cat}/${slug}`
  let desc = DEFAULT.description
  if (content) {
    const plain = content.replace(/[#*`]/g, '').trim()
    const para = plain.split('\n').find(l => l.length > 20)
    if (para) desc = para.substring(0, 157) + '...'
  }
  const catName = cat.charAt(0).toUpperCase() + cat.slice(1)
  return {
    title: `${title} - ${catName} | Valdi Documentation`,
    description: desc,
    keywords: `${title.toLowerCase()}, Valdi ${cat}, ${DEFAULT.keywords}`,
    canonical: url,
    ogType: 'article',
    ogImage: `${SITE_URL}/og-image.png`,
    twitterCard: 'summary_large_image'
  }
}

export function setJsonLd(data: object) {
  const existing = document.querySelector('script[type="application/ld+json"]')
  if (existing) existing.remove()
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

export function crumbData(path: string): object {
  const parts = path.split('/').filter(Boolean)
  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL }]
  let cur = ''
  parts.forEach((p, i) => {
    cur += `/${p}`
    items.push({ '@type': 'ListItem', position: i + 2, name: p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '), item: `${SITE_URL}${cur}` })
  })
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items }
}

export function articleData(title: string, desc: string, url: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description: desc,
    url,
    publisher: { '@type': 'Organization', name: 'Valdi', url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url }
  }
}
