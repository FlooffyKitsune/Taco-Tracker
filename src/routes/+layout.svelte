<script lang="ts">
	import '../app.css';	import { activeTab, showTacoRain, currentUser, showAchievementModal, newAchievements } from '$lib/stores';
	import TacoRain from '$lib/components/TacoRain.svelte';
	import AchievementModal from '$lib/components/AchievementModal.svelte';
	import { onMount } from 'svelte';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import type { PageData } from './$types';

	export let data: PageData;

	const tabs = [
		{ id: 'calculator' as const, label: '🧮 Calculator', icon: '🌮' },
		{ id: 'tracker' as const, label: '📊 Tracker', icon: '✏️' },
		{ id: 'stats' as const, label: '📈 Stats', icon: '📊' },
		{ id: 'achievements' as const, label: '🏆 Achievements', icon: '🏆' },
		{ id: 'leaderboard' as const, label: '👑 Leaderboard', icon: '👑' }	];
	function setActiveTab(tab: typeof tabs[0]['id']) {
		activeTab.set(tab);
	}
	// Handle user session
	$: {
		if (data.session?.user) {
			currentUser.set({
				id: data.session.user.id,
				name: data.session.user.name ?? null,
				email: data.session.user.email ?? null,
				image: data.session.user.image ?? null,
				discordId: null,
				username: null,
				globalName: null,
				totalTacosEaten: data.session.user.totalTacosEaten || 0,
				totalTacoSessions: data.session.user.totalTacoSessions || 0,
				joinedAt: new Date(),
				lastActiveAt: new Date()
			});
		} else {
			currentUser.set(null);
		}
	}
</script>

{#if $showTacoRain}
	<TacoRain />
{/if}

<AchievementModal 
	achievements={$newAchievements}
	visible={$showAchievementModal}
	on:close={() => {
		showAchievementModal.set(false);
		newAchievements.set([]);
	}}
/>

<div class="min-h-screen immersive-bg flex flex-col">
	<!-- Parallax Background Layers -->
	<div class="bg-layer-base"></div>
	<div class="parallax-layer-1"></div>
	<div class="parallax-layer-2"></div>
	<div class="parallax-layer-3"></div>
	<div class="ambient-light"></div>
	
	<!-- Floating Geometric Shapes -->
	<div class="geometric-shapes">
		<div class="shape"></div>
		<div class="shape"></div>
		<div class="shape"></div>
		<div class="shape"></div>
	</div>	<!-- Header -->
	<header class="taco-gradient text-white py-12 relative overflow-hidden">
		<div class="container mx-auto px-4 relative z-10">
			<div class="flex justify-between items-center">
				<div class="text-center flex-1">
					<h1 class="text-4xl md:text-6xl font-bold mb-4 text-white text-shadow-enhanced">
						🌮 Taco Tracker
					</h1>
					<p class="text-lg md:text-xl opacity-90 text-shadow-enhanced">
						Your ultimate Taco Tuesday companion!
					</p>
				</div>
				
				<!-- Authentication Status -->
				<div class="hidden md:block">
					{#if data.session?.user}
						<div class="flex items-center space-x-4">
							<div class="text-right">
								<p class="font-medium">{data.session.user.name}</p>
								<p class="text-sm opacity-75">🌮 {data.session.user.totalTacosEaten || 0} tacos eaten</p>
							</div>
							{#if data.session.user.image}
								<img src={data.session.user.image} alt="Profile" class="w-12 h-12 rounded-full border-2 border-white/30" />
							{/if}
							<button
								on:click={() => signOut()}
								class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors border border-red-400/30"
							>
								Sign Out
							</button>
						</div>
					{:else}
						<button
							on:click={() => signIn('discord')}
							class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center space-x-2"
						>
							<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
								<path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
							</svg>
							<span>Sign in with Discord</span>
						</button>
					{/if}
				</div>
			</div>
		</div>
		<!-- Subtle floating tacos background -->
		<div class="absolute inset-0 pointer-events-none opacity-20">
			<div class="absolute top-8 left-8 text-4xl float-gentle" style="animation-delay: 0s;">🌮</div>
			<div class="absolute top-16 right-12 text-3xl float-gentle" style="animation-delay: 2s;">🌯</div>
			<div class="absolute bottom-12 left-16 text-3xl float-gentle" style="animation-delay: 4s;">🥙</div>
			<div class="absolute bottom-8 right-8 text-2xl float-gentle" style="animation-delay: 3s;">🌶️</div>
		</div>
	</header>

	<!-- Navigation Tabs -->
	<nav class="bg-white/10 backdrop-blur-xl shadow-xl sticky top-0 z-20 border-b border-white/20">
		<div class="container mx-auto px-4">
			<div class="flex justify-center space-x-2">
				{#each tabs as tab, index}
					<button
						on:click={() => setActiveTab(tab.id)}
						class="px-6 py-4 font-medium transition-all duration-300 border-b-3 btn-smooth text-white/90 {$activeTab === tab.id
							? 'border-blue-400 text-blue-300 bg-blue-500/20 glow-soft'
							: 'border-transparent hover:text-blue-300 hover:bg-white/10'}"
					>
						<span class="hidden sm:inline">{tab.label}</span>
						<span class="sm:hidden text-2xl">{tab.icon}</span>
					</button>
				{/each}
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="container mx-auto px-4 py-8 flex-grow">
		<slot />
	</main>

	<!-- Footer -->
	<footer class="bg-black/30 backdrop-blur-xl text-white py-8 mt-auto border-t border-white/10 relative z-10">
		<div class="container mx-auto px-4 text-center">
			<p class="text-lg mb-2 gradient-text-premium">Made with ❤️</p>
			<p class="text-white/70">© 2025 VulpineStudio</p>
		</div>
	</footer>
</div>
