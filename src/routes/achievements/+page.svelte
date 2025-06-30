<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser } from '$lib/stores';
	import { goto } from '$app/navigation';

	// Database achievement types
	type DbAchievement = {
		id: string;
		name: string;
		description: string;
		icon: string;
		category: string;
		requirement: number;
		createdAt: Date;
	};

	type DbUserAchievement = {
		id: string;
		userId: string;
		achievementId: string;
		unlockedAt: Date;
		achievement: DbAchievement;
	};

	// Combined achievement for display
	type CombinedAchievement = DbAchievement & {
		unlocked: boolean;
		unlockedAt?: Date;
		progress?: number;
	};

	let allAchievements: DbAchievement[] = [];
	let userAchievements: DbUserAchievement[] = [];
	let combinedAchievements: CombinedAchievement[] = [];
	let loading = true;
	let userStats = {
		totalTacosConsumed: 0,
		favoriteTacoType: '',
		totalSessions: 0
	};

	// Categories for grouping
	const categories = ['taco', 'session', 'streak', 'social', 'special'];

	function getCategoryColor(category: string): string {
		const colors: Record<string, string> = {
			'taco': 'border-yellow-500 bg-yellow-500/10',
			'session': 'border-blue-500 bg-blue-500/10',
			'streak': 'border-green-500 bg-green-500/10',
			'social': 'border-purple-500 bg-purple-500/10',
			'special': 'border-red-500 bg-red-500/10'
		};
		return colors[category] || 'border-gray-500 bg-gray-500/10';
	}

	async function loadData() {
		if (!$currentUser) {
			goto('/');
			return;
		}

		loading = true;
		try {
			// Load all achievements
			const achievementsResponse = await fetch('/api/achievements');
			if (achievementsResponse.ok) {
				allAchievements = await achievementsResponse.json();
			}

			// Load user achievements
			const userAchievementsResponse = await fetch('/api/users/achievements');
			if (userAchievementsResponse.ok) {
				userAchievements = await userAchievementsResponse.json();
			}

			// Load user stats for progress calculation
			const statsResponse = await fetch('/api/users/stats');
			if (statsResponse.ok) {
				const stats = await statsResponse.json();
				userStats = {
					totalTacosConsumed: stats.totalTacosConsumed || 0,
					favoriteTacoType: stats.favoriteTacoType || '',
					totalSessions: stats.recentSessions?.length || 0
				};
			}

			// Combine achievements with unlock status
			const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));
			const unlockedMap = new Map(userAchievements.map(ua => [ua.achievementId, ua.unlockedAt]));

			combinedAchievements = allAchievements.map(achievement => ({
				...achievement,
				unlocked: unlockedIds.has(achievement.id),
				unlockedAt: unlockedMap.get(achievement.id),
				progress: unlockedIds.has(achievement.id) ? 100 : calculateProgress(achievement)
			}));

		} catch (error) {
			console.error('Failed to load achievements:', error);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadData();
	});

	// Reactive statement to reload data when user changes
	$: if ($currentUser) {
		loadData();
	}

	function calculateProgress(achievement: DbAchievement): number {
		// Calculate progress based on achievement type and user stats
		switch (achievement.category) {
			case 'taco':
				if (achievement.name.includes('consumed')) {
					return Math.min((userStats.totalTacosConsumed / achievement.requirement) * 100, 100);
				}
				break;
			case 'session':
				if (achievement.name.includes('sessions')) {
					return Math.min((userStats.totalSessions / achievement.requirement) * 100, 100);
				}
				break;
			// Add more progress calculations as needed
		}
		return 0;
	}

	function getTotalUnlocked(): number {
		return combinedAchievements.filter(a => a.unlocked).length;
	}
</script>

<svelte:head>
	<title>Achievements - Taco Tracker</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-8">
	<div class="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
		<!-- Header -->
		<div class="text-center mb-8">
			<h1 class="text-4xl md:text-5xl font-bold text-white mb-4 text-shadow-enhanced">
				🏆 Achievements
			</h1>
			<p class="text-lg md:text-xl text-white/80 text-shadow-enhanced mb-6">
				Your taco journey milestones
			</p>
			
			{#if !loading && $currentUser}
				<div class="flex justify-center space-x-8 mb-6">
					<div class="text-center">
						<div class="text-3xl font-bold text-yellow-400 text-shadow-enhanced">{getTotalUnlocked()}</div>
						<div class="text-sm text-white/70">Unlocked</div>
					</div>
					<div class="text-center">
						<div class="text-3xl font-bold text-blue-400 text-shadow-enhanced">{allAchievements.length}</div>
						<div class="text-sm text-white/70">Total</div>
					</div>
				</div>
					
				<!-- Overall Progress Bar -->
				<div class="max-w-md mx-auto">
					<div class="bg-white/10 backdrop-blur-sm rounded-full h-4 overflow-hidden border border-white/20">
						<div 
							class="taco-gradient h-full transition-all duration-1000 ease-out glow-soft"
							style="width: {(getTotalUnlocked() / allAchievements.length) * 100}%"
						></div>
					</div>
					<div class="text-sm text-white/70 mt-2 text-shadow-enhanced">
						{Math.round((getTotalUnlocked() / allAchievements.length) * 100)}% Complete
					</div>
				</div>
			{/if}
		</div>

		{#if loading}
			<div class="text-center py-20">
				<div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mb-6"></div>
				<p class="text-white/80 text-lg text-shadow-enhanced">Loading achievements...</p>
			</div>
		{:else if !$currentUser}
			<div class="text-center py-20">
				<div class="bg-gray-900/90 backdrop-blur-sm rounded-2xl p-12 border border-white/20 max-w-md mx-auto">
					<div class="text-8xl mb-6">🔐</div>
					<p class="text-white text-xl mb-4 text-shadow-enhanced">Sign in to view your achievements!</p>
					<p class="text-white/70 text-shadow-enhanced">Track your taco journey and unlock rewards!</p>
				</div>
			</div>
		{:else}
			<!-- All Achievements - Vertical List -->
			<div class="max-w-4xl mx-auto">
				<div class="space-y-4">
					{#each combinedAchievements as achievement, index}
						<div 
							class="achievement-card bg-gray-900/90 backdrop-blur-sm border border-white/20 rounded-xl p-6 transition-all duration-300 hover:bg-gray-800/90 hover:border-white/30 {achievement.unlocked ? 'ring-2 ring-green-400/50' : 'opacity-75'}"
							style="animation-delay: {index * 0.05}s"
						>
							<div class="flex items-center">
								<!-- Achievement Icon -->
								<div class="flex-shrink-0 mr-6">
									<span class="text-4xl {achievement.unlocked ? '' : 'filter grayscale opacity-50'}">{achievement.icon}</span>
								</div>
								
								<!-- Achievement Info -->
								<div class="flex-grow">
									<div class="flex items-start justify-between mb-3">
										<div>
											<h3 class="font-bold text-xl text-white mb-2">
												{achievement.name}
											</h3>
											{#if achievement.description}
												<p class="text-white/90 mb-3">
													{achievement.description}
												</p>
											{:else}
												<p class="text-white/60 mb-3 italic">
													Secret achievement - no description available
												</p>
											{/if}
											<div class="flex items-center space-x-4">
												<span class="text-sm px-3 py-1 rounded-full font-medium transition-colors {achievement.unlocked ? 'bg-green-500/80 text-white border border-green-400/50' : 'bg-gray-500/50 text-gray-200 border border-gray-400/30'}">
													{achievement.unlocked ? '✓ UNLOCKED' : '🔒 LOCKED'}
												</span>
												<span class="text-sm text-white/60 capitalize px-2 py-1 bg-white/10 rounded border border-white/20">
													{achievement.category}
												</span>
											</div>
										</div>
										
										<!-- Unlock Date (if unlocked) -->
										{#if achievement.unlocked && achievement.unlockedAt}
											<div class="text-right text-sm text-white/70">
												<div class="font-medium">Unlocked</div>
												<div>{new Date(achievement.unlockedAt).toLocaleDateString()}</div>
											</div>
										{/if}
									</div>
									
									<!-- Progress Bar for Locked Achievements -->
									{#if !achievement.unlocked && achievement.progress && achievement.progress > 0}
										<div class="mt-4">
											<div class="flex justify-between text-sm text-white/70 mb-2">
												<span>Progress</span>
												<span class="font-medium">{Math.round(achievement.progress)}%</span>
											</div>
											<div class="bg-white/20 rounded-full h-3 overflow-hidden border border-white/30">
												<div 
													class="taco-gradient h-full transition-all duration-1000 ease-out"
													style="width: {achievement.progress}%"
												></div>
											</div>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			{#if combinedAchievements.length === 0}
				<div class="text-center py-20">
					<div class="bg-white/20 backdrop-blur-sm rounded-2xl p-12 border border-white/30 max-w-md mx-auto">
						<div class="text-6xl mb-6">🏆</div>
						<p class="text-white text-xl mb-2 text-shadow-enhanced">No achievements available yet!</p>
						<p class="text-white/70 text-shadow-enhanced">Check back later for more challenges!</p>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.achievement-card {
		animation: slideInFromBottom 0.6s ease-out both;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
		background: rgba(17, 24, 39, 0.9) !important; /* Solid dark background, no animations */
	}

	.achievement-card:hover {
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
		background: rgba(31, 41, 55, 0.9) !important; /* Slightly lighter on hover */
	}

	/* Ensure no background animations leak into cards */
	.achievement-card * {
		background-attachment: initial !important;
	}
</style>
