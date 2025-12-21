<script lang="ts">
	import { page } from '$app/stores';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { NavSection } from '$lib/docs';

	let {
		children,
		data
	}: {
		children: any;
		data: { navigation: { docs: NavSection[]; api: NavSection[]; codelabs: NavSection[] } };
	} = $props();

	// 是否在文档页面
	let isDocsPage = $derived($page.url.pathname.startsWith('/docs'));

	// 根据当前路径决定显示哪个导航
	let currentSections = $derived.by(() => {
		const pathname = $page.url.pathname;
		if (pathname.startsWith('/docs/api')) {
			return data.navigation.api;
		} else if (pathname.startsWith('/docs/codelabs')) {
			return data.navigation.codelabs;
		} else {
			return data.navigation.docs;
		}
	});
</script>

<svelte:head>
	<title>Vadli Docs</title>
</svelte:head>

<div class="layout">
	<header>
		<div class="logo">
			<a href="/">Vadli Docs</a>
		</div>
		<nav class="top-nav">
			<a href="/docs/docs/start-introduction" class:active={$page.url.pathname.startsWith('/docs/docs')}>Docs</a>
			<a href="/docs/api/api-quick-reference" class:active={$page.url.pathname.startsWith('/docs/api')}>API</a>
			<a href="/docs/codelabs/getting_started/1-introduction" class:active={$page.url.pathname.startsWith('/docs/codelabs')}>Tutorials</a>
		</nav>
	</header>

	<div class="main-container">
		{#if isDocsPage}
			<Sidebar currentPath={$page.url.pathname} sections={currentSections} />
		{/if}
		<main class:full-width={!isDocsPage}>
			{@render children()}
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
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
	}

	.top-nav a:hover {
		color: #111827;
		background-color: #f3f4f6;
	}

	.top-nav a.active {
		color: #2563eb;
		background-color: #eff6ff;
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

	main.full-width {
		max-width: 100%;
	}
</style>
