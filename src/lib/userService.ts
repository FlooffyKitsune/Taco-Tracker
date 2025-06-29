import { prisma } from './database.js';
import { checkAndUnlockAchievements } from './achievements.js';
import type { User } from './types.js';

export async function createTacoSession(userId: string, participantIds: string[]) {
	const session = await prisma.tacoSession.create({
		data: {
			createdById: userId,
			participants: {
				create: participantIds.map(id => ({
					userId: id
				}))
			}
		},
		include: {
			createdBy: true,
			participants: {
				include: {
					user: true
				}
			},
			orders: {
				include: {
					tacoType: true
				}
			}
		}
	});

	return session;
}

export async function addTacoOrder(sessionId: string, tacoTypeId: string, quantity: number) {
	const order = await prisma.tacoOrder.create({
		data: {
			sessionId,
			tacoTypeId,
			quantity
		}
	});

	// Update session total
	await updateSessionTotals(sessionId);

	return order;
}

export async function recordTacoConsumption(
	userId: string, 
	tacoTypeId: string, 
	quantity: number, 
	sessionId?: string
) {
	// Create consumption record
	const consumption = await prisma.tacoConsumption.create({
		data: {
			userId,
			tacoTypeId,
			quantity,
			sessionId
		}
	});

	// Update user totals
	await prisma.user.update({
		where: { id: userId },
		data: {
			totalTacosEaten: {
				increment: quantity
			},
			lastActiveAt: new Date()
		}
	});

	// Update session participant totals if in a session
	if (sessionId) {
		await prisma.tacoSessionParticipant.updateMany({
			where: {
				sessionId,
				userId
			},
			data: {
				tacosConsumed: {
					increment: quantity
				}
			}
		});
	}

	// Check for new achievements
	const newAchievements = await checkAndUnlockAchievements(userId);

	return { consumption, newAchievements };
}

export async function updateSessionTotals(sessionId: string) {
	const orders = await prisma.tacoOrder.findMany({
		where: { sessionId }
	});

	const totalTacos = orders.reduce((sum, order) => sum + order.quantity, 0);

	await prisma.tacoSession.update({
		where: { id: sessionId },
		data: { totalTacos }
	});
}

export async function getUserStats(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: {
			tacoConsumptions: {
				include: {
					tacoType: true
				},
				orderBy: {
					consumedAt: 'desc'
				}
			},
			achievements: {
				include: {
					achievement: true
				},
				orderBy: {
					unlockedAt: 'desc'
				}
			},
			tacoSessionParticipants: {
				include: {
					session: {
						include: {
							createdBy: true
						}
					}
				}
			}
		}
	});

	if (!user) return null;

	// Calculate additional stats
	const uniqueTacoTypes = new Set(user.tacoConsumptions.map(tc => tc.tacoTypeId));
	const totalAchievementPoints = user.achievements.reduce(
		(sum, ua) => sum + ua.achievement.points, 
		0
	);

	return {
		...user,
		uniqueTacoTypesCount: uniqueTacoTypes.size,
		totalAchievementPoints,
		recentConsumptions: user.tacoConsumptions.slice(0, 10)
	};
}

export async function getLeaderboard() {
	const users = await prisma.user.findMany({
		where: {
			totalTacosEaten: {
				gt: 0
			}
		},
		include: {
			achievements: {
				include: {
					achievement: true
				}
			}
		},
		orderBy: [
			{ totalTacosEaten: 'desc' },
			{ totalTacoSessions: 'desc' },
			{ name: 'asc' }
		],
		take: 50
	});

	return users.map((user, index) => ({
		rank: index + 1,
		...user,
		totalAchievementPoints: user.achievements.reduce(
			(sum, ua) => sum + ua.achievement.points, 
			0
		)
	}));
}
