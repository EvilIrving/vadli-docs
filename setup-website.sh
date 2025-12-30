#!/bin/bash

# Valdi 文档网站初始化脚本
# 使用 pnpm 作为包管理器

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEBSITE_DIR="$SCRIPT_DIR/website"

echo "=========================================="
echo "  Valdi 文档网站初始化"
echo "=========================================="

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    echo "错误: pnpm 未安装，请先安装 pnpm"
    echo "安装命令: npm install -g pnpm"
    exit 1
fi

# 步骤 1: 创建 SvelteKit 项目
echo ""
echo "[1/5] 创建 SvelteKit 项目..."
if [ -d "$WEBSITE_DIR" ]; then
    echo "website 目录已存在，跳过创建"
else
    cd "$SCRIPT_DIR"
    pnpm create svelte@latest website --template skeleton --types typescript --no-add-ons --no-install
fi

# 步骤 2: 安装基础依赖
echo ""
echo "[2/5] 安装依赖..."
cd "$WEBSITE_DIR"
pnpm install

# 步骤 3: 安装 Markdown 相关依赖
echo ""
echo "[3/5] 安装 Markdown 处理依赖..."
pnpm add mdsvex shiki unified remark-gfm rehype-slug rehype-autolink-headings
pnpm add -D @types/node @sveltejs/adapter-static

# 步骤 4: 创建目录结构
echo ""
echo "[4/5] 创建目录结构..."
mkdir -p src/content
mkdir -p src/lib/components
mkdir -p src/routes/docs/\[...slug\]

# 步骤 5: 复制文档内容
echo ""
echo "[5/5] 复制文档内容..."
cp -r "$SCRIPT_DIR/docs" src/content/
# 创建配置文件
echo ""
echo "创建配置文件..."

# svelte.config.js
cat > svelte.config.js << 'EOF'
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
EOF

# src/lib/docs.js
cat > src/lib/docs.js << 'EOF'
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
EOF

# src/lib/components/Sidebar.svelte
cat > src/lib/components/Sidebar.svelte << 'EOF'
<script>
	export let currentPath = '';
	
	const navigation = [
		{
			title: 'Getting Started',
			items: [
				{ title: 'Introduction', href: '/docs/start-introduction' },
				{ title: 'Installation', href: '/docs/start-install' },
				{ title: 'About', href: '/docs/start-about' }
			]
		},
		{
			title: 'Core Concepts',
			items: [
				{ title: 'Components', href: '/core-component' },
				{ title: 'States', href: '/core-states' },
				{ title: 'Events', href: '/core-events' },
				{ title: 'Styling', href: '/core-styling' }
			]
		},
		{
			title: 'API Reference',
			items: [
				{ title: 'Quick Reference', href: '/api/api-quick-reference' },
				{ title: 'Elements', href: '/api/api-reference-elements' },
				{ title: 'Style Attributes', href: '/api/api-style-attributes' }
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
EOF

# src/routes/+layout.svelte
cat > src/routes/+layout.svelte << 'EOF'
<script>
	import { page } from '$app/stores';
	import Sidebar from '$lib/components/Sidebar.svelte';
</script>

<div class="layout">
	<header>
		<div class="logo">
			<a href="/">Valdi Docs</a>
		</div>
		<nav class="top-nav">
			<a href="/docs/start-introduction">Docs</a>
			<a href="/api/api-quick-reference">API</a>
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
EOF

# src/routes/+page.svelte
cat > src/routes/+page.svelte << 'EOF'
<svelte:head>
	<title>Valdi Documentation</title>
</svelte:head>

<div class="hero">
	<h1>Valdi Documentation</h1>
	<p>Learn how to build cross-platform applications with Valdi</p>
	
	<div class="actions">
		<a href="/docs/start-introduction" class="btn primary">Get Started</a>
		<a href="/api/api-quick-reference" class="btn secondary">API Reference</a>
	</div>
</div>

<div class="features">
	<div class="feature">
		<h3>📚 Documentation</h3>
		<p>Comprehensive guides covering all aspects of Valdi development.</p>
		<a href="/docs/start-introduction">Read the docs →</a>
	</div>
	
	<div class="feature">
		<h3>🧪 Code Labs</h3>
		<p>Step-by-step tutorials to help you learn by doing.</p>
		<a href="/docs/codelabs/getting_started/1-introduction">Start learning →</a>
	</div>
	
	<div class="feature">
		<h3>📖 API Reference</h3>
		<p>Detailed API documentation for all elements and attributes.</p>
		<a href="/api/api-quick-reference">View API →</a>
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
EOF

# src/routes/docs/[...slug]/+page.js
cat > "src/routes/docs/[...slug]/+page.js" << 'EOF'
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
EOF

# src/routes/docs/[...slug]/+page.svelte
cat > "src/routes/docs/[...slug]/+page.svelte" << 'EOF'
<script>
	export let data;
</script>

<svelte:head>
	<title>{data.metadata?.title || 'Documentation'} - Valdi Docs</title>
</svelte:head>

<article class="prose prose-lg max-w-none">
	<svelte:component this={data.content} />
</article>
EOF

echo ""
echo "=========================================="
echo "  初始化完成!"
echo "=========================================="
echo ""
echo "运行以下命令启动开发服务器:"
echo ""
echo "  cd website"
echo "  pnpm dev"
echo ""
