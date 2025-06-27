<script lang="ts">
	import { onMount } from 'svelte';

	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	// Simplified taco rain - fewer, cleaner
	const tacos = Array.from({ length: 30 }, (_, i) => ({
		id: i,
		emoji: ['🌮', '🌯', '🥙'][Math.floor(Math.random() * 3)],
		left: Math.random() * 100,
		delay: Math.random() * 2,
		duration: 3 + Math.random() * 2
	}));
</script>

{#if mounted}
	<div class="fixed inset-0 pointer-events-none z-50 overflow-hidden">
		{#each tacos as taco}
			<div
				class="absolute text-4xl"
				style="left: {taco.left}%; animation-delay: {taco.delay}s; animation-duration: {taco.duration}s;"
			>
				<div class="taco-rain">
					{taco.emoji}
				</div>
			</div>
		{/each}
	</div>
{/if}
