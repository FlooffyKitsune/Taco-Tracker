<script lang="ts">
	import { TACO_TYPES } from '$lib/tacoCalculator';
	import { TacoStorage } from '$lib/storage';
	import type { TacoType, TacoConsumption, TacoConsumptionEntry, MultiTacoConsumption } from '$lib/types';

	let personName = '';
	let tacoEntries: TacoConsumptionEntry[] = [];
	let isSubmitting = false;

	// Add a new taco entry
	function addTacoEntry(tacoType: TacoType) {
		const existingEntry = tacoEntries.find(entry => entry.tacoType.id === tacoType.id);
		if (existingEntry) {
			existingEntry.quantity += 1;
		} else {
			tacoEntries = [...tacoEntries, { tacoType, quantity: 1 }];
		}
	}

	// Update quantity for a specific taco type
	function updateQuantity(tacoId: string, newQuantity: number) {
		if (newQuantity <= 0) {
			tacoEntries = tacoEntries.filter(entry => entry.tacoType.id !== tacoId);
		} else {
			tacoEntries = tacoEntries.map(entry => 
				entry.tacoType.id === tacoId 
					? { ...entry, quantity: newQuantity }
					: entry
			);
		}
	}

	// Remove a taco entry completely
	function removeTacoEntry(tacoId: string) {
		tacoEntries = tacoEntries.filter(entry => entry.tacoType.id !== tacoId);
	}

	// Calculate total tacos
	$: totalTacos = tacoEntries.reduce((total, entry) => total + entry.quantity, 0);

	function handleSubmit() {
		if (!personName.trim() || tacoEntries.length === 0) return;

		isSubmitting = true;

		// Save as new multi-taco consumption
		const multiConsumption: MultiTacoConsumption = {
			id: Date.now().toString(),
			date: new Date().toISOString().split('T')[0],
			personName: personName.trim(),
			entries: [...tacoEntries],
			totalTacos
		};

		// Also save individual entries for backwards compatibility
		tacoEntries.forEach(entry => {
			const consumption: TacoConsumption = {
				id: `${Date.now()}-${entry.tacoType.id}`,
				date: new Date().toISOString().split('T')[0],
				personName: personName.trim(),
				tacoType: entry.tacoType,
				quantity: entry.quantity
			};
			TacoStorage.saveConsumption(consumption);
		});

		// Save multi-consumption (for future enhanced features)
		TacoStorage.saveMultiConsumption(multiConsumption);

		// Reset form
		personName = '';
		tacoEntries = [];
		isSubmitting = false;
	}
</script>

<div class="card-3d rounded-xl p-6 slide-in">
	<h2 class="text-2xl font-bold text-white mb-6 text-center">
		📊 Track Your Taco Feast
	</h2>

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<div>
			<label for="person-name" class="block text-sm font-medium text-white/90 mb-2"> Your Name </label>
			<input
				id="person-name"
				type="text"
				bind:value={personName}
				class="w-full px-4 py-3 rounded-lg transition-all duration-300"
				placeholder="Enter your name..."
				required
			/>
		</div>

		<div>
			<div class="text-sm font-medium text-white/90 mb-3">
				Select Tacos You've Eaten
			</div>
			<div class="grid grid-cols-2 gap-3 mb-4">
				{#each TACO_TYPES as taco, index}
					<button
						type="button"
						on:click={() => addTacoEntry(taco)}
						class="p-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 border-white/20 hover:border-blue-400 hover:bg-white/10"
						style="animation-delay: {index * 0.05}s"
					>
						<div class="flex items-center space-x-2">
							<span class="text-2xl">{taco.emoji}</span>
							<span class="font-medium text-white">{taco.name}</span>
						</div>
					</button>
				{/each}
			</div>
		</div>

		{#if tacoEntries.length > 0}
			<div class="bg-white/5 rounded-lg p-4 border border-white/10">
				<h3 class="text-lg font-semibold text-white mb-3 flex items-center">
					🌮 Your Taco Selections
					<span class="ml-2 bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
						{totalTacos} total
					</span>
				</h3>
				<div class="space-y-3">
					{#each tacoEntries as entry, index}
						<div class="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
							<div class="flex items-center space-x-3">
								<span class="text-2xl">{entry.tacoType.emoji}</span>
								<span class="font-medium text-white">{entry.tacoType.name}</span>
							</div>
							<div class="flex items-center space-x-3">
								<button
									type="button"
									on:click={() => updateQuantity(entry.tacoType.id, entry.quantity - 1)}
									class="w-8 h-8 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-all duration-200"
								>
									-
								</button>
								<span class="text-xl font-bold text-white min-w-[2rem] text-center">
									{entry.quantity}
								</span>
								<button
									type="button"
									on:click={() => updateQuantity(entry.tacoType.id, entry.quantity + 1)}
									class="w-8 h-8 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-all duration-200"
								>
									+
								</button>
								<button
									type="button"
									on:click={() => removeTacoEntry(entry.tacoType.id)}
									class="w-8 h-8 rounded-full bg-red-500/20 text-red-300 font-bold hover:bg-red-500/30 transition-all duration-200 ml-2"
								>
									×
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<button
			type="submit"
			disabled={!personName.trim() || tacoEntries.length === 0 || isSubmitting}
			class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn-smooth shadow-lg"
		>
			{isSubmitting 
				? 'Recording your epic taco feast...' 
				: `🎯 RECORD ${totalTacos} TACO${totalTacos !== 1 ? 'S' : ''} 🏆`}
		</button>
	</form>
</div>
