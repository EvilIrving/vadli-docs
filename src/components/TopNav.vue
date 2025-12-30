<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const navLinks = [
	{ label: 'Docs', href: '/docs/start-introduction' },
	{ label: 'API', href: '/api/api-quick-reference' },
	{ label: 'Tutorials', href: '/codelabs/getting_started/1-introduction' }
]

function isActive(href: string): boolean {
	const currentPath = route.path
	if (href.startsWith('/docs/')) return currentPath.startsWith('/docs/')
	if (href.startsWith('/api/')) return currentPath.startsWith('/api/')
	if (href.startsWith('/codelabs/')) return currentPath.startsWith('/codelabs/')
	return false
}
</script>

<template>
	<nav class="topnav">
		<RouterLink to="/" class="topnav__logo">
			<span class="topnav__logo-icon">&gt;_</span>
			Valdi
		</RouterLink>
		<div class="topnav__links">
			<RouterLink
				v-for="link in navLinks"
				:key="link.href"
				:to="link.href"
				class="topnav__link"
				:class="{ active: isActive(link.href) }"
			>
				{{ link.label }}
			</RouterLink>
		</div>
	</nav>
</template>
