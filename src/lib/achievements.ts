import type { TacoConsumption } from './types.js';

export interface Achievement {
	id: string;
	title: string;
	description: string;
	emoji: string;
	condition: (consumptions: TacoConsumption[]) => boolean;
	rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENTS: Achievement[] = [
	{
		id: 'first-taco',
		title: 'Taco Newbie',
		description: 'Your first taco tracked!',
		emoji: '🌮',
		condition: (consumptions) => consumptions.length >= 1,
		rarity: 'common'
	},
	{
		id: 'taco-five',
		title: 'Taco Explorer',
		description: 'Tracked 5 tacos!',
		emoji: '🗺️',
		condition: (consumptions) => consumptions.reduce((sum, c) => sum + c.quantity, 0) >= 5,
		rarity: 'common'
	},
	{
		id: 'taco-ten',
		title: 'Taco Enthusiast',
		description: 'Tracked 10 tacos!',
		emoji: '🔥',
		condition: (consumptions) => consumptions.reduce((sum, c) => sum + c.quantity, 0) >= 10,
		rarity: 'rare'
	},
	{
		id: 'variety-lover',
		title: 'Flavor Explorer',
		description: 'Tried 5 different taco types!',
		emoji: '🌈',
		condition: (consumptions) => {
			const uniqueTypes = new Set(consumptions.map((c) => c.tacoType.id));
			return uniqueTypes.size >= 5;
		},
		rarity: 'rare'
	},
	{
		id: 'taco-master',
		title: 'Taco Master',
		description: 'Tracked 25 tacos!',
		emoji: '👑',
		condition: (consumptions) => consumptions.reduce((sum, c) => sum + c.quantity, 0) >= 25,
		rarity: 'epic'
	},
	{
		id: 'completionist',
		title: 'Menu Completionist',
		description: 'Tried ALL taco types!',
		emoji: '🏆',
		condition: (consumptions) => {
			const uniqueTypes = new Set(consumptions.map((c) => c.tacoType.id));
			return uniqueTypes.size >= 12; // All taco types
		},
		rarity: 'epic'
	},
	{
		id: 'taco-legend',
		title: 'Taco Legend',
		description: 'Tracked 50 tacos!',
		emoji: '⭐',
		condition: (consumptions) => consumptions.reduce((sum, c) => sum + c.quantity, 0) >= 50,
		rarity: 'legendary'
	},
	{
		id: 'daily-warrior',
		title: 'Daily Warrior',
		description: 'Tracked tacos on 7 different days!',
		emoji: '⚔️',
		condition: (consumptions) => {
			const uniqueDates = new Set(consumptions.map((c) => c.date));
			return uniqueDates.size >= 7;
		},
		rarity: 'epic'
	},
	{
		id: 'taco-god',
		title: 'TACO GOD',
		description: 'Tracked 100 tacos! YOU ARE LEGENDARY!',
		emoji: '🔱',
		condition: (consumptions) => consumptions.reduce((sum, c) => sum + c.quantity, 0) >= 100,
		rarity: 'legendary'
	}
];

export function getUnlockedAchievements(consumptions: TacoConsumption[]): Achievement[] {
	return ACHIEVEMENTS.filter((achievement) => achievement.condition(consumptions));
}

export function getNextAchievement(consumptions: TacoConsumption[]): Achievement | null {
	const unlocked = getUnlockedAchievements(consumptions);
	const unlockedIds = unlocked.map((a) => a.id);

	return ACHIEVEMENTS.find((achievement) => !unlockedIds.includes(achievement.id)) || null;
}

export function getRarityColor(rarity: Achievement['rarity']): string {
	switch (rarity) {
		case 'common':
			return 'text-gray-600 bg-gray-100';
		case 'rare':
			return 'text-blue-600 bg-blue-100';
		case 'epic':
			return 'text-purple-600 bg-purple-100';
		case 'legendary':
			return 'text-yellow-600 bg-yellow-100';
		default:
			return 'text-gray-600 bg-gray-100';
	}
}
