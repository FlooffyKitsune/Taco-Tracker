import { prisma } from './database.js';
import type { User, Achievement } from './types.js';

// Default achievements to seed the database
export const DEFAULT_ACHIEVEMENTS = [
	{
		name: 'First Bite',
		description: 'Track your very first taco!',
		icon: '🌮',
		category: 'consumption',
		requirement: 10
	},
	{
		name: 'Taco Explorer',
		description: 'Eat 5 tacos total',
		icon: '🗺️',
		category: 'consumption',
		requirement: 25
	},
	{
		name: 'Flavor Hunter',
		description: 'Try 3 different taco types',
		icon: '🌈',
		category: 'consumption',
		requirement: 30
	},
	{
		name: 'Social Butterfly',
		description: 'Join your first taco session with friends',
		icon: '🦋',
		category: 'social',
		requirement: 20
	},
	{
		name: 'Taco Master',
		description: 'Eat 25 tacos total',
		icon: '👑',
		category: 'consumption',
		requirement: 100
	},
	{
		name: 'Menu Completionist',
		description: 'Try all available taco types',
		icon: '🏆',
		category: 'consumption',
		requirement: 200
	},
	{
		name: 'Taco Legend',
		description: 'Eat 50 tacos total',
		icon: '⭐',
		category: 'consumption',
		requirement: 250
	},
	{
		name: 'Taco Tuesday Warrior',
		description: 'Track tacos on 5 different Tuesdays',
		icon: '⚔️',
		category: 'streak',
		requirement: 150
	},
	{
		name: 'Tuesday Champion',
		description: 'Track tacos on 10 different Tuesdays',
		icon: '🏆',
		category: 'streak',
		requirement: 200
	},
	{
		name: 'TACO GOD',
		description: 'Eat 100 tacos total - YOU ARE LEGENDARY!',
		icon: '🔱',
		category: 'consumption',
		requirement: 500
	},
	{
		name: 'Secret Sauce',
		description: '',
		icon: '🤫',
		category: 'special',
		requirement: 75
	}
];

export async function checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				consumptions: {
					include: {
						tacoType: true
					}
				},
				sessionParticipants: {
					include: {
						session: true
					}
				},
				achievements: {
					include: {
						achievement: true
					}
				}
			}
		});

		if (!user) return [];

		const allAchievements = await prisma.achievement.findMany();
		const unlockedAchievementIds = user.achievements.map(ua => ua.achievementId);
		const newlyUnlocked: any[] = [];

		for (const achievement of allAchievements) {
			if (unlockedAchievementIds.includes(achievement.id)) continue;

			let shouldUnlock = false;

			// Simple achievement checking based on achievement name and requirement
			switch (achievement.name.toLowerCase()) {
				case 'first bite':
					shouldUnlock = user.consumptions.length >= 1;
					break;
				case 'taco explorer':
					shouldUnlock = user.totalTacosEaten >= 5;
					break;
				case 'flavor hunter':
					const uniqueTypes = new Set(user.consumptions.map(tc => tc.tacoTypeId));
					shouldUnlock = uniqueTypes.size >= 3;
					break;
				case 'social butterfly':
					shouldUnlock = user.sessionParticipants.length >= 1;
					break;
				case 'taco master':
					shouldUnlock = user.totalTacosEaten >= 25;
					break;
				case 'menu completionist':
					const uniqueTypesAll = new Set(user.consumptions.map(tc => tc.tacoTypeId));
					// This should check if user has tried all available taco types
					const totalTacoTypes = await prisma.tacoType.count();
					shouldUnlock = uniqueTypesAll.size >= totalTacoTypes;
					break;
				case 'taco legend':
					shouldUnlock = user.totalTacosEaten >= 50;
					break;
				case 'taco tuesday warrior':
					// Count unique Tuesdays when user tracked tacos
					const uniqueTuesdays = new Set();
					user.consumptions.forEach(consumption => {
						const date = new Date(consumption.consumedAt);
						if (date.getDay() === 2) { // Tuesday is day 2
							const tuesdayKey = `${date.getFullYear()}-${date.getMonth()}-${Math.floor(date.getDate() / 7)}`;
							uniqueTuesdays.add(tuesdayKey);
						}
					});
					shouldUnlock = uniqueTuesdays.size >= 5;
					break;
				case 'tuesday champion':
					// Count unique Tuesdays when user tracked tacos
					const uniqueTuesdaysChamp = new Set();
					user.consumptions.forEach(consumption => {
						const date = new Date(consumption.consumedAt);
						if (date.getDay() === 2) { // Tuesday is day 2
							const tuesdayKey = `${date.getFullYear()}-${date.getMonth()}-${Math.floor(date.getDate() / 7)}`;
							uniqueTuesdaysChamp.add(tuesdayKey);
						}
					});
					shouldUnlock = uniqueTuesdaysChamp.size >= 10;
					break;
				case 'taco god':
					shouldUnlock = user.totalTacosEaten >= 100;
					break;
				case 'secret sauce':
					// This will be handled separately via the footer heart click mechanism
					shouldUnlock = false;
					break;
				default:
					// For other achievements, fall back to total tacos consumed
					shouldUnlock = user.totalTacosEaten >= achievement.requirement;
			}

			if (shouldUnlock) {
				await prisma.userAchievement.create({
					data: {
						userId: user.id,
						achievementId: achievement.id
					}
				});
				
				// Convert to the expected Achievement type format
				newlyUnlocked.push({
					id: achievement.id,
					name: achievement.name,
					description: achievement.description,
					icon: achievement.icon,
					category: achievement.category,
					points: achievement.requirement, // Use requirement as points
					emoji: achievement.icon, // Use icon as emoji
					isHidden: false
				});
			}
		}

		return newlyUnlocked;
	} catch (error) {
		console.error('Error checking achievements:', error);
		return [];
	}
}

export async function getUserAchievements(userId: string) {
	return await prisma.userAchievement.findMany({
		where: { userId },
		include: {
			achievement: true
		},
		orderBy: {
			unlockedAt: 'desc'
		}
	});
}

export function getCategoryColor(category: string): string {
	switch (category) {
		case 'consumption':
			return 'bg-orange-100 text-orange-800';
		case 'social':
			return 'bg-blue-100 text-blue-800';
		case 'streak':
			return 'bg-green-100 text-green-800';
		case 'special':
			return 'bg-purple-100 text-purple-800';
		default:
			return 'bg-gray-100 text-gray-800';
	}
}

export function getPointsColor(points: number): string {
	if (points >= 500) return 'text-purple-600';
	if (points >= 200) return 'text-yellow-600';
	if (points >= 100) return 'text-orange-600';
	if (points >= 50) return 'text-blue-600';
	return 'text-gray-600';
}

export async function unlockSecretAchievement(userId: string): Promise<Achievement | null> {
	try {
		// Check if user already has the secret sauce achievement
		const existingAchievement = await prisma.userAchievement.findFirst({
			where: {
				userId: userId,
				achievement: {
					name: 'Secret Sauce'
				}
			}
		});

		if (existingAchievement) {
			return null; // Already unlocked
		}

		// Find the secret sauce achievement
		const secretAchievement = await prisma.achievement.findFirst({
			where: { name: 'Secret Sauce' }
		});

		if (!secretAchievement) {
			return null; // Achievement doesn't exist
		}

		// Unlock the achievement
		await prisma.userAchievement.create({
			data: {
				userId: userId,
				achievementId: secretAchievement.id
			}
		});

		return {
			id: secretAchievement.id,
			name: secretAchievement.name,
			description: secretAchievement.description,
			emoji: secretAchievement.icon,
			category: secretAchievement.category,
			points: secretAchievement.requirement,
			isHidden: false
		};

	} catch (error) {
		console.error('Error unlocking secret achievement:', error);
		return null;
	}
}
