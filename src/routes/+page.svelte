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
		<h3>Documentation</h3>
		<p>Comprehensive guides covering all aspects of Vadli development.</p>
		<a href="/docs/docs/start-introduction">Read the docs →</a>
	</div>

	<div class="feature">
		<h3>Code Labs</h3>
		<p>Step-by-step tutorials to help you learn by doing.</p>
		<a href="/docs/codelabs/getting_started/1-introduction">Start learning →</a>
	</div>

	<div class="feature">
		<h3>API Reference</h3>
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
