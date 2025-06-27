<script lang="ts">
	import '../app.css';
	import { activeTab, showTacoRain } from '$lib/stores';
	import TacoRain from '$lib/components/TacoRain.svelte';
	import { onMount } from 'svelte';

	const tabs = [
		{ id: 'calculator' as const, label: '🧮 Calculator', icon: '🌮' },
		{ id: 'tracker' as const, label: '📊 Tracker', icon: '✏️' },
		{ id: 'stats' as const, label: '📈 Stats', icon: '📊' }
	];

	function setActiveTab(tab: 'calculator' | 'tracker' | 'stats') {
		activeTab.set(tab);
	}

	// Setup complete - no custom cursor for accessibility
</script>

{#if $showTacoRain}
	<TacoRain />
{/if}

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
	</div>
	<!-- Header -->
	<header class="taco-gradient text-white py-12 relative overflow-hidden">
		<div class="container mx-auto px-4 text-center relative z-10">
			<h1 class="text-4xl md:text-6xl font-bold mb-4 text-white text-shadow-enhanced">
				🌮 Taco Tracker
			</h1>
			<p class="text-lg md:text-xl opacity-90 text-shadow-enhanced">
				Your ultimate Taco Tuesday companion!
			</p>
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
			<p class="text-lg mb-2 gradient-text-premium">Made with ❤️ and lots of 🌮</p>
			<p class="text-white/70">Perfect for your Taco Tuesday adventures!</p>
		</div>
	</footer>
</div>
