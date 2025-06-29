<script lang="ts">
	import { onMount } from 'svelte';
		let seeding = false;
	let testing = false;
	let result = '';
	let testResult = '';

	async function testDatabase() {
		testing = true;
		testResult = '';
		try {
			const response = await fetch('/api/test');
			const data = await response.json();
			if (data.success) {
				testResult = `✅ Database connected successfully!\n📊 Current counts:\n• ${data.counts.tacoTypes} taco types\n• ${data.counts.achievements} achievements\n• ${data.counts.users} users`;
			} else {
				testResult = `❌ Database connection failed:\n${data.error}`;
			}
		} catch (error) {
			testResult = `❌ Network Error: ${error}`;
		}
		testing = false;
	}

	async function seedDatabase() {
		seeding = true;
		result = '';
		try {
			const response = await fetch('/api/seed', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				}
			});
			const data = await response.json();
			if (data.success) {
				result = `✅ Database seeded successfully!\n📊 ${data.tacoTypesCreated || 12} taco types created\n🏆 ${data.achievementsCreated || 10} achievements created\n\nYou're ready to start tracking tacos! 🌮`;
			} else {
				result = `❌ Failed to seed database:\n${data.error || 'Unknown error'}\n\nDetails: ${JSON.stringify(data.details || {}, null, 2)}`;
			}
		} catch (error) {
			result = `❌ Network Error: ${error}\n\nMake sure your dev server is running and try again.`;
		}
		seeding = false;
	}
</script>

<svelte:head>
	<title>🌮 Database Setup - Taco Tracker</title>
</svelte:head>

<div class="max-w-2xl mx-auto">
	<div class="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
		<h1 class="text-3xl font-bold mb-6 text-white">🌮 Database Setup</h1>
				<p class="text-white/80 mb-6">
			First, test your database connection, then seed it with default taco types and achievements.
			This only needs to be done once when setting up the application.
		</p>

		<div class="space-y-4 mb-6">
			<button
				on:click={testDatabase}
				disabled={testing}
				class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 rounded-lg font-medium transition-colors text-white"
			>
				{testing ? '🔄 Testing...' : '🔍 Test Database Connection'}
			</button>

			{#if testResult}
				<div class="p-4 rounded-lg {testResult.includes('✅') ? 'bg-green-500/20 border border-green-400/30' : 'bg-red-500/20 border border-red-400/30'}">
					<pre class="text-white whitespace-pre-wrap font-mono text-sm">{testResult}</pre>
				</div>
			{/if}

			<button
				on:click={seedDatabase}
				disabled={seeding}
				class="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 rounded-lg font-medium transition-colors text-white"
			>
				{seeding ? '🔄 Seeding...' : '🌱 Seed Database'}
			</button>
		</div>
		{#if result}
			<div class="mt-6 p-4 rounded-lg {result.includes('✅') ? 'bg-green-500/20 border border-green-400/30' : 'bg-red-500/20 border border-red-400/30'}">
				<pre class="text-white whitespace-pre-wrap font-mono text-sm">{result}</pre>
			</div>
		{/if}

		<div class="mt-8 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
			<h3 class="font-semibold text-white mb-2">What gets seeded:</h3>
			<ul class="text-white/80 space-y-1">
				<li>• 12 different taco types (Carne Asada, Al Pastor, etc.)</li>
				<li>• 10 achievements to unlock</li>
				<li>• Database tables for users, sessions, and tracking</li>
			</ul>
		</div>

		<div class="mt-6">
			<a href="/" class="text-blue-300 hover:text-blue-200 underline">← Back to Taco Tracker</a>
		</div>
	</div>
</div>
