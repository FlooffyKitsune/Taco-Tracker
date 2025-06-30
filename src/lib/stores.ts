import { writable } from 'svelte/store';
import type { TacoSession, TacoConsumption, User, TacoSessionWithParticipants, Achievement } from './types.js';

export const sessions = writable<TacoSession[]>([]);
export const consumptions = writable<TacoConsumption[]>([]);
export const activeTab = writable<'calculator' | 'tracker' | 'stats' | 'achievements' | 'leaderboard'>('calculator');

// New stores for user management
export const currentUser = writable<User | null>(null);
export const activeTacoSession = writable<TacoSessionWithParticipants | null>(null);
export const availableUsers = writable<User[]>([]);
export const selectedParticipants = writable<User[]>([]);
export const newAchievements = writable<Achievement[]>([]);

// Store for showing achievement unlocks
export const showAchievementModal = writable(false);

// Store for the most recent order that users can track from
export const recentOrderForTracking = writable<TacoSession | null>(null);

// Store to trigger stats refresh
export const statsRefreshTrigger = writable(0);
