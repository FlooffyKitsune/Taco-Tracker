<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		currentUser, 
		activeTacoSession, 
		recentOrderForTracking,
		statsRefreshTrigger
	} from '$lib/stores';
	import { TacoStorage } from '$lib/storage';
	import type { TacoType, TacoConsumption, TacoConsumptionEntry, MultiTacoConsumption, TacoSession, TacoSessionWithParticipants } from '$lib/types';

	let tacoEntries: TacoConsumptionEntry[] = [];
	let isSubmitting = false;
	let tacoTypes: TacoType[] = [];
	let loading = true;
	let recentSessions: TacoSession[] = [];
	let selectedSessionId: string | null = null;
	let selectedSession: TacoSession | null = null;
	let totalOrderedTacos = 0;
	let totalClaimedTacos = 0;
	let isCurrentUserInOrder = false;

	onMount(async () => {
		loading = true;
		try {
			// Load taco types
			const typesResponse = await fetch('/api/taco-types');
			if (typesResponse.ok) {
				tacoTypes = await typesResponse.json();
			}

			// Load recent sessions to allow users to track from orders
			loadRecentSessions();
		} catch (error) {
			console.error('Failed to load data:', error);
		} finally {
			loading = false;
		}
	});

	// React to recent order for tracking
	$: if ($recentOrderForTracking && $currentUser) {
		checkIfUserInRecentOrder($recentOrderForTracking);
	}

	function checkIfUserInRecentOrder(session: TacoSession) {
		if (!$currentUser) return;
		
		const userInOrder = session.participants?.some(p => p.id === $currentUser?.id) || false;
		
		if (userInOrder && !selectedSessionId) {
			// Auto-select this session for tracking
			selectSession(session);
		}
	}

	function loadRecentSessions() {
		const sessions = TacoStorage.getSessions();
		// Filter out sessions where all tacos have been claimed
		const availableSessions = sessions.filter(session => {
			const totalOrdered = session.orders.reduce((sum, order) => sum + order.quantity, 0);
			const totalClaimed = session.consumptions?.reduce((sum, consumption) => sum + consumption.quantity, 0) || 0;
			return totalClaimed < totalOrdered; // Only show sessions with remaining tacos
		});
		recentSessions = availableSessions.slice(-5).reverse(); // Show last 5 available sessions
	}

	function selectSession(session: TacoSession) {
		selectedSessionId = session.id;
		selectedSession = session;
		
		// Check if current user is in this order
		isCurrentUserInOrder = session.participants?.some(p => p.id === $currentUser?.id) || false;
		
		// Calculate total ordered tacos
		totalOrderedTacos = session.orders.reduce((sum, order) => sum + order.quantity, 0);
		
		// Calculate suggested quantities per person (evenly distributed)
		const peopleCount = session.participants?.length || session.peopleCount;
		
		// Pre-populate taco entries from the session's orders with suggested quantities
		tacoEntries = session.orders.map(order => {
			const suggestedQuantity = Math.floor(order.quantity / peopleCount);
			return {
				tacoType: order.type,
				quantity: suggestedQuantity // Start with suggested amount
			};
		});

		// Calculate already claimed tacos
		calculateClaimedTacos();
	}

	function calculateClaimedTacos() {
		if (!selectedSession) return;
		
		// Calculate total already claimed by all participants
		totalClaimedTacos = selectedSession.consumptions?.reduce((sum, consumption) => sum + consumption.quantity, 0) || 0;
	}

	function clearSessionSelection() {
		selectedSessionId = null;
		selectedSession = null;
		tacoEntries = [];
		totalOrderedTacos = 0;
		totalClaimedTacos = 0;
		isCurrentUserInOrder = false;
		
		// Clear the recent order for tracking
		recentOrderForTracking.set(null);
	}

	// Add a new taco entry (for manual entry)
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
		if (newQuantity < 0) return; // Don't allow negative quantities
		
		tacoEntries = tacoEntries.map(entry => 
			entry.tacoType.id === tacoId 
				? { ...entry, quantity: newQuantity }
				: entry
		);
	}

	// Remove a taco entry completely
	function removeTacoEntry(tacoId: string) {
		tacoEntries = tacoEntries.filter(entry => entry.tacoType.id !== tacoId);
	}

	// Calculate total tacos being claimed
	$: totalTacos = tacoEntries.reduce((total, entry) => total + entry.quantity, 0);
	$: hasValidEntries = tacoEntries.some(entry => entry.quantity > 0);
	$: remainingTacos = totalOrderedTacos - totalClaimedTacos - totalTacos;
	$: isOverLimit = selectedSessionId && (totalTacos + totalClaimedTacos > totalOrderedTacos);

	async function handleSubmit() {
		console.log('handleSubmit called', { 
			currentUser: !!$currentUser, 
			hasValidEntries, 
			totalTacos,
			tacoEntries,
			isSubmitting
		});

		if (!$currentUser || !hasValidEntries) {
			console.log('Submit blocked:', { currentUser: !!$currentUser, hasValidEntries });
			return;
		}

		console.log('Starting submission...', { totalTacos, selectedSessionId, tacoEntries });
		isSubmitting = true;

		try {
			// Filter out entries with 0 quantity
			const validEntries = tacoEntries.filter(entry => entry.quantity > 0);
			console.log('Valid entries:', validEntries);

			// Save consumption to database via API
			const requestBody = {
				userId: $currentUser.id,
				sessionId: selectedSessionId,
				entries: validEntries.map(entry => ({
					tacoTypeId: entry.tacoType.id,
					quantity: entry.quantity
				}))
			};
			console.log('API request:', requestBody);

			const response = await fetch('/api/consume', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody)
			});

			console.log('API response status:', response.status);
			const responseData = await response.json();
			console.log('API response data:', responseData);

			if (response.ok) {
				// Update local storage to reflect consumption
				if (selectedSession) {
					validEntries.forEach(entry => {
						const consumption: TacoConsumption = {
							id: `${Date.now()}-${entry.tacoType.id}`,
							date: new Date().toISOString().split('T')[0],
							personName: $currentUser!.name || 'Unknown',
							tacoType: entry.tacoType,
							quantity: entry.quantity
						};
						
						if (selectedSession) {
							selectedSession.consumptions = selectedSession.consumptions || [];
							selectedSession.consumptions.push(consumption);
						}
					});
					
					// Update stored session
					TacoStorage.saveSession(selectedSession);
					
					// Calculate new totals after this consumption
					const newTotalClaimed = totalClaimedTacos + totalTacos;
					
					// If all tacos have been claimed, clear the order from tracker
					if (newTotalClaimed >= totalOrderedTacos) {
						console.log('🎉 Order fully consumed! Clearing from tracker...');
						clearSessionSelection();
						recentOrderForTracking.set(null);
						// Refresh the recent sessions list to remove completed orders					loadRecentSessions();
				}
			}

			// Update user's taco count in the store
			if ($currentUser) {
					$currentUser.totalTacosEaten += totalTacos;
				}

				// Trigger stats refresh
				statsRefreshTrigger.update(n => n + 1);

				// Auto-navigate to stats after successful submission
				setTimeout(() => {
					import('$lib/stores').then(({ activeTab }) => {
						activeTab.set('stats');
					});
				}, 1500); // Wait 1.5 seconds for taco rain to show

				// Reset form or update to show remaining
				if (selectedSession && totalClaimedTacos + totalTacos < totalOrderedTacos) {
					calculateClaimedTacos();
					// Reset quantities to 0 but keep the taco types
					tacoEntries = tacoEntries.map(entry => ({ ...entry, quantity: 0 }));
				} else if (!selectedSession) {
					tacoEntries = [];
				}
				
				// Success feedback (no alert popup!)
				console.log(`🌮 Successfully recorded ${totalTacos} tacos for ${$currentUser.name}!`);
			} else {
				console.error('Failed to save consumption');
			}
		} catch (error) {
			console.error('Error saving consumption:', error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="card-3d rounded-xl p-6 slide-in">
	<h2 class="text-2xl font-bold text-white mb-6 text-center">
		📊 Track Your Taco Consumption
	</h2>

	{#if !$currentUser}
		<div class="text-center py-8">
			<p class="text-white/70 mb-4">Please sign in to track your tacos!</p>
		</div>
	{:else}
		<!-- Recent Sessions Section -->
		{#if recentSessions.length > 0 && !selectedSessionId}
			<div class="mb-6">
				<h3 class="text-lg font-semibold text-white mb-3">📦 Track from Recent Orders</h3>
				<div class="space-y-2">
					{#each recentSessions as session}
						<button
							type="button"
							on:click={() => selectSession(session)}
							class="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-blue-400 transition-all duration-300 text-left"
						>
							<div class="flex justify-between items-start">
								<div>
									<p class="font-medium text-white">Order for {session.peopleCount} people</p>
									<p class="text-sm text-white/70">{session.date}</p>
								</div>
								<div class="text-sm text-blue-300">
									{session.orders.reduce((total, order) => total + order.quantity, 0)} tacos
								</div>
							</div>
							<div class="flex flex-wrap gap-1 mt-2">
								{#each session.orders as order}
									<span class="text-xs bg-white/10 px-2 py-1 rounded">
										{order.type.emoji} {order.quantity}
									</span>
								{/each}
							</div>
						</button>
					{/each}
				</div>
				<div class="text-center mt-4">
					<p class="text-white/60 text-sm">Or manually track tacos below</p>
				</div>
			</div>
		{/if}

		<!-- Selected Session Info -->
		{#if selectedSession}
			<div class="mb-6 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
				<div class="flex justify-between items-start mb-2">
					<div>
						<h3 class="text-lg font-semibold text-blue-200">📦 Tracking from Order</h3>
						<p class="text-sm text-blue-300">
							{selectedSession.date} • {selectedSession.participants?.length || selectedSession.peopleCount} people
						</p>
						{#if selectedSession.participants && selectedSession.participants.length > 0}
							<div class="flex flex-wrap gap-1 mt-2">
								{#each selectedSession.participants as participant}
									<span class="text-xs bg-blue-400/20 text-blue-200 px-2 py-1 rounded">
										{participant.name} {participant.id === $currentUser?.id ? '(you)' : ''}
									</span>
								{/each}
							</div>
						{/if}
					</div>
					<button
						on:click={clearSessionSelection}
						class="text-blue-300 hover:text-blue-200 text-sm underline"
					>
						Clear Selection
					</button>
				</div>
				
				<!-- Order tracking stats -->
				<div class="grid grid-cols-3 gap-3 mt-3 text-center">
					<div class="bg-white/10 rounded p-2">
						<p class="text-xs text-white/70">Ordered</p>
						<p class="font-bold text-white">{totalOrderedTacos}</p>
					</div>
					<div class="bg-white/10 rounded p-2">
						<p class="text-xs text-white/70">Claimed</p>
						<p class="font-bold text-white">{totalClaimedTacos}</p>
					</div>
					<div class="bg-white/10 rounded p-2">
						<p class="text-xs text-white/70">Remaining</p>
						<p class="font-bold {remainingTacos < 0 ? 'text-red-400' : 'text-green-400'}">{remainingTacos}</p>
					</div>
				</div>
				
				{#if !isCurrentUserInOrder}
					<div class="mt-3 p-2 bg-yellow-500/20 rounded border border-yellow-400/30">
						<p class="text-yellow-200 text-sm">⚠️ You weren't part of this order, but you can still track consumption manually.</p>
					</div>
				{:else}
					<p class="text-blue-200 text-sm mt-2">✨ Quantities below are suggested based on equal distribution:</p>
				{/if}
			</div>
		{/if}

		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<!-- Manual Taco Selection (only if no session selected) -->
			{#if !selectedSessionId}
				<div>
					<div class="text-sm font-medium text-white/90 mb-3">
						Select Tacos You've Eaten
					</div>
					<div class="grid grid-cols-2 gap-3 mb-4">
						{#if loading}
							<div class="col-span-2 text-center py-4">
								<div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
								<p class="mt-2 text-white/70">Loading taco types...</p>
							</div>
						{:else if tacoTypes.length === 0}
							<div class="col-span-2 text-center py-4">
								<p class="text-red-400">Failed to load taco types. Please refresh the page.</p>
							</div>
						{:else}
							{#each tacoTypes as taco, index}
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
						{/if}
					</div>
				</div>
			{/if}

			<!-- Taco Quantities -->
			{#if tacoEntries.length > 0}
				<div class="bg-white/5 rounded-lg p-4 border border-white/10">
					<h3 class="text-lg font-semibold text-white mb-3 flex items-center">
						🌮 Your Taco Consumption
						{#if totalTacos > 0}
							<span class="ml-2 bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
								{totalTacos} total
							</span>
						{/if}
					</h3>
					<div class="space-y-3">
						{#each tacoEntries as entry, index}
							<div class="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
								<div class="flex items-center space-x-3">
									<span class="text-2xl">{entry.tacoType.emoji}</span>
									<span class="font-medium text-white">{entry.tacoType.name}</span>
								</div>							<div class="flex items-center space-x-3">
								<button
									type="button"
									on:click={() => updateQuantity(entry.tacoType.id, entry.quantity - 1)}
									class="w-8 h-8 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
									disabled={entry.quantity <= 0}
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
								{#if !selectedSessionId}
									<button
										type="button"
										on:click={() => removeTacoEntry(entry.tacoType.id)}
										class="w-8 h-8 rounded-full bg-red-500/20 text-red-300 font-bold hover:bg-red-500/30 transition-all duration-200 ml-2"
									>
										×
									</button>
								{/if}
							</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Over-limit warning -->
			{#if isOverLimit}
				<div class="mb-4 p-3 bg-red-500/20 rounded border border-red-400/30">
					<p class="text-red-200 text-sm font-medium">⚠️ Warning: You're trying to claim more tacos than available!</p>
					<p class="text-red-300 text-xs mt-1">Total available: {totalOrderedTacos}, Already claimed: {totalClaimedTacos}, You want: {totalTacos}</p>
				</div>
			{/if}

			<!-- Submit Button -->
			<button
				type="submit"
				disabled={!hasValidEntries || isSubmitting || isOverLimit}
				class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn-smooth shadow-lg {isOverLimit ? 'from-red-500 to-red-600' : ''}"
			>
				{isSubmitting 
					? 'Recording your epic taco feast...' 
					: isOverLimit
						? '🚫 Cannot claim more than available'
					: totalTacos > 0 
						? `🎯 RECORD ${totalTacos} TACO${totalTacos !== 1 ? 'S' : ''} 🏆`
						: '🌮 Set quantities to track consumption'}
			</button>
		</form>
	{/if}
</div>
