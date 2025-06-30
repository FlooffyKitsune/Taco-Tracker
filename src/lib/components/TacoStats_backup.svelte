<script lang="ts">
	import { onMount } from 'svelte';
	import { TacoStorage } from '$lib/storage';
	import { currentUser, statsRefreshTrigger } from '$lib/stores';
	import type { TacoConsumption, TacoSession, TacoType } from '$lib/types';

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
		recentSessions: [] as any[] // Mixed format from DB and localStorage
	};

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
	}

	function getTotalFromOrders(orders: any[]): number {
		return orders.reduce((total: number, order: any) => total + order.quantity, 0);
	}

	function getTotalFromConsumptions(consumptions: any[]): number {
		return consumptions.reduce((total: number, consumption: any) => total + consumption.quantity, 0);
	}

	function getUniquePersonNames(consumptions: any[]): string[] {
		const names = new Set<string>();
		consumptions.forEach(consumption => {
			if (consumption.personName) {
				names.add(consumption.personName);
			}
		});
		return Array.from(names);
	}

	async function refreshStats(showLoading = true) {
		if (showLoading) {
			loading = true;
		}

		try {
			if ($currentUser) {
				// Fetch user stats from database
				const statsResponse = await fetch('/api/users/stats');
				if (statsResponse.ok) {
					const userStatsData = await statsResponse.json();
					
					stats = {
						totalTacosConsumed: userStatsData.totalTacosConsumed || 0,
						favoriteTacoType: userStatsData.favoriteTacoType || '',
						recentConsumptions: userStatsData.recentConsumptions || [],
						recentSessions: userStatsData.recentSessions || []
					};
				} else {
					console.error('Failed to fetch user stats:', statsResponse.status, 'using local storage only');
					// Fallback to local storage
					stats.recentSessions = TacoStorage.getSessions().slice(-5).reverse();
				}

				// Fetch recent sessions
				const sessionsResponse = await fetch('/api/sessions/recent');
				if (sessionsResponse.ok) {
					const recentSessions = await sessionsResponse.json();
					stats.recentSessions = recentSessions.slice(-5).reverse();
				} else {
					console.error('Failed to fetch recent sessions:', sessionsResponse.status, 'using local storage only');
					// Fallback to local storage only
					stats.recentSessions = TacoStorage.getSessions().slice(-5).reverse();
				}

				// Fetch user achievements
				const achievementsResponse = await fetch('/api/users/achievements');
				if (achievementsResponse.ok) {
					unlockedAchievements = await achievementsResponse.json();
				}

			} else {
				// User not authenticated - use local storage only
				
				// Use local storage for everything
				const localConsumptions = TacoStorage.getConsumptions();
				const localSessions = TacoStorage.getSessions().slice(-5).reverse();
				
				stats = {
					totalTacosConsumed: TacoStorage.getTotalTacosConsumed(),
					favoriteTacoType: TacoStorage.getFavoriteTacoType(),
					recentConsumptions: localConsumptions.slice(-10),
					recentSessions: localSessions
				};
				
				unlockedAchievements = [];
			}

		} catch (error) {
			console.error('Failed to load stats:', error);
			// Fallback to local storage completely
			const localConsumptions = TacoStorage.getConsumptions();
			const localSessions = TacoStorage.getSessions().slice(-5).reverse();
			
			stats = {
				totalTacosConsumed: TacoStorage.getTotalTacosConsumed(),
				favoriteTacoType: TacoStorage.getFavoriteTacoType(),
				recentConsumptions: localConsumptions.slice(-10),
				recentSessions: localSessions
			};
			
			unlockedAchievements = [];
		} finally {
			loading = false;
		}
	}
	onMount(async () => {
		loading = true;
		await loadTacoTypes();
		await refreshStats();
		loading = false;
	});

	// Reactive statement to refresh stats when trigger changes
	$: if ($statsRefreshTrigger) {
		refreshStats(false); // Don't show loading indicator for external triggers
	}

	$: favoriteTaco = tacoTypes.find((t) => t.id === stats.favoriteTacoType);

	// Optimistic delete - update UI immediately, then sync with server
	async function deleteConsumption(id: string) {
		// Find the consumption to delete for optimistic update
		const consumptionToDelete = stats.recentConsumptions.find(c => c.id === id);
		if (!consumptionToDelete) return;

		// 1. IMMEDIATE UI UPDATE (optimistic)
		// Remove from UI instantly
		stats.recentConsumptions = stats.recentConsumptions.filter(c => c.id !== id);
		
		// Update total tacos count immediately
		stats.totalTacosConsumed -= consumptionToDelete.quantity;
		
		// Update current user's taco count in store immediately
		if ($currentUser) {
			$currentUser.totalTacosEaten = Math.max(0, $currentUser.totalTacosEaten - consumptionToDelete.quantity);
		}

		// Recalculate favorite taco type without deleted consumption
		const typeCounts = new Map<string, number>();
		stats.recentConsumptions.forEach((consumption: any) => {
			const count = typeCounts.get(consumption.tacoTypeId) || 0;
			typeCounts.set(consumption.tacoTypeId, count + consumption.quantity);
		});
		
		let newFavoriteId = '';
		let maxCount = 0;
		typeCounts.forEach((count, typeId) => {
			if (count > maxCount) {
				maxCount = count;
				newFavoriteId = typeId;
			}
		});
		stats.favoriteTacoType = newFavoriteId;

		// 2. SERVER REQUEST (background)
		try {
			const response = await fetch(`/api/consume`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id })
			});

			// 3. HANDLE RESPONSE
			if (!response.ok) {
				// ROLLBACK on failure
				stats.recentConsumptions = [consumptionToDelete, ...stats.recentConsumptions];
				
				// Restore total tacos count
				stats.totalTacosConsumed += consumptionToDelete.quantity;
				
				// Restore current user's taco count
				if ($currentUser) {
					$currentUser.totalTacosEaten += consumptionToDelete.quantity;
				}
				
				// Restore favorite taco type calculation
				const restoredTypeCounts = new Map<string, number>();
				stats.recentConsumptions.forEach((consumption: any) => {
					const count = restoredTypeCounts.get(consumption.tacoTypeId) || 0;
					restoredTypeCounts.set(consumption.tacoTypeId, count + consumption.quantity);
				});
				
				let restoredFavoriteId = '';
				let restoredMaxCount = 0;
				restoredTypeCounts.forEach((count, typeId) => {
					if (count > restoredMaxCount) {
						restoredMaxCount = count;
						restoredFavoriteId = typeId;
					}
				});
				stats.favoriteTacoType = restoredFavoriteId;
				
				// Show user-friendly error
				console.error('Could not delete taco consumption. Please try again.');
			} else {
				// 4. SUCCESS - trigger refresh for other components but don't reload this page
				statsRefreshTrigger.update(n => n + 1);
				console.log('✅ Consumption deleted successfully');
			}
		} catch (error) {
			console.error('Network error while deleting consumption:', error);
			// Rollback on network error (same as above)
			stats.recentConsumptions = [consumptionToDelete, ...stats.recentConsumptions];
			stats.totalTacosConsumed += consumptionToDelete.quantity;
			if ($currentUser) {
				$currentUser.totalTacosEaten += consumptionToDelete.quantity;
			}
		}
	}

	function deleteSession(id: string) {
		console.log('Delete session not implemented for database records');
		// TacoStorage.deleteSession(id);
		// refreshStats();
	}
</script>

<div class="space-y-6 slide-in">
	{#if loading}
		<!-- Loading Animation -->
		<div class="flex flex-col items-center justify-center py-16 space-y-6">
			<div class="relative">
				<!-- Spinning ring -->
				<div class="w-16 h-16 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
				<!-- Pulsing inner circle -->
				<div class="absolute inset-2 bg-yellow-400/20 rounded-full animate-pulse"></div>
			</div>
			<div class="text-center">
				<h3 class="text-xl font-bold text-white mb-2">Loading Your Taco Stats...</h3>
				<p class="text-white/70">Fetching data from the taco vault 🏛️</p>
			</div>
			<!-- Loading bars -->
			<div class="w-64 space-y-2">
				<div class="h-2 bg-white/20 rounded-full overflow-hidden">
					<div class="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse w-3/4"></div>
				</div>
				<div class="h-2 bg-white/20 rounded-full overflow-hidden">
					<div class="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse w-1/2"></div>
				</div>
				<div class="h-2 bg-white/20 rounded-full overflow-hidden">
					<div class="h-full bg-gradient-to-r from-red-500 to-purple-500 rounded-full animate-pulse w-2/3"></div>
				</div>
			</div>
		</div>
	{:else}
		<!-- Stats Summary -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<div class="bg-gradient-to-br from-taco-orange to-taco-red text-white rounded-xl p-6 card-3d">
			<h3 class="text-lg font-bold mb-2 text-white">🏆 Total Tacos Consumed</h3>
			<p class="text-4xl font-bold mb-2">{stats.totalTacosConsumed}</p>
			<div class="text-sm opacity-90">
				{stats.totalTacosConsumed >= 100 ? '🏆 Taco Legend' : 
				 stats.totalTacosConsumed >= 50 ? '🥇 Taco Master' : 
				 stats.totalTacosConsumed >= 25 ? '🥈 Taco Expert' : 
				 stats.totalTacosConsumed >= 10 ? '🥉 Taco Enthusiast' : 
				 stats.totalTacosConsumed >= 5 ? '🌮 Taco Lover' : '🌱 Taco Newbie'}
			</div>
		</div>

		<div class="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl p-6 card-3d">
			<h3 class="text-lg font-bold mb-2 text-white">❤️ Favorite Taco</h3>
			<div class="flex items-center space-x-3">
				{#if favoriteTaco}
					<span class="text-3xl">{favoriteTaco.emoji}</span>
					<span class="text-xl font-bold">{favoriteTaco.name}</span>
				{:else}
					<span class="text-lg opacity-75">🤔 No favorite yet!</span>
				{/if}
			</div>
		</div>
	</div>

	<!-- Achievements Section -->
	<div class="card-3d rounded-xl p-6">
		<h3 class="text-xl font-bold text-white mb-4">🏆 Achievements</h3>
		{#if $currentUser}
			{#if unlockedAchievements.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each unlockedAchievements as userAchievement}
						<div class="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10">
							<span class="text-2xl">{userAchievement.achievement.icon}</span>
							<div>
								<p class="font-medium text-white">{userAchievement.achievement.name}</p>
								<p class="text-xs text-white/70">
									Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}
								</p>
							</div>
						</div>
					{/each}
				</div>
				<div class="mt-4 text-center">
					<a href="/achievements" class="text-blue-400 hover:text-blue-300 underline">
						View all achievements →
					</a>
				</div>
			{:else}
				<p class="text-white/70 text-center py-4 text-sm">Start tracking tacos to unlock achievements! 🌮</p>
			{/if}
		{:else}
			<div class="text-center py-8">
				<p class="text-white/70 mb-2 text-sm">🔐 Sign in to unlock achievements!</p>
				<p class="text-white/50 text-xs">Track your taco journey and compete with friends!</p>
			</div>
		{/if}
	</div>

	<!-- Recent Consumption History -->
	<div class="card-3d rounded-xl p-6">
		<h3 class="text-xl font-bold text-white mb-4">🕰️ Recent Individual Consumption</h3>
		{#if stats.recentConsumptions.length > 0}
			<div class="space-y-3">
				{#each stats.recentConsumptions as consumption}
					<div class="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
						<div class="flex items-center space-x-3">
							<span class="text-2xl">{consumption.tacoType?.emoji || '🌮'}</span>
							<div>
								<p class="font-medium text-white">{consumption.personName || $currentUser?.name || 'Unknown'}</p>
								<p class="text-sm text-white/70">
									{consumption.quantity} × {consumption.tacoType?.name || 'Unknown Taco'} • {new Date(consumption.date).toLocaleDateString()}
								</p>
							</div>
						</div>
						<button
							on:click={() => deleteConsumption(consumption.id)}
							class="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full w-8 h-8 flex items-center justify-center font-bold transition-all duration-200"
							title="Delete consumption"
						>
							×
						</button>
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-8">
				<p class="text-white/70 mb-4">No consumption history yet! 🍽️</p>
				<p class="text-white/50 text-sm">
					{#if $currentUser}
						Track individual tacos in the Tracker tab to see history here!
					{:else}
						Sign in to track consumption history across devices.
					{/if}
				</p>
			</div>
		{/if}
	</div>

	<!-- Recent Taco Orders/Sessions -->
	<div class="card-3d rounded-xl p-6">
		<h3 class="text-xl font-bold text-white mb-4">📦 Recent Taco Orders</h3>
		{#if stats.recentSessions.length > 0}
			<div class="space-y-4">
				{#each stats.recentSessions as session}
					<div class="p-4 bg-white/5 rounded-lg border border-white/10">
						<div class="flex items-center justify-between mb-3">
							<div>
								<p class="font-bold text-white">
									📅 {new Date(session.createdAt || session.date).toLocaleDateString()}
									<span class="text-xs text-white/60 ml-2">
										{new Date(session.createdAt || session.date).toLocaleTimeString()}
									</span>
								</p>
								{#if session.orders && session.orders.length > 0}
									<p class="text-sm text-white/80">
										Total: {getTotalFromOrders(session.orders)} tacos ordered
									</p>
								{:else if session.consumptions && session.consumptions.length > 0}
									<p class="text-sm text-white/80">
										Total: {getTotalFromConsumptions(session.consumptions)} tacos consumed
									</p>
								{:else}
									<p class="text-xs text-yellow-400">⚠️ No orders or consumptions found</p>
								{/if}
								{#if session.createdBy}
									<p class="text-xs text-white/50">Created by {session.createdBy}</p>
								{/if}
							</div>
							<button
								on:click={() => deleteSession(session.id)}
								class="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full w-8 h-8 flex items-center justify-center font-bold transition-all duration-200"
								title="Delete session"
							>
								×
							</button>
						</div>
						
						<!-- Show order breakdown -->
						{#if session.orders && session.orders.length > 0}
							<div class="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
								{#each session.orders as order}
									<div class="flex items-center space-x-2 text-sm text-white/80 bg-white/5 rounded px-2 py-1">
										<span>{order.type.emoji}</span>
										<span>{order.quantity} {order.type.name}</span>
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-xs text-yellow-400 mb-3">⚠️ No order breakdown available</div>
						{/if}

						<!-- Show consumption status if available -->
						{#if session.consumptions && session.consumptions.length > 0}
							<div class="mt-3 pt-3 border-t border-white/10">
								<p class="text-xs font-medium text-white/80 mb-2">🍽️ Consumption Tracked:</p>
								<div class="flex flex-wrap gap-1">
									{#each getUniquePersonNames(session.consumptions) as person}
										<span class="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
											{person}
										</span>
									{/each}
								</div>
							</div>
						{:else}
							<div class="mt-3 pt-3 border-t border-white/10">
								<p class="text-xs text-yellow-400">⏳ No consumption tracked yet</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-8">
				<p class="text-white/70 mb-4">No orders placed yet! 📦</p>
				<p class="text-white/50 text-sm">
					{#if $currentUser}
						Create an order in the Calculator tab to get started!
					{:else}
						Sign in to create database-backed orders, or use Calculator tab for local-only orders.
					{/if}
				</p>
			</div>
		{/if}
	</div>
	{/if}
</div>

<style>
	/* Styles are now minimal since complex achievements UI moved to dedicated page */
</style>
