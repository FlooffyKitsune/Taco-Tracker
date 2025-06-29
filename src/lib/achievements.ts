import { prisma } from './database.js';
import type { User, Achievement } from './types.js';

// Default achievements to seed the database
export const DEFAULT_ACHIEVEMENTS = [
	{
		name: 'First Bite',
		description: 'Track your very first taco!',
		emoji: '🌮',
		category: 'consumption',
		condition: JSON.stringify({ type: 'total_tacos', value: 1 }),
		points: 10,
		isHidden: false
	},
	{
		name: 'Taco Explorer',
		description: 'Eat 5 tacos total',
		emoji: '🗺️',
		category: 'consumption',
		condition: JSON.stringify({ type: 'total_tacos', value: 5 }),
		points: 25,
		isHidden: false
	},
	{
		name: 'Flavor Hunter',
		description: 'Try 3 different taco types',
		emoji: '🌈',
		category: 'consumption',
		condition: JSON.stringify({ type: 'unique_types', value: 3 }),
		points: 30,
		isHidden: false
	},
	{
		name: 'Social Butterfly',
		description: 'Join your first taco session with friends',
		emoji: '🦋',
		category: 'social',
		condition: JSON.stringify({ type: 'sessions_joined', value: 1 }),
		points: 20,
		isHidden: false
	},
	{
		name: 'Taco Master',
		description: 'Eat 25 tacos total',
		emoji: '👑',
		category: 'consumption',
		condition: JSON.stringify({ type: 'total_tacos', value: 25 }),
		points: 100,
		isHidden: false
	},
	{
		name: 'Menu Completionist',
		description: 'Try all available taco types',
		emoji: '🏆',
		category: 'consumption',
		condition: JSON.stringify({ type: 'all_types' }),
		points: 200,
		isHidden: false
	},
	{
		name: 'Taco Legend',
		description: 'Eat 50 tacos total',
		emoji: '⭐',
		category: 'consumption',
		condition: JSON.stringify({ type: 'total_tacos', value: 50 }),
		points: 250,
		isHidden: false
	},
	{
		name: 'Daily Warrior',
		description: 'Track tacos on 7 different days',
		emoji: '⚔️',
		category: 'streak',
		condition: JSON.stringify({ type: 'unique_days', value: 7 }),
		points: 150,
		isHidden: false
	},
	{
		name: 'TACO GOD',
		description: 'Eat 100 tacos total - YOU ARE LEGENDARY!',
		emoji: '🔱',
		category: 'consumption',
		condition: JSON.stringify({ type: 'total_tacos', value: 100 }),
		points: 500,
		isHidden: false
	},
	{
		name: 'Secret Sauce',
		description: 'Complete a taco session with exactly 13 tacos',
		emoji: '🤫',
		category: 'special',
		condition: JSON.stringify({ type: 'session_exact_tacos', value: 13 }),
		points: 75,
		isHidden: true
	}
];

export async function checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: {
			tacoConsumptions: {
				include: {
					tacoType: true
				}
			},
			tacoSessionParticipants: {
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
	const newlyUnlocked: Achievement[] = [];

	for (const achievement of allAchievements) {
		if (unlockedAchievementIds.includes(achievement.id)) continue;

		const condition = JSON.parse(achievement.condition);
		let shouldUnlock = false;

		switch (condition.type) {
			case 'total_tacos':
				shouldUnlock = user.totalTacosEaten >= condition.value;
				break;
			
			case 'unique_types':
				const uniqueTypes = new Set(user.tacoConsumptions.map(tc => tc.tacoTypeId));
				shouldUnlock = uniqueTypes.size >= condition.value;
				break;
			
			case 'sessions_joined':
				shouldUnlock = user.tacoSessionParticipants.length >= condition.value;
				break;
			
			case 'all_types':
				const totalTypes = await prisma.tacoType.count();
				const userTypes = new Set(user.tacoConsumptions.map(tc => tc.tacoTypeId));
				shouldUnlock = userTypes.size >= totalTypes;
				break;
			
			case 'unique_days':
				const uniqueDays = new Set(
					user.tacoConsumptions.map(tc => tc.consumedAt.toDateString())
				);
				shouldUnlock = uniqueDays.size >= condition.value;
				break;
			
			case 'session_exact_tacos':
				shouldUnlock = user.tacoSessionParticipants.some(tsp => 
					tsp.tacosConsumed === condition.value
				);
				break;
		}

		if (shouldUnlock) {
			await prisma.userAchievement.create({
				data: {
					userId: user.id,
					achievementId: achievement.id
				}
			});
			newlyUnlocked.push(achievement);
		}
	}

	return newlyUnlocked;
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
