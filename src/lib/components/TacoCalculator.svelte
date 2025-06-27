<script lang="ts">
	import { calculateTacoOrder, TACO_TYPES, DEFAULT_TACO_DISTRIBUTION } from '$lib/tacoCalculator';
	import { TacoStorage } from '$lib/storage';
	import { activeTab, showTacoRain } from '$lib/stores';
	import type { TacoOrder, TacoSession } from '$lib/types';

	let peopleCount = 3;
	let distribution = [...DEFAULT_TACO_DISTRIBUTION];
	$: result = calculateTacoOrder(peopleCount, distribution);

	function handlePeopleCountChange(count: number) {
		if (count > 0 && count <= 50) {
			peopleCount = count;
		}
	}

	function handleDistributionChange(typeId: string, ratio: number) {
		distribution = distribution.map((item) =>
			item.typeId === typeId ? { ...item, ratio } : item
		);
	}

	function addTacoType(typeId: string) {
		if (!distribution.find((item) => item.typeId === typeId)) {
			distribution = [...distribution, { typeId, ratio: 1 }];
		}
	}

	function removeTacoType(typeId: string) {
		if (distribution.length > 1) {
			distribution = distribution.filter((item) => item.typeId !== typeId);
		}
	}

	function handleOrderNow() {
		const session: TacoSession = {
			id: Date.now().toString(),
			date: new Date().toISOString().split('T')[0],
			peopleCount,
			orders: result.orders,
			consumptions: []
		};

		TacoStorage.saveSession(session);

		// TACO RAIN CELEBRATION! 🌮🎉
		showTacoRain.set(true);
		setTimeout(() => showTacoRain.set(false), 3000);

		// Show success message and switch to stats
		alert(
			`🌮 TACO ORDER PLACED! 🎉\n${result.orders.reduce(
				(sum, order) => sum + order.quantity,
				0
			)} delicious tacos incoming for ${peopleCount} hungry people!\n\nLET'S GOOO! 🌮🚀`
		);
		activeTab.set('stats');
	}

	$: availableTypes = TACO_TYPES.filter(
		(type) => !distribution.find((item) => item.typeId === type.id)
	);
</script>

<div class="card-3d rounded-xl p-6 slide-in">
	<h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
		🌮 Taco Order Calculator
	</h2>

	<!-- People Count Input -->
	<div class="mb-6">
		<div class="text-sm font-medium text-gray-700 mb-2">
			How many hungry people?
		</div>
		<div class="flex items-center space-x-4">
			<button
				on:click={() => handlePeopleCountChange(peopleCount - 1)}
				class="w-12 h-12 rounded-full bg-taco-orange text-white font-bold hover:bg-taco-red transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn-smooth"
				disabled={peopleCount <= 1}
			>
				-
			</button>
			<span class="text-3xl font-bold text-gray-800 min-w-[3rem] text-center">
				{peopleCount}
			</span>
			<button
				on:click={() => handlePeopleCountChange(peopleCount + 1)}
				class="w-12 h-12 rounded-full bg-taco-orange text-white font-bold hover:bg-taco-red transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn-smooth"
				disabled={peopleCount >= 50}
			>
				+
			</button>
		</div>
	</div>

	<!-- Taco Distribution -->
	<div class="mb-6">
		<div class="text-sm font-medium text-gray-700 mb-3">
			Taco Distribution (per person)
		</div>
		<div class="space-y-4">
			{#each distribution as item, index (item.typeId)}
				{@const tacoType = TACO_TYPES.find((t) => t.id === item.typeId)}
				{#if tacoType}
					<div class="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg slide-in stagger-{index + 1}">
						<div
							class="w-10 h-10 rounded-full {tacoType.color} flex items-center justify-center text-white font-bold shadow-md"
						>
							{tacoType.emoji}
						</div>
						<span class="flex-1 font-medium text-gray-800">{tacoType.name}</span>
						<div class="flex items-center space-x-3">
							<button
								on:click={() => handleDistributionChange(item.typeId, Math.max(0, item.ratio - 1))}
								class="w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-600 font-bold hover:border-taco-orange hover:text-taco-orange transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed btn-smooth"
								disabled={item.ratio <= 0}
							>
								-
							</button>
							<span class="w-8 text-center font-bold text-lg text-gray-800">{item.ratio}</span>
							<button
								on:click={() => handleDistributionChange(item.typeId, item.ratio + 1)}
								class="w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-600 font-bold hover:border-taco-orange hover:text-taco-orange transition-all duration-200 btn-smooth"
							>
								+
							</button>
							{#if distribution.length > 1}
								<button
									on:click={() => removeTacoType(item.typeId)}
									class="w-8 h-8 rounded-full bg-red-500 text-white font-bold hover:bg-red-600 transition-all duration-200 ml-2 btn-smooth"
								>
									×
								</button>
							{/if}
						</div>
					</div>
				{/if}
			{/each}
		</div>

		<!-- Add New Taco Type -->
		{#if availableTypes.length > 0}
			<div class="mt-4">
				<select
					on:change={(e) => e.currentTarget.value && addTacoType(e.currentTarget.value)}
					value=""
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-taco-orange focus:border-transparent dropdown-fixed"
				>
					<option value="">Add another taco type...</option>
					{#each availableTypes as type}
						<option value={type.id}>
							{type.emoji} {type.name}
						</option>
					{/each}
				</select>
			</div>
		{/if}
	</div>

	<!-- Order Summary -->
	<div class="bg-gradient-to-r from-taco-orange to-taco-red text-white rounded-xl p-6 mb-6 shadow-lg">
		<h3 class="text-xl font-bold mb-4 text-white">Order Summary</h3>
		<div class="space-y-3">
			{#each result.orders as order, index}
				<div class="flex justify-between items-center bg-white/10 rounded-lg p-3 slide-in stagger-{index + 1}">
					<span class="flex items-center gap-2">
						<span class="text-2xl">{order.type.emoji}</span>
						<span class="font-medium">{order.type.name}</span>
					</span>
					<span class="font-bold text-xl">{order.quantity}</span>
				</div>
			{/each}
		</div>
		<div class="border-t border-white/30 mt-4 pt-4">
			<div class="flex justify-between items-center text-xl font-bold">
				<span>Total Tacos:</span>
				<span class="text-2xl">{result.totalTacos}</span>
			</div>
			<div class="text-sm opacity-90 mt-1">Optimized for buy 2 get 1 free deal!</div>
		</div>
	</div>

	<button
		on:click={handleOrderNow}
		class="w-full bg-taco-orange hover:bg-taco-red text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 text-lg btn-smooth shadow-lg"
	>
		🌮 PLACE THIS FIRE ORDER! 🔥
	</button>
</div>
