// docs-logic.ts - 文档与导航逻辑 (Unix style)

export interface DocModule { default: string; metadata?: Record<string, unknown> }
export interface Doc { slug: string; path: string; metadata: Record<string, unknown>; content: string }
export interface NavItem { title: string; href: string; order?: number }
export interface NavSection { title: string; items: NavItem[]; order: number }
export interface RouteResult<T> { status: number; data?: T; error?: Error }
export interface DocRouteData { content: string; metadata: Record<string, unknown> }
export interface HomeConfig { title: string; subtitle: string; primary: NavItem; secondary: NavItem; features: { title: string; desc: string; href: string; label: string; icon: string }[]; quickLinks?: { title: string; desc: string; href: string; icon: string }[]; aboutMarkdown?: { title: string; desc: string; repoUrl: string } }

// content loading
const mods = import.meta.glob<DocModule>('/src/content/**/*.md', { eager: true, query: '?raw' })

function all(): Doc[] {
  return Object.entries(mods).map(([p, m]) => ({
    slug: p.replace('/src/content/', '').replace('.md', ''),
    path: p,
    metadata: (m.metadata as Record<string, unknown>) || {},
    content: m.default
  }))
}

export function doc(slug: string): Doc | undefined { return all().find(d => d.slug === slug) }
export function docs(cat: string): Doc[] { return all().filter(d => d.slug.startsWith(cat + '/')) }

// title extraction
function slugTitle(f: string): string {
  return f.replace(/^\d+-/, '').replace(/^(start|core|native|advanced|performance|workflow|help|stdlib|client-libraries|api)-?/, '').replace(/[-_]/g, ' ')
    .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function docTitle(d: Doc): string {
  const m = d.metadata as { title?: string }
  if (m?.title) return m.title
  const f = d.slug.split('/').pop()
  return f && f.trim() ? slugTitle(f) : 'Untitled'
}

// config
const DOC_CATS: Record<string, { title: string; order: number; pfx: string[] }> = {
  'getting-started': { title: 'Getting Started', order: 1, pfx: ['start-'] },
  'core-concepts': { title: 'Core Concepts', order: 2, pfx: ['core-', 'control-'] },
  'native-integration': { title: 'Native Integration', order: 3, pfx: ['native-'] },
  navigation: { title: 'Navigation', order: 4, pfx: ['navigation'] },
  'client-libraries': { title: 'Client Libraries', order: 5, pfx: ['client-libraries-', 'advanced-protobuf'] },
  'standard-library': { title: 'Standard Library', order: 6, pfx: ['stdlib-', 'glossary'] },
  advanced: { title: 'Advanced Topics', order: 7, pfx: ['advanced-'] },
  performance: { title: 'Performance', order: 8, pfx: ['performance-'] },
  workflow: { title: 'Workflow', order: 9, pfx: ['workflow-', 'command-line'] },
  misc: { title: 'Misc', order: 10, pfx: ['third-party', 'faq'] },
  help: { title: 'Help', order: 11, pfx: ['help-'] }
}

const API_SECTS: Record<string, { title: string; order: number }> = {
  'api-quick-reference': { title: 'Quick Reference', order: 1 },
  'api-reference-elements': { title: 'Elements', order: 2 },
  'api-style-attributes': { title: 'Style Attributes', order: 3 }
}

const LAB_SECTS: Record<string, { title: string; order: number }> = {
  getting_started: { title: 'Getting Started', order: 1 },
  advanced_ui: { title: 'Advanced UI', order: 2 },
  integration_with_native: { title: 'Integration with Native', order: 3 },
  shared_business_logic: { title: 'Shared Business Logic', order: 4 }
}

// nav builder
function buildNav(ds: Doc[], cats: Record<string, { title: string; order: number; pfx?: string[] }>, mapper: (d: Doc) => string): NavSection[] {
  const g = new Map<string, Doc[]>()
  for (const d of ds) {
    const k = mapper(d)
    if (!g.has(k)) g.set(k, [])
    g.get(k)!.push(d)
  }
  return [...g].map(([k, items]) => ({
    title: cats[k]?.title || k,
    order: cats[k]?.order || 99,
    items: items.map(d => ({ title: docTitle(d), href: '/' + d.slug })).sort((a, b) => a.title.localeCompare(b.title))
  })).sort((a, b) => a.order - b.order)
}

export function docsNav(): NavSection[] {
  return buildNav(docs('docs'), DOC_CATS as any, f => {
    const fn = f.slug.replace('docs/', '')
    if (fn === 'advanced-protobuf') return 'client-libraries'
    const cat = Object.entries(DOC_CATS).find(([, c]) => c.pfx.some(p => fn.startsWith(p)))
    return cat?.[0] || 'misc'
  })
}

export function apiNav(): NavSection[] {
  return buildNav(docs('api'), API_SECTS as any, d => d.slug.replace('api/', ''))
}

export function labsNav(): NavSection[] {
  return buildNav(docs('codelabs'), LAB_SECTS as any, (d): string => {
    const p = d.slug.replace('codelabs/', '').split('/')
    return p.length >= 2 ? p[0]! : 'general'
  })
}

export function nav() { return { docs: docsNav(), api: apiNav(), codelabs: labsNav() } }

export function route(slug: string): RouteResult<DocRouteData> {
  try {
    const d = doc(slug)
    if (!d) return { status: 404, error: new Error('Not found') }
    return { status: 200, data: { content: d.content, metadata: d.metadata || {} } }
  } catch (e) { return { status: 500, error: e instanceof Error ? e : new Error('Unknown') } }
}

export const HOME: HomeConfig = {
  title: 'Valdi Documentation',
  subtitle: 'Learn how to build cross-platform applications with Valdi',
  primary: { title: 'Get Started', href: '/docs/start-introduction' },
  secondary: { title: 'API Reference', href: '/api/api-quick-reference' },
  quickLinks: [
    { title: 'Getting Started', desc: 'Installation & first app', href: '/docs/start-install', icon: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a.75.75 0 01.75.75v5.69l1.22-1.22a.75.75 0 111.06 1.06l-2.5 2.5a.75.75 0 01-1.06 0l-2.5-2.5a.75.75 0 111.06-1.06l1.22 1.22V1.75A.75.75 0 018 1zM1.75 8a.75.75 0 01.75.75v3.75a.75.75 0 00.75.75h8.5a.75.75 0 00.75-.75v-3.75a.75.75 0 011.5 0v3.75A2.25 2.25 0 0111.75 16h-8.5A2.25 2.25 0 011 13.75v-3.75A.75.75 0 011.75 8z"/></svg>' },
    { title: 'Core Concepts', desc: 'Components, state & more', href: '/docs/core-component', icon: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M6.47 3.22a.75.75 0 011.06 0L10 5.94l2.47-2.72a.75.75 0 111.06 1.06L10 8.06l-3.47-3.78a.75.75 0 010-1.06z"/></svg>' },
    { title: 'Native Integration', desc: 'iOS & Android APIs', href: '/docs/native-bindings', icon: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 5.5a3 3 0 013-3h1v11.5a2 5 0 01-2 2H6.5a2 5 0 01-2-2V5.5zm3 5a2 2 0 100-4 2 2 0 000 4zm3-2a1 1 0 11-2 0 1 1 0 012 0z"/></svg>' },
    { title: 'API Reference', desc: 'Complete element docs', href: '/api/api-quick-reference', icon: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 1.5A1.5 1.5 0 013 3h10a1.5 1.5 0 011.5 1.5v10a1.5 1.5 0 01-1.5 1.5H3a1.5 1.5 0 01-1.5-1.5V1.5zM3 2h10a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V4a2 2 0 012-2z"/></svg>' }
  ],
  features: [
    { title: 'Comprehensive Docs', desc: 'In-depth guides covering all aspects of Valdi development, from basics to advanced patterns.', href: '/docs/start-introduction', label: 'Browse docs', icon: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 1.5A1.5 1.5 0 013 3h10a1.5 1.5 0 011.5 1.5v10a1.5 1.5 0 01-1.5 1.5H3a1.5 1.5 0 01-1.5-1.5V1.5zM3 2h10a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V4a2 2 0 012-2z"/></svg>' },
    { title: 'Hands-on Codelabs', desc: 'Step-by-step tutorials where you build real features and learn by doing.', href: '/codelabs/getting_started/1-introduction', label: 'Start codelabs', icon: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a.75.75 0 01.75.75v5.69l1.22-1.22a.75.75 0 111.06 1.06l-2.5 2.5a.75.75 0 01-1.06 0l-2.5-2.5a.75.75 0 111.06-1.06l1.22 1.22V1.75A.75.75 0 018 1z"/></svg>' },
    { title: 'Complete API Reference', desc: 'Detailed documentation for all elements, attributes, and standard library APIs.', href: '/api/api-quick-reference', label: 'View API', icon: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 1.5A1.5 1.5 0 013 3h10a1.5 1.5 0 011.5 1.5v10a1.5 1.5 0 01-1.5 1.5H3a1.5 1.5 0 01-1.5-1.5V1.5zM3 2h10a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V4a2 2 0 012-2z"/></svg>' }
  ],
  aboutMarkdown: {
    title: 'About Valdi Docs',
    desc: 'This is the web documentation for Valdi (formerly Snap Layout), built by the community for better accessibility, searchability, and offline support. Fast, beautiful, and always available.',
    repoUrl: 'https://github.com/EvilIrving/valdi-docs'
  }
}
