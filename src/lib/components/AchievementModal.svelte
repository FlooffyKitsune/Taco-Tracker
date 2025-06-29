<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly, scale } from 'svelte/transition';
	import { getCategoryColor } from '$lib/achievements.js';
	import type { Achievement } from '$lib/types.js';

	export let achievements: Achievement[] = [];
	export let visible: boolean = false;

	const dispatch = createEventDispatcher<{
		close: void
	}>();

	function closeModal() {
		visible = false;
		dispatch('close');
	}
</script>

{#if visible && achievements.length > 0}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
		<div 
			class="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 max-w-md w-full"
			transition:scale={{ duration: 300, start: 0.8 }}
		>
			<div class="text-center mb-6">
				<div class="text-6xl mb-4 animate-bounce">🎉</div>
				<h2 class="text-2xl font-bold text-white mb-2">
					Achievement{achievements.length > 1 ? 's' : ''} Unlocked!
				</h2>
				<p class="text-white/70">
					You've earned {achievements.length} new achievement{achievements.length > 1 ? 's' : ''}!
				</p>
			</div>

			<div class="space-y-4 mb-6">
				{#each achievements as achievement, i}
					<div 
						class="p-4 bg-white/5 rounded-lg border border-white/20"
						transition:fly={{ delay: i * 200, x: 50 }}
					>
						<div class="flex items-start space-x-3">
							<div class="text-3xl">{achievement.emoji}</div>
							<div class="flex-1">
								<div class="flex items-center space-x-2 mb-1">
									<h3 class="font-semibold text-white">{achievement.name}</h3>
									<span class="px-2 py-1 text-xs rounded-full {getCategoryColor(achievement.category)}">
										{achievement.category}
									</span>
								</div>
								<p class="text-white/80 text-sm mb-2">{achievement.description}</p>
								<div class="flex items-center justify-between">
									<span class="text-yellow-400 text-sm font-medium">
										+{achievement.points} points
									</span>
									{#if achievement.isHidden}
										<span class="text-purple-300 text-xs">🤫 Secret</span>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<button
				on:click={closeModal}
				class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-white"
			>
				Awesome! 🎊
			</button>
		</div>
	</div>
{/if}
