<script lang="ts">
	import TextRenderer from '$lib/components/TextRenderer.svelte';

	let { data }: { data: { content: string; metadata: Record<string, unknown> } } = $props();
</script>

<svelte:head>
	<title>{(data.metadata?.title as string) || 'Documentation'} - Vadli Docs</title>
</svelte:head>

<article class="text-content">
	<TextRenderer content={data.content} />
</article>

<style>
	.text-content {
		max-width: 100%;
		padding: 1rem;
		background: #f8fafc;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
</style>
