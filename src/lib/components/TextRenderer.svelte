<script lang="ts">
	// 纯文本渲染组件，避免任何 markdown 解析
	let { content = '' }: { content?: string } = $props();
</script>

<div class="text-renderer">
	{#if content}
		<pre>{content}</pre>
	{:else}
		<div class="empty-state">
			<p>无法加载文档内容</p>
		</div>
	{/if}
</div>

<style>
	.text-renderer {
        font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
		font-size: 14px;
		line-height: 1.5;
		
	}
	
	.text-renderer pre {
        margin: 0;
		padding: 0;
		background: transparent;
		border: none;
        word-break: break-word;
        white-space: pre-wrap;
	}
	
	.empty-state {
		color: #64748b;
		text-align: center;
		padding: 2rem;
	}
</style>