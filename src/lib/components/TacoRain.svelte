<script lang="ts">
	import { onMount } from 'svelte';

	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	// Awesome taco explosion - like fireworks but with tacos!
	const tacos = Array.from({ length: 50 }, (_, i) => ({
		id: i,
		emoji: ['🌮', '🌯', '🥙'][Math.floor(Math.random() * 3)],
		delay: Math.random() * 0.2, // Quick staggered start
		angle: (Math.random() * 360) * (Math.PI / 180), // Convert to radians for better math
		speed: 150 + Math.random() * 200, // Initial velocity
		gravity: 0.5 + Math.random() * 0.3, // Realistic gravity
		size: 1.5 + Math.random() * 1, // Reasonable sizes
		rotation: Math.random() * 360, // Starting rotation
		rotationSpeed: (Math.random() - 0.5) * 10 // Rotation velocity
	}));
</script>

{#if mounted}
	<div class="taco-explosion-container">
		{#each tacos as taco}
			<div
				class="taco-piece"
				style="
					--delay: {taco.delay}s; 
					--angle: {taco.angle};
					--speed: {taco.speed}px;
					--gravity: {taco.gravity};
					--size: {taco.size}rem;
					--rotation: {taco.rotation}deg;
					--rotation-speed: {taco.rotationSpeed}deg;
				"
			>
				{taco.emoji}
			</div>
		{/each}
	</div>
{/if}

<style>
	.taco-explosion-container {
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 100vw;
		height: 100vh;
		pointer-events: none;
		overflow: hidden;
		z-index: 9999;
	}

	.taco-piece {
		position: absolute;
		bottom: 50px;
		left: 50%;
		font-size: var(--size);
		transform-origin: center;
		animation: taco-fireworks 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) var(--delay) forwards;
		filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
	}

	@keyframes taco-fireworks {
		0% {
			transform: translateX(-50%) rotate(var(--rotation)) scale(0);
			opacity: 1;
		}
		5% {
			transform: translateX(-50%) rotate(var(--rotation)) scale(1.2);
			opacity: 1;
		}
		10% {
			transform: translateX(-50%) rotate(var(--rotation)) scale(1);
			opacity: 1;
		}
		100% {
			transform: 
				translateX(-50%)
				translateX(calc(cos(var(--angle)) * var(--speed) * 2))
				translateY(calc(sin(var(--angle)) * var(--speed) * -2 + var(--gravity) * 400px))
				rotate(calc(var(--rotation) + var(--rotation-speed) * 20))
				scale(0.3);
			opacity: 0;
		}
	}
</style>
