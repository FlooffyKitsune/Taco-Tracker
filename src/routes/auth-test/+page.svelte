<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<svelte:head>
	<title>Auth Test - Taco Tracker</title>
</svelte:head>

<div class="p-8">
	<h1 class="text-2xl font-bold mb-4">Authentication Test</h1>
	
	<div class="mb-4">
		<h2 class="text-lg font-semibold">Current Session:</h2>
		<pre class="bg-gray-100 p-4 rounded overflow-auto">
{JSON.stringify(data?.session, null, 2)}
		</pre>
	</div>
	
	<div class="mb-4">
		<h2 class="text-lg font-semibold">Test Authentication:</h2>
		<div class="space-y-2">
			<a href="/api/auth/signin" class="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
				Direct Auth.js Sign In
			</a>
			<a href="/api/auth/signin/discord" class="block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
				Direct Discord Sign In
			</a>
			<a href="/api/auth/providers" class="block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
				Check Available Providers
			</a>
			<a href="/api/auth/session" class="block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
				Check Current Session
			</a>
		</div>
	</div>
</div>
