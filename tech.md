# Vadli 文档网站技术方案

使用 SvelteKit 将 Markdown 文档转换为静态网站。

## 技术栈

- **SvelteKit**: 现代前端框架，支持静态站点生成
- **mdsvex**: Markdown 预处理器，支持在 Svelte 中使用 Markdown
- **shiki**: 代码高亮
- **remark-gfm**: GitHub 风格 Markdown 支持
- **rehype-slug/autolink-headings**: 自动生成标题锚点

## 实现步骤

### 1. 初始化 SvelteKit 项目

```bash
# 在项目根目录执行
pnpm create svelte@latest website
cd website
pnpm install
```

### 2. 安装依赖

```bash
pnpm add mdsvex shiki unified remark-gfm rehype-slug rehype-autolink-headings
pnpm add -D @types/node
```

### 3. 配置 mdsvex

创建 `website/svelte.config.js`：

```javascript
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.md'],
	remarkPlugins: [remarkGfm],
	rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings]
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		prerender: {
			handleHttpError: 'warn'
		}
	}
};

export default config;
```

### 4. 项目目录结构

```
vadli-docs/
├── api/                    # 原有文档（保留）
├── codelabs/
├── docs/
├── setup/
└── website/                # 新的 SvelteKit 网站
    ├── src/
    │   ├── content/        # 复制的 md 文件
    │   │   ├── api/
    │   │   ├── codelabs/
    │   │   ├── docs/
    │   │   └── setup/
    │   ├── lib/
    │   │   ├── docs.js
    │   │   └── components/
    │   │       ├── Sidebar.svelte
    │   │       └── Navigation.svelte
    │   └── routes/
    │       ├── +layout.svelte
    │       ├── +page.svelte
    │       └── docs/
    │           └── [...slug]/
    │               ├── +page.js
    │               └── +page.svelte
    ├── svelte.config.js
    └── package.json
```

### 5. 创建文档加载工具

创建 `website/src/lib/docs.js`：

```javascript
const docModules = import.meta.glob('/src/content/**/*.md', { eager: true });

export function getAllDocs() {
	const docs = [];
	
	for (const [path, module] of Object.entries(docModules)) {
		const slug = path
			.replace('/src/content/', '')
			.replace('.md', '');
		
		docs.push({
			slug,
			path,
			metadata: module.metadata || {},
			component: module.default
		});
	}
	
	return docs;
}

export function getDocBySlug(slug) {
	const docs = getAllDocs();
	return docs.find(doc => doc.slug === slug);
}

export function getDocsByCategory(category) {
	const docs = getAllDocs();
	return docs.filter(doc => doc.slug.startsWith(category + '/'));
}
```

### 6. 创建动态路由

创建 `website/src/routes/docs/[...slug]/+page.js`：

```javascript
export async function load({ params }) {
	const slug = params.slug;
	
	try {
		const doc = await import(`../../../content/${slug}.md`);
		return {
			content: doc.default,
			metadata: doc.metadata || {}
		};
	} catch (e) {
		return {
			status: 404,
			error: new Error('Document not found')
		};
	}
}
```

创建 `website/src/routes/docs/[...slug]/+page.svelte`：

```svelte
<script>
	export let data;
</script>

<svelte:head>
	<title>{data.metadata?.title || 'Documentation'} - Vadli Docs</title>
</svelte:head>

<article class="prose prose-lg max-w-none">
	<svelte:component this={data.content} />
</article>
```

### 7. 创建侧边栏导航

创建 `website/src/lib/components/Sidebar.svelte`：

```svelte
<script>
	export let currentPath = '';
	
	const navigation = [
		{
			title: 'Getting Started',
			items: [
				{ title: 'Introduction', href: '/docs/docs/start-introduction' },
				{ title: 'Installation', href: '/docs/docs/start-install' },
				{ title: 'About', href: '/docs/docs/start-about' }
			]
		},
		{
			title: 'Core Concepts',
			items: [
				{ title: 'Components', href: '/docs/docs/core-component' },
				{ title: 'States', href: '/docs/docs/core-states' },
				{ title: 'Events', href: '/docs/docs/core-events' },
				{ title: 'Styling', href: '/docs/docs/core-styling' }
			]
		},
		{
			title: 'API Reference',
			items: [
				{ title: 'Quick Reference', href: '/docs/api/api-quick-reference' },
				{ title: 'Elements', href: '/docs/api/api-reference-elements' },
				{ title: 'Style Attributes', href: '/docs/api/api-style-attributes' }
			]
		},
		{
			title: 'Code Labs',
			items: [
				{ title: 'Getting Started', href: '/docs/codelabs/getting_started/1-introduction' },
				{ title: 'Advanced UI', href: '/docs/codelabs/advanced_ui/1-setup' }
			]
		}
	];
</script>

<nav class="sidebar">
	{#each navigation as section}
		<div class="section">
			<h3>{section.title}</h3>
			<ul>
				{#each section.items as item}
					<li>
						<a 
							href={item.href} 
							class:active={currentPath === item.href}
						>
							{item.title}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</nav>

<style>
	.sidebar {
		width: 250px;
		padding: 1rem;
		border-right: 1px solid #e5e7eb;
		height: 100vh;
		overflow-y: auto;
		position: sticky;
		top: 0;
	}
	
	.section {
		margin-bottom: 1.5rem;
	}
	
	h3 {
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		margin-bottom: 0.5rem;
		text-transform: uppercase;
	}
	
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	
	li a {
		display: block;
		padding: 0.375rem 0.75rem;
		color: #6b7280;
		text-decoration: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}
	
	li a:hover {
		color: #111827;
		background-color: #f3f4f6;
	}
	
	li a.active {
		color: #2563eb;
		background-color: #eff6ff;
	}
</style>
```

### 8. 创建主布局

创建 `website/src/routes/+layout.svelte`：

```svelte
<script>
	import { page } from '$app/stores';
	import Sidebar from '$lib/components/Sidebar.svelte';
</script>

<div class="layout">
	<header>
		<div class="logo">
			<a href="/">Vadli Docs</a>
		</div>
		<nav class="top-nav">
			<a href="/docs/docs/start-introduction">Docs</a>
			<a href="/docs/api/api-quick-reference">API</a>
			<a href="/docs/codelabs/getting_started/1-introduction">Tutorials</a>
		</nav>
	</header>
	
	<div class="main-container">
		<Sidebar currentPath={$page.url.pathname} />
		<main>
			<slot />
		</main>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}
	
	.layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
	
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 2rem;
		border-bottom: 1px solid #e5e7eb;
		background: white;
		position: sticky;
		top: 0;
		z-index: 100;
	}
	
	.logo a {
		font-size: 1.25rem;
		font-weight: 700;
		color: #111827;
		text-decoration: none;
	}
	
	.top-nav {
		display: flex;
		gap: 2rem;
	}
	
	.top-nav a {
		color: #6b7280;
		text-decoration: none;
	}
	
	.top-nav a:hover {
		color: #111827;
	}
	
	.main-container {
		display: flex;
		flex: 1;
	}
	
	main {
		flex: 1;
		padding: 2rem 3rem;
		max-width: 900px;
	}
</style>
```

### 9. 创建首页

创建 `website/src/routes/+page.svelte`：

```svelte
<svelte:head>
	<title>Vadli Documentation</title>
</svelte:head>

<div class="hero">
	<h1>Vadli Documentation</h1>
	<p>Learn how to build cross-platform applications with Vadli</p>
	
	<div class="actions">
		<a href="/docs/docs/start-introduction" class="btn primary">Get Started</a>
		<a href="/docs/api/api-quick-reference" class="btn secondary">API Reference</a>
	</div>
</div>

<div class="features">
	<div class="feature">
		<h3>📚 Documentation</h3>
		<p>Comprehensive guides covering all aspects of Vadli development.</p>
		<a href="/docs/docs/start-introduction">Read the docs →</a>
	</div>
	
	<div class="feature">
		<h3>🧪 Code Labs</h3>
		<p>Step-by-step tutorials to help you learn by doing.</p>
		<a href="/docs/codelabs/getting_started/1-introduction">Start learning →</a>
	</div>
	
	<div class="feature">
		<h3>📖 API Reference</h3>
		<p>Detailed API documentation for all elements and attributes.</p>
		<a href="/docs/api/api-quick-reference">View API →</a>
	</div>
</div>

<style>
	.hero {
		text-align: center;
		padding: 4rem 2rem;
	}
	
	h1 {
		font-size: 3rem;
		margin-bottom: 1rem;
	}
	
	.hero p {
		font-size: 1.25rem;
		color: #6b7280;
		margin-bottom: 2rem;
	}
	
	.actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}
	
	.btn {
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		text-decoration: none;
		font-weight: 500;
	}
	
	.btn.primary {
		background: #2563eb;
		color: white;
	}
	
	.btn.secondary {
		background: #f3f4f6;
		color: #374151;
	}
	
	.features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}
	
	.feature {
		padding: 1.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
	}
	
	.feature h3 {
		margin-top: 0;
	}
	
	.feature a {
		color: #2563eb;
		text-decoration: none;
	}
</style>
```

### 10. 复制文档内容

```bash
# 将原有的 markdown 文件复制到 content 目录
mkdir -p website/src/content
cp -r docs website/src/content/
```

### 11. 运行开发服务器

```bash
cd website
pnpm dev
```

## 功能特性

- ✅ Markdown 渲染与代码高亮
- ✅ GitHub 风格 Markdown 支持（表格、任务列表等）
- ✅ 自动生成标题锚点链接
- ✅ 侧边栏导航
- ✅ 响应式布局
- ✅ 静态站点生成
- ✅ 可部署到 GitHub Pages、Vercel、Netlify 等

## 部署

### 构建静态站点

```bash
cd website
pnpm build
```

 