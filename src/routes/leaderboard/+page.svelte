<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser, statsRefreshTrigger } from '$lib/stores';
	import { isDevAccount } from '$lib/debug';

	let leaderboard: Array<{name: string, totalTacos: number, sessions: number}> = [];
	let loading = true;

	function getAchievementBadge(totalTacos: number): string {
		if (totalTacos >= 100) return '🏆 Taco Legend';
		if (totalTacos >= 50) return '🥇 Taco Master';
		if (totalTacos >= 25) return '🥈 Taco Expert';
		if (totalTacos >= 10) return '🥉 Taco Enthusiast';
		if (totalTacos >= 5) return '🌮 Taco Lover';
		return '🌱 Taco Newbie';
	}

	function getRankIcon(index: number): string {
		if (index === 0) return '🥇';
		if (index === 1) return '🥈';
		if (index === 2) return '🥉';
		return `${index + 1}`;
	}

	function getRankColor(index: number): string {
		if (index === 0) return 'bg-yellow-500 text-white';
		if (index === 1) return 'bg-gray-400 text-white';
		if (index === 2) return 'bg-amber-600 text-white';
		return 'bg-blue-500/20 text-white';
	}

	async function loadLeaderboard() {
		loading = true;
		try {
			if ($currentUser) {
				// Fetch leaderboard from database
				const leaderboardResponse = await fetch('/api/leaderboard');
				if (leaderboardResponse.ok) {
					const leaderboardData = await leaderboardResponse.json();
					leaderboard = leaderboardData.map((user: any) => ({
						name: user.name,
						totalTacos: user.totalTacosEaten || 0,
						sessions: user.sessions || 0
					}));
				}
			} else {
				// Fallback to localStorage for non-authenticated users
				const { TacoStorage } = await import('$lib/storage');
				leaderboard = TacoStorage.getLeaderboard();
			}
		} catch (error) {
			console.error('Failed to load leaderboard:', error);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadLeaderboard();
	});

	// Refresh when stats change
	$: if ($statsRefreshTrigger) {
		loadLeaderboard();
	}
</script>

<svelte:head>
	<title>Leaderboard - Taco Tracker</title>
</svelte:head>

<div class="max-w-4xl mx-auto">
	<div class="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
		<!-- Header -->
		<div class="text-center mb-8">
			<h1 class="text-4xl md:text-5xl font-bold text-white mb-4 text-shadow-enhanced">
				👑 Taco Leaderboard
			</h1>
			<p class="text-lg md:text-xl text-white/80 text-shadow-enhanced mb-6">
				See who's the ultimate taco champion!
			</p>
			
			{#if !loading}
				<div class="flex justify-center space-x-8 mb-6">
					<div class="text-center">
						<div class="text-3xl font-bold text-yellow-400 text-shadow-enhanced">{leaderboard.length}</div>
						<div class="text-sm text-white/70">Competitors</div>
					</div>
					{#if leaderboard.length > 0}
						<div class="text-center">
							<div class="text-3xl font-bold text-blue-400 text-shadow-enhanced">{leaderboard.reduce((sum, player) => sum + player.totalTacos, 0)}</div>
							<div class="text-sm text-white/70">Total Tacos</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		{#if loading}
			<div class="text-center py-20">
				<div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mb-6"></div>
				<p class="text-white/80 text-lg text-shadow-enhanced">Loading leaderboard...</p>
			</div>
		{:else if leaderboard.length > 0}
			<!-- Dev Account Notice -->
			{#if $currentUser && isDevAccount($currentUser)}
				<div class="mb-6 p-4 bg-purple-500/20 border border-purple-400/50 rounded-xl">
					<div class="flex items-center space-x-3">
						<div class="text-2xl">🔧</div>
						<div>
							<h4 class="font-bold text-purple-300">Developer Account</h4>
							<p class="text-purple-200/80 text-sm">Your stats are hidden from public leaderboards for development purposes.</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Leaderboard -->
			<div class="space-y-4">
				{#each leaderboard as player, index}
					<div 
						class="leaderboard-card transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl {index < 3 ? 'ring-2 ring-yellow-400/30' : ''}"
						style="animation-delay: {index * 0.1}s"
					>
						<div class="flex items-center justify-between p-6">
							<div class="flex items-center space-x-6">
								<!-- Rank Badge -->
								<div class="flex items-center justify-center w-16 h-16 rounded-full {getRankColor(index)} font-bold text-xl shadow-lg">
									{getRankIcon(index)}
								</div>
								
								<!-- Player Info -->
								<div>
									<h3 class="text-2xl font-bold text-white mb-1">
										{player.name}
										{#if player.name === $currentUser?.name}
											<span class="text-sm bg-blue-500/30 text-blue-300 px-2 py-1 rounded-full ml-2">You</span>
										{/if}
									</h3>
									<p class="text-white/80 text-lg mb-2">{getAchievementBadge(player.totalTacos)}</p>
									<p class="text-white/60">
										{player.sessions} session{player.sessions !== 1 ? 's' : ''}
									</p>
								</div>
							</div>
							
							<!-- Stats -->
							<div class="text-right">
								<div class="text-4xl font-bold text-white mb-2">
									{player.totalTacos}
								</div>
								<div class="text-white/70">
									Tacos Eaten
								</div>
								
								<!-- Progress Bar for Visual Appeal -->
								{#if leaderboard[0] && player.totalTacos > 0}
									<div class="mt-4 w-32">
										<div class="bg-white/20 rounded-full h-2 overflow-hidden">
											<div 
												class="taco-gradient h-full transition-all duration-1000 ease-out"
												style="width: {(player.totalTacos / leaderboard[0].totalTacos) * 100}%"
											></div>
										</div>
									</div>
								{/if}
							</div>
						</div>
						
						<!-- Special Effects for Top 3 -->
						{#if index === 0}
							<div class="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/10 to-orange-500/10 pointer-events-none"></div>
						{:else if index === 1}
							<div class="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-400/10 to-gray-600/10 pointer-events-none"></div>
						{:else if index === 2}
							<div class="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-600/10 to-yellow-600/10 pointer-events-none"></div>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Fun Stats Section -->
			{#if leaderboard.length >= 3}
				<div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
					<div class="bg-white/5 rounded-xl p-6 text-center border border-white/10">
						<div class="text-3xl mb-2">🚀</div>
						<h4 class="font-bold text-white mb-2">Most Active</h4>
						<p class="text-white/80">{leaderboard.reduce((max, player) => player.sessions > max.sessions ? player : max).name}</p>
						<p class="text-sm text-white/60">{leaderboard.reduce((max, player) => player.sessions > max.sessions ? player : max).sessions} sessions</p>
					</div>
					
					<div class="bg-white/5 rounded-xl p-6 text-center border border-white/10">
						<div class="text-3xl mb-2">🔥</div>
						<h4 class="font-bold text-white mb-2">Taco Champion</h4>
						<p class="text-white/80">{leaderboard[0].name}</p>
						<p class="text-sm text-white/60">{leaderboard[0].totalTacos} tacos consumed</p>
					</div>
					
					<div class="bg-white/5 rounded-xl p-6 text-center border border-white/10">
						<div class="text-3xl mb-2">📊</div>
						<h4 class="font-bold text-white mb-2">Average</h4>
						<p class="text-white/80">{Math.round(leaderboard.reduce((sum, player) => sum + player.totalTacos, 0) / leaderboard.length)} tacos</p>
						<p class="text-sm text-white/60">per competitor</p>
					</div>
				</div>
			{/if}
		{:else}
			<div class="text-center py-20">
				<div class="bg-white/5 rounded-2xl p-12 border border-white/10 max-w-md mx-auto">
					<div class="text-8xl mb-6">🏁</div>
					<h3 class="text-2xl font-bold text-white mb-4">Be the First Champion!</h3>
					<p class="text-white/70 mb-6">
						No competitors yet. Start tracking tacos to claim the crown!
					</p>
					{#if !$currentUser}
						<p class="text-white/60 text-sm">
							Sign in to join the competition and track your progress!
						</p>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.leaderboard-card {
		position: relative;
		background: rgba(17, 24, 39, 0.7);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 1rem;
		animation: slideInFromLeft 0.6s ease-out both;
		overflow: hidden;
	}

	.leaderboard-card:hover {
		background: rgba(31, 41, 55, 0.8);
		border-color: rgba(255, 255, 255, 0.2);
	}

	@keyframes slideInFromLeft {
		from {
			opacity: 0;
			transform: translateX(-30px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>
