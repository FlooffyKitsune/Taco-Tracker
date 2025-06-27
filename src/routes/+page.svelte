<script lang="ts">
	import { activeTab } from '$lib/stores';
	import TacoCalculator from '$lib/components/TacoCalculator.svelte';
	import ConsumptionTracker from '$lib/components/ConsumptionTracker.svelte';
	import TacoStats from '$lib/components/TacoStats.svelte';
</script>

<svelte:head>
	<title>🌮 Taco Tracker - Your Ultimate Taco Tuesday Companion</title>
</svelte:head>

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
{/if}
