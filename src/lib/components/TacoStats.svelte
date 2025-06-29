<script lang="ts">
	import { onMount } from 'svelte';
	import { TacoStorage } from '$lib/storage';
	import { getUserAchievements, getCategoryColor, getPointsColor } from '$lib/achievements';
	import { currentUser } from '$lib/stores';
	import type { TacoConsumption, TacoSession, MultiTacoConsumption, TacoType } from '$lib/types';

	// Database achievement type (what we actually get from Prisma)
	type DbUserAchievement = {
		id: string;
		userId: string;
		achievementId: string;
		unlockedAt: Date;
		achievement: {
			id: string;
			name: string;
			description: string;
			icon: string;
			category: string;
			requirement: number;
			createdAt: Date;
		};
	};

	let stats = {
		totalTacosConsumed: 0,
		favoriteTacoType: '',
		recentConsumptions: [] as TacoConsumption[],
		recentSessions: [] as TacoSession[],
		recentMultiConsumptions: [] as MultiTacoConsumption[]
	};

	let leaderboard: Array<{name: string, totalTacos: number, sessions: number}> = [];
	let unlockedAchievements: DbUserAchievement[] = [];
	let tacoTypes: TacoType[] = [];
	let loading = true;

	async function loadTacoTypes() {
		try {
			const response = await fetch('/api/taco-types');
			if (response.ok) {
				tacoTypes = await response.json();
			}
		} catch (error) {
			console.error('Failed to load taco types:', error);
		}
	}	async function refreshStats() {
		const totalTacosConsumed = TacoStorage.getTotalTacosConsumed();
		const favoriteTacoType = TacoStorage.getFavoriteTacoType();
		const allConsumptions = TacoStorage.getConsumptions();
		const allSessions = TacoStorage.getSessions();
		const allMultiConsumptions = TacoStorage.getMultiConsumptions();

		stats = {
			totalTacosConsumed,
			favoriteTacoType,
			recentConsumptions: allConsumptions.slice(-10).reverse(),
			recentSessions: allSessions.slice(-5).reverse(),
			recentMultiConsumptions: allMultiConsumptions.slice(-10).reverse()
		};

		leaderboard = TacoStorage.getLeaderboard();
		
		// Load user achievements if authenticated
		if ($currentUser) {
			try {
				unlockedAchievements = await getUserAchievements($currentUser.id);
			} catch (error) {
				console.error('Failed to load achievements:', error);
				unlockedAchievements = [];
			}
		} else {
			unlockedAchievements = [];
		}
	}
	onMount(async () => {
		loading = true;
		await loadTacoTypes();
		await refreshStats();
		loading = false;
	});

	$: favoriteTaco = tacoTypes.find((t) => t.id === stats.favoriteTacoType);

	function deleteConsumption(id: string) {
		TacoStorage.deleteConsumption(id);
		refreshStats();
	}

	function deleteSession(id: string) {
		TacoStorage.deleteSession(id);
		refreshStats();
	}

	function deleteMultiConsumption(id: string) {
		TacoStorage.deleteMultiConsumption(id);
		refreshStats();
	}

	function getAchievementBadge(totalTacos: number): string {
		if (totalTacos >= 100) return '🏆 Taco Legend';
		if (totalTacos >= 50) return '🥇 Taco Master';
		if (totalTacos >= 25) return '🥈 Taco Expert';
		if (totalTacos >= 10) return '🥉 Taco Enthusiast';
		if (totalTacos >= 5) return '🌮 Taco Lover';
		return '🌱 Taco Newbie';
	}
</script>

<div class="space-y-6 slide-in">
	<!-- Stats Summary -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<div class="bg-gradient-to-br from-taco-orange to-taco-red text-white rounded-xl p-6 card-3d">
			<h3 class="text-lg font-bold mb-2 text-white">🏆 Total Tacos Consumed</h3>
			<p class="text-4xl font-bold">{stats.totalTacosConsumed}</p>
		</div>

		<div class="bg-gradient-to-br from-taco-yellow to-taco-orange text-white rounded-xl p-6 card-3d">
			<h3 class="text-lg font-bold mb-2 text-white">❤️ Favorite Taco</h3>
			<div class="flex items-center space-x-2">
				{#if favoriteTaco}
					<span class="text-3xl">{favoriteTaco.emoji}</span>
					<span class="text-xl font-bold">{favoriteTaco.name}</span>
				{:else}
					<span class="text-xl">No data yet!</span>
				{/if}
			</div>
		</div>
	</div>
	<!-- Achievements Section -->
	<div class="achievement-panel card-3d rounded-xl p-6">
		<h3 class="text-xl font-bold achievement-title mb-4">🏆 Achievements Unlocked</h3>		{#if unlockedAchievements.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
				{#each unlockedAchievements as userAchievement, index}
					<div class="achievement-item p-4 rounded-lg border-2 {getCategoryColor(userAchievement.achievement.category)} stagger-item" style="animation-delay: {index * 0.1}s">
						<div class="flex items-center space-x-3">
							<span class="text-2xl">{userAchievement.achievement.icon}</span>
							<div>
								<h4 class="font-bold text-white">{userAchievement.achievement.name}</h4>
								<p class="text-sm text-white/90">{userAchievement.achievement.description}</p>
								<span class="text-xs uppercase font-bold {getPointsColor(userAchievement.achievement.requirement)} px-2 py-1 rounded mt-1 inline-block">{userAchievement.achievement.requirement} pts</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-white/70 text-center py-4">Start tracking tacos to unlock achievements! 🌮</p>
		{/if}
	</div>

	<!-- Leaderboard Section -->
	<div class="card-3d rounded-xl p-6">
		<h3 class="text-xl font-bold text-white mb-4 flex items-center">
			🏆 Taco Leaderboard
			<span class="ml-2 text-sm bg-blue-500/20 px-2 py-1 rounded-full">
				{leaderboard.length} players
			</span>
		</h3>
		{#if leaderboard.length > 0}
			<div class="space-y-3">
				{#each leaderboard as player, index}
					<div class="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
						<div class="flex items-center space-x-4">
							<div class="flex items-center justify-center w-8 h-8 rounded-full {index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-blue-500/20'} text-white font-bold text-sm">
								{index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
							</div>
							<div>
								<p class="font-bold text-white">{player.name}</p>
								<p class="text-sm text-white/70">{getAchievementBadge(player.totalTacos)}</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-xl font-bold text-white">{player.totalTacos}</p>
							<p class="text-xs text-white/60">{player.sessions} session{player.sessions !== 1 ? 's' : ''}</p>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-white/70 text-center py-4">No leaderboard data yet! Start tracking tacos to compete! 🌮</p>
		{/if}
	</div>

	<!-- Recent Multi-Taco Sessions -->
	<div class="card-3d rounded-xl p-6">
		<h3 class="text-xl font-bold text-white mb-4">🍽️ Recent Taco Sessions</h3>
		{#if stats.recentMultiConsumptions.length > 0}
			<div class="space-y-3">
				{#each stats.recentMultiConsumptions as session}
					<div class="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
						<div class="flex items-center space-x-3">
							<div class="text-2xl">🌮</div>
							<div>
								<p class="font-medium text-white">{session.personName}</p>
								<p class="text-sm text-white/70">
									{session.totalTacos} taco{session.totalTacos !== 1 ? 's' : ''} • {session.date}
								</p>
								<div class="flex space-x-1 mt-1">
									{#each session.entries as entry}
										<span class="text-sm bg-white/10 px-2 py-1 rounded">
											{entry.tacoType.emoji} {entry.quantity}
										</span>
									{/each}
								</div>
							</div>
						</div>
						<button
							on:click={() => deleteMultiConsumption(session.id)}
							class="text-red-400 hover:text-red-300 font-bold"
						>
							×
						</button>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-white/70 text-center py-4">No taco sessions yet! Start tracking your taco feasts! 🌮</p>
		{/if}
	</div>

	<!-- Recent Consumption History -->
	<div class="card-3d rounded-xl p-6">
		<h3 class="text-xl font-bold text-white mb-4">🕰️ Recent Individual Consumption</h3>
		{#if stats.recentConsumptions.length > 0}
			<div class="space-y-3">
				{#each stats.recentConsumptions as consumption}
					<div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
						<div class="flex items-center space-x-3">
							<span class="text-2xl">{consumption.tacoType.emoji}</span>
							<div>
								<p class="font-medium text-white">{consumption.personName}</p>
								<p class="text-sm text-white/70">
									{consumption.quantity} × {consumption.tacoType.name} • {consumption.date}
								</p>
							</div>
						</div>
						<button
							on:click={() => deleteConsumption(consumption.id)}
							class="text-red-400 hover:text-red-300 font-bold"
						>
							×
						</button>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-white/70 text-center py-8">No taco consumption recorded yet! 🌮</p>
		{/if}
	</div>

	<!-- Recent Order Sessions -->
	<div class="card-3d rounded-xl p-6">
		<h3 class="text-xl font-bold text-white mb-4">📦 Recent Orders</h3>
		{#if stats.recentSessions.length > 0}
			<div class="space-y-4">
				{#each stats.recentSessions as session}
					<div class="p-4 bg-white/5 rounded-lg border border-white/10">
						<div class="flex justify-between items-start mb-2">
							<div>
								<p class="font-bold text-white">Order for {session.peopleCount} people</p>
								<p class="text-sm text-white/70">{session.date}</p>
							</div>
							<button
								on:click={() => deleteSession(session.id)}
								class="text-red-400 hover:text-red-300 font-bold"
							>
								×
							</button>
						</div>
						<div class="grid grid-cols-2 md:grid-cols-3 gap-2">
							{#each session.orders as order}
								<div class="flex items-center space-x-2 text-sm text-white/80">
									<span>{order.type.emoji}</span>
									<span>{order.quantity} {order.type.name}</span>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-white/70 text-center py-8">No orders placed yet! 📦</p>
		{/if}
	</div>
</div>
