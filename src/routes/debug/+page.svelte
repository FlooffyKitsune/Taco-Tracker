<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<svelte:head>
	<title>Debug - Taco Tracker</title>
</svelte:head>

<div class="p-8">
	<h1 class="text-2xl font-bold mb-4">Debug Page</h1>
	
	<div class="mb-4">
		<h2 class="text-lg font-semibold">Session Data:</h2>
		<pre class="bg-gray-100 p-4 rounded overflow-auto">
{JSON.stringify(data?.session, null, 2)}
		</pre>
	</div>
	
	<div class="mb-4">
		<h2 class="text-lg font-semibold">Environment Check:</h2>
		<p>Page loaded successfully at: {new Date().toISOString()}</p>
	</div>
</div>
