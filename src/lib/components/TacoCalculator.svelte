<script lang="ts">
	import { calculateTacoOrder, DEFAULT_TACO_DISTRIBUTION } from '$lib/tacoCalculator';
	import { TacoStorage } from '$lib/storage';
	import { 
		activeTab, 
		currentUser, 
		availableUsers, 
		selectedParticipants,
		recentOrderForTracking,
		statsRefreshTrigger
	} from '$lib/stores';
	import { onMount } from 'svelte';
	import UserPicker from './UserPicker.svelte';
	import type { TacoOrder, TacoSession, User, TacoType } from '$lib/types';

	let peopleCount = 3;
	let distribution = [...DEFAULT_TACO_DISTRIBUTION];
	let users: User[] = [];
	let selectedUsers: User[] = [];
	let showUserPicker = false;
	let creatingSession = false;
	let tacoTypes: TacoType[] = [];
	let loading = true;

	$: result = tacoTypes.length > 0 ? calculateTacoOrder(Math.max(peopleCount, selectedUsers.length + ($currentUser ? 1 : 0)), distribution, tacoTypes) : null;	onMount(async () => {
		loading = true;
		try {
			// Load taco types from API
			const tacoTypesResponse = await fetch('/api/taco-types');
			if (tacoTypesResponse.ok) {
				tacoTypes = await tacoTypesResponse.json();
				
				// Validate distribution against loaded taco types
				const validDistribution = distribution.filter(item => {
					return tacoTypes.some(t => t.id === item.typeId);
				});
				
				if (validDistribution.length === 0) {
					// No valid items, use first 3 taco types as default
					distribution = tacoTypes.slice(0, 3).map(t => ({ typeId: t.id, ratio: 1 }));
				} else {
					distribution = validDistribution;
				}
			}

			// Load available users
			const usersResponse = await fetch('/api/users');
			if (usersResponse.ok) {
				users = await usersResponse.json();
			}
		} catch (error) {
			console.error('Failed to load data:', error);
		} finally {
			loading = false;
		}
	});

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

	function handleUserSelection(event: CustomEvent<User[]>) {
		selectedUsers = event.detail;
		// Update people count to include selected users plus current user
		peopleCount = Math.max(peopleCount, selectedUsers.length + ($currentUser ? 1 : 0));
	}

	async function handleOrderNow() {
		if (!$currentUser) {
			console.warn('Please sign in to place an order!');
			return;
		}

		creatingSession = true;
		try {
			// Create a taco session if users are selected
			let sessionId = null;
			if (selectedUsers.length > 0) {
				const response = await fetch('/api/sessions', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						participantIds: selectedUsers.map(u => u.id)
					})
				});

				if (response.ok) {
					const session = await response.json();
					sessionId = session.id;
				}
			}

			// Only proceed if we have a valid result
			if (!result) {
				console.error('Unable to calculate order - no result available');
				return;
			}

			// Save session locally for now (backward compatibility)
			const session: TacoSession = {
				id: sessionId || Date.now().toString(),
				date: new Date().toISOString().split('T')[0],
				peopleCount: selectedUsers.length + 1,
				orders: result.orders,
				consumptions: [],
				participants: [
					$currentUser,
					...selectedUsers
				].filter(Boolean) as User[]
			};

			TacoStorage.saveSession(session);

			// Set this as the recent order for tracking
			recentOrderForTracking.set(session);

			// Switch to tracker tab for easy consumption tracking
			activeTab.set('tracker');
			
			// Trigger stats refresh
			statsRefreshTrigger.update(n => n + 1);
			
			// Log success without alert popup
			console.log(`🌮 TACO ORDER PLACED! 🎉\n${result.totalTacos} delicious tacos ordered${selectedUsers.length > 0 ? ` with ${selectedUsers.map(u => u.name).join(', ')}` : ''}!`);
		} catch (error) {
			console.error('Error placing order:', error);
		} finally {
			creatingSession = false;
		}
	}
	$: availableTypes = tacoTypes.filter(
		(type) => !distribution.find((item) => item.typeId === type.id)
	);

	$: actualPeopleCount = Math.max(peopleCount, selectedUsers.length + ($currentUser ? 1 : 0));
</script>

<div class="card-3d rounded-xl p-6 slide-in">	<h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
		🌮 Taco Order Calculator
	</h2>

	{#if loading}
		<div class="text-center py-8">
			<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
			<p class="mt-2 text-gray-600">Loading taco types...</p>
		</div>
	{:else if tacoTypes.length === 0}
		<div class="text-center py-8">
			<p class="text-red-600">Failed to load taco types. Please try refreshing the page.</p>
		</div>
	{:else}
	<!-- People Count Input -->
	<div class="mb-6">
		<div class="text-sm font-medium text-gray-700 mb-2">
			How many hungry people?
		</div>
		<div class="flex items-center space-x-4 mb-4">
			<button
				on:click={() => handlePeopleCountChange(peopleCount - 1)}
				class="w-12 h-12 rounded-full bg-taco-orange text-white font-bold hover:bg-taco-red transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn-smooth"
				disabled={actualPeopleCount <= 1}
			>
				-
			</button>
			<span class="text-3xl font-bold text-gray-800 min-w-[3rem] text-center">
				{actualPeopleCount}
			</span>
			<button
				on:click={() => handlePeopleCountChange(peopleCount + 1)}
				class="w-12 h-12 rounded-full bg-taco-orange text-white font-bold hover:bg-taco-red transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn-smooth"
				disabled={actualPeopleCount >= 50}
			>
				+
			</button>
		</div>

		<!-- User Selection (only show if authenticated) -->
		{#if $currentUser}
			<div class="mb-4">
				<button
					on:click={() => showUserPicker = !showUserPicker}
					class="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-between"
				>
					<span>👥 Select Participants</span>
					<span>{showUserPicker ? '▲' : '▼'}</span>
				</button>
			</div>

			{#if showUserPicker}
				<div class="mb-4 p-4 bg-gray-50 rounded-lg">
					<UserPicker 
						{users} 
						bind:selectedUsers 
						currentUser={$currentUser}
						on:selectionChange={handleUserSelection}
					/>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Taco Distribution -->
	<div class="mb-6">
		<div class="text-sm font-medium text-gray-700 mb-3">
			Taco Distribution (per person)
		</div>		<div class="space-y-4">
			{#each distribution as item, index (item.typeId)}
				{@const tacoType = tacoTypes.find((t) => t.id === item.typeId)}
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
	{#if result}
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
			disabled={creatingSession || !$currentUser}
			class="w-full bg-taco-orange hover:bg-taco-red text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 text-lg btn-smooth shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"		>
			{#if creatingSession}
				🔄 Creating Session...
			{:else if !$currentUser}
				🔒 Sign in to Order
			{:else}
				🌮 PLACE THIS FIRE ORDER! 🔥
			{/if}
		</button>
	{/if}
{/if}
</div>
