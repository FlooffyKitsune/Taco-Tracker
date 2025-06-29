<script lang="ts">
	import { activeTab, currentUser } from '$lib/stores';
	import { isDebugMode } from '$lib/debug';
	import TacoCalculator from '$lib/components/TacoCalculator.svelte';
	import ConsumptionTracker from '$lib/components/ConsumptionTracker.svelte';
	import TacoStats from '$lib/components/TacoStats.svelte';
	import { signIn } from '@auth/sveltekit/client';
	import type { PageData } from './$types';

	export let data: PageData;

	// Placeholder components for new features
	function AchievementsView() {
		return '<div class="text-center py-20"><h2 class="text-3xl font-bold mb-4">🏆 Achievements</h2><p class="text-gray-600">Coming soon! Track your taco milestones.</p></div>';
	}

	function LeaderboardView() {
		return '<div class="text-center py-20"><h2 class="text-3xl font-bold mb-4">👑 Leaderboard</h2><p class="text-gray-600">Coming soon! See who\'s the ultimate taco champion.</p></div>';
	}
</script>

<svelte:head>
	<title>🌮 Taco Tracker - Your Ultimate Taco Tuesday Companion</title>
</svelte:head>

{#if !data.session?.user}
	<!-- Login prompt for unauthenticated users -->
	<div class="max-w-2xl mx-auto text-center py-20">
		<div class="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
			<h2 class="text-3xl font-bold mb-6 text-white">🌮 Welcome to Taco Tracker!</h2>
			<p class="text-white/80 mb-8 text-lg">
				Join the ultimate taco tracking experience! Sign in with Discord to:
			</p>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
				<div class="bg-white/5 rounded-lg p-4">
					<div class="text-2xl mb-2">📊</div>
					<h3 class="font-semibold text-white mb-2">Track Your Tacos</h3>
					<p class="text-white/70 text-sm">Log every delicious bite and see your taco journey</p>
				</div>
				<div class="bg-white/5 rounded-lg p-4">
					<div class="text-2xl mb-2">🏆</div>
					<h3 class="font-semibold text-white mb-2">Unlock Achievements</h3>
					<p class="text-white/70 text-sm">Earn badges for your taco conquests</p>
				</div>
				<div class="bg-white/5 rounded-lg p-4">
					<div class="text-2xl mb-2">👥</div>
					<h3 class="font-semibold text-white mb-2">Social Tracking</h3>
					<p class="text-white/70 text-sm">Track tacos with friends and compete</p>
				</div>
				<div class="bg-white/5 rounded-lg p-4">
					<div class="text-2xl mb-2">👑</div>
					<h3 class="font-semibold text-white mb-2">Leaderboards</h3>
					<p class="text-white/70 text-sm">See who's the ultimate taco champion</p>
				</div>
			</div>
			<button
				on:click={() => signIn('discord')}
				class="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center space-x-3 mx-auto text-lg"
			>
				<svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
					<path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
				</svg>
				<span>Get Started with Discord</span>
			</button>
		</div>
	</div>
{:else}	<!-- Authenticated user content -->
	
	<!-- Debug info only for developer accounts -->
	{#if isDebugMode(data.session?.user)}
		<div class="debug-info mb-4 p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/40">
			<details>
				<summary class="text-white cursor-pointer hover:text-yellow-200 flex items-center gap-2">
					🔧 Developer Debug Mode
					<span class="text-xs opacity-75">(DEV only)</span>
				</summary>
				<div class="mt-3 text-sm text-white/90 space-y-1">
					<p><strong>Authentication:</strong> ✅ User authenticated</p>
					<p><strong>Active Tab:</strong> {$activeTab}</p>
					<p><strong>User ID:</strong> {data.session?.user?.id}</p>
					<p><strong>Display Name:</strong> {data.session?.user?.name}</p>
					<p><strong>Email:</strong> {data.session?.user?.email}</p>
					<p><strong>Environment:</strong> {import.meta.env.MODE}</p>
				</div>
			</details>
		</div>
	{/if}
	
	{#if $activeTab === 'calculator'}
		<div class="max-w-2xl mx-auto">
			<TacoCalculator />
		</div>
	{:else if $activeTab === 'tracker'}
		<div class="max-w-2xl mx-auto">
			<ConsumptionTracker />
		</div>
	{:else if $activeTab === 'stats'}
		<div class="max-w-4xl mx-auto">
			<TacoStats />
		</div>
	{:else if $activeTab === 'achievements'}
		<div class="max-w-4xl mx-auto">
			{@html AchievementsView()}
		</div>
	{:else if $activeTab === 'leaderboard'}
		<div class="max-w-4xl mx-auto">
			{@html LeaderboardView()}
		</div>
	{/if}
{/if}
