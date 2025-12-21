<script lang="ts">
	import type { NavSection } from '$lib/docs';

	let {
		currentPath = '',
		sections = []
	}: {
		currentPath?: string;
		sections: NavSection[];
	} = $props();

	// 跟踪展开/折叠状态，使用 Map 来存储每个 section 的展开状态
	let expandedSections = $state<Map<string, boolean>>(new Map());

	// 初始化时展开当前页面所在的 section
	$effect(() => {
		const newExpandedSections = new Map<string, boolean>();
		
		for (const section of sections) {
			// 默认情况下，只展开包含当前路径的 section
			if (section.items.some((item) => item.href === currentPath)) {
				newExpandedSections.set(section.title, true);
			} else {
				newExpandedSections.set(section.title, false);
			}
		}
		
		expandedSections = newExpandedSections;
	});

	function toggleSection(title: string) {
		const newExpandedSections = new Map(expandedSections);
		
		// 如果当前 section 是展开的，则关闭它
		if (newExpandedSections.get(title)) {
			newExpandedSections.set(title, false);
		} else {
			// 关闭所有其他 sections，只展开当前点击的 section（手风琴效果）
			for (const section of sections) {
				newExpandedSections.set(section.title, section.title === title);
			}
		}
		
		expandedSections = newExpandedSections;
	}
</script>

<nav class="sidebar">
	{#each sections as section}
		<div class="section">
			<button class="section-header" onclick={() => toggleSection(section.title)}>
				<h3>{section.title}</h3>
				<span class="chevron" class:expanded={expandedSections.get(section.title) ?? false}>›</span>
			</button>
			{#if expandedSections.get(section.title)}
				<ul>
					{#each section.items as item}
						<li>
							<a href={item.href} class:active={currentPath === item.href}>
								{item.title}
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/each}
</nav>

<style>
	.sidebar {
		width: 280px;
		padding: 1rem;
		border-right: 1px solid #e5e7eb;
		height: calc(100vh - 60px);
		overflow-y: auto;
		position: sticky;
		top: 60px;
		background: white;
		flex-shrink: 0;
	}

	.section {
		margin-bottom: 0.5rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.5rem 0.5rem;
		background: none;
		border: none;
		cursor: pointer;
		border-radius: 0.375rem;
	}

	.section-header:hover {
		background-color: #f3f4f6;
	}

	.section-header h3 {
		font-size: 0.75rem;
		font-weight: 600;
		color: #374151;
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.chevron {
		font-size: 1rem;
		color: #9ca3af;
		transition: transform 0.2s ease;
		transform: rotate(0deg);
	}

	.chevron.expanded {
		transform: rotate(90deg);
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		padding-left: 0.5rem;
	}

	li a {
		display: block;
		padding: 0.375rem 0.75rem;
		color: #6b7280;
		text-decoration: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
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