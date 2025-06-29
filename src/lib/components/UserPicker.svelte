<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { User } from '$lib/types.js';

	export let users: User[] = [];
	export let selectedUsers: User[] = [];
	export let currentUser: User | null = null;

	const dispatch = createEventDispatcher<{
		selectionChange: User[]
	}>();

	function toggleUser(user: User) {
		const isSelected = selectedUsers.some(u => u.id === user.id);
		
		if (isSelected) {
			selectedUsers = selectedUsers.filter(u => u.id !== user.id);
		} else {
			selectedUsers = [...selectedUsers, user];
		}
		
		dispatch('selectionChange', selectedUsers);
	}

	function isUserSelected(user: User): boolean {
		return selectedUsers.some(u => u.id === user.id);
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold text-white">👥 Who's joining this taco session?</h3>
		<span class="text-sm text-white/70">{selectedUsers.length} selected</span>
	</div>

	{#if currentUser}
		<div class="p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
			<div class="flex items-center space-x-3">
				{#if currentUser.image}
					<img src={currentUser.image} alt={currentUser.name} class="w-8 h-8 rounded-full" />
				{/if}
				<div class="flex-1">
					<p class="font-medium text-white">{currentUser.name} (You)</p>
					<p class="text-sm text-blue-200">🌮 {currentUser.totalTacosEaten} tacos eaten</p>
				</div>
				<div class="text-blue-300">
					✓ Auto-included
				</div>
			</div>
		</div>
	{/if}

	<div class="space-y-2 max-h-60 overflow-y-auto">
		{#each users.filter(u => u.id !== currentUser?.id) as user (user.id)}
			<button
				on:click={() => toggleUser(user)}
				class="w-full p-3 rounded-lg border transition-all duration-200 {isUserSelected(user)
					? 'bg-green-500/20 border-green-400/50 text-white'
					: 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30'}"
			>
				<div class="flex items-center space-x-3">
					{#if user.image}
						<img src={user.image} alt={user.name} class="w-8 h-8 rounded-full" />
					{:else}
						<div class="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm">
							{user.name?.charAt(0) || '?'}
						</div>
					{/if}
					<div class="flex-1 text-left">
						<p class="font-medium">{user.name || user.username || 'Unknown User'}</p>
						<p class="text-sm opacity-75">🌮 {user.totalTacosEaten} tacos eaten</p>
					</div>
					<div class="text-xl">
						{isUserSelected(user) ? '✅' : '➕'}
					</div>
				</div>
			</button>
		{:else}
			<div class="text-center py-8 text-white/60">
				<p>No other users found.</p>
				<p class="text-sm mt-2">Invite friends to join Taco Tracker!</p>
			</div>
		{/each}
	</div>

	{#if selectedUsers.length > 0}
		<div class="mt-4 p-3 bg-white/5 rounded-lg">
			<p class="text-sm text-white/80 mb-2">Selected participants:</p>
			<div class="flex flex-wrap gap-2">
				{#each selectedUsers as user}
					<span class="px-2 py-1 bg-green-500/20 text-green-200 rounded text-sm">
						{user.name || user.username}
					</span>
				{/each}
			</div>
		</div>
	{/if}
</div>
