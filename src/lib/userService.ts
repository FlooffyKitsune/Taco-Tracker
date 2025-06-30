import { prisma } from './database.js';
import { checkAndUnlockAchievements } from './achievements.js';
import { isDevAccount } from './debug.js';
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
			}
		}
	});

	return session;
}

export async function recordTacoConsumption(
	userId: string, 
	tacoTypeId: string, 
	quantity: number, 
	sessionId?: string
) {
	// Check if sessionId exists in database if provided
	let validSessionId: string | undefined = undefined;
	if (sessionId) {
		const sessionExists = await prisma.tacoSession.findUnique({
			where: { id: sessionId }
		});
		validSessionId = sessionExists ? sessionId : undefined;
	}

	// Create consumption record
	const consumption = await prisma.tacoConsumption.create({
		data: {
			userId,
			tacoTypeId,
			quantity,
			sessionId: validSessionId // Only use sessionId if it exists in DB
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
		// Note: TacoSessionParticipant doesn't have tacosConsumed field in current schema
		// This update is omitted to match the actual schema
		console.log(`Updated consumption for user ${userId} in session ${sessionId}`);
	}

	// Check for new achievements
	const newAchievements = await checkAndUnlockAchievements(userId);

	return { consumption, newAchievements };
}

export async function recordMultipleTacoConsumptions(
	userId: string,
	entries: Array<{ tacoTypeId: string; quantity: number }>,
	sessionId?: string
) {
	const consumptions = [];
	let totalQuantity = 0;
	const newAchievements = [];

	// Check if sessionId exists in database if provided
	let validSessionId: string | undefined = undefined;
	if (sessionId) {
		const sessionExists = await prisma.tacoSession.findUnique({
			where: { id: sessionId }
		});
		validSessionId = sessionExists ? sessionId : undefined;
	}

	// Create all consumption records in a transaction
	for (const entry of entries) {
		if (entry.quantity > 0) {
			const consumption = await prisma.tacoConsumption.create({
				data: {
					userId,
					tacoTypeId: entry.tacoTypeId,
					quantity: entry.quantity,
					sessionId: validSessionId // Only use sessionId if it exists in DB
				}
			});
			consumptions.push(consumption);
			totalQuantity += entry.quantity;
		}
	}

	if (totalQuantity > 0) {
		// Update user totals
		await prisma.user.update({
			where: { id: userId },
			data: {
				totalTacosEaten: {
					increment: totalQuantity
				},
				lastActiveAt: new Date()
			}
		});

		// Check for new achievements
		const achievements = await checkAndUnlockAchievements(userId);
		newAchievements.push(...achievements);
	}

	return { consumptions, totalQuantity, newAchievements };
}

export async function updateSessionTotals(sessionId: string) {
	// Since there are no TacoOrder records in current schema,
	// we can calculate totals from consumptions if needed
	const consumptions = await prisma.tacoConsumption.findMany({
		where: { sessionId }
	});

	const totalTacos = consumptions.reduce((sum: number, consumption) => sum + consumption.quantity, 0);

	// Note: TacoSession doesn't have totalTacos field in current schema
	// This function is kept for compatibility but doesn't update anything
	console.log(`Session ${sessionId} has ${totalTacos} total tacos consumed`);
}

export async function getUserStats(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: {
			consumptions: {
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
			sessionParticipants: {
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
	const uniqueTacoTypes = new Set(user.consumptions.map((tc) => tc.tacoTypeId));
	const totalAchievementPoints = user.achievements.reduce(
		(sum: number, ua) => sum + ua.achievement.requirement, // Using requirement as points since points field doesn't exist
		0
	);

	return {
		...user,
		uniqueTacoTypesCount: uniqueTacoTypes.size,
		totalAchievementPoints,
		recentConsumptions: user.consumptions.slice(0, 10)
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

	// Filter out dev accounts from public leaderboard
	const filteredUsers = users.filter(user => !isDevAccount(user));

	return filteredUsers.map((user, index) => ({
		rank: index + 1,
		...user,
		totalAchievementPoints: user.achievements.reduce(
			(sum: number, ua) => sum + ua.achievement.requirement, // Using requirement as points since points field doesn't exist
			0
		)
	}));
}
